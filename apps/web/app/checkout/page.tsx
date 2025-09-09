// apps/web/app/checkout/page.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function CheckoutPage() {
  const [priceId, setPriceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create session");

      // Prefer redirectToCheckout with session id
      if (!pk) throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      const stripe = await loadStripe(pk);
      if (!stripe) throw new Error("Stripe.js failed to load");

      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">Stripe Test Checkout</h1>
      <label className="block text-sm font-medium mb-1">Stripe Price ID</label>
      <input
        className="border rounded w-full p-2 mb-3"
        value={priceId}
        onChange={(e) => setPriceId(e.target.value)}
        placeholder="price_123..."
      />
      <button
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        onClick={startCheckout}
        disabled={busy || !priceId}
      >
        {busy ? "Redirecting..." : "Buy test"}
      </button>
      {error && <p className="text-red-600 mt-3">{error}</p>}
      <p className="text-sm text-gray-500 mt-6">
        Use any test card in <a className="underline" href="https://stripe.com/docs/testing#cards" target="_blank">Stripe docs</a>.
      </p>
    </div>
  );
}
