// apps/web/app/api/debug/env/route.ts
export const runtime = "nodejs";

function notFound() {
  return new Response("Not Found", { status: 404 });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return notFound();
  // Keep this minimal; never leak secrets. Show only whitelisted keys.
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    VERCEL: process.env.VERCEL ?? "false",
  };
  return Response.json({ status: "ok", env: safeEnv });
}
