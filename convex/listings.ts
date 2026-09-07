import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { getOrganizationOwner, getUserByEmailDoc, isUserAdmin, canManageOrganization } from "./helpers";

async function attachImages(ctx: any, listing: any) {
  const images = await ctx.db
    .query("listing_image")
    .withIndex("by_listing", (q: any) => q.eq("listingId", listing._id))
    .collect();
  images.sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const withUrls = await Promise.all(
    images.map(async (img: any) => ({
      ...img,
      url: await ctx.storage.getUrl(img.storageId),
    })),
  );

  return { ...listing, images: withUrls };
}

async function attachOrgSummary(ctx: any, listing: any) {
  const org = await ctx.db.get(listing.organizationId);
  return {
    ...listing,
    organizationName: org?.name ?? "Seller",
    organizationId: listing.organizationId,
  };
}

function resolveAssetType(listing: any): "MOBILE_HOME" | "TINY_HOUSE" {
  return listing.assetType === "TINY_HOUSE" ? "TINY_HOUSE" : "MOBILE_HOME";
}

function passesFilters(listing: any, args: any) {
  if (listing.status !== "APPROVED") return false;
  if (args.listingType && listing.listingType !== args.listingType) return false;
  if (args.assetType && resolveAssetType(listing) !== args.assetType) return false;
  if (args.state && listing.state !== args.state) return false;
  if (args.minPrice != null && listing.priceCents < args.minPrice) return false;
  if (args.maxPrice != null && listing.priceCents > args.maxPrice) return false;
  if (args.beds != null && (listing.beds ?? 0) < args.beds) return false;
  if (args.bounds) {
    const { north, south, east, west } = args.bounds;
    if (listing.lat > north || listing.lat < south || listing.lng > east || listing.lng < west) {
      return false;
    }
  }
  if (args.query) {
    const q = args.query.toLowerCase();
    const hay = `${listing.title} ${listing.city} ${listing.state} ${listing.zip} ${listing.communityName ?? ""} ${listing.manufacturer ?? ""} ${listing.model ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export const getListingStats = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listing").collect();
    const approved = listings.filter((l) => l.status === "APPROVED");
    return {
      forSale: approved.filter((l) => l.listingType === "SALE").length,
      forRent: approved.filter((l) => l.listingType === "RENT").length,
      communities: new Set(approved.map((l) => l.communityName).filter(Boolean)).size,
    };
  },
});

export const getRecentlyClosed = query({
  args: {
    limit: v.optional(v.number()),
    listingType: v.optional(v.union(v.literal("SALE"), v.literal("RENT"))),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sold = await ctx.db
      .query("listing")
      .withIndex("by_status", (q) => q.eq("status", "SOLD"))
      .collect();

    const filtered = sold.filter((l) => {
      if (args.listingType && l.listingType !== args.listingType) return false;
      if (args.state && l.state !== args.state.trim().toUpperCase()) return false;
      return true;
    });

    const sorted = filtered
      .sort((a, b) => (b.soldAt ?? b.updatedAt) - (a.soldAt ?? a.updatedAt))
      .slice(0, args.limit ?? 12);

    const enriched = [];
    for (const listing of sorted) {
      const withImages = await attachImages(ctx, listing);
      enriched.push(await attachOrgSummary(ctx, withImages));
    }
    return enriched;
  },
});

export const getTrendingThisWeek = query({
  args: {},
  handler: async (ctx) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const all = await ctx.db.query("listing").collect();
    const sold = all.filter((l) => l.status === "SOLD");
    const soldThisWeek = sold.filter((l) => (l.soldAt ?? l.updatedAt) >= weekAgo);
    const pool = soldThisWeek.length >= 3 ? soldThisWeek : sold;

    const topSales = [...pool]
      .filter((l) => l.listingType === "SALE")
      .sort((a, b) => b.priceCents - a.priceCents)
      .slice(0, 5);

    const topSalesEnriched = [];
    for (const listing of topSales) {
      const withImages = await attachImages(ctx, listing);
      topSalesEnriched.push(await attachOrgSummary(ctx, withImages));
    }

    const dealerMap = new Map<string, { organizationId: string; count: number; volumeCents: number }>();
    for (const listing of pool) {
      const key = listing.organizationId;
      const cur = dealerMap.get(key) ?? { organizationId: key, count: 0, volumeCents: 0 };
      cur.count += 1;
      cur.volumeCents += listing.priceCents;
      dealerMap.set(key, cur);
    }
    const trendingDealers = [];
    for (const row of [...dealerMap.values()].sort((a, b) => b.count - a.count || b.volumeCents - a.volumeCents).slice(0, 5)) {
      const org = await ctx.db.get(row.organizationId as Id<"organization">);
      if (!org || org.type !== "SELLER") continue;
      trendingDealers.push({
        organizationId: row.organizationId,
        name: org.name,
        count: row.count,
        volumeCents: row.volumeCents,
      });
    }

    const stateMap = new Map<string, number>();
    for (const listing of pool) {
      stateMap.set(listing.state, (stateMap.get(listing.state) ?? 0) + 1);
    }
    // Also weight active inventory for states with little sold volume
    if (stateMap.size < 3) {
      for (const listing of all.filter((l) => l.status === "APPROVED")) {
        stateMap.set(listing.state, (stateMap.get(listing.state) ?? 0) + 1);
      }
    }
    const trendingStates = [...stateMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));

    const factoryMap = new Map<string, number>();
    for (const listing of pool) {
      const name = listing.manufacturer?.trim();
      if (!name) continue;
      factoryMap.set(name, (factoryMap.get(name) ?? 0) + 1);
    }
    if (factoryMap.size < 3) {
      for (const listing of all.filter((l) => l.status === "APPROVED" || l.status === "SOLD")) {
        const name = listing.manufacturer?.trim();
        if (!name) continue;
        factoryMap.set(name, (factoryMap.get(name) ?? 0) + 1);
      }
    }
    const trendingFactories = [...factoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      topSales: topSalesEnriched,
      trendingDealers,
      trendingStates,
      trendingFactories,
    };
  },
});


export const getPublicListings = query({
  args: {
    listingType: v.optional(v.union(v.literal("SALE"), v.literal("RENT"))),
    assetType: v.optional(v.union(v.literal("MOBILE_HOME"), v.literal("TINY_HOUSE"))),
    state: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    beds: v.optional(v.number()),
    query: v.optional(v.string()),
    bounds: v.optional(
      v.object({
        north: v.number(),
        south: v.number(),
        east: v.number(),
        west: v.number(),
      }),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("listing").collect();
    const filtered = all
      .filter((l) => passesFilters(l, args))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, args.limit ?? 200);

    const enriched = [];
    for (const listing of filtered) {
      const org = await ctx.db.get(listing.organizationId);
      if (!org || org.type !== "SELLER") continue;
      const owner = await getOrganizationOwner(ctx, listing.organizationId);
      if (!owner?.isApproved) continue;
      const withImages = await attachImages(ctx, listing);
      enriched.push({
        ...(await attachOrgSummary(ctx, withImages)),
        assetType: resolveAssetType(listing),
      });
    }
    return enriched;
  },
});

export const getPublicListing = query({
  args: {
    listingId: v.id("listing"),
    viewerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;

    const org = await ctx.db.get(listing.organizationId);
    if (!org || org.type !== "SELLER") return null;

    const isPublicStatus = listing.status === "APPROVED" || listing.status === "SOLD";
    let canPreviewPrivate = false;
    if (args.viewerEmail) {
      const viewer = await getUserByEmailDoc(ctx, args.viewerEmail);
      if (viewer) {
        canPreviewPrivate =
          (await isUserAdmin(ctx, viewer._id)) ||
          (await canManageOrganization(ctx, viewer._id, listing.organizationId));
      }
    }

    if (!isPublicStatus && !canPreviewPrivate) return null;

    const owner = await getOrganizationOwner(ctx, org._id);
    // Public visitors still require an approved dealer; admins/managers can preview drafts.
    if (!canPreviewPrivate && !owner?.isApproved) return null;

    const withImages = await attachImages(ctx, listing);
    const withOrg = await attachOrgSummary(ctx, withImages);
    return {
      ...withOrg,
      organization: org,
      sellerEmail: owner?.email ?? null,
      sellerPhone: org.phone,
      previewOnly: !isPublicStatus,
    };
  },
});

export const getOrganizationListings = query({
  args: {
    organizationId: v.id("organization"),
    userEmail: v.optional(v.string()),
    includeNonPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listing")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    let canSeePrivate = false;
    if (args.userEmail) {
      const user = await getUserByEmailDoc(ctx, args.userEmail);
      if (user) {
        canSeePrivate = await canManageOrganization(ctx, user._id, args.organizationId);
      }
    }

    const visible = listings.filter((l) => {
      if (l.status === "APPROVED" || l.status === "SOLD") return true;
      return canSeePrivate && args.includeNonPublic;
    });

    visible.sort((a, b) => b.updatedAt - a.updatedAt);
    const enriched = [];
    for (const listing of visible) {
      enriched.push(await attachImages(ctx, listing));
    }
    return enriched;
  },
});

export const getPendingListings = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const pending = await ctx.db
      .query("listing")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();

    const enriched = [];
    for (const listing of pending) {
      enriched.push(await attachOrgSummary(ctx, await attachImages(ctx, listing)));
    }
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createListing = mutation({
  args: {
    userEmail: v.string(),
    /** Admins may create a listing for another dealer org. */
    organizationId: v.optional(v.id("organization")),
    title: v.string(),
    description: v.optional(v.string()),
    listingType: v.union(v.literal("SALE"), v.literal("RENT")),
    assetType: v.optional(v.union(v.literal("MOBILE_HOME"), v.literal("TINY_HOUSE"))),
    priceCents: v.number(),
    lotRentCents: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    sqft: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    widthFeet: v.optional(v.number()),
    lengthFeet: v.optional(v.number()),
    address1: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    lat: v.number(),
    lng: v.number(),
    communityName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("User not found");

    const isAdmin = await isUserAdmin(ctx, user._id);
    const organizationId = args.organizationId ?? user.organizationId;
    if (!organizationId) throw new Error("Dealer organization required");

    if (!isAdmin && user.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    const org = await ctx.db.get(organizationId);
    if (!org || org.type !== "SELLER") {
      throw new Error("Only dealers can create listings");
    }

    if (!isAdmin && !user.isApproved) {
      throw new Error("Dealer account pending approval");
    }

    const now = Date.now();
    const listingId = await ctx.db.insert("listing", {
      organizationId,
      createdBy: user._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      listingType: args.listingType,
      assetType: args.assetType ?? "MOBILE_HOME",
      status: "PENDING",
      priceCents: args.priceCents,
      lotRentCents: args.lotRentCents,
      beds: args.beds,
      baths: args.baths,
      sqft: args.sqft,
      yearBuilt: args.yearBuilt,
      manufacturer: args.manufacturer?.trim(),
      model: args.model?.trim(),
      widthFeet: args.widthFeet,
      lengthFeet: args.lengthFeet,
      address1: args.address1.trim(),
      city: args.city.trim(),
      state: args.state.trim().toUpperCase(),
      zip: args.zip.trim(),
      lat: args.lat,
      lng: args.lng,
      communityName: args.communityName?.trim(),
      createdAt: now,
      updatedAt: now,
    });

    return listingId;
  },
});

export const updateListing = mutation({
  args: {
    userEmail: v.string(),
    listingId: v.id("listing"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    listingType: v.optional(v.union(v.literal("SALE"), v.literal("RENT"))),
    assetType: v.optional(v.union(v.literal("MOBILE_HOME"), v.literal("TINY_HOUSE"))),
    priceCents: v.optional(v.number()),
    lotRentCents: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    sqft: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    widthFeet: v.optional(v.number()),
    lengthFeet: v.optional(v.number()),
    address1: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    communityName: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("APPROVED"),
        v.literal("REJECTED"),
        v.literal("ARCHIVED"),
        v.literal("SOLD"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const isAdmin = user ? await isUserAdmin(ctx, user._id) : false;
    const isOwner = user?.organizationId === listing.organizationId;
    if (!isAdmin && !isOwner) throw new Error("Unauthorized");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    const fields = [
      "title", "description", "listingType", "assetType", "priceCents", "lotRentCents",
      "beds", "baths", "sqft", "yearBuilt", "manufacturer", "model",
      "widthFeet", "lengthFeet", "address1", "city", "state", "zip",
      "lat", "lng", "communityName",
    ] as const;

    for (const field of fields) {
      const val = (args as any)[field];
      if (val !== undefined) patch[field] = typeof val === "string" ? val.trim() : val;
    }

    if (args.state !== undefined) patch.state = args.state.trim().toUpperCase();

    if (args.status !== undefined) {
      if (!isAdmin && args.status === "APPROVED") {
        throw new Error("Only admins can approve listings");
      }
      patch.status = args.status;
      if (args.status === "SOLD") {
        patch.soldAt = Date.now();
      }
    } else if (!isAdmin && listing.status === "APPROVED") {
      patch.status = "PENDING";
    }

    await ctx.db.patch(args.listingId, patch);
    return args.listingId;
  },
});

export const markListingSold = mutation({
  args: {
    userEmail: v.string(),
    listingId: v.id("listing"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const isAdmin = user ? await isUserAdmin(ctx, user._id) : false;
    const isOwner = user?.organizationId === listing.organizationId;
    if (!isAdmin && !isOwner) throw new Error("Unauthorized");
    if (listing.status !== "APPROVED" && listing.status !== "SOLD") {
      throw new Error("Only live listings can be marked sold");
    }

    const now = Date.now();
    await ctx.db.patch(args.listingId, {
      status: "SOLD",
      soldAt: now,
      updatedAt: now,
    });
    return args.listingId;
  },
});

export const adminUpdateListingStatus = mutation({
  args: {
    adminEmail: v.string(),
    listingId: v.id("listing"),
    status: v.union(
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("ARCHIVED"),
      v.literal("SOLD"),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.status === "SOLD") patch.soldAt = Date.now();
    await ctx.db.patch(args.listingId, patch);
    return { success: true };
  },
});

export const addListingImage = mutation({
  args: {
    userEmail: v.string(),
    listingId: v.id("listing"),
    storageId: v.id("_storage"),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (user?.organizationId !== listing.organizationId && !(user && (await isUserAdmin(ctx, user._id)))) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("listing_image", {
      listingId: args.listingId,
      storageId: args.storageId,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const submitListingInquiry = mutation({
  args: {
    listingId: v.id("listing"),
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing || listing.status !== "APPROVED") throw new Error("Listing not found");

    await ctx.db.insert("listing_inquiry", {
      listingId: args.listingId,
      name: args.name.trim(),
      email: args.email.trim(),
      message: args.message.trim(),
      createdAt: Date.now(),
    });

    const org = await ctx.db.get(listing.organizationId);
    const owner = org ? await getOrganizationOwner(ctx, org._id) : null;
    if (owner?.email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendListingInquiryEmail, {
        sellerEmail: owner.email,
        listingTitle: listing.title,
        fromName: args.name.trim(),
        fromEmail: args.email.trim(),
        message: args.message.trim(),
      });
    }

    return { success: true };
  },
});
