// apps/web/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";
import prisma from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM ?? "Psychology.me <noreply@psychology.me>";

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // We send magic links via Resend instead of nodemailer
      async sendVerificationRequest({ identifier, url }) {
        try {
          await resend.emails.send({
            from,
            to: identifier,
            subject: "Your sign-in link for psychology.me",
            html: `<p>Click the link to sign in:</p><p><a href="${url}">Sign in</a></p><p>This link will expire soon.</p>`,
            text: `Sign in to psychology.me:\n${url}\n\nThis link will expire soon.`,
          });
        } catch (err) {
          console.error("[auth] Resend send error:", err);
          throw new Error("Could not send sign-in email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  // Support either env name
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // We use Prisma Session model; default is "database"
  session: { strategy: "database" },
};
