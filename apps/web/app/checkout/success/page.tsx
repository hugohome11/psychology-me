// apps/web/app/checkout/success/page.tsx
import Stripe from "stripe";

export const runtime = "nodejs"; // ensure Node runtime on Vercel

type Params =
  | Record<string, string | string[] | undefined>
  | undefined;

export default async function SuccessPage({
  searchParams,
}: {
  // Next.js 15: searchParams is a *Promise*
  searchParams: Promise<Params>;
}) {
  const sp = (await searchParams) || {};
  const raw = sp["session_id"];
  const sessionId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  if (!sessionId) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Receipt</h1>
        <p>Missing <code>session_id</code> in URL.</p>
      </main>
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Pull full details so we can show amount/email
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    const amount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? "").toUpperCase();
    const email =
      session.customer_details?.email ?? session.customer_email ?? "—";

    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Receipt</h1>
        <p className="mb-2">Thanks! Your payment was successful.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Session: {session.id}</li>
          <li>Amount: {amount} {currency}</li>
          <li>Email: {email}</li>
          <li>Status: {session.payment_status}</li>
        </ul>
      </main>
    );
  } catch (err) {
    console.error("Failed to load session:", err);
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Receipt</h1>
        <p>Could not load the session.</p>
      </main>
    );
  }
}
