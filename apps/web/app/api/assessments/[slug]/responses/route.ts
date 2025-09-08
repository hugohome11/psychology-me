import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const payload = body?.payload ?? {};
    const a = await prisma.assessment.findUnique({ where: { slug: params.slug } });
    if (!a) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    // naive scoring stub — replace with real scoring later
    const sum = Object.values(payload || {}).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
    const count = Math.max(1, Object.keys(payload || {}).length);
    const score = Math.round((sum / (count * 5)) * 100);

    const created = await prisma.response.create({
      data: { assessmentId: a.id, userId: null, payload, score }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'bad_request', message: e?.message ?? 'Invalid body' }, { status: 400 });
  }
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const a = await prisma.assessment.findUnique({ where: { slug: params.slug } });
  if (!a) return NextResponse.json([]);
  const items = await prisma.response.findMany({
    where: { assessmentId: a.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return NextResponse.json(items);
}
