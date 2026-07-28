import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  user: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
    phone: v.optional(v.string()),
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

  listing: defineTable({
    organizationId: v.id("organization"),
    createdBy: v.id("user"),
    title: v.string(),
    description: v.optional(v.string()),
    listingType: v.union(v.literal("SALE"), v.literal("RENT")),
    status: v.union(
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("ARCHIVED"),
    ),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_organization", ["organizationId"])
    .index("by_state", ["state"])
    .index("by_listingType", ["listingType"]),

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
});
