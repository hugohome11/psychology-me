import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execSync } from 'node:child_process';

export const dynamic = 'force-dynamic'; // ensure it always runs server-side

export async function GET() {
  const t0 = Date.now();
  let db = false;
  try {
    // Light-weight ping (works even if you have no tables)
    await prisma.$queryRawUnsafe('SELECT 1');
    db = true;
  } catch {
    db = false;
  }
  const rtt_ms = Date.now() - t0;

  let commit = process.env.VERCEL_GIT_COMMIT_SHA || '';
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      commit = 'local';
    }
  }

  return NextResponse.json({ status: 'ok', db, rtt_ms, commit });
}
