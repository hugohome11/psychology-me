import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // In production you may want to hide this:
  // if (process.env.NODE_ENV === "production") {
  //   return new Response("Not Found", { status: 404 });
  // }

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const to = body?.to ?? "milos@psychology.me";
  const subject = body?.subject ?? "Resend dev test";
  const text = body?.text ?? "Hello from dev";

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY or EMAIL_FROM" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });
    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("Resend debug send failed:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message ?? String(e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
