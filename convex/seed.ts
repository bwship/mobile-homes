import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { hashPassword } from "./passwords";

type SeedListing = {
  seedKey: string;
  orgKey: "seller1" | "seller2";
  title: string;
  listingType: "SALE" | "RENT";
  assetType?: "MOBILE_HOME" | "TINY_HOUSE";
  priceCents: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  manufacturer: string;
  model: string;
  widthFeet: number;
  lengthFeet: number;
  address1: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  communityName?: string;
  lotRentCents?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED" | "SOLD";
  /** Days ago the listing closed (only used when status is SOLD). */
  soldDaysAgo?: number;
  description?: string;
};

const DEMO_LISTINGS: SeedListing[] = [
  {
    seedKey: "clayton-inspiration-palm-bay",
    orgKey: "seller1",
    title: "2021 Clayton Inspiration — 3 Bed / 2 Bath",
    listingType: "SALE",
    priceCents: 8990000,
    beds: 3,
    baths: 2,
    sqft: 1456,
    yearBuilt: 2021,
    manufacturer: "Clayton",
    model: "Inspiration",
    widthFeet: 28,
    lengthFeet: 52,
    address1: "4521 Palm Bay Rd NE",
    city: "Palm Bay",
    state: "FL",
    zip: "32905",
    lat: 28.0345,
    lng: -80.5887,
    communityName: "Buccaneer Estates MHP",
    lotRentCents: 45000,
  },
  {
    seedKey: "fleetwood-rent-merritt-island",
    orgKey: "seller1",
    title: "Cozy 2 Bed Mobile Home for Rent",
    listingType: "RENT",
    priceCents: 125000,
    beds: 2,
    baths: 1,
    sqft: 980,
    yearBuilt: 2015,
    manufacturer: "Fleetwood",
    model: "Westridge",
    widthFeet: 24,
    lengthFeet: 40,
    address1: "1200 E Merritt Island Cswy",
    city: "Merritt Island",
    state: "FL",
    zip: "32952",
    lat: 28.3594,
    lng: -80.6881,
    communityName: "Harbor View Park",
  },
  {
    seedKey: "champion-double-wide-austin",
    orgKey: "seller2",
    title: "Double Wide on Private Lot — Austin Area",
    listingType: "SALE",
    priceCents: 12500000,
    beds: 4,
    baths: 2,
    sqft: 1680,
    yearBuilt: 2019,
    manufacturer: "Champion",
    model: "Arbor Creek",
    widthFeet: 32,
    lengthFeet: 56,
    address1: "8801 Brodie Ln",
    city: "Austin",
    state: "TX",
    zip: "78745",
    lat: 30.2056,
    lng: -97.8351,
  },
  {
    seedKey: "legacy-starter-san-antonio",
    orgKey: "seller2",
    title: "Affordable Starter Home — San Antonio",
    listingType: "SALE",
    priceCents: 5490000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    yearBuilt: 2012,
    manufacturer: "Legacy",
    model: "Cottage",
    widthFeet: 24,
    lengthFeet: 48,
    address1: "4100 S New Braunfels Ave",
    city: "San Antonio",
    state: "TX",
    zip: "78223",
    lat: 29.4012,
    lng: -98.4572,
    communityName: "Alamo Mobile Community",
    lotRentCents: 35000,
  },
  {
    seedKey: "skyline-pending-orlando",
    orgKey: "seller1",
    title: "Pending Approval — New Listing Demo",
    listingType: "SALE",
    priceCents: 7500000,
    beds: 3,
    baths: 2,
    sqft: 1320,
    yearBuilt: 2020,
    manufacturer: "Skyline",
    model: "Shoreline",
    widthFeet: 28,
    lengthFeet: 48,
    address1: "100 Main St",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    lat: 28.5383,
    lng: -81.3792,
    status: "PENDING",
  },
  {
    seedKey: "clayton-tru-tampa",
    orgKey: "seller1",
    title: "2023 Clayton TRU — Move-In Ready in Tampa",
    listingType: "SALE",
    priceCents: 11200000,
    beds: 3,
    baths: 2,
    sqft: 1560,
    yearBuilt: 2023,
    manufacturer: "Clayton",
    model: "TRU",
    widthFeet: 28,
    lengthFeet: 56,
    address1: "7820 N Florida Ave",
    city: "Tampa",
    state: "FL",
    zip: "33604",
    lat: 28.0225,
    lng: -82.4598,
    communityName: "Sunset Palms MHP",
    lotRentCents: 52000,
    description:
      "Brand-new manufactured home with open floor plan, stainless appliances, and covered porch. Community pool and clubhouse.",
  },
  {
    seedKey: "fleetwood-jacksonville-rent",
    orgKey: "seller1",
    title: "Updated 3 Bed Rental — Jacksonville",
    listingType: "RENT",
    priceCents: 149500,
    beds: 3,
    baths: 2,
    sqft: 1200,
    yearBuilt: 2018,
    manufacturer: "Fleetwood",
    model: "Cavco Select",
    widthFeet: 28,
    lengthFeet: 44,
    address1: "4100 Southside Blvd",
    city: "Jacksonville",
    state: "FL",
    zip: "32216",
    lat: 30.2876,
    lng: -81.5542,
    communityName: "Baymeadows Mobile Estates",
  },
  {
    seedKey: "champion-lakeland-lakefront",
    orgKey: "seller1",
    title: "Lakefront Double Wide — Lakeland",
    listingType: "SALE",
    priceCents: 9850000,
    beds: 3,
    baths: 2,
    sqft: 1520,
    yearBuilt: 2020,
    manufacturer: "Champion",
    model: "Lakeview",
    widthFeet: 28,
    lengthFeet: 54,
    address1: "2200 Griffin Rd",
    city: "Lakeland",
    state: "FL",
    zip: "33810",
    lat: 28.0845,
    lng: -81.9831,
    communityName: "Lake Gibson Shores",
    lotRentCents: 48000,
  },
  {
    seedKey: "skyline-pensacola-retire",
    orgKey: "seller1",
    title: "55+ Community Home — Pensacola",
    listingType: "SALE",
    priceCents: 7990000,
    beds: 2,
    baths: 2,
    sqft: 1150,
    yearBuilt: 2017,
    manufacturer: "Skyline",
    model: "Retreat",
    widthFeet: 24,
    lengthFeet: 48,
    address1: "6100 Mobile Hwy",
    city: "Pensacola",
    state: "FL",
    zip: "32526",
    lat: 30.4213,
    lng: -87.2169,
    communityName: "Gulf Breeze Senior Park",
    lotRentCents: 42000,
  },
  {
    seedKey: "legacy-fort-myers-canal",
    orgKey: "seller1",
    title: "Canal-View Manufactured Home — Fort Myers",
    listingType: "SALE",
    priceCents: 13450000,
    beds: 4,
    baths: 2,
    sqft: 1720,
    yearBuilt: 2022,
    manufacturer: "Legacy",
    model: "Cypress",
    widthFeet: 32,
    lengthFeet: 54,
    address1: "14500 McGregor Blvd",
    city: "Fort Myers",
    state: "FL",
    zip: "33919",
    lat: 26.5629,
    lng: -81.9495,
    communityName: "Palmetto Pointe",
    lotRentCents: 55000,
  },
  {
    seedKey: "clayton-houston-family",
    orgKey: "seller2",
    title: "Family-Friendly 4 Bed — Houston Suburbs",
    listingType: "SALE",
    priceCents: 11850000,
    beds: 4,
    baths: 2,
    sqft: 1640,
    yearBuilt: 2021,
    manufacturer: "Clayton",
    model: "Summit",
    widthFeet: 32,
    lengthFeet: 52,
    address1: "11900 Fuqua St",
    city: "Houston",
    state: "TX",
    zip: "77034",
    lat: 29.6124,
    lng: -95.2401,
    communityName: "Clear Creek Mobile Village",
    lotRentCents: 38000,
  },
  {
    seedKey: "champion-dallas-rent",
    orgKey: "seller2",
    title: "Modern 2 Bed Rental — Dallas Metro",
    listingType: "RENT",
    priceCents: 139900,
    beds: 2,
    baths: 2,
    sqft: 1050,
    yearBuilt: 2019,
    manufacturer: "Champion",
    model: "Metro",
    widthFeet: 24,
    lengthFeet: 44,
    address1: "9500 Ferguson Rd",
    city: "Dallas",
    state: "TX",
    zip: "75228",
    lat: 32.7767,
    lng: -96.797,
    communityName: "East Dallas Mobile Park",
  },
  {
    seedKey: "fleetwood-fort-worth-value",
    orgKey: "seller2",
    title: "Great Value Single Wide — Fort Worth",
    listingType: "SALE",
    priceCents: 4290000,
    beds: 2,
    baths: 1,
    sqft: 880,
    yearBuilt: 2010,
    manufacturer: "Fleetwood",
    model: "Value Series",
    widthFeet: 16,
    lengthFeet: 56,
    address1: "5200 S Hulen St",
    city: "Fort Worth",
    state: "TX",
    zip: "76132",
    lat: 32.6555,
    lng: -97.398,
  },
  {
    seedKey: "legacy-el-paso-desert",
    orgKey: "seller2",
    title: "Desert Oasis Double Wide — El Paso",
    listingType: "SALE",
    priceCents: 6750000,
    beds: 3,
    baths: 2,
    sqft: 1280,
    yearBuilt: 2016,
    manufacturer: "Legacy",
    model: "Desert Rose",
    widthFeet: 28,
    lengthFeet: 48,
    address1: "7800 Montana Ave",
    city: "El Paso",
    state: "TX",
    zip: "79925",
    lat: 31.7619,
    lng: -106.485,
    communityName: "Franklin Mountain Estates",
    lotRentCents: 32000,
  },
  {
    seedKey: "clayton-phoenix-new",
    orgKey: "seller2",
    title: "2024 Energy-Efficient Home — Phoenix",
    listingType: "SALE",
    priceCents: 14200000,
    beds: 3,
    baths: 2,
    sqft: 1580,
    yearBuilt: 2024,
    manufacturer: "Clayton",
    model: "EcoSmart",
    widthFeet: 28,
    lengthFeet: 56,
    address1: "4400 N 19th Ave",
    city: "Phoenix",
    state: "AZ",
    zip: "85015",
    lat: 33.4484,
    lng: -112.074,
    communityName: "Desert Sky MHP",
    lotRentCents: 41000,
  },
  {
    seedKey: "champion-tucson-rent",
    orgKey: "seller2",
    title: "Furnished Rental — Tucson",
    listingType: "RENT",
    priceCents: 119900,
    beds: 2,
    baths: 1,
    sqft: 920,
    yearBuilt: 2014,
    manufacturer: "Champion",
    model: "Sonora",
    widthFeet: 24,
    lengthFeet: 40,
    address1: "3200 S Country Club Rd",
    city: "Tucson",
    state: "AZ",
    zip: "85713",
    lat: 32.2226,
    lng: -110.9747,
    communityName: "Cactus Trail Park",
  },
  {
    seedKey: "skyline-atlanta-suburban",
    orgKey: "seller1",
    title: "Suburban Double Wide — Atlanta Area",
    listingType: "SALE",
    priceCents: 10500000,
    beds: 3,
    baths: 2,
    sqft: 1490,
    yearBuilt: 2020,
    manufacturer: "Skyline",
    model: "Peachtree",
    widthFeet: 28,
    lengthFeet: 52,
    address1: "4100 Flat Shoals Rd",
    city: "Decatur",
    state: "GA",
    zip: "30034",
    lat: 33.6959,
    lng: -84.2266,
    communityName: "Stone Mountain Mobile Homes",
    lotRentCents: 44000,
  },
  {
    seedKey: "legacy-charlotte-rent",
    orgKey: "seller1",
    title: "3 Bed Rental Near Charlotte",
    listingType: "RENT",
    priceCents: 154900,
    beds: 3,
    baths: 2,
    sqft: 1180,
    yearBuilt: 2017,
    manufacturer: "Legacy",
    model: "Carolina",
    widthFeet: 28,
    lengthFeet: 44,
    address1: "7800 Harris Blvd",
    city: "Charlotte",
    state: "NC",
    zip: "28269",
    lat: 35.2271,
    lng: -80.8431,
    communityName: "Queen City Mobile Park",
  },
  {
    seedKey: "fleetwood-nashville-music",
    orgKey: "seller2",
    title: "Music City Manufactured Home — Nashville",
    listingType: "SALE",
    priceCents: 9200000,
    beds: 3,
    baths: 2,
    sqft: 1360,
    yearBuilt: 2019,
    manufacturer: "Fleetwood",
    model: "Harmony",
    widthFeet: 28,
    lengthFeet: 50,
    address1: "5100 Nolensville Pike",
    city: "Nashville",
    state: "TN",
    zip: "37211",
    lat: 36.1627,
    lng: -86.7816,
    communityName: "Music Valley Estates",
    lotRentCents: 39000,
  },
  {
    seedKey: "clayton-columbia-sc",
    orgKey: "seller1",
    title: "Spacious 4 Bed — Columbia, SC",
    listingType: "SALE",
    priceCents: 8750000,
    beds: 4,
    baths: 2,
    sqft: 1600,
    yearBuilt: 2018,
    manufacturer: "Clayton",
    model: "Magnolia",
    widthFeet: 32,
    lengthFeet: 52,
    address1: "2400 Decker Blvd",
    city: "Columbia",
    state: "SC",
    zip: "29206",
    lat: 34.0007,
    lng: -81.0348,
    communityName: "Palmetto Ridge MHP",
    lotRentCents: 36000,
  },
  {
    seedKey: "champion-mobile-al-gulf",
    orgKey: "seller2",
    title: "Gulf Coast Single Wide — Mobile, AL",
    listingType: "SALE",
    priceCents: 5190000,
    beds: 2,
    baths: 1,
    sqft: 940,
    yearBuilt: 2013,
    manufacturer: "Champion",
    model: "Bay Breeze",
    widthFeet: 16,
    lengthFeet: 60,
    address1: "3100 Government Blvd",
    city: "Mobile",
    state: "AL",
    zip: "36606",
    lat: 30.6954,
    lng: -88.0399,
    communityName: "Gulf Coast Mobile Park",
    lotRentCents: 30000,
  },
  {
    seedKey: "legacy-baton-rouge-rent",
    orgKey: "seller2",
    title: "Affordable 2 Bed Rental — Baton Rouge",
    listingType: "RENT",
    priceCents: 99500,
    beds: 2,
    baths: 1,
    sqft: 860,
    yearBuilt: 2011,
    manufacturer: "Legacy",
    model: "Bayou",
    widthFeet: 24,
    lengthFeet: 36,
    address1: "6200 Siegen Ln",
    city: "Baton Rouge",
    state: "LA",
    zip: "70809",
    lat: 30.4515,
    lng: -91.1871,
    communityName: "Red Stick Mobile Homes",
  },
  {
    seedKey: "skyline-savannah-charm",
    orgKey: "seller1",
    title: "Charming Coastal Home — Savannah",
    listingType: "SALE",
    priceCents: 9650000,
    beds: 3,
    baths: 2,
    sqft: 1410,
    yearBuilt: 2021,
    manufacturer: "Skyline",
    model: "Coastal",
    widthFeet: 28,
    lengthFeet: 50,
    address1: "1200 Abercorn St",
    city: "Savannah",
    state: "GA",
    zip: "31419",
    lat: 32.0108,
    lng: -81.1243,
    communityName: "Ogeechee Mobile Estates",
    lotRentCents: 43000,
  },
  {
    seedKey: "fleetwood-knoxville-mountain",
    orgKey: "seller2",
    title: "Mountain View Double Wide — Knoxville",
    listingType: "SALE",
    priceCents: 7890000,
    beds: 3,
    baths: 2,
    sqft: 1340,
    yearBuilt: 2016,
    manufacturer: "Fleetwood",
    model: "Smoky View",
    widthFeet: 28,
    lengthFeet: 48,
    address1: "7800 Kingston Pike",
    city: "Knoxville",
    state: "TN",
    zip: "37919",
    lat: 35.9606,
    lng: -83.9207,
    communityName: "Volunteer Valley MHP",
    lotRentCents: 37000,
  },
  {
    seedKey: "sold-clayton-austin",
    orgKey: "seller1",
    title: "Closed — 2022 Clayton Absolute in Austin",
    listingType: "SALE",
    priceCents: 12850000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    yearBuilt: 2022,
    manufacturer: "Clayton",
    model: "Absolute",
    widthFeet: 28,
    lengthFeet: 58,
    address1: "9100 N Lamar Blvd",
    city: "Austin",
    state: "TX",
    zip: "78753",
    lat: 30.357,
    lng: -97.698,
    communityName: "Lamar Crossing MHP",
    status: "SOLD",
    soldDaysAgo: 2,
    description: "Recently closed sale. Move-in ready Clayton Absolute.",
  },
  {
    seedKey: "sold-champion-phoenix",
    orgKey: "seller2",
    title: "Closed — Champion Titan Double-Wide Phoenix",
    listingType: "SALE",
    priceCents: 10490000,
    beds: 3,
    baths: 2,
    sqft: 1480,
    yearBuilt: 2021,
    manufacturer: "Champion",
    model: "Titan",
    widthFeet: 28,
    lengthFeet: 52,
    address1: "3400 E Baseline Rd",
    city: "Phoenix",
    state: "AZ",
    zip: "85042",
    lat: 33.378,
    lng: -112.01,
    communityName: "Baseline Palms",
    status: "SOLD",
    soldDaysAgo: 4,
  },
  {
    seedKey: "sold-fleetwood-orlando",
    orgKey: "seller1",
    title: "Closed — Fleetwood Bayside Orlando",
    listingType: "SALE",
    priceCents: 9550000,
    beds: 2,
    baths: 2,
    sqft: 1180,
    yearBuilt: 2019,
    manufacturer: "Fleetwood",
    model: "Bayside",
    widthFeet: 24,
    lengthFeet: 48,
    address1: "5400 S Kirkman Rd",
    city: "Orlando",
    state: "FL",
    zip: "32819",
    lat: 28.468,
    lng: -81.458,
    communityName: "Kirkman Estates",
    status: "SOLD",
    soldDaysAgo: 1,
  },
  {
    seedKey: "sold-skyline-dallas",
    orgKey: "seller2",
    title: "Closed — Skyline Nomad Dallas",
    listingType: "SALE",
    priceCents: 8750000,
    beds: 3,
    baths: 2,
    sqft: 1400,
    yearBuilt: 2020,
    manufacturer: "Skyline",
    model: "Nomad",
    widthFeet: 28,
    lengthFeet: 50,
    address1: "2600 W Northwest Hwy",
    city: "Dallas",
    state: "TX",
    zip: "75220",
    lat: 32.86,
    lng: -96.87,
    communityName: "Northwest Village",
    status: "SOLD",
    soldDaysAgo: 5,
  },
  {
    seedKey: "sold-legacy-tampa",
    orgKey: "seller1",
    title: "Closed — Legacy Housing Tampa Bay",
    listingType: "SALE",
    priceCents: 11990000,
    beds: 4,
    baths: 2,
    sqft: 1720,
    yearBuilt: 2023,
    manufacturer: "Legacy",
    model: "Independence",
    widthFeet: 32,
    lengthFeet: 56,
    address1: "4100 W Hillsborough Ave",
    city: "Tampa",
    state: "FL",
    zip: "33614",
    lat: 27.996,
    lng: -82.505,
    communityName: "Hillsborough Haven",
    status: "SOLD",
    soldDaysAgo: 3,
  },
  {
    seedKey: "sold-clayton-jacksonville",
    orgKey: "seller2",
    title: "Closed — Clayton Buccaneer Jacksonville",
    listingType: "SALE",
    priceCents: 7990000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    yearBuilt: 2018,
    manufacturer: "Clayton",
    model: "Buccaneer",
    widthFeet: 24,
    lengthFeet: 44,
    address1: "7800 Lem Turner Rd",
    city: "Jacksonville",
    state: "FL",
    zip: "32208",
    lat: 30.39,
    lng: -81.72,
    communityName: "Lem Turner MHP",
    status: "SOLD",
    soldDaysAgo: 6,
  },
  {
    seedKey: "leased-champion-tampa",
    orgKey: "seller1",
    title: "Leased — Champion Ideal in Tampa",
    listingType: "RENT",
    priceCents: 149500,
    beds: 3,
    baths: 2,
    sqft: 1340,
    yearBuilt: 2020,
    manufacturer: "Champion",
    model: "Ideal",
    widthFeet: 28,
    lengthFeet: 48,
    address1: "5200 E Busch Blvd",
    city: "Tampa",
    state: "FL",
    zip: "33617",
    lat: 28.033,
    lng: -82.4,
    communityName: "Busch Gardens Estates",
    lotRentCents: 45000,
    status: "SOLD",
    soldDaysAgo: 2,
    description: "Recently leased manufactured home in a family-friendly community.",
  },
  {
    seedKey: "leased-fleetwood-dallas",
    orgKey: "seller2",
    title: "Leased — Fleetwood Westport Dallas",
    listingType: "RENT",
    priceCents: 129900,
    beds: 2,
    baths: 2,
    sqft: 1120,
    yearBuilt: 2019,
    manufacturer: "Fleetwood",
    model: "Westport",
    widthFeet: 24,
    lengthFeet: 44,
    address1: "3500 W Mockingbird Ln",
    city: "Dallas",
    state: "TX",
    zip: "75235",
    lat: 32.835,
    lng: -96.845,
    communityName: "Mockingbird MHP",
    lotRentCents: 38000,
    status: "SOLD",
    soldDaysAgo: 4,
  },
  {
    seedKey: "leased-clayton-phoenix",
    orgKey: "seller1",
    title: "Leased — Clayton Destiny Phoenix",
    listingType: "RENT",
    priceCents: 119500,
    beds: 2,
    baths: 1,
    sqft: 980,
    yearBuilt: 2017,
    manufacturer: "Clayton",
    model: "Destiny",
    widthFeet: 16,
    lengthFeet: 60,
    address1: "4200 W Indian School Rd",
    city: "Phoenix",
    state: "AZ",
    zip: "85019",
    lat: 33.495,
    lng: -112.14,
    communityName: "Indian School Village",
    lotRentCents: 35000,
    status: "SOLD",
    soldDaysAgo: 1,
  },
  // Tiny houses — modern prefab / expandable container style
  {
    seedKey: "tiny-expandable-container-austin",
    orgKey: "seller1",
    title: "Expandable Prefab Tiny House — Austin",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 4290000,
    beds: 1,
    baths: 1,
    sqft: 320,
    yearBuilt: 2024,
    manufacturer: "NestPod",
    model: "Expand X1",
    widthFeet: 10,
    lengthFeet: 20,
    address1: "1100 E 5th St",
    city: "Austin",
    state: "TX",
    zip: "78702",
    lat: 30.263,
    lng: -97.727,
    communityName: "East Side Tiny Lots",
    description:
      "Modern expandable container tiny house with fold-out living deck, full kitchenette, loft sleeping, and smart climate control. Move-in ready prefab inspired by contemporary modular designs.",
  },
  {
    seedKey: "tiny-glass-cabin-asheville",
    orgKey: "seller2",
    title: "Glass-Wall Tiny Cabin — Asheville",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 6850000,
    beds: 1,
    baths: 1,
    sqft: 400,
    yearBuilt: 2023,
    manufacturer: "Alpine Modular",
    model: "Vista 400",
    widthFeet: 12,
    lengthFeet: 28,
    address1: "22 Tunnel Rd",
    city: "Asheville",
    state: "NC",
    zip: "28805",
    lat: 35.592,
    lng: -82.492,
    communityName: "Blue Ridge Tiny Village",
    description:
      "Floor-to-ceiling glass, insulated steel frame, and a compact loft bedroom. Ideal ADU or short-stay retreat with low utility costs.",
  },
  {
    seedKey: "tiny-studio-pod-tampa",
    orgKey: "seller1",
    title: "Studio Prefab Pod — Tampa Bay",
    assetType: "TINY_HOUSE",
    listingType: "RENT",
    priceCents: 145000,
    beds: 1,
    baths: 1,
    sqft: 280,
    yearBuilt: 2024,
    manufacturer: "NestPod",
    model: "Studio S",
    widthFeet: 8,
    lengthFeet: 24,
    address1: "4800 E Busch Blvd",
    city: "Tampa",
    state: "FL",
    zip: "33617",
    lat: 28.033,
    lng: -82.405,
    communityName: "Bay Tiny Living",
    lotRentCents: 45000,
    description:
      "Compact expandable studio pod with bathroom, kitchenette, and outdoor awning. Perfect for guests or remote work. Monthly rent includes lot.",
  },
  {
    seedKey: "tiny-family-duo-denver",
    orgKey: "seller2",
    title: "2-Bed Expandable Tiny Home — Denver",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 7990000,
    beds: 2,
    baths: 1,
    sqft: 480,
    yearBuilt: 2025,
    manufacturer: "Horizon Prefab",
    model: "Duo Expand",
    widthFeet: 12,
    lengthFeet: 32,
    address1: "3400 W 38th Ave",
    city: "Denver",
    state: "CO",
    zip: "80211",
    lat: 39.769,
    lng: -105.033,
    communityName: "Highlands Tiny Court",
    description:
      "Two expandable wings create a surprisingly spacious tiny home: primary loft, guest nook, full bath, and outdoor kitchen ready deck.",
  },
  {
    seedKey: "tiny-offgrid-boise",
    orgKey: "seller1",
    title: "Off-Grid Ready Tiny House — Boise",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 5490000,
    beds: 1,
    baths: 1,
    sqft: 360,
    yearBuilt: 2024,
    manufacturer: "Horizon Prefab",
    model: "Trail Ready",
    widthFeet: 10,
    lengthFeet: 26,
    address1: "5200 W State St",
    city: "Boise",
    state: "ID",
    zip: "83703",
    lat: 43.648,
    lng: -116.275,
    description:
      "Steel modular shell with solar-ready roof mounts, composting-toilet option, and propane backup. Towable chassis available separately.",
  },
  {
    seedKey: "tiny-waterfront-charleston",
    orgKey: "seller2",
    title: "Waterfront Tiny Retreat — Charleston",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 9250000,
    beds: 1,
    baths: 1,
    sqft: 420,
    yearBuilt: 2023,
    manufacturer: "Coastal Modular",
    model: "Harbor 420",
    widthFeet: 12,
    lengthFeet: 30,
    address1: "88 Folly Rd",
    city: "Charleston",
    state: "SC",
    zip: "29412",
    lat: 32.735,
    lng: -79.965,
    communityName: "Folly Tiny Shore",
    description:
      "Elevated prefab tiny home with wrap deck, hurricane-rated windows, and open living/kitchen. Designed for coastal lots and ADU use.",
  },
  {
    seedKey: "tiny-urban-adjoining-portland",
    orgKey: "seller1",
    title: "Urban ADU Tiny House — Portland",
    assetType: "TINY_HOUSE",
    listingType: "RENT",
    priceCents: 185000,
    beds: 1,
    baths: 1,
    sqft: 350,
    yearBuilt: 2024,
    manufacturer: "NestPod",
    model: "ADU Flex",
    widthFeet: 10,
    lengthFeet: 28,
    address1: "2200 NE Alberta St",
    city: "Portland",
    state: "OR",
    zip: "97211",
    lat: 45.559,
    lng: -122.643,
    lotRentCents: 0,
    description:
      "City-permitted ADU-style tiny house: laundry closet, full bath, queen loft, and street-facing porch. Monthly rental.",
  },
  {
    seedKey: "tiny-desert-modern-phoenix",
    orgKey: "seller2",
    title: "Desert Modern Tiny House — Phoenix",
    assetType: "TINY_HOUSE",
    listingType: "SALE",
    priceCents: 6150000,
    beds: 1,
    baths: 1,
    sqft: 380,
    yearBuilt: 2025,
    manufacturer: "Alpine Modular",
    model: "Solara",
    widthFeet: 11,
    lengthFeet: 28,
    address1: "4100 E Camelback Rd",
    city: "Phoenix",
    state: "AZ",
    zip: "85018",
    lat: 33.509,
    lng: -111.995,
    communityName: "Camelback Tiny Lots",
    description:
      "Heat-reflective cladding, deep overhangs, and an expandable side deck. Prefab tiny living tuned for desert climates.",
  },
];

async function insertSeedListings(
  ctx: { db: any },
  orgs: { seller1: any; seller2: any },
  users: { seller1: any; seller2: any },
) {
  const existing = await ctx.db.query("listing").collect();
  const existingTitles = new Set(existing.map((listing: { title: string }) => listing.title));
  const now = Date.now();
  let inserted = 0;

  for (const item of DEMO_LISTINGS) {
    if (existingTitles.has(item.title)) continue;

    const org = orgs[item.orgKey];
    const user = users[item.orgKey];
    const { orgKey, seedKey, status, description, soldDaysAgo, assetType, ...rest } = item;
    const soldAt =
      status === "SOLD"
        ? now - (soldDaysAgo ?? 3) * 24 * 60 * 60 * 1000
        : undefined;

    await ctx.db.insert("listing", {
      organizationId: org,
      createdBy: user,
      status: status ?? "APPROVED",
      assetType: assetType ?? "MOBILE_HOME",
      description:
        description ??
        "Beautiful manufactured home in a great community. Schedule a tour today.",
      createdAt: now,
      updatedAt: soldAt ?? now,
      ...(soldAt != null ? { soldAt } : {}),
      ...rest,
    });
    inserted += 1;
  }

  return inserted;
}

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("user").first();
    if (existing) {
      const orgs = await ctx.db.query("organization").collect();
      const users = await ctx.db.query("user").collect();
      const seller1Org = orgs.find((o) => o.name === "Sunshine Mobile Homes");
      const seller2Org = orgs.find((o) => o.name === "Gulf Coast MH Dealers");
      const seller1User = users.find((u) => u.email === "seller@mhm.com");
      const seller2User = users.find((u) => u.email === "dealer@mhm.com");
      const adminUser = users.find((u) => u.email === "admin@mhm.com");

      // Ensure existing admin is assigned to a dealer org for listing.
      if (adminUser && seller1Org && !adminUser.organizationId) {
        await ctx.db.patch(adminUser._id, { organizationId: seller1Org._id });
        const membership = await ctx.db
          .query("organization_user")
          .withIndex("by_user", (q) => q.eq("userId", adminUser._id))
          .first();
        if (!membership) {
          await ctx.db.insert("organization_user", {
            organizationId: seller1Org._id,
            userId: adminUser._id,
            role: "ADMIN",
            isActive: true,
            createdAt: Date.now(),
          });
        }
      }

      if (!seller1Org || !seller2Org || !seller1User || !seller2User) {
        return { skipped: true, inserted: 0 };
      }
      const inserted = await insertSeedListings(
        ctx,
        { seller1: seller1Org._id, seller2: seller2Org._id },
        { seller1: seller1User._id, seller2: seller2User._id },
      );
      return { skipped: true, inserted };
    }

    const now = Date.now();
    const adminHash = await hashPassword("admin12345");
    const sellerHash = await hashPassword("seller12345");

    const adminId = await ctx.db.insert("user", {
      email: "admin@mhm.com",
      name: "Admin User",
      isApproved: true,
      isAdmin: true,
      emailVerified: true,
      createdAt: now,
      passwordHash: adminHash,
    });

    const seller1Org = await ctx.db.insert("organization", {
      name: "Sunshine Mobile Homes",
      url: "https://sunshinehomes.example.com",
      phone: "555-0100",
      type: "SELLER",
      isActive: true,
      createdAt: now,
    });

    // Assign admin to the primary dealer org so they can list under it.
    await ctx.db.patch(adminId, { organizationId: seller1Org });
    await ctx.db.insert("organization_user", {
      organizationId: seller1Org,
      userId: adminId,
      role: "ADMIN",
      isActive: true,
      createdAt: now,
    });

    const seller1Id = await ctx.db.insert("user", {
      email: "seller@mhm.com",
      name: "Jane Seller",
      isApproved: true,
      emailVerified: true,
      createdAt: now,
      organizationId: seller1Org,
      passwordHash: sellerHash,
    });

    await ctx.db.insert("organization_user", {
      organizationId: seller1Org,
      userId: seller1Id,
      role: "OWNER",
      isActive: true,
      createdAt: now,
    });

    const seller2Org = await ctx.db.insert("organization", {
      name: "Gulf Coast MH Dealers",
      url: "https://gulfcoast.example.com",
      phone: "555-0200",
      type: "SELLER",
      isActive: true,
      createdAt: now,
    });

    const seller2Id = await ctx.db.insert("user", {
      email: "dealer@mhm.com",
      name: "Bob Dealer",
      isApproved: true,
      emailVerified: true,
      createdAt: now,
      organizationId: seller2Org,
      passwordHash: sellerHash,
    });

    await ctx.db.insert("organization_user", {
      organizationId: seller2Org,
      userId: seller2Id,
      role: "OWNER",
      isActive: true,
      createdAt: now,
    });

    const inserted = await insertSeedListings(
      ctx,
      { seller1: seller1Org, seller2: seller2Org },
      { seller1: seller1Id, seller2: seller2Id },
    );

    return {
      skipped: false,
      inserted,
      adminEmail: "admin@mhm.com",
      sellerEmail: "seller@mhm.com",
      adminId,
    };
  },
});

export const seedListings = mutation({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organization").collect();
    const users = await ctx.db.query("user").collect();
    const seller1Org = orgs.find((o) => o.name === "Sunshine Mobile Homes");
    const seller2Org = orgs.find((o) => o.name === "Gulf Coast MH Dealers");
    const seller1User = users.find((u) => u.email === "seller@mhm.com");
    const seller2User = users.find((u) => u.email === "dealer@mhm.com");

    if (!seller1Org || !seller2Org || !seller1User || !seller2User) {
      throw new Error("Run seed:seedDemo first to create demo sellers.");
    }

    const inserted = await insertSeedListings(
      ctx,
      { seller1: seller1Org._id, seller2: seller2Org._id },
      { seller1: seller1User._id, seller2: seller2User._id },
    );

    const listings = await ctx.db.query("listing").collect();
    const approved = listings.filter((l) => l.status === "APPROVED");

    return {
      inserted,
      total: listings.length,
      approved: approved.length,
      forSale: approved.filter((l) => l.listingType === "SALE").length,
      forRent: approved.filter((l) => l.listingType === "RENT").length,
    };
  },
});

/** Idempotent: creates/updates Bob Wall admin, dealer, and customer accounts. */
export const seedBobAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const passwordHash = await hashPassword("testing");
    const results: Record<string, string> = {};

    // Ensure a dealer org exists for admin + dealer users.
    let dealerOrg = (
      await ctx.db
        .query("organization")
        .withIndex("by_type", (q) => q.eq("type", "SELLER"))
        .collect()
    ).find((o) => o.name === "Sunshine Mobile Homes" && o.isActive !== false);

    if (!dealerOrg) {
      const orgId = await ctx.db.insert("organization", {
        name: "Sunshine Mobile Homes",
        url: "https://sunshinehomes.example.com",
        phone: "555-0100",
        type: "SELLER",
        isActive: true,
        createdAt: now,
      });
      dealerOrg = (await ctx.db.get(orgId))!;
    }

    async function upsertUser(opts: {
      email: string;
      name: string;
      isAdmin?: boolean;
      orgId?: Id<"organization">;
      orgRole?: "OWNER" | "ADMIN" | "MEMBER";
      createBuyerOrg?: boolean;
    }) {
      const email = opts.email.trim().toLowerCase();
      let user = await ctx.db
        .query("user")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          name: opts.name,
          passwordHash,
          isApproved: true,
          isAdmin: opts.isAdmin ?? false,
          emailVerified: true,
          ...(opts.orgId ? { organizationId: opts.orgId } : {}),
        });
        results[email] = "updated";
      } else {
        let organizationId = opts.orgId;
        if (opts.createBuyerOrg) {
          organizationId = await ctx.db.insert("organization", {
            name: `${opts.name} (Customer)`,
            type: "BUYER",
            isActive: true,
            createdAt: now,
          });
        }
        const userId = await ctx.db.insert("user", {
          email,
          name: opts.name,
          passwordHash,
          isApproved: true,
          isAdmin: opts.isAdmin ?? false,
          emailVerified: true,
          createdAt: now,
          ...(organizationId ? { organizationId } : {}),
        });
        user = (await ctx.db.get(userId))!;
        results[email] = "created";

        if (organizationId) {
          await ctx.db.insert("organization_user", {
            organizationId,
            userId,
            role: opts.orgRole ?? (opts.createBuyerOrg ? "OWNER" : "MEMBER"),
            isActive: true,
            createdAt: now,
          });
        }
        return user;
      }

      if (opts.orgId) {
        const membership = await ctx.db
          .query("organization_user")
          .withIndex("by_user", (q) => q.eq("userId", user!._id))
          .collect();
        const hasOrg = membership.some(
          (m) => m.organizationId === opts.orgId && m.isActive !== false,
        );
        if (!hasOrg) {
          await ctx.db.insert("organization_user", {
            organizationId: opts.orgId,
            userId: user._id,
            role: opts.orgRole ?? "MEMBER",
            isActive: true,
            createdAt: now,
          });
        }
      }

      return user;
    }

    await upsertUser({
      email: "bob.m.wall@gmail.com",
      name: "Bob Wall",
      isAdmin: true,
      orgId: dealerOrg._id,
      orgRole: "ADMIN",
    });

    await upsertUser({
      email: "Jdboakwood@gmail.com",
      name: "JD Boakwood",
      isAdmin: true,
      orgId: dealerOrg._id,
      orgRole: "ADMIN",
    });

    await upsertUser({
      email: "bob.m.wall+dealer@gmail.com",
      name: "Bob Wall (Dealer)",
      orgId: dealerOrg._id,
      orgRole: "OWNER",
    });

    await upsertUser({
      email: "bob.m.wall+customer@gmail.com",
      name: "Bob Wall (Customer)",
      createBuyerOrg: true,
    });

    return {
      password: "testing",
      dealerOrg: dealerOrg.name,
      results,
    };
  },
});
