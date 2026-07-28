import { mutation } from "./_generated/server";
import { hashPassword } from "./passwords";

type SeedListing = {
  seedKey: string;
  orgKey: "seller1" | "seller2";
  title: string;
  listingType: "SALE" | "RENT";
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
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
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
    const { orgKey, seedKey, status, description, ...rest } = item;

    await ctx.db.insert("listing", {
      organizationId: org,
      createdBy: user,
      status: status ?? "APPROVED",
      description:
        description ??
        "Beautiful manufactured home in a great community. Schedule a tour today.",
      createdAt: now,
      updatedAt: now,
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
