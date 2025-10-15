// apps/web/app/api/debug/echo/route.ts
import { NextRequest } from "next/server";
export const runtime = "nodejs";

function notFound() {
  return new Response("Not Found", { status: 404 });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return notFound();
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await req.json();
    return Response.json({ ok: true, body });
  }
  const form = await req.formData();
  const obj: Record<string, unknown> = {};
  form.forEach((v, k) => (obj[k] = v));
  return Response.json({ ok: true, body: obj });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return notFound();
  return Response.json({ ok: true, hint: "POST JSON or form-data to echo it back." });
}
