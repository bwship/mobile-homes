import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  canManageOrganization,
  enrichUser,
  getOrganizationOwner,
  getUserByEmailDoc,
  isUserAdmin,
  resolveOrgImageUrl,
} from "./helpers";

declare const crypto: {
  getRandomValues: (array: Uint8Array) => Uint8Array;
  subtle: {
    digest: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
  };
};
declare function btoa(data: string): string;

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const INVITE_TOKEN_BYTES = 32;

function tokenBytesToString(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

async function getMembershipRole(
  ctx: Parameters<typeof canManageOrganization>[0],
  userId: Id<"user">,
  organizationId: Id<"organization">,
) {
  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
  const m = memberships.find((row) => row.userId === userId && row.isActive !== false);
  return m?.role ?? null;
}

export const getOrganization = query({
  args: {
    organizationId: v.id("organization"),
    viewerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.isActive === false) return null;

    const owner = await getOrganizationOwner(ctx, args.organizationId);
    const listings = await ctx.db
      .query("listing")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const approved = listings.filter((l) => l.status === "APPROVED");
    const sold = listings.filter((l) => l.status === "SOLD");
    const soldSales = sold.filter((l) => l.listingType === "SALE");
    const soldLeases = sold.filter((l) => l.listingType === "RENT");

    const memberships = await ctx.db
      .query("organization_user")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const teamPreview = [];
    for (const membership of memberships) {
      if (membership.isActive === false) continue;
      const user = await ctx.db.get(membership.userId);
      if (!user) continue;
      const enriched = await enrichUser(ctx, user);
      teamPreview.push({
        _id: user._id,
        name: enriched.name,
        imageUrl: enriched.imageUrl ?? null,
        role: membership.role,
      });
    }

    let canManage = false;
    let membershipRole: string | null = null;
    if (args.viewerEmail) {
      const viewer = await getUserByEmailDoc(ctx, args.viewerEmail);
      if (viewer) {
        canManage = await canManageOrganization(ctx, viewer._id, args.organizationId);
        membershipRole = await getMembershipRole(ctx, viewer._id, args.organizationId);
        if (await isUserAdmin(ctx, viewer._id)) {
          canManage = true;
        }
      }
    }

    const imageUrl = await resolveOrgImageUrl(ctx, org);

    return {
      ...org,
      imageUrl,
      ownerApproved: owner?.isApproved ?? false,
      ownerName: owner?.name ?? null,
      approvedListingCount: approved.length,
      memberCount: teamPreview.length,
      teamPreview: teamPreview.slice(0, 8),
      canManage,
      membershipRole,
      stats: {
        live: approved.length,
        closed: sold.length,
        soldVolumeCents: soldSales.reduce((sum, l) => sum + l.priceCents, 0),
        leasedVolumeCents: soldLeases.reduce((sum, l) => sum + l.priceCents, 0),
        forSale: approved.filter((l) => l.listingType === "SALE").length,
        forRent: approved.filter((l) => l.listingType === "RENT").length,
      },
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
    const imageUrl = await resolveOrgImageUrl(ctx, org);
    return { ...org, imageUrl, user: await enrichUser(ctx, user) };
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

/** Approved dealer orgs for homepage marquee / directory. */
export const getFeaturedDealers = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db
      .query("organization")
      .withIndex("by_type", (q) => q.eq("type", "SELLER"))
      .collect();

    const featured = [];
    for (const org of orgs) {
      if (org.isActive === false) continue;
      const owner = await getOrganizationOwner(ctx, org._id);
      if (!owner?.isApproved) continue;
      featured.push({
        _id: org._id,
        name: org.name,
        url: org.url,
        imageUrl: await resolveOrgImageUrl(ctx, org),
      });
    }
    return featured;
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

export const createDealer = mutation({
  args: {
    adminEmail: v.string(),
    name: v.string(),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const name = args.name.trim();
    if (!name) throw new Error("Company name is required");

    const organizationId = await ctx.db.insert("organization", {
      name,
      url: args.url?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      description: args.description?.trim() || undefined,
      imageStorageId: args.imageStorageId,
      type: "SELLER",
      isActive: true,
      createdAt: Date.now(),
    });

    const org = await ctx.db.get(organizationId);
    return {
      ...org!,
      imageUrl: await resolveOrgImageUrl(ctx, org),
    };
  },
});

export const updateOrganization = mutation({
  args: {
    userEmail: v.string(),
    organizationId: v.id("organization"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");
    if (!(await canManageOrganization(ctx, user._id, args.organizationId))) {
      throw new Error("Unauthorized");
    }

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.url !== undefined) patch.url = args.url.trim() || undefined;
    if (args.phone !== undefined) patch.phone = args.phone.trim() || undefined;
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.imageStorageId !== undefined) {
      patch.imageStorageId = args.imageStorageId;
      patch.imageUrl = undefined;
    }
    if (args.clearImage) {
      patch.imageStorageId = undefined;
      patch.imageUrl = undefined;
    }
    // Always include clearImage keys so Convex unsets optional fields.
    if (Object.keys(patch).length) {
      await ctx.db.patch(args.organizationId, patch as any);
    }
    const org = await ctx.db.get(args.organizationId);
    if (!org) return null;
    return { ...org, imageUrl: await resolveOrgImageUrl(ctx, org) };
  },
});

export const getOrganizationTeam = query({
  args: {
    organizationId: v.id("organization"),
    viewerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.isActive === false) return null;

    let canManage = false;
    if (args.viewerEmail) {
      const viewer = await getUserByEmailDoc(ctx, args.viewerEmail);
      if (viewer) {
        canManage = await canManageOrganization(ctx, viewer._id, args.organizationId);
      }
    }

    const memberships = await ctx.db
      .query("organization_user")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const members = [];
    for (const membership of memberships) {
      if (membership.isActive === false) continue;
      const user = await ctx.db.get(membership.userId);
      if (!user) continue;
      members.push({
        membershipId: membership._id,
        role: membership.role,
        createdAt: membership.createdAt,
        user: await enrichUser(ctx, user),
      });
    }

    let pendingInvites: Array<{
      _id: Id<"organization_invite">;
      email: string;
      name: string | null;
      role: "OWNER" | "ADMIN" | "MEMBER";
      createdAt: number;
      expiresAt: number;
      status: string;
    }> = [];

    if (canManage) {
      const invites = await ctx.db
        .query("organization_invite")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
        .collect();
      pendingInvites = invites
        .filter((i) => i.status === "PENDING" && i.expiresAt > Date.now())
        .map((i) => ({
          _id: i._id,
          email: i.email,
          name: i.name ?? null,
          role: i.role,
          createdAt: i.createdAt,
          expiresAt: i.expiresAt,
          status: i.status,
        }));
    }

    return {
      members: members.sort((a, b) => a.createdAt - b.createdAt),
      pendingInvites,
      canManage,
    };
  },
});

export const inviteTeamMember = mutation({
  args: {
    userEmail: v.string(),
    organizationId: v.id("organization"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("OWNER"), v.literal("ADMIN"), v.literal("MEMBER")),
  },
  handler: async (ctx, args) => {
    const inviter = await getUserByEmailDoc(ctx, args.userEmail);
    if (!inviter) throw new Error("Unauthorized");
    if (!(await canManageOrganization(ctx, inviter._id, args.organizationId))) {
      throw new Error("Unauthorized");
    }

    const name = args.name.trim();
    if (!name) throw new Error("Name is required");

    const email = args.email.trim().toLowerCase();
    if (!email || !email.includes("@")) throw new Error("Invalid email");

    const existingMemberships = await ctx.db
      .query("organization_user")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    if (args.role === "OWNER") {
      const hasOwner = existingMemberships.some(
        (m) => m.role === "OWNER" && m.isActive !== false,
      );
      if (hasOwner) throw new Error("This dealer already has an owner");
    }

    const existingUser = await getUserByEmailDoc(ctx, email);
    if (existingUser) {
      const already = existingMemberships.find(
        (m) => m.userId === existingUser._id && m.isActive !== false,
      );
      if (already) throw new Error("User is already a team member");

      await ctx.db.insert("organization_user", {
        organizationId: args.organizationId,
        userId: existingUser._id,
        role: args.role,
        isActive: true,
        createdAt: Date.now(),
      });
      const userPatch: Record<string, unknown> = {
        organizationId: args.organizationId,
      };
      if (name) userPatch.name = name;
      // Admin-created dealer invites: auto-approve owner so they show as live.
      if (args.role === "OWNER" && (await isUserAdmin(ctx, inviter._id))) {
        userPatch.isApproved = true;
      }
      await ctx.db.patch(existingUser._id, userPatch);

      const inviteId = await ctx.db.insert("organization_invite", {
        organizationId: args.organizationId,
        email,
        name,
        role: args.role,
        invitedBy: inviter._id,
        tokenHash: await sha256Hex(`accepted-${Date.now()}-${email}`),
        status: "ACCEPTED",
        createdAt: Date.now(),
        expiresAt: Date.now() + INVITE_TTL_MS,
      });

      return { inviteId, token: null as string | null, attached: true };
    }

    const existingInvites = await ctx.db
      .query("organization_invite")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const pending = existingInvites.find(
      (i) =>
        i.organizationId === args.organizationId &&
        i.status === "PENDING" &&
        i.expiresAt > Date.now(),
    );
    if (pending) throw new Error("Invite already pending for this email");

    if (args.role === "OWNER") {
      const pendingOwner = existingInvites.find(
        (i) =>
          i.organizationId === args.organizationId &&
          i.role === "OWNER" &&
          i.status === "PENDING" &&
          i.expiresAt > Date.now(),
      );
      if (pendingOwner) throw new Error("An owner invite is already pending");
    }

    const tokenBytes = crypto.getRandomValues(new Uint8Array(INVITE_TOKEN_BYTES));
    const token = tokenBytesToString(tokenBytes);
    const tokenHash = await sha256Hex(token);

    const inviteId = await ctx.db.insert("organization_invite", {
      organizationId: args.organizationId,
      email,
      name,
      role: args.role,
      invitedBy: inviter._id,
      tokenHash,
      status: "PENDING",
      createdAt: Date.now(),
      expiresAt: Date.now() + INVITE_TTL_MS,
    });

    return { inviteId, token, attached: false };
  },
});
export const revokeInvite = mutation({
  args: {
    userEmail: v.string(),
    inviteId: v.id("organization_invite"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (!(await canManageOrganization(ctx, user._id, invite.organizationId))) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.inviteId, { status: "REVOKED" });
    return { success: true };
  },
});

export const acceptInvite = mutation({
  args: {
    userEmail: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const tokenHash = await sha256Hex(args.token);
    const invite = await ctx.db
      .query("organization_invite")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .first();

    if (!invite || invite.status !== "PENDING") {
      throw new Error("Invite not found or already used");
    }
    if (invite.expiresAt < Date.now()) {
      throw new Error("Invite expired");
    }
    if (user.email.trim().toLowerCase() !== invite.email.trim().toLowerCase()) {
      throw new Error("Invite email does not match your account");
    }

    const memberships = await ctx.db
      .query("organization_user")
      .withIndex("by_organization", (q) => q.eq("organizationId", invite.organizationId))
      .collect();
    const already = memberships.find(
      (m) => m.userId === user._id && m.isActive !== false,
    );
    if (!already) {
      await ctx.db.insert("organization_user", {
        organizationId: invite.organizationId,
        userId: user._id,
        role: invite.role,
        isActive: true,
        createdAt: Date.now(),
      });
    }
    const userPatch: Record<string, unknown> = {};
    if (!user.organizationId) userPatch.organizationId = invite.organizationId;
    if (invite.name && (!user.name || user.name === user.email)) {
      userPatch.name = invite.name;
    }
    if (invite.role === "OWNER") {
      const inviter = await ctx.db.get(invite.invitedBy);
      if (inviter && (await isUserAdmin(ctx, inviter._id))) {
        userPatch.isApproved = true;
      }
    }
    if (Object.keys(userPatch).length) {
      await ctx.db.patch(user._id, userPatch);
    }

    await ctx.db.patch(invite._id, { status: "ACCEPTED" });
    return { success: true, organizationId: invite.organizationId };
  },
});

/** Accept any pending invites matching the user's email (call after login). */
export const acceptPendingInvitesForUser = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const email = user.email.trim().toLowerCase();
    const invites = await ctx.db
      .query("organization_invite")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const accepted: Id<"organization">[] = [];
    for (const invite of invites) {
      if (invite.status !== "PENDING" || invite.expiresAt < Date.now()) continue;

      const memberships = await ctx.db
        .query("organization_user")
        .withIndex("by_organization", (q) => q.eq("organizationId", invite.organizationId))
        .collect();
      const already = memberships.find(
        (m) => m.userId === user._id && m.isActive !== false,
      );
      if (!already) {
        await ctx.db.insert("organization_user", {
          organizationId: invite.organizationId,
          userId: user._id,
          role: invite.role,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      if (!user.organizationId && accepted.length === 0) {
        await ctx.db.patch(user._id, { organizationId: invite.organizationId });
      }
      await ctx.db.patch(invite._id, { status: "ACCEPTED" });
      accepted.push(invite.organizationId);
    }

    return { accepted };
  },
});

export const updateMemberRole = mutation({
  args: {
    userEmail: v.string(),
    membershipId: v.id("organization_user"),
    role: v.union(v.literal("ADMIN"), v.literal("MEMBER")),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found");
    if (!(await canManageOrganization(ctx, user._id, membership.organizationId))) {
      throw new Error("Unauthorized");
    }
    if (membership.role === "OWNER") {
      throw new Error("Cannot change owner role");
    }

    await ctx.db.patch(args.membershipId, { role: args.role });
    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    userEmail: v.string(),
    membershipId: v.id("organization_user"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmailDoc(ctx, args.userEmail);
    if (!user) throw new Error("Unauthorized");

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found");
    if (!(await canManageOrganization(ctx, user._id, membership.organizationId))) {
      throw new Error("Unauthorized");
    }
    if (membership.role === "OWNER") {
      throw new Error("Cannot remove owner");
    }
    if (membership.userId === user._id) {
      throw new Error("Cannot remove yourself");
    }

    await ctx.db.patch(args.membershipId, { isActive: false });

    const memberUser = await ctx.db.get(membership.userId);
    if (memberUser?.organizationId === membership.organizationId) {
      await ctx.db.patch(membership.userId, { organizationId: undefined });
    }

    return { success: true };
  },
});

export const getOrganizationInsights = query({
  args: { organizationId: v.id("organization") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.isActive === false) return null;

    const listings = await ctx.db
      .query("listing")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const sold = listings.filter((l) => l.status === "SOLD");
    const live = listings.filter((l) => l.status === "APPROVED");
    const soldSales = sold.filter((l) => l.listingType === "SALE");
    const soldLeases = sold.filter((l) => l.listingType === "RENT");

    const monthKey = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const volumeByMonthMap = new Map<string, { salesCents: number; leaseCents: number; count: number }>();
    for (const listing of sold) {
      const ts = listing.soldAt ?? listing.updatedAt ?? listing.createdAt;
      const key = monthKey(ts);
      const row = volumeByMonthMap.get(key) ?? { salesCents: 0, leaseCents: 0, count: 0 };
      row.count += 1;
      if (listing.listingType === "SALE") row.salesCents += listing.priceCents;
      else row.leaseCents += listing.priceCents;
      volumeByMonthMap.set(key, row);
    }

    const volumeByMonth = Array.from(volumeByMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({ month, ...data }));

    const stateMap = new Map<string, number>();
    for (const listing of [...sold, ...live]) {
      const state = listing.state?.toUpperCase() || "??";
      stateMap.set(state, (stateMap.get(state) ?? 0) + 1);
    }
    const topStates = Array.from(stateMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      liveCount: live.length,
      closedCount: sold.length,
      saleCount: soldSales.length,
      leaseCount: soldLeases.length,
      soldVolumeCents: soldSales.reduce((s, l) => s + l.priceCents, 0),
      leasedVolumeCents: soldLeases.reduce((s, l) => s + l.priceCents, 0),
      volumeByMonth,
      topStates,
      saleVsLease: {
        sale: soldSales.length,
        lease: soldLeases.length,
      },
    };
  },
});

export const getAllOrganizationsForAdmin = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const orgs = await ctx.db
      .query("organization")
      .withIndex("by_type", (q) => q.eq("type", "SELLER"))
      .collect();

    const result = [];
    for (const org of orgs) {
      if (org.isActive === false) continue;
      const owner = await getOrganizationOwner(ctx, org._id);
      const memberships = await ctx.db
        .query("organization_user")
        .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
        .collect();
      const activeMembers = memberships.filter((m) => m.isActive !== false);
      const listings = await ctx.db
        .query("listing")
        .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
        .collect();
      const approvedListingCount = listings.filter((l) => l.status === "APPROVED").length;
      const pendingListingCount = listings.filter((l) => l.status === "PENDING").length;

      result.push({
        ...org,
        imageUrl: await resolveOrgImageUrl(ctx, org),
        owner: owner ? await enrichUser(ctx, owner) : null,
        memberCount: activeMembers.length,
        approvedListingCount,
        pendingListingCount,
        ownerApproved: owner?.isApproved ?? false,
      });
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getOrganizationMembers = query({
  args: {
    adminEmail: v.string(),
    organizationId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByEmailDoc(ctx, args.adminEmail);
    if (!admin || !(await isUserAdmin(ctx, admin._id))) {
      throw new Error("Unauthorized");
    }

    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error("Organization not found");

    const memberships = await ctx.db
      .query("organization_user")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const members = [];
    for (const membership of memberships) {
      if (membership.isActive === false) continue;
      const user = await ctx.db.get(membership.userId);
      if (!user) continue;
      members.push({
        membershipId: membership._id,
        role: membership.role,
        createdAt: membership.createdAt,
        user: await enrichUser(ctx, user),
      });
    }

    return {
      organization: org,
      members: members.sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});
