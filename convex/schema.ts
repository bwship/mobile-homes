import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  user: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    isApproved: v.boolean(),
    isAdmin: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    organizationId: v.optional(v.id("organization")),
    passwordHash: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_organization", ["organizationId"]),

  password_reset: defineTable({
    userId: v.id("user"),
    email: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_user", ["userId"]),

  organization: defineTable({
    name: v.string(),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(v.literal("SELLER"), v.literal("BUYER")),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_type", ["type"]),

  organization_user: defineTable({
    organizationId: v.id("organization"),
    userId: v.id("user"),
    role: v.union(v.literal("OWNER"), v.literal("ADMIN"), v.literal("MEMBER")),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),

  organization_invite: defineTable({
    organizationId: v.id("organization"),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("OWNER"), v.literal("ADMIN"), v.literal("MEMBER")),
    invitedBy: v.id("user"),
    tokenHash: v.string(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("ACCEPTED"),
      v.literal("REVOKED"),
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_tokenHash", ["tokenHash"]),

  listing: defineTable({
    organizationId: v.id("organization"),
    createdBy: v.id("user"),
    title: v.string(),
    description: v.optional(v.string()),
    listingType: v.union(v.literal("SALE"), v.literal("RENT")),
    /** Missing / undefined treated as MOBILE_HOME for older listings. */
    assetType: v.optional(v.union(v.literal("MOBILE_HOME"), v.literal("TINY_HOUSE"))),
    status: v.union(
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("ARCHIVED"),
      v.literal("SOLD"),
    ),
    priceCents: v.number(),
    lotRentCents: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    sqft: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    /** Factory / manufacturer name (e.g. Clayton, Champion). */
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
    soldAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_organization", ["organizationId"])
    .index("by_state", ["state"])
    .index("by_listingType", ["listingType"])
    .index("by_assetType", ["assetType"])
    .index("by_soldAt", ["soldAt"]),

  listing_image: defineTable({
    listingId: v.id("listing"),
    storageId: v.id("_storage"),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_listing", ["listingId"]),

  favorite: defineTable({
    userId: v.id("user"),
    listingId: v.id("listing"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"])
    .index("by_user_listing", ["userId", "listingId"]),

  listing_inquiry: defineTable({
    listingId: v.id("listing"),
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_listing", ["listingId"]),

  /** Buyer ↔ dealer org thread (listing optional context). */
  conversation: defineTable({
    buyerUserId: v.id("user"),
    organizationId: v.id("organization"),
    listingId: v.optional(v.id("listing")),
    lastMessage: v.string(),
    lastAt: v.number(),
    buyerUnread: v.number(),
    dealerUnread: v.number(),
    createdAt: v.number(),
  })
    .index("by_buyer", ["buyerUserId"])
    .index("by_organization", ["organizationId"])
    .index("by_buyer_organization", ["buyerUserId", "organizationId"]),

  message: defineTable({
    conversationId: v.id("conversation"),
    senderUserId: v.id("user"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  /** In-app notifications (e.g. listing favorited). */
  notification: defineTable({
    userId: v.id("user"),
    type: v.literal("LISTING_FAVORITED"),
    actorUserId: v.id("user"),
    listingId: v.id("listing"),
    organizationId: v.id("organization"),
    title: v.string(),
    body: v.string(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),
});
