// apps/web/app/api/stripe/webhook/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY env");
if (!webhookSecret) console.warn("[stripe] STRIPE_WEBHOOK_SECRET not set (webhooks will 400)");

const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  if (!webhookSecret) {
    return new Response("Webhook not configured", { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const payload = await req.text(); // RAW body required for verification

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe] webhook signature error:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Minimal: just log. (We can persist to DB later.)
        console.log("[stripe] checkout.session.completed", {
          id: session.id,
          mode: session.mode,
          customer_email: session.customer_details?.email,
          amount_total: session.amount_total,
          currency: session.currency,
        });
        break;
      }
      default:
        // Keep logs sparse in prod
        break;
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unhandled webhook error";
    console.error("[stripe] handler error:", msg);
    return new Response(`Handler Error: ${msg}`, { status: 500 });
  }
}
