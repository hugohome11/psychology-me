export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// apps/web/app/api/debug/purchases/route.ts
import { prisma } from "../../../../lib/prisma";

function notFound() {
  return new Response("Not Found", { status: 404 });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return notFound();
  const rows = await prisma.purchase.findMany({
    orderBy: { lastPurchasedAt: "desc" },
    take: 20,
  });
  return Response.json({ count: rows.length, rows });
}

