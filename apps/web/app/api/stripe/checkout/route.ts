// apps/web/app/api/stripe/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

function computeBaseUrl(req: NextRequest): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function bad(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  let priceId = (process.env.NEXT_PUBLIC_DEFAULT_PRICE_ID || "").trim();
  let quantity = 1;

  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = (await req.json()) as { priceId?: string; quantity?: number };
      priceId = (body.priceId ?? priceId).toString();
      quantity = Number(body.quantity ?? 1) || 1;
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      priceId = String(form.get("priceId") ?? priceId);
      quantity = Number(form.get("quantity") ?? 1) || 1;
    }
  } catch {
    /* ignore, fallback to env */
  }

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing priceId and no NEXT_PUBLIC_DEFAULT_PRICE_ID set" },
      { status: 400 }
    );
  }
  if (quantity < 1) quantity = 1;

  const baseUrl = computeBaseUrl(req);

  try {
    // Look up the price to decide the correct Checkout mode.
    const price = await stripe.prices.retrieve(priceId);

    // If price.recurring is present, it's a subscription price; otherwise one-time.
    const isRecurring = Boolean(price.recurring);
    const mode: "payment" | "subscription" = isRecurring ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: price.id, quantity }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      allow_promotion_codes: false,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("checkout create failed:", err?.message || err);
    return NextResponse.json({ error: err?.message ?? "Checkout failed" }, { status: 500 });
  }
}

export async function GET() {
  return bad(405, "Method Not Allowed");
}
