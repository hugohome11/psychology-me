import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // 4x .. from [slug]/route.ts

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const a = await prisma.assessment.findUnique({ where: { slug: params.slug } });
    if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(a);
  } catch (e: any) {
    console.error('GET /api/assessments/[slug] error:', e);
    return NextResponse.json(
      { error: 'internal_error', message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
