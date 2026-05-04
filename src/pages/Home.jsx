function LogoIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <rect x="8" y="9" width="16" height="2" rx="1" fill="white" />
      <rect x="8" y="14" width="16" height="2" rx="1" fill="white" />
      <rect x="8" y="19" width="10" height="2" rx="1" fill="white" />
      <circle cx="24" cy="23" r="4" fill="#22c55e" />
      <path
        d="M22 23l1.5 1.5L26 21"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <LogoIcon />
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Resume<span className="text-blue-600">AI</span>
        </span>
        <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          $2.99 one-time
        </span>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="px-4 pb-10 pt-12 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-green-700">
            Built for military veterans &amp; career starters
          </span>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Create a job&#8209;ready resume{' '}
          <span className="text-blue-600">in minutes</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
          No resume needed. Just describe your experience&nbsp;&mdash; we&apos;ll
          build it for you.
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Translates military &amp; entry-level experience into professional,
          ATS-optimised language.
        </p>
      </div>
    </section>
  )
}

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl">
        <Hero />

        {/* Task 3 — Input System placeholder */}
        <section id="input-section" className="px-4 pb-6">
          {/* Three input modes go here (Task 3) */}
        </section>

        {/* Task 4 — Job description + submit placeholder */}
        <section id="job-section" className="px-4 pb-6">
          {/* Job description field + Create My Resume button go here (Task 4) */}
        </section>

        {/* Task 5 — Preview UI placeholder */}
        <section id="preview-section" className="px-4 pb-16">
          {/* Mocked resume preview + blur + CTA goes here (Task 5) */}
        </section>
      </main>
    </div>
  )
}

export default Home
