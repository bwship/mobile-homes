import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Platform roles exposed to the client. Organization.type stays SELLER/BUYER
// in the schema; DEALER maps from SELLER orgs and CUSTOMER from BUYER orgs.
export type UserRole = "ADMIN" | "DEALER" | "CUSTOMER";

export async function getUserRoleAndOrg(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"user">,
): Promise<{ role: UserRole; organizationId?: Id<"organization"> }> {
  const user = await ctx.db.get(userId);
  if (!user) return { role: "CUSTOMER" };

  if (user.isAdmin) {
    return { role: "ADMIN", organizationId: user.organizationId };
  }

  if (user.organizationId) {
    const organization = await ctx.db.get(user.organizationId);
    if (organization?.type === "SELLER") {
      return { role: "DEALER", organizationId: user.organizationId };
    }
    if (organization?.type === "BUYER") {
      return { role: "CUSTOMER", organizationId: user.organizationId };
    }
  }

  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const membership of memberships) {
    if (membership.isActive === false) continue;
    const org = await ctx.db.get(membership.organizationId);
    if (org?.type === "SELLER") return { role: "DEALER", organizationId: org._id };
    if (org?.type === "BUYER") return { role: "CUSTOMER", organizationId: org._id };
  }

  return { role: "CUSTOMER" };
}

export async function getUserByEmailDoc(ctx: QueryCtx | MutationCtx, email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;

  let user = await ctx.db
    .query("user")
    .withIndex("by_email", (q) => q.eq("email", trimmed))
    .first();

  if (!user) {
    const allUsers = await ctx.db.query("user").collect();
    user = allUsers.find((u) => u.email.toLowerCase() === trimmed) ?? null;
  }

  return user;
}

export async function isUserAdmin(ctx: QueryCtx | MutationCtx, userId: Id<"user">) {
  const user = await ctx.db.get(userId);
  return Boolean(user?.isAdmin);
}

export async function getOrganizationOwner(ctx: QueryCtx | MutationCtx, organizationId: Id<"organization">) {
  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  const ownerMembership = memberships.find((m) => m.role === "OWNER" && m.isActive !== false);
  if (!ownerMembership) return null;
  return await ctx.db.get(ownerMembership.userId);
}

export async function enrichUser(ctx: QueryCtx | MutationCtx, user: any) {
  const { role, organizationId } = await getUserRoleAndOrg(ctx, user._id);
  const { passwordHash: _omit, ...safe } = user;

  let imageUrl = user.imageUrl ?? undefined;
  if (user.imageStorageId) {
    imageUrl = (await ctx.storage.getUrl(user.imageStorageId)) ?? imageUrl;
  }

  return {
    ...safe,
    imageUrl,
    organizationId: user.organizationId ?? organizationId,
    role,
  };
}

/** Platform admin OR OWNER/ADMIN membership on the org. */
export async function canManageOrganization(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"user">,
  organizationId: Id<"organization">,
) {
  if (await isUserAdmin(ctx, userId)) return true;

  const memberships = await ctx.db
    .query("organization_user")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  return memberships.some(
    (m) =>
      m.userId === userId &&
      m.isActive !== false &&
      (m.role === "OWNER" || m.role === "ADMIN"),
  );
}

export async function resolveOrgImageUrl(ctx: QueryCtx | MutationCtx, org: any) {
  let imageUrl = org.imageUrl ?? undefined;
  if (org.imageStorageId) {
    imageUrl = (await ctx.storage.getUrl(org.imageStorageId)) ?? imageUrl;
  }
  return imageUrl;
}
