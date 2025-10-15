export default function CancelPage() {
  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4">Payment Cancelled</h1>
      <p>You can try again anytime. No charges were made.</p>
      <a
        href="/"
        className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Home
      </a>
    </main>
  );
}
