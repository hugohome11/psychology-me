import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env");
}
if (!webhookSecret) {
  console.warn("[stripe] STRIPE_WEBHOOK_SECRET not set (webhooks will 400)");
}

const stripe = new Stripe(stripeKey);

export async function POST(req: Request) {
  if (!webhookSecret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe] webhook signature error:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[stripe] checkout.session.completed:", {
        id: session.id,
        amount_total: session.amount_total,
        customer: session.customer,
        customer_email: session.customer_email,
      });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown webhook handler error";
    console.error("[stripe] webhook handler error:", msg);
    return new Response(`Handler Error: ${msg}`, { status: 500 });
  }
}