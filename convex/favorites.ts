import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByEmailDoc } from "./helpers";

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
      if (listing && listing.status === "APPROVED") {
        listings.push(listing);
      }
    }
    return listings.sort((a, b) => b.updatedAt - a.updatedAt);
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
    return { favorited: true };
  },
});
