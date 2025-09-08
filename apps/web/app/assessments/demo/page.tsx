'use client';

import { useState } from 'react';

type Answers = Record<string, number>;
type CreatedResponse = {
  id: string; assessmentId: string; payload: any; score: number; createdAt: string;
};
type ReportPayload = {
  assessment: string;
  responseId: string;
  report: { title: string; raw: number; normalized: number };
};

export default function DemoAssessmentPage() {
  const items = [
    { key: 'q1', label: 'I often plan ahead.' },
    { key: 'q2', label: 'I can stay focused on tasks.' },
    { key: 'q3', label: 'I manage stress effectively.' },
    { key: 'q4', label: 'I communicate clearly.' },
    { key: 'q5', label: 'I adapt to change well.' },
  ] as const;

  const [answers, setAnswers] = useState<Answers>(
    Object.fromEntries(items.map(i => [i.key, 3])) as Answers
  );
  const [submitting, setSubmitting] = useState(false);
  const [resp, setResp] = useState<CreatedResponse | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = Object.values(answers).reduce((s, v) => s + v, 0);
  const normalized = Math.round((total / (items.length * 5)) * 100);

  async function submit() {
    setSubmitting(true); setError(null); setResp(null); setReport(null);
    try {
      const create = await fetch('/api/assessments/demo/responses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload: answers }),
      });
      const created: CreatedResponse | { error: string; message?: string } = await create.json();
      if (!create.ok || 'error' in created) throw new Error(('message' in created && created.message) || 'Submit failed');
      setResp(created as CreatedResponse);

      // fetch latest report
      const repRes = await fetch('/api/assessments/demo/report', { cache: 'no-store' });
      const rep: ReportPayload | { error: string; message?: string } = await repRes.json();
      if (!repRes.ok || 'error' in rep) throw new Error(('message' in rep && rep.message) || 'Report failed');
      setReport(rep as ReportPayload);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Demo Assessment</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Adjust the sliders (1–5) and submit. We’ll save your response and show a computed report.
      </p>

      <div className="mt-6 space-y-5">
        {items.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={key} className="text-sm font-medium">{label}</label>
            <div className="mt-2 flex items-center gap-4">
              <input
                id={key}
                type="range"
                min={1}
                max={5}
                step={1}
                value={answers[key]}
                onChange={(e) => setAnswers(a => ({ ...a, [key]: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="w-6 text-right tabular-nums">{answers[key]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm">
        Client preview: <strong>{total}</strong> / {items.length * 5} · norm <strong>{normalized}%</strong>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-lg border px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          {submitting ? 'Submitting…' : 'Submit sample'}
        </button>
        <a href="/api/assessments/demo/report" className="text-sm underline decoration-dotted" rel="nofollow">
          Open latest report (raw)
        </a>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">Error: {error}</p>}

      {resp && (
        <div className="mt-6">
          <h2 className="text-base font-semibold">Saved response</h2>
          <pre className="mt-2 text-xs bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg overflow-auto">
            {JSON.stringify(resp, null, 2)}
          </pre>
        </div>
      )}

      {report && (
        <div className="mt-6">
          <h2 className="text-base font-semibold">{report.report.title}</h2>
          <p className="text-sm mt-1">Raw: <strong>{report.report.raw}</strong> · Normalized: <strong>{report.report.normalized}%</strong></p>
          <pre className="mt-2 text-xs bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg overflow-auto">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
