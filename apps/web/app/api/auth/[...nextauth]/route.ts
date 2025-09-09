import NextAuth from "next-auth";
import { authConfig } from "../../../../lib/auth";

/**
 * next-auth v4 in the App Router:
 * NextAuth(...) returns a single RequestHandler.
 * Export explicit GET/POST functions to avoid any export shape ambiguity.
 */
const handler = NextAuth(authConfig);

export async function GET(req: Request, ctx: { params: Record<string, string> }) {
  return handler(req, ctx as unknown as Record<string, unknown>);
}

export async function POST(req: Request, ctx: { params: Record<string, string> }) {
  return handler(req, ctx as unknown as Record<string, unknown>);
}
