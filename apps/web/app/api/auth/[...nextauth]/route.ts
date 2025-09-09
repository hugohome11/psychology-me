import NextAuth from "next-auth";
import { authConfig } from "../../../../lib/auth";

// Instantiate the handler once at module scope
const handler = NextAuth(authConfig);

// Next 15 route context: params are provided as a Promise,
// and for `[...nextauth]` the key is `nextauth`
type Ctx = { params: Promise<{ nextauth: string[] }> };
type NextAuthCtx = { params: { nextauth: string[] } };

export async function GET(req: Request, ctx: Ctx) {
  const params = await ctx.params;
  return handler(req, { params } as NextAuthCtx);
}

export async function POST(req: Request, ctx: Ctx) {
  const params = await ctx.params;
  return handler(req, { params } as NextAuthCtx);
}
