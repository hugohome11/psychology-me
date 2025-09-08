# psychology.me

Monorepo (Next.js App Router + Prisma + Supabase).

## Local Development

```bash
pnpm -C apps/web dev
```

- Health: http://localhost:3000/api/health
- Demo UI: http://localhost:3000/assessments/demo
- Demo report: http://localhost:3000/api/assessments/demo/report

## Environment Variables (apps/web/.env)

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_INSTANCE.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_INSTANCE.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_NAME=psychology.me
```

## Prisma/Supabase

- Push schema (skip generate while dev server is running):
  ```bash
  pnpm -C apps/web exec prisma db push --schema=prisma/schema.prisma --skip-generate
  ```
- Generate client (with dev server stopped):
  ```bash
  pnpm -C apps/web exec prisma generate --schema=prisma/schema.prisma
  ```

## Routes

- **GET** `/api/health` — App + DB status
- **GET** `/api/assessments/demo` — Demo assessment
- **POST** `/api/assessments/demo/responses` — Create response (body: `{ payload: {...} }`)
- **GET** `/api/assessments/demo/report` — Latest response report

## Notes

- API routes are forced to Node runtime:
  ```ts
  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';
  ```
- Use relative imports to `lib/prisma` (deployment-safe).

## Deploy (Vercel)

- Root Directory: `apps/web`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command:
  ```bash
  pnpm -C apps/web prisma generate --schema=prisma/schema.prisma && pnpm -C apps/web build
  ```
- Set env vars for **Production** and **Preview**.

## Git Hygiene

- Keep heavy folders out of Git history:
  - `node_modules/`, `.pnpm-store/`, `.next/`, `dist/`, `build/`, `.turbo/`, `.vercel/`
- `.gitattributes` enforces LF in repo; Windows scripts use CRLF.
