import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format cents to dollar string, e.g. 500 → "5", 150 → "1.50". Returns "0" for NaN/undefined/null. */
export function formatCents(cents: number | undefined | null): string {
  const n = Number(cents) || 0
  const isWholeDollar = n % 100 === 0
  return (n / 100).toLocaleString('en-US', {
    minimumFractionDigits: isWholeDollar ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Avatar placeholder when there is no image: first letter of the first two whitespace-separated words.
 * One word → single initial; empty → fallback.
 */
export function avatarInitialsFromName(
  name: string | undefined | null,
  fallback = '?'
): string {
  if (!name?.trim()) return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase()
}

/** Strip trailing qualifiers like " (Supplier)" so sort uses the person's name, not the label. */
function nameForSortKey(name: string | undefined): string {
  return (name || '')
    .trim()
    .replace(/\s*\([^)]*\)\s*$/u, '')
    .trim()
}

/** Sort key from display name: last name first, then given name(s). Handles "First Last" and "Last, First". */
export function lastNameFirstSortKey(name: string | undefined): [string, string] {
  const raw = nameForSortKey(name)
  if (!raw) return ['', '']
  if (raw.includes(',')) {
    const [lastPart, firstPart] = raw.split(',').map((s) => s.trim())
    return [lastPart || '', firstPart || '']
  }
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ['', '']
  if (parts.length === 1) return [parts[0]!, '']
  const last = parts[parts.length - 1]!
  const first = parts.slice(0, -1).join(' ')
  return [last, first]
}

export function compareByLastNameFirst(aName: string | undefined, bName: string | undefined): number {
  const [la, fa] = lastNameFirstSortKey(aName)
  const [lb, fb] = lastNameFirstSortKey(bName)
  const c = la.localeCompare(lb, undefined, { sensitivity: 'base' })
  if (c !== 0) return c
  return fa.localeCompare(fb, undefined, { sensitivity: 'base' })
}

/** One plain line for grids/lists when `description` is Markdown-backed. */
export function productMarkdownListSnippet(
  raw: string | undefined | null,
  maxChars = 220,
): string {
  const text = typeof raw === 'string' ? raw : ''
  if (!text.trim()) return ''

  const lines = text.replace(/\r\n/g, '\n').trim().split(/\n/)
  let firstBody = ''

  for (const line of lines) {
    let t = line.replace(/^#{1,6}\s+/, '').trim()
    // Heading-only rows like "###" or "## Description"
    if (!t) continue
    if (/^desc(?:ription)?$/i.test(t)) continue

    t = t.replace(/^description\s+/i, '').trim()

    // Line was only “Description” after stripping #
    if (!t || /^desc(?:ription)?$/i.test(t)) continue

    firstBody = t
    break
  }

  const oneLine = firstBody.replace(/\s+/g, ' ').trim()
  if (!oneLine) return ''

  if (maxChars > 0 && oneLine.length > maxChars) {
    return `${oneLine.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
  }
  return oneLine
}

/** Display label for org roles and role chips (OWNER → Owner, SYSTEM_ADMIN → System admin).
 *
 * When `orgType === 'BUYER'`, we override two labels to match the product team's
 * preferred terminology for buyer organizations: OWNER renders as "Buyer" and
 * MEMBER renders as "Registered". Backend literals are unchanged.
 */
export function formatRoleChipLabel(
  key: string | undefined,
  orgType?: 'SUPPLIER' | 'BUYER',
): string {
  if (!key) return '—'
  if (orgType === 'BUYER') {
    if (key === 'OWNER') return 'Buyer'
    if (key === 'MEMBER') return 'Registered'
  }
  const map: Record<string, string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
    SYSTEM_ADMIN: 'System admin',
    ULTRA_BUYER: 'Power Buyer',
  }
  if (map[key]) return map[key]
  return key
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
