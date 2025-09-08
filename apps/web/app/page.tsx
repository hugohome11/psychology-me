// apps/web/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Health =
  | { status: string; db: boolean; rtt_ms: number; commit: string }
  | null;

export default function HomePage() {
  const [health, setHealth] = useState<Health>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as NonNullable<Health>;
        if (active) setHealth(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? 'Failed to load health');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-dvh bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            psychology<span className="text-neutral-400">.me</span>
          </h1>
          <nav className="text-sm">
            <ul className="flex gap-5">
              <li>
                <Link href="/assessments/demo" className="hover:underline">
                  Demo Assessment
                </Link>
              </li>
              <li>
                <a
                  href="/api/health"
                  className="hover:underline"
                  rel="nofollow"
                >
                  API Health
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-neutral-200/70 p-8 shadow-sm dark:border-neutral-800">
          <h2 className="text-2xl font-semibold">MVP bootstrap</h2>
          <p className="mt-2 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
            Next.js App Router + Prisma + Supabase are connected. Use the quick
            links below to verify API routes, seed the database, and submit a
            sample response.
          </p>

          {/* Health pill */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-neutral-200/70 px-3 py-1 dark:border-neutral-800">
              {loading ? (
                'Checking health…'
              ) : error ? (
                <span className="text-red-600 dark:text-red-400">
                  Health error: {error}
                </span>
              ) : health ? (
                <>
                  status: <strong>{health.status}</strong> · db:{' '}
                  <strong>{String(health.db)}</strong> · rtt:{' '}
                  <strong>{health.rtt_ms}ms</strong> · commit:{' '}
                  <strong>{health.commit}</strong>
                </>
              ) : (
                'No health data'
              )}
            </span>
            <Link
              href="/api/health"
              className="rounded-full border border-neutral-200/70 px-3 py-1 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              Open /api/health
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            title="Assessments"
            description="Work with the demo assessment: view, submit a sample response, and fetch a simple report."
            actions={[
              { label: 'GET /api/assessments/demo', href: '/api/assessments/demo' },
              {
                label: 'GET /api/assessments/demo/report',
                href: '/api/assessments/demo/report',
              },
              { label: 'Open demo UI', href: '/assessments/demo' },
            ]}
          />
          <Card
            title="Developer shortcuts"
            description="Common endpoints and docs used during local development."
            actions={[
              { label: 'API Health', href: '/api/health' },
              { label: 'List assessments', href: '/api/assessments' },
              {
                label: 'Next.js Docs',
                href: 'https://nextjs.org/docs',
                external: true,
              },
              {
                label: 'Prisma Docs',
                href: 'https://www.prisma.io/docs',
                external: true,
              },
              {
                label: 'Supabase',
                href: 'https://supabase.com/',
                external: true,
              },
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200/70 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
        <span>
          © {new Date().getFullYear()} psychology.me · Local dev environment
        </span>
      </footer>
    </main>
  );
}

function Card({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 p-6 shadow-sm dark:border-neutral-800">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {actions.map(({ label, href, external }) => (
          <li key={label}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/70 px-3 py-1.5 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                {label} <span aria-hidden>↗</span>
              </a>
            ) : (
              <Link
                href={href}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/70 px-3 py-1.5 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
