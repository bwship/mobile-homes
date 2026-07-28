import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export type ListingSeedTarget = {
  _id: Id<"listing">;
  title: string;
};

export const listListingsWithoutImages = internalQuery({
  args: {},
  handler: async (ctx): Promise<ListingSeedTarget[]> => {
    const listings = await ctx.db.query("listing").collect();
    listings.sort((a, b) => a.createdAt - b.createdAt);

    const withoutImages: ListingSeedTarget[] = [];
    for (const listing of listings) {
      const image = await ctx.db
        .query("listing_image")
        .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
        .first();
      if (!image) {
        withoutImages.push({ _id: listing._id, title: listing.title });
      }
    }

    return withoutImages;
  },
});

export const linkListingImage = internalMutation({
  args: {
    listingId: v.id("listing"),
    storageId: v.id("_storage"),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("listing_image", {
      listingId: args.listingId,
      storageId: args.storageId,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const attachImagesToListing = internalAction({
  args: {
    listingId: v.id("listing"),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<number> => {
    let attached = 0;

    for (let i = 0; i < args.imageUrls.length; i += 1) {
      const response = await fetch(args.imageUrls[i]);
      if (!response.ok) {
        console.warn("Failed to fetch seed image", args.imageUrls[i], response.status);
        continue;
      }

      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.seedImageHelpers.linkListingImage, {
        listingId: args.listingId,
        storageId,
        sortOrder: i,
      });
      attached += 1;
    }

    return attached;
  },
});
