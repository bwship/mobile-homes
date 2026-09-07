import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  enrichUser,
  getUserByEmailDoc,
  isUserAdmin,
  resolveOrgImageUrl,
} from "./helpers";

async function getActiveOrgIdsForUser(
  ctx: any,
  userId: Id<"user">,
): Promise<Id<"organization">[]> {
  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();
  const ids: Id<"organization">[] = [];
  for (const m of memberships) {
    if (m.isActive === false) continue;
    ids.push(m.organizationId);
  }
  const user = await ctx.db.get(userId);
  if (user?.organizationId && !ids.includes(user.organizationId)) {
    ids.push(user.organizationId);
  }
  return ids;
}

async function canAccessConversation(ctx: any, userId: Id<"user">, conversation: any) {
  if (await isUserAdmin(ctx, userId)) return true;
  if (conversation.buyerUserId === userId) return true;
  const orgIds = await getActiveOrgIdsForUser(ctx, userId);
  return orgIds.includes(conversation.organizationId);
}

async function summarizeConversation(ctx: any, conversation: any, viewerUserId: Id<"user">) {
  const org = await ctx.db.get(conversation.organizationId);
  const buyer = await ctx.db.get(conversation.buyerUserId);
  const enrichedBuyer = buyer ? await enrichUser(ctx, buyer) : null;
  const isBuyer = conversation.buyerUserId === viewerUserId;
  const orgIds = await getActiveOrgIdsForUser(ctx, viewerUserId);
  const isDealer = orgIds.includes(conversation.organizationId);

  let listingTitle: string | null = null;
  if (conversation.listingId) {
    const listing = await ctx.db.get(conversation.listingId);
    listingTitle = listing?.title ?? null;
  }

  return {
    _id: conversation._id,
    organizationId: conversation.organizationId,
    buyerUserId: conversation.buyerUserId,
    listingId: conversation.listingId ?? null,
    listingTitle,
    lastMessage: conversation.lastMessage,
    lastAt: conversation.lastAt,
    unreadCount: isBuyer
      ? conversation.buyerUnread
      : isDealer
        ? conversation.dealerUnread
        : 0,
    partnerName: isBuyer
      ? org?.name ?? "Dealer"
      : enrichedBuyer?.name ?? "Buyer",
    partnerImageUrl: isBuyer
      ? (org ? await resolveOrgImageUrl(ctx, org) : null)
      : enrichedBuyer?.imageUrl ?? null,
    partnerKind: isBuyer ? ("dealer" as const) : ("buyer" as const),
  };
}

export const getConversations = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return [];

    const byBuyer = await ctx.db
      .query("conversation")
      .withIndex("by_buyer", (q) => q.eq("buyerUserId", user._id))
      .collect();

    const orgIds = await getActiveOrgIdsForUser(ctx, user._id);
    const byOrg: any[] = [];
    for (const orgId of orgIds) {
      const rows = await ctx.db
        .query("conversation")
        .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
        .collect();
      byOrg.push(...rows);
    }

    const map = new Map<string, any>();
    for (const c of [...byBuyer, ...byOrg]) {
      map.set(c._id, c);
    }

    const summaries = [];
    for (const c of map.values()) {
      summaries.push(await summarizeConversation(ctx, c, user._id));
    }
    return summaries.sort((a, b) => b.lastAt - a.lastAt);
  },
});

export const getUnreadCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) return 0;

    const byBuyer = await ctx.db
      .query("conversation")
      .withIndex("by_buyer", (q) => q.eq("buyerUserId", user._id))
      .collect();
    const orgIds = await getActiveOrgIdsForUser(ctx, user._id);
    const byOrg: any[] = [];
    for (const orgId of orgIds) {
      const rows = await ctx.db
        .query("conversation")
        .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
        .collect();
      byOrg.push(...rows);
    }
    const map = new Map<string, any>();
    for (const c of [...byBuyer, ...byOrg]) map.set(c._id, c);

    let unread = 0;
    for (const c of map.values()) {
      if (c.buyerUserId === user._id) unread += c.buyerUnread || 0;
      else if (orgIds.includes(c.organizationId)) unread += c.dealerUnread || 0;
    }
    return unread;
  },
});

export const getMessages = query({
  args: {
    userEmail: v.string(),
    conversationId: v.id("conversation"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !(await canAccessConversation(ctx, user._id, conversation))) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("message")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const enriched = [];
    for (const msg of messages.sort((a, b) => a.createdAt - b.createdAt)) {
      const sender = await ctx.db.get(msg.senderUserId);
      enriched.push({
        ...msg,
        senderName: sender?.name ?? "User",
        isMine: msg.senderUserId === user._id,
      });
    }
    return enriched;
  },
});

export const markConversationRead = mutation({
  args: {
    userEmail: v.string(),
    conversationId: v.id("conversation"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !(await canAccessConversation(ctx, user._id, conversation))) {
      throw new Error("Unauthorized");
    }

    if (conversation.buyerUserId === user._id) {
      await ctx.db.patch(args.conversationId, { buyerUnread: 0 });
    } else {
      await ctx.db.patch(args.conversationId, { dealerUnread: 0 });
    }
    return { success: true };
  },
});

export const sendListingMessage = mutation({
  args: {
    userEmail: v.string(),
    listingId: v.id("listing"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Log in to send a message");

    const body = args.body.trim();
    if (!body) throw new Error("Message is required");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const organizationId = listing.organizationId;
    const isAdmin = await isUserAdmin(ctx, user._id);
    const orgIds = await getActiveOrgIdsForUser(ctx, user._id);
    // Platform admins may message any listing (including orgs they also belong to).
    if (!isAdmin && orgIds.includes(organizationId)) {
      throw new Error("Dealers can't message their own listings from here");
    }

    let conversation = await ctx.db
      .query("conversation")
      .withIndex("by_buyer_organization", (q) =>
        q.eq("buyerUserId", user._id).eq("organizationId", organizationId),
      )
      .first();

    const now = Date.now();
    if (!conversation) {
      const conversationId = await ctx.db.insert("conversation", {
        buyerUserId: user._id,
        organizationId,
        listingId: args.listingId,
        lastMessage: body,
        lastAt: now,
        buyerUnread: 0,
        dealerUnread: 1,
        createdAt: now,
      });
      await ctx.db.insert("message", {
        conversationId,
        senderUserId: user._id,
        body,
        createdAt: now,
      });
      return { conversationId, created: true };
    }

    await ctx.db.insert("message", {
      conversationId: conversation._id,
      senderUserId: user._id,
      body,
      createdAt: now,
    });
    await ctx.db.patch(conversation._id, {
      lastMessage: body,
      lastAt: now,
      dealerUnread: (conversation.dealerUnread || 0) + 1,
      listingId: conversation.listingId ?? args.listingId,
    });
    return { conversationId: conversation._id, created: false };
  },
});

export const sendReply = mutation({
  args: {
    userEmail: v.string(),
    conversationId: v.id("conversation"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const body = args.body.trim();
    if (!body) throw new Error("Message is required");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !(await canAccessConversation(ctx, user._id, conversation))) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    await ctx.db.insert("message", {
      conversationId: args.conversationId,
      senderUserId: user._id,
      body,
      createdAt: now,
    });

    const isBuyer = conversation.buyerUserId === user._id;
    await ctx.db.patch(args.conversationId, {
      lastMessage: body,
      lastAt: now,
      ...(isBuyer
        ? { dealerUnread: (conversation.dealerUnread || 0) + 1 }
        : { buyerUnread: (conversation.buyerUnread || 0) + 1 }),
    });

    return { success: true };
  },
});
