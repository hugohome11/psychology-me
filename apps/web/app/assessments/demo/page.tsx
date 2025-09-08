"use client";

import { useState } from "react";
import Link from "next/link";

type Answers = Record<string, number>;
type Created = { id: string };

function hasId(x: unknown): x is Created {
  return typeof x === "object" && x !== null && typeof (x as { id?: unknown }).id === "string";
}

export default function DemoAssessmentPage() {
  const [answers, setAnswers] = useState<Answers>({ Q1: 3, Q2: 3, Q3: 3 });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof Answers) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setAnswers((prev) => ({ ...prev, [key]: v }));
  };

  async function submit() {
    setLoading(true);
    setError(null);
    setCreated(null);
    try {
      const res = await fetch("/api/assessments/demo/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data: unknown = await res.json();
      if (res.ok && hasId(data)) {
        setCreated({ id: data.id });
      } else {
        setError("Submit failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">Demo Assessment</h1>

      <div className="space-y-4">
        {(["Q1", "Q2", "Q3"] as const).map((k) => (
          <div key={k}>
            <label className="block text-sm font-medium mb-1">{k}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={answers[k]}
              onChange={update(k)}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">Value: {answers[k]}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* Use Link instead of <a> */}
        <Link
          href="/api/assessments/demo/report"
          className="text-sm underline underline-offset-2"
        >
          View report (JSON)
        </Link>
      </div>

      {created && (
        <p className="text-green-700 text-sm">Created response id: {created.id}</p>
      )}
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </main>
  );
}
