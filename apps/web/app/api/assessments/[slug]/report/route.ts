import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; // 5x .. to reach apps/web

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const a = await prisma.assessment.findUnique({ where: { slug: params.slug } });
  if (!a) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const latest = await prisma.response.findFirst({
    where: { assessmentId: a.id },
    orderBy: { createdAt: 'desc' }
  });
  if (!latest) return NextResponse.json({ message: 'no_responses_yet' });

  const payload = latest.payload as Record<string, number>;
  const sum = Object.values(payload).reduce((s, v) => s + (Number(v) || 0), 0);
  const norm = Math.round((sum / (5 * Math.max(1, Object.keys(payload).length))) * 100);

  return NextResponse.json({
    assessment: a.slug,
    responseId: latest.id,
    report: { title: 'Demo Report', raw: sum, normalized: norm }
  });
}
