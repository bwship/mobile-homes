// Normalize a user-typed URL: trim whitespace and prepend https:// when no
// scheme is present. Empty input is returned as-is so callers can decide
// whether the field is required. Mirrors `normalizeWebsiteUrl` in
// `convex/organizations.ts` so client and server agree on shape.
export function normalizeWebsiteUrl(input: string | undefined | null): string {
  const trimmed = (input ?? '').trim()
  if (!trimmed) return ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
