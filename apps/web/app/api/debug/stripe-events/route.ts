export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const rows = await prisma.stripeEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ count: rows.length, rows });
}