const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? ''

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const trimmed = address.trim()
  if (!trimmed) throw new Error('Address is required')

  if (!GOOGLE_MAPS_API_KEY) {
    // Fallback coordinates (Orlando) when no API key — lets local dev work
    console.warn('[geocode] No API key; using fallback coordinates')
    return { lat: 28.5383, lng: -81.3792 }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', trimmed)
  url.searchParams.set('key', GOOGLE_MAPS_API_KEY)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
    throw new Error('Could not geocode that address. Check city, state, and ZIP.')
  }

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}
