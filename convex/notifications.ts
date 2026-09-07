import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { enrichUser, getUserByEmailDoc, isUserAdmin } from "./helpers";

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

async function canManageListingOrg(ctx: any, userId: Id<"user">, organizationId: Id<"organization">) {
  if (await isUserAdmin(ctx, userId)) return true;
  const memberIds = await getOrgMemberUserIds(ctx, organizationId);
  return memberIds.includes(userId);
}

export const listMyNotifications = query({
  args: { userEmail: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return [];

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);
    const rows = await ctx.db
      .query("notification")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    rows.sort((a, b) => b.createdAt - a.createdAt);
    const sliced = rows.slice(0, limit);

    const result = [];
    for (const n of sliced) {
      const actor = await ctx.db.get(n.actorUserId);
      const enrichedActor = actor ? await enrichUser(ctx, actor) : null;
      const listing = await ctx.db.get(n.listingId);
      result.push({
        _id: n._id,
        type: n.type,
        title: n.title,
        body: n.body,
        listingId: n.listingId,
        listingTitle: listing?.title ?? null,
        organizationId: n.organizationId,
        actorUserId: n.actorUserId,
        actorName: enrichedActor?.name ?? "Someone",
        actorImageUrl: enrichedActor?.imageUrl ?? null,
        readAt: n.readAt ?? null,
        createdAt: n.createdAt,
      });
    }
    return result;
  },
});

export const getUnreadCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return 0;

    const rows = await ctx.db
      .query("notification")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return rows.filter((n) => !n.readAt).length;
  },
});

export const markRead = mutation({
  args: {
    userEmail: v.string(),
    notificationId: v.id("notification"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const n = await ctx.db.get(args.notificationId);
    if (!n || n.userId !== user._id) throw new Error("Unauthorized");

    if (!n.readAt) {
      await ctx.db.patch(args.notificationId, { readAt: Date.now() });
    }
    return { success: true };
  },
});

export const markAllRead = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const rows = await ctx.db
      .query("notification")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    for (const n of rows) {
      if (!n.readAt) await ctx.db.patch(n._id, { readAt: now });
    }
    return { success: true };
  },
});

/** Dealer opens (or creates) a conversation with the buyer who favorited a listing. */
export const openFavoriteConversation = mutation({
  args: {
    userEmail: v.string(),
    notificationId: v.id("notification"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const n = await ctx.db.get(args.notificationId);
    if (!n || n.userId !== user._id) throw new Error("Unauthorized");
    if (n.type !== "LISTING_FAVORITED") throw new Error("Unsupported notification");

    const listing = await ctx.db.get(n.listingId);
    if (!listing) throw new Error("Listing not found");

    if (!(await canManageListingOrg(ctx, user._id, listing.organizationId))) {
      throw new Error("Unauthorized");
    }

    if (!n.readAt) {
      await ctx.db.patch(args.notificationId, { readAt: Date.now() });
    }

    let conversation = await ctx.db
      .query("conversation")
      .withIndex("by_buyer_organization", (q) =>
        q.eq("buyerUserId", n.actorUserId).eq("organizationId", listing.organizationId),
      )
      .first();

    const now = Date.now();
    if (!conversation) {
      const conversationId = await ctx.db.insert("conversation", {
        buyerUserId: n.actorUserId,
        organizationId: listing.organizationId,
        listingId: n.listingId,
        lastMessage: "Saved your listing",
        lastAt: now,
        buyerUnread: 0,
        dealerUnread: 0,
        createdAt: now,
      });
      return { conversationId };
    }

    await ctx.db.patch(conversation._id, {
      listingId: conversation.listingId ?? n.listingId,
    });
    return { conversationId: conversation._id };
  },
});
