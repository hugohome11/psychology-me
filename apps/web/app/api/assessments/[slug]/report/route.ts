export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;

  const assessment = await prisma.assessment.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  // Grab the most recent response for this assessment
  const latest = await prisma.response.findFirst({
    where: { assessmentId: assessment.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, payload: true },
  });

  if (!latest) {
    return NextResponse.json({ message: "No responses yet" });
  }

  // Compute a simple percentage score (1–5 scaled to 0–100)
  const payload = latest.payload as Record<string, unknown>;
  const values = Object.values(payload).map(v => (typeof v === "number" ? v : Number(v)));
  const clean = values.filter(n => Number.isFinite(n)) as number[];
  const count = Math.max(1, clean.length);
  const sum = clean.reduce((a, b) => a + b, 0);
  const score = Math.round((sum / (count * 5)) * 100);

  return NextResponse.json({
    assessment: slug,
    responseId: latest.id,
    report: { count, sum, score, payload: latest.payload },
  });
}