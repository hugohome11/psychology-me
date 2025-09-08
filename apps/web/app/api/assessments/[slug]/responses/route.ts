import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };
type Payload = Record<string, number | string>;

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const body: { payload?: Payload } = await req.json();
    const payload: Payload = body?.payload ?? {};

    const a = await prisma.assessment.findUnique({ where: { slug } });
    if (!a) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const sum = Object.values(payload).reduce<number>((s, v) => {
      const n = typeof v === 'number' ? v : Number(v);
      return s + (Number.isFinite(n) ? n : 0);
    }, 0);
    const count = Math.max(1, Object.keys(payload).length);
    const score = Math.round((sum / (count * 5)) * 100);

    const created = await prisma.response.create({
      data: { assessmentId: a.id, userId: null, payload, score }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid body';
    return NextResponse.json({ error: 'bad_request', message }, { status: 400 });
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await prisma.assessment.findUnique({ where: { slug } });
  if (!a) return NextResponse.json([]);

  const items = await prisma.response.findMany({
    where: { assessmentId: a.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return NextResponse.json(items);
}
