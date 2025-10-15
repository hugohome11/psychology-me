// apps/web/app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "psychology.me";
  const priceId =
    process.env.NEXT_PUBLIC_DEFAULT_PRICE_ID ??
    "price_1SIWb22VGHNH32HcAxS8O2Qb"; // your new test price
  const priceLabel =
    process.env.NEXT_PUBLIC_PRICE_LABEL ?? "Buy Test (€1.99 / month)";

  async function startCheckout() {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          priceId,
          quantity: 1,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Non-JSON (${res.status}): ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || "Checkout session not created");
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert(`Checkout error: ${err?.message || err}`);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{appName}</h1>
      <p className="mt-2 text-sm text-gray-600">MVP demo</p>

      <ul className="mt-6 list-disc pl-6">
        <li><Link href="/api/health">/api/health</Link></li>
        <li><Link href="/api/assessments/demo">/api/assessments/demo</Link></li>
        <li><Link href="/assessments/demo">/assessments/demo</Link></li>
      </ul>

      <div className="mt-8">
        <button
          onClick={startCheckout}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {priceLabel}
        </button>
      </div>
    </main>
  );
}
