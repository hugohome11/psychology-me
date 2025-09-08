import Link from "next/link";

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "psychology.me";

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{appName}</h1>
      <p className="mt-2 text-sm text-gray-600">MVP demo</p>

      <ul className="mt-6 list-disc pl-6">
        <li>
          <Link href="/api/health">/api/health</Link>
        </li>
        <li>
          <Link href="/api/assessments/demo">/api/assessments/demo</Link>
        </li>
        <li>
          <Link href="/assessments/demo">/assessments/demo</Link>
        </li>
      </ul>
    </main>
  );
}
