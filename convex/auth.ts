import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashPassword, verifyPassword } from "./passwords";

declare const crypto: {
  subtle: { digest(algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> };
  getRandomValues<T>(array: T): T;
};
declare function btoa(s: string): string;

const MIN_PASSWORD_LENGTH = 8;

function assertPasswordOk(password: string) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("SELLER"), v.literal("BUYER")),
    organizationName: v.optional(v.string()),
    organizationUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    assertPasswordOk(args.password);
    const passwordHash = await hashPassword(args.password);
    return await ctx.runMutation(internal.users.signupInternal, {
      email: args.email,
      passwordHash,
      name: args.name,
      role: args.role,
      organizationName: args.organizationName,
      organizationUrl: args.organizationUrl,
    });
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<any> => {
    if (!args.email?.trim()) throw new Error("Email is required");

    const user: any = await ctx.runQuery(internal.users.getUserByEmailWithHashInternal, {
      email: args.email,
    });

    const invalid = new Error("Invalid email or password");
    if (!user) throw invalid;

    if (user.passwordHash) {
      const ok = await verifyPassword(args.password, user.passwordHash);
      if (!ok) throw invalid;
    } else {
      assertPasswordOk(args.password);
      const newHash = await hashPassword(args.password);
      await ctx.runMutation(internal.users.setPasswordHashInternal, {
        userId: user._id,
        passwordHash: newHash,
      });
    }

    const { passwordHash: _omit, ...safe } = user;
    return safe;
  },
});

const RESET_TOKEN_BYTES = 32;
const RESET_TTL_MS = 1000 * 60 * 60;

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

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<{ ok: true }> => {
    const trimmed = args.email.trim().toLowerCase();
    if (!trimmed) return { ok: true };

    const user: any = await ctx.runQuery(internal.users.getUserByEmailWithHashInternal, {
      email: trimmed,
    });
    if (!user) return { ok: true };

    const tokenBytes = crypto.getRandomValues(new Uint8Array(RESET_TOKEN_BYTES));
    const token = tokenBytesToString(tokenBytes);
    const tokenHash = await sha256Hex(token);

    await ctx.runMutation(internal.users.createPasswordResetInternal, {
      userId: user._id,
      email: user.email,
      tokenHash,
      expiresAt: Date.now() + RESET_TTL_MS,
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendPasswordResetEmail, {
      email: user.email,
      name: user.name ?? null,
      token,
    });

    return { ok: true };
  },
});

export const resetPassword = mutation({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, args): Promise<{ ok: true }> => {
    assertPasswordOk(args.newPassword);
    const tokenHash = await sha256Hex(args.token);

    const reset: any = await ctx.runQuery(internal.users.findPasswordResetByTokenHashInternal, {
      tokenHash,
    });
    const generic = new Error("This password reset link is invalid or has expired.");
    if (!reset || reset.usedAt || reset.expiresAt < Date.now()) throw generic;

    const newHash = await hashPassword(args.newPassword);
    await ctx.runMutation(internal.users.consumePasswordResetInternal, {
      resetId: reset._id,
      userId: reset.userId,
      passwordHash: newHash,
    });

    return { ok: true };
  },
});

export const getAuthToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? identity.tokenIdentifier : null;
  },
});
