export type NavLink = {
  label: string
  to: string
  description?: string
}

export type MegaColumn = {
  heading: string
  links: NavLink[]
}

export type MegaItem = {
  id: 'buy' | 'sell' | 'rent'
  label: string
  columns: MegaColumn[]
}

export type FlatItem = {
  id: string
  label: string
  to: string
}

/** Buy / Sell / Rent only — mega menus. Everything after Find a Dealer is flat. */
export const megaNavItems: MegaItem[] = [
  {
    id: 'buy',
    label: 'Buy',
    columns: [
      {
        heading: 'Homes for sale',
        links: [
          { label: 'Search homes for sale', to: '/search?type=SALE' },
          { label: 'Recently closed', to: '/closings' },
          { label: 'Tiny houses', to: '/search?asset=TINY_HOUSE' },
          { label: 'Browse by market', to: '/#markets' },
        ],
      },
    ],
  },
  {
    id: 'sell',
    label: 'Sell',
    columns: [
      {
        heading: 'Selling options',
        links: [
          { label: 'List a home', to: '/signup?role=SELLER' },
          { label: 'Manage listings', to: '/manage-listings' },
          { label: 'Advertise with us', to: '/advertise' },
        ],
      },
    ],
  },
  {
    id: 'rent',
    label: 'Rent',
    columns: [
      {
        heading: 'Homes for rent',
        links: [
          { label: 'Search homes for rent', to: '/search?type=RENT' },
          { label: 'Browse by market', to: '/#markets' },
        ],
      },
    ],
  },
]

/** Flat links — no dropdowns from MH News onward (and Find a Dealer). */
export const flatNavItems: FlatItem[] = [
  { id: 'dealers', label: 'Find a Dealer', to: '/dealers' },
  { id: 'news', label: 'MH News', to: '/news' },
  { id: 'my-home', label: 'My Home', to: '/my-home' },
  { id: 'manage', label: 'Manage Listings', to: '/manage-listings' },
  { id: 'advertise', label: 'Advertise', to: '/advertise' },
]
