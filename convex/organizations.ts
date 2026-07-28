import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  enrichUser,
  getOrganizationOwner,
  getUserByEmailDoc,
  isUserAdmin,
} from "./helpers";

export const getOrganization = query({
  args: { organizationId: v.id("organization") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.isActive === false) return null;

    const owner = await getOrganizationOwner(ctx, args.organizationId);
    const listingCount = (
      await ctx.db
        .query("listing")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
        .collect()
    ).filter((l) => l.status === "APPROVED").length;

    return {
      ...org,
      ownerApproved: owner?.isApproved ?? false,
      approvedListingCount: listingCount,
    };
  },
});

export const getMyOrganization = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user?.organizationId) return null;
    const org = await ctx.db.get(user.organizationId);
    if (!org) return null;
    return { ...org, user: await enrichUser(ctx, user) };
  },
});

export const getAllSellerOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db
      .query("organization")
      .withIndex("by_type", (q) => q.eq("type", "SELLER"))
      .collect();
    return orgs.filter((o) => o.isActive !== false);
  },
});

export const getPendingSellers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const sellerOrgs = await ctx.db
      .query("organization")
      .withIndex("by_type", (q) => q.eq("type", "SELLER"))
      .collect();

    const pending = [];
    for (const org of sellerOrgs) {
      const owner = await getOrganizationOwner(ctx, org._id);
      if (owner && !owner.isApproved) {
        pending.push({
          organization: org,
          owner: await enrichUser(ctx, owner),
        });
      }
    }
    return pending;
  },
});

export const approveOrganization = mutation({
  args: {
    organizationId: v.id("organization"),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.type !== "SELLER") {
      throw new Error("Organization not found");
    }

    const owner = await getOrganizationOwner(ctx, args.organizationId);
    if (!owner) throw new Error("Organization owner not found");

    await ctx.db.patch(owner._id, { isApproved: true });
    return { success: true };
  },
});

export const updateOrganization = mutation({
  args: {
    userEmail: v.string(),
    organizationId: v.id("organization"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user?.organizationId || user.organizationId !== args.organizationId) {
      throw new Error("Unauthorized");
    }

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.url !== undefined) patch.url = args.url.trim() || undefined;
    if (args.phone !== undefined) patch.phone = args.phone.trim() || undefined;
    if (Object.keys(patch).length) {
      await ctx.db.patch(args.organizationId, patch);
    }
    return await ctx.db.get(args.organizationId);
  },
});
