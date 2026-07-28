import { formatCents } from './utils'

export function formatListingPrice(cents: number, listingType: 'SALE' | 'RENT') {
  const amount = `$${formatCents(cents)}`
  return listingType === 'RENT' ? `${amount}/mo` : amount
}

export function formatLotRent(cents?: number | null) {
  if (cents == null) return null
  return `$${formatCents(cents)}/mo lot rent`
}

export function bedsBathsLabel(beds?: number | null, baths?: number | null) {
  const parts: string[] = []
  if (beds != null) parts.push(`${beds} bd`)
  if (baths != null) parts.push(`${baths} ba`)
  return parts.join(' · ')
}

export function fullAddress(listing: {
  address1: string
  city: string
  state: string
  zip: string
}) {
  return `${listing.address1}, ${listing.city}, ${listing.state} ${listing.zip}`
}

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]
