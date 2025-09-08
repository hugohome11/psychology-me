import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { z } from "zod";

type Ctx = { params: Promise<{ slug: string }> };

const BodySchema = z.object({
  answers: z.record(z.string(), z.number()), // { [itemKey]: number }
  userId: z.string().optional(),
});

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const created = await prisma.response.create({
      data: {
        assessmentId: assessment.id,
        userId: parsed.data.userId ?? null,
        payload: parsed.data.answers,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ id: created.id, createdAt: created.createdAt }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}