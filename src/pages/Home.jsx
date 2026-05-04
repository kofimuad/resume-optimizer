// Placeholder Home page — full UI lives here in Day 1–2 (Tasks 2–5).
// For now this just confirms the scaffold renders.

function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Resume Optimizer</h1>
        <p className="mt-2 text-slate-600">
          Scaffold is ready. Build the input system, preview UI, and CTA on top of this.
        </p>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Next steps</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Task 2 — Header, headline, subheadline</li>
          <li>Task 3 — Three input modes (default, voice, tap-to-build)</li>
          <li>Task 4 — Job description field + submit</li>
          <li>Task 5 — Mocked preview UI with blur/CTA</li>
        </ul>
      </section>
    </main>
  )
}

export default Home
