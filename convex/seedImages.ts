import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { ListingSeedTarget } from "./seedImageHelpers";

const IMAGE_PARAMS = "auto=format&fit=crop&w=1400&q=80";

const EXTERIOR_PHOTOS = [
  `https://images.unsplash.com/photo-1713948898788-547426f32abc?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1719530156133-0f5c96e44521?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1692133219792-2cf075603e65?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1671198274811-ef6e73769528?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1652946336807-bd35785ef268?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1770938474402-b605503e1342?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1573003139034-1693385f21a6?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1472224371017-08207f84aaae?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1770938474406-ce5456513ac8?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1652946337030-b8de81c06235?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1600585154526-990dced4db0d?${IMAGE_PARAMS}`,
  // Compact / cabin / modern ADU vibes for tiny homes
  `https://images.unsplash.com/photo-1518780664697-55e3ad937233?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1449844908441-882987f98ffa?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1523217582562-09d0def993a6?${IMAGE_PARAMS}`,
];

const INTERIOR_PHOTOS = [
  `https://images.unsplash.com/photo-1694885198442-0481d4389008?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1694885196093-6427f01f5c75?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1694885197739-8c53030838d0?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1694885143807-bc6e4b0fc789?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1694885150510-cb89a261081d?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1694885200929-42646459bcc7?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1621872112223-167c62e0782a?${IMAGE_PARAMS}`,
  `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?${IMAGE_PARAMS}`,
];

function photosForListing(index: number): string[] {
  return [
    EXTERIOR_PHOTOS[index % EXTERIOR_PHOTOS.length],
    INTERIOR_PHOTOS[index % INTERIOR_PHOTOS.length],
    EXTERIOR_PHOTOS[(index + 3) % EXTERIOR_PHOTOS.length],
  ];
}

export const seedListingImages = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ listingsUpdated: number; imagesAttached: number; skipped: number }> => {
    const listings: ListingSeedTarget[] = await ctx.runQuery(
      internal.seedImageHelpers.listListingsWithoutImages,
    );
    let listingsUpdated = 0;
    let imagesAttached = 0;

    for (let i = 0; i < listings.length; i += 1) {
      const listing = listings[i];
      const attached = await ctx.runAction(internal.seedImageHelpers.attachImagesToListing, {
        listingId: listing._id,
        imageUrls: photosForListing(i),
      });
      if (attached > 0) {
        listingsUpdated += 1;
        imagesAttached += attached;
      }
    }

    return {
      listingsUpdated,
      imagesAttached,
      skipped: listings.length - listingsUpdated,
    };
  },
});
