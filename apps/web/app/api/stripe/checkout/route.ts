import Stripe from "stripe";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env");
}

const isDev = process.env.NODE_ENV !== "production";
if (isDev && stripeKey.startsWith("sk_live")) {
  // Hard stop: never create live sessions in local dev unless explicitly allowed
  throw new Error(
    "Live Stripe key detected in development. Use test keys locally (sk_test_ / pk_test_), or set ALLOW_LIVE_IN_DEV=true and understand the risk."
  );
}

// IMPORTANT: don't pass apiVersion; use the SDK's built-in default to satisfy types
const stripe = new Stripe(stripeKey);

const BodySchema = z.object({
  priceId: z.string().min(1, "priceId required"),
  quantity: z.number().int().positive().optional().default(1),
  mode: z.enum(["payment", "subscription"]).optional().default("payment"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const origin =
    req.headers.get("origin") ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const json = (await req.json().catch(() => ({}))) as unknown;
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { priceId, quantity, mode, successUrl, cancelUrl } = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl ?? `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${origin}/checkout/cancel`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return Response.json({ id: session.id, url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("Stripe checkout error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}