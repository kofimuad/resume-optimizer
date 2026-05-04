// Placeholder Success page — Stripe redirects here with ?session_id=xxx (Day 5, Task 13).
// Full payment verification flow gets wired up later.

import { useSearchParams } from 'react-router-dom'

function Success() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Payment success</h1>
      <p className="mt-2 text-slate-600">
        Verification flow gets wired up on Day 5.
      </p>
      {sessionId && (
        <p className="mt-4 break-all text-xs text-slate-500">
          Session ID: {sessionId}
        </p>
      )}
    </main>
  )
}

export default Success
