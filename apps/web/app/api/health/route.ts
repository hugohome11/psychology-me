export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const t0 = Date.now();
  let db = false;
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    db = true;
  } catch {}
  return NextResponse.json({
    status: "ok",
    db,
    rtt_ms: Date.now() - t0,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  });
}
