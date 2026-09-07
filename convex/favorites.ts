import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getUserByEmailDoc } from "./helpers";

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

async function getOrgMemberUserIds(
  ctx: any,
  organizationId: Id<"organization">,
): Promise<Id<"user">[]> {
  const ids = new Set<string>();

  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_organization", (q: any) => q.eq("organizationId", organizationId))
    .collect();
  for (const m of memberships) {
    if (m.isActive === false) continue;
    ids.add(m.userId);
  }

  const users = await ctx.db
    .query("user")
    .withIndex("by_organization", (q: any) => q.eq("organizationId", organizationId))
    .collect();
  for (const u of users) ids.add(u._id);

  return [...ids] as Id<"user">[];
}

async function notifyListingFavorited(
  ctx: any,
  actorUserId: Id<"user">,
  listing: any,
) {
  const recipients = await getOrgMemberUserIds(ctx, listing.organizationId);
  const actor = await ctx.db.get(actorUserId);
  const actorName = actor?.name?.trim() || "Someone";
  const now = Date.now();

  for (const recipientId of recipients) {
    if (recipientId === actorUserId) continue;
    await ctx.db.insert("notification", {
      userId: recipientId,
      type: "LISTING_FAVORITED",
      actorUserId,
      listingId: listing._id,
      organizationId: listing.organizationId,
      title: "Listing saved",
      body: `${actorName} saved “${listing.title}”`,
      createdAt: now,
    });
  }
}

export const getFavoritesCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return 0;

    const favorites = await ctx.db
      .query("favorite")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    let count = 0;
    for (const fav of favorites) {
      const listing = await ctx.db.get(fav.listingId);
      if (listing) count += 1;
    }
    return count;
  },
});

export const getUserFavorites = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favorite")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const listings = [];
    for (const fav of favorites) {
      const listing = await ctx.db.get(fav.listingId);
      if (!listing) continue;
      // Show everything the user saved (including pending previews they favorited).
      listings.push({
        ...(await attachImages(ctx, listing)),
        favoritedAt: fav.createdAt,
      });
    }
    return listings.sort(
      (a, b) => (b.favoritedAt ?? b.updatedAt) - (a.favoritedAt ?? a.updatedAt),
    );
  },
});

export const isFavorite = query({
  args: { userEmail: v.string(), listingId: v.id("listing") },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return false;

    const existing = await ctx.db
      .query("favorite")
      .withIndex("by_user_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId),
      )
      .first();

    return Boolean(existing);
  },
});

export const toggleFavorite = mutation({
  args: { userEmail: v.string(), listingId: v.id("listing") },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Login required");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const existing = await ctx.db
      .query("favorite")
      .withIndex("by_user_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favorite", {
      userId: user._id,
      listingId: args.listingId,
      createdAt: Date.now(),
    });
    await notifyListingFavorited(ctx, user._id, listing);
    return { favorited: true };
  },
});
