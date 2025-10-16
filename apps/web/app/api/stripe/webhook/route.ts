// apps/web/app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    console.error("[webhook] missing signature or secret");
    // Return 200 so Stripe doesn't hammer you if config is wrong.
    return new Response("ok", { status: 200 });
  }

  let event: Stripe.Event;
  let body = "";
  try {
    body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.error("[webhook] signature error:", err?.message);
    return new Response("Invalid signature", { status: 400 });
  }

  const tag = `[evt ${event.id}]`;

  try {
    // Idempotent event record (matches your schema: id, type only)
    await prisma.stripeEvent.upsert({
      where: { id: event.id },
      update: {},
      create: { id: event.id, type: event.type ?? null },
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ??
        session.customer_email ??
        undefined;

      // Get line items to extract priceIds (do not rely on metadata)
      let priceIds: string[] = [];
      try {
        const items = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 20,
        });
        priceIds = items.data
          .map((li) => li.price?.id)
          .filter((v): v is string => !!v);
      } catch (e) {
        console.error(`${tag} listLineItems failed`, e);
      }

      // --- Entitlements (one per priceId) ---
      if (email && priceIds.length) {
        for (const priceId of priceIds) {
          try {
            await prisma.entitlement.upsert({
              where: { email_priceId: { email, priceId } },
              create: { email, priceId },
              update: {},
            });
          } catch (e) {
            console.error(`${tag} entitlement upsert failed ${email}/${priceId}`, e);
          }
        }
      } else {
        console.warn(`${tag} missing email or empty priceIds (email=${email}, n=${priceIds.length})`);
      }

      // --- Purchase (ONE per Checkout Session) ---
      // Your schema requires: sessionId (unique), lastEventId (required)
      // Optional fields exist with defaults, but we’ll fill what we can.
      try {
        const primaryPriceId = priceIds[0] ?? null;

        await prisma.purchase.upsert({
          where: { sessionId: session.id }, // unique
          update: {
            // If Stripe retries or we replay, refresh the last event id
            lastEventId: event.id,
            paymentIntentId: session.payment_intent
              ? String(session.payment_intent)
              : null,
          },
          create: {
            email: email ?? "unknown@example.com",
            priceId: primaryPriceId,
            currency: (session.currency ?? "eur").toLowerCase(),
            amountTotalCents: session.amount_total ?? 0,
            sessionId: session.id,
            paymentIntentId: session.payment_intent
              ? String(session.payment_intent)
              : null,
            lastEventId: event.id,

            // Optional association to an Assessment if you ever pass it
            // via metadata or map priceId -> assessment in your DB.
            // assessmentId: SOME_ID,
          },
        });
      } catch (e) {
        console.error(`${tag} purchase upsert failed (sessionId=${(event.data.object as any).id})`, e);
      }
    }
  } catch (err) {
    console.error(`${tag} unhandled webhook error`, err);
    // swallow — we still ack below
  }

  // Always acknowledge to stop Stripe retries
  return new Response("ok", { status: 200 });
}
