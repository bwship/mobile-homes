import { ConvexClient } from 'convex/browser'

const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  import.meta.env.CONVEX_URL ||
  ''

if (!convexUrl) {
  console.warn(
    'Convex URL is not set. Add VITE_CONVEX_URL (or CONVEX_URL) to mobile-homes/.env.local',
  )
}

export const convex = new ConvexClient(convexUrl)
