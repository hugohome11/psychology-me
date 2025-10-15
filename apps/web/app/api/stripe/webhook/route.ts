export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
// NOTE: relative import to avoid alias issues in prod
import { prisma } from "../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion left default to SDK’s pinned version
});

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  // 1) Verify signature using RAW body
  const raw = await req.text();
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature verify FAILED:", err?.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 2) Idempotency: store event id as PK
  try {
    await prisma.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    // already processed (replay)
    return NextResponse.json({ ok: true, replay: true });
  }

  // 3) Fulfillment for checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email =
      session.customer_details?.email || session.customer_email || undefined;

    // Prefer API fetch for line items (safer than metadata)
    const items = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 10,
    });

    const priceIds = items.data
      .map((li) => li.price?.id)
      .filter((v): v is string => Boolean(v));

    if (email && priceIds.length) {
      await Promise.all(
        priceIds.map(async (priceId) => {
          // upsert ensures single row per (email, priceId)
          await prisma.entitlement.upsert({
            where: { email_priceId: { email, priceId } },
            create: { email, priceId },
            update: {},
          });
          // optional audit trail
          await prisma.purchase.create({ data: { email, priceId } });
        })
      );
    }
  }

  return NextResponse.json({ ok: true });
}
