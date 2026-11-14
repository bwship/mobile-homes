import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  enrichUser,
  getUserByEmailDoc,
  isUserAdmin,
} from "./helpers";

declare const crypto: {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
  subtle: { digest(algorithm: string, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer> };
};

export const getUserByEmailWithHashInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.email);
    if (!user) return null;
    return enrichUser(ctx, user);
  },
});

export const setPasswordHashInternal = internalMutation({
  args: { userId: v.id("user"), passwordHash: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordHash: args.passwordHash });
  },
});

export const createPasswordResetInternal = internalMutation({
  args: {
    userId: v.id("user"),
    email: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("password_reset", {
      userId: args.userId,
      email: args.email,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const findPasswordResetByTokenHashInternal = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("password_reset")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .first();
  },
});

export const consumePasswordResetInternal = internalMutation({
  args: {
    resetId: v.id("password_reset"),
    userId: v.id("user"),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordHash: args.passwordHash });
    await ctx.db.patch(args.resetId, { usedAt: Date.now() });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return null;
    const user = await getUserByEmailDoc(ctx, identity.email);
    if (!user) return null;
    return enrichUser(ctx, user);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.email);
    if (!user) return null;
    return enrichUser(ctx, user);
  },
});

export const signupInternal = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("SELLER"), v.literal("BUYER")),
    organizationName: v.optional(v.string()),
    organizationUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.email.trim() || !args.name.trim()) {
      throw new Error("Email and name are required");
    }

    const existing = await getUserByEmailDoc(ctx, args.email);
    if (existing) throw new Error("User with this email already exists");

    const isSeller = args.role === "SELLER";
    if (isSeller && !args.organizationName?.trim()) {
      throw new Error("Company name is required for sellers");
    }

    const userId = await ctx.db.insert("user", {
      email: args.email.trim().toLowerCase(),
      name: args.name.trim(),
      isApproved: isSeller ? false : true,
      emailVerified: true,
      createdAt: Date.now(),
      passwordHash: args.passwordHash,
    });

    if (isSeller && args.organizationName?.trim()) {
      const orgId = await ctx.db.insert("organization", {
        name: args.organizationName.trim(),
        url: args.organizationUrl?.trim(),
        type: "SELLER",
        isActive: true,
        createdAt: Date.now(),
      });

      await ctx.db.patch(userId, { organizationId: orgId });
      await ctx.db.insert("organization_user", {
        organizationId: orgId,
        userId,
        role: "OWNER",
        isActive: true,
        createdAt: Date.now(),
      });
    } else if (args.role === "BUYER") {
      const orgId = await ctx.db.insert("organization", {
        name: `${args.name.trim()} (Buyer)`,
        type: "BUYER",
        isActive: true,
        createdAt: Date.now(),
      });
      await ctx.db.patch(userId, { organizationId: orgId });
      await ctx.db.insert("organization_user", {
        organizationId: orgId,
        userId,
        role: "OWNER",
        isActive: true,
        createdAt: Date.now(),
      });
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Failed to create user");
    return enrichUser(ctx, user);
  },
});

export const listAllUsers = query({
  args: { adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = args.adminEmail ? await getUserByEmailDoc(ctx, args.adminEmail) : null;
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db.query("user").collect();
    const result = [];
    for (const user of users) {
      const enriched = await enrichUser(ctx, user);
      let organizationName: string | undefined;
      if (enriched.organizationId) {
        const org = await ctx.db.get(enriched.organizationId as Id<"organization">);
        organizationName = org?.name;
      }
      result.push({
        _id: enriched._id,
        email: enriched.email,
        name: enriched.name,
        imageUrl: enriched.imageUrl,
        role: enriched.role,
        isApproved: enriched.isApproved,
        organizationId: enriched.organizationId,
        organizationName,
        createdAt: enriched.createdAt,
      });
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const adminSetUserApproved = mutation({
  args: {
    userId: v.id("user"),
    isApproved: v.boolean(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.userId, { isApproved: args.isApproved });
    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    userEmail: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    imageStorageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("User not found");
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.phone !== undefined) patch.phone = args.phone.trim() || undefined;
    if (args.theme !== undefined) patch.theme = args.theme;
    if (args.imageStorageId !== undefined) {
      patch.imageStorageId = args.imageStorageId;
      patch.imageUrl = undefined;
    }
    if (args.clearImage) {
      patch.imageStorageId = undefined;
      patch.imageUrl = undefined;
    }
    if (Object.keys(patch).length) await ctx.db.patch(user._id, patch);
    const updated = await ctx.db.get(user._id);
    return enrichUser(ctx, updated);
  },
});
