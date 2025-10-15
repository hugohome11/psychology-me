// apps/web/app/signin/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await signIn("resend", { email, redirect: false });
    setStatus(res?.ok ? "sent" : "error");
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <p className="text-sm text-gray-600 mb-4">
        Enter your email and we’ll send you a one-time sign-in link.
      </p>
      <form onSubmit={onSubmit} className="space-y-3" aria-label="email sign in form">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            aria-label="email"
          />
        </label>
        <button
          disabled={status==="sending"||email.length===0}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          type="submit"
        >
          {status==="sending" ? "Sending..." : "Send magic link"}
        </button>
        {status==="sent" && <p className="text-green-700 text-sm">Check your inbox.</p>}
        {status==="error" && <p className="text-red-700 text-sm">Could not send link.</p>}
      </form>
    </main>
  );
}
