// Strip noisy Convex / runtime framing from error messages so end users
// see the human-readable reason. Examples we clean up:
//
//   "[CONVEX M(users:signup)] [Request ID: abc] Server Error\nUncaught Error: User with this email already exists\n    at handler (../../convex/users.ts:167:21)\n"
//   "Uncaught Error: User with this email already exists at handler (../../convex/users.ts:167:21)"
//   "[CONVEX M(users:verifyPassword)] Server Error: Invalid email or password"
//
const GENERIC_SERVER_MESSAGE =
  "Something went wrong on our side. Please try again in a moment or contact support if it keeps happening."

// Shown only when Convex returns an empty/low-signal message for create/update —
// misleading to blame description length here; ordinary copy fits easily.
const PRODUCT_SAVE_HINT =
  "We couldn't save this product—the server reply didn't include a specific reason (often transient). Try Save again or refresh and retry. Typical product descriptions are only a few KiB and are unlikely to hit limits; contact support with the approximate time if it keeps failing."

const PRODUCT_PAYLOAD_TOO_LARGE_HINT =
  "Couldn't save — this listing exceeds Convex's per-product encoded size (~1 MiB row cap). Paste less into long text fields or strip heavy formatting, then save again—or contact support."

function convexMutationSlug(raw: string): string | null {
  const m = raw.match(/\[CONVEX[^\]]*M\(([^:]+:[^)]+)\)\]/i)
  return m ? m[1] ?? null : null
}

function contextualGenericMessage(slug: string | null): string {
  if (slug === 'products:createProduct' || slug === 'products:updateProduct') {
    return PRODUCT_SAVE_HINT
  }
  return GENERIC_SERVER_MESSAGE
}

// We strip the bracketed Convex prefix, the "Server Error" / "Uncaught Error"
// wrappers (which can appear stacked), and every "at handler (path:line:col)"
// / "at async handler (...)" frame Convex concatenates onto the message (often
// two or more chained).
//
// IMPORTANT: Convex sometimes returns framing + "Server Error" with nothing
// else. We must not fall back to the raw `[CONVEX...]` blob for users.
export function friendlyAuthError(raw: string | null | undefined): string | null {
  if (!raw) return null

  const slug = convexMutationSlug(raw)
  let message = raw

  // Drop a leading "[CONVEX ...]" and optional "[Request ID: ...]" prefix.
  message = message.replace(/^\[CONVEX[^\]]*]\s*(?:\[Request ID:[^\]]*]\s*)?/i, '')

  // Drop trailing "Called by client" Convex client suffix.
  message = message.replace(/\s*Called by client[\s\S]*$/i, '')

  // Convex often appends several frames on one line, e.g.
  // "… at handler (…/users.ts:1:1) at async handler (…/auth.ts:2:2)" — strip every one.
  message = message.replace(/\s+at\s+(?:async\s+)?handler\s*\([^)]*\)/gi, '')

  // Strip leading "Server Error" / "Uncaught Error" / "Error" wrappers.
  // These often stack (Convex prints "Server Error\nUncaught Error: ...");
  // loop until the prefix no longer matches so we peel both layers off.
  const PREFIX_RE = /^(?:Uncaught\s+)?(?:Server\s+)?Error[:\s]*/i
  while (PREFIX_RE.test(message)) {
    const next = message.replace(PREFIX_RE, '')
    if (next === message) break
    message = next
  }

  // Collapse whitespace and trim.
  message = message.replace(/\s+/g, ' ').trim()

  const duplicateEmailMatches =
    /^User with this email already exists\b/i.test(message) ||
    /^A user with this email already exists\b/i.test(message) ||
    /email already exists.*please log in instead/i.test(message)

  if (duplicateEmailMatches) {
    return 'An account with this email already exists. Try signing in, or use a different email.'
  }

  if (/value is too large/i.test(message) || /\d+\s*>\s*maximum\s+size/i.test(message)) {
    if (slug === 'products:createProduct' || slug === 'products:updateProduct') {
      return PRODUCT_PAYLOAD_TOO_LARGE_HINT
    }
    return 'This save exceeds the maximum size Convex allows (~1 MiB per value). Trim large text or files and try again.'
  }

  const vacuousMessage =
    message.length === 0 ||
    /^server error[!.]*$/i.test(message) ||
    /^uncaught[!.]*$/i.test(message)

  if (vacuousMessage) {
    return contextualGenericMessage(slug)
  }

  return message
}
