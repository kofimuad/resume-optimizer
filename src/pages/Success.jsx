import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

function SpinnerLarge() {
  return (
    <svg className="h-10 w-10 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function Success() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState('verifying') // verifying | paid | failed

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed')
      return
    }

    api.get(`/verify-payment?session_id=${sessionId}`)
      .then(({ data }) => {
        if (data.paid) {
          setStatus('paid')
          // Brief pause so user sees the confirmation, then redirect home with
          // session_id so Home.jsx can call /unlock to generate the full resume.
          setTimeout(() => navigate(`/?session_id=${sessionId}`), 2200)
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [sessionId, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="mx-auto w-full max-w-md">

        {status === 'verifying' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-5 flex justify-center">
              <SpinnerLarge />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verifying your payment…</h1>
            <p className="mt-2 text-sm text-slate-500">This takes just a moment.</p>
          </div>
        )}

        {status === 'paid' && (
          <div className="rounded-2xl border border-green-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Payment confirmed!</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Your full resume package is ready. Taking you back now…
            </p>
            <div className="mt-5 flex justify-center">
              <SpinnerLarge />
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              ✗
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Payment not verified</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We couldn&apos;t confirm your payment. If you were charged, please contact support.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go back
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Success
