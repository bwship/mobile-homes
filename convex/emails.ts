import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:5173";

export const sendPasswordResetEmail = internalAction({
  args: {
    email: v.string(),
    name: v.union(v.string(), v.null()),
    token: v.string(),
  },
  handler: async (_ctx, args) => {
    const resetUrl = `${SITE_URL}/reset-password?token=${encodeURIComponent(args.token)}`;
    const apiKey = process.env.RESEND_API_KEY;
    const greeting = args.name ? `Hi ${args.name},` : "Hi,";

    if (!apiKey) {
      console.log("[email stub] Password reset for", args.email, resetUrl);
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MH Marketplace <noreply@example.com>",
        to: args.email,
        subject: "Reset your password",
        html: `<p>${greeting}</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
      }),
    });

    if (!res.ok) {
      console.error("Failed to send password reset email", await res.text());
    }
  },
});

export const sendListingInquiryEmail = internalAction({
  args: {
    sellerEmail: v.string(),
    listingTitle: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const body = `Inquiry about: ${args.listingTitle}\nFrom: ${args.fromName} <${args.fromEmail}>\n\n${args.message}`;

    if (!apiKey) {
      console.log("[email stub] Listing inquiry to", args.sellerEmail, body);
      return;
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MH Marketplace <noreply@example.com>",
        to: args.sellerEmail,
        reply_to: args.fromEmail,
        subject: `Inquiry: ${args.listingTitle}`,
        text: body,
      }),
    });
  },
});
