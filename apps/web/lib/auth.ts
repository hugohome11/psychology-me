import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import prisma from "./prisma";

// ---- Env guards ----
function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const NEXTAUTH_SECRET = must("NEXTAUTH_SECRET");
const NEXTAUTH_URL = must("NEXTAUTH_URL");
const RESEND_API_KEY = must("RESEND_API_KEY");
const EMAIL_FROM = must("EMAIL_FROM");

const resend = new Resend(RESEND_API_KEY);

// Ensure links always use the canonical NEXTAUTH_URL origin
function canonicalizeUrl(url: string, base: string) {
  const u = new URL(url);
  const b = new URL(base);
  u.protocol = b.protocol;
  u.host = b.host;
  u.port = b.port;
  return u.toString();
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      maxAge: 24 * 60 * 60, // 24h
      sendVerificationRequest: async ({ identifier, url }) => {
        const signInUrl = canonicalizeUrl(url, NEXTAUTH_URL);
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,   // e.g. "Psychology.me <onboarding@resend.dev>" or a verified domain sender
          to: identifier,
          subject: "Sign in to Psychology.me",
          text: `Use this link to sign in:\n\n${signInUrl}\n\nThis link expires in 24 hours.`,
          html: `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;">
              <h2 style="margin:0 0 12px 0;">Sign in to <span style="font-weight:600;">Psychology.me</span></h2>
              <p style="margin:0 0 16px 0;">Click the button below to sign in. The link expires in 24 hours.</p>
              <p style="margin:0 0 24px 0;">
                <a href="${signInUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;border:1px solid #e2e2e2;">
                  Sign in
                </a>
              </p>
              <p style="color:#666;margin:0;">If you did not request this email, please ignore it.</p>
            </div>
          `,
        });
        if (error) {
          throw new Error(`Resend email send failed: ${error.message ?? JSON.stringify(error)}`);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = {} as any;
      (session.user as any).id = token.sub;
      session.user.email = token.email as string | undefined;
      session.user.name = (token.name as string | undefined) ?? null;
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url);
        const b = new URL(baseUrl);
        if (u.origin === b.origin) return url;
      } catch {}
      return baseUrl;
    },
  },
};

export default authOptions;
