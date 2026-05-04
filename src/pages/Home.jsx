import { useState, useRef, useCallback, useEffect } from 'react'
import api from '../lib/api'

const PREFILL =
  'I managed a team of __ people. I was responsible for __. I handled __.'

const CHIPS = [
  { label: 'Managed people',  append: 'I managed and led a team of people. ' },
  { label: 'Logistics',       append: 'I coordinated logistics and supply chain operations. ' },
  { label: 'Training',        append: 'I trained and developed junior team members. ' },
  { label: 'Operations',      append: 'I oversaw day-to-day operations and ensured mission readiness. ' },
  { label: 'Equipment',       append: 'I maintained and managed equipment and inventory. ' },
  { label: 'Admin',           append: 'I handled administrative duties and documentation. ' },
]


// ─── Icons ────────────────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <rect x="8" y="9" width="16" height="2" rx="1" fill="white" />
      <rect x="8" y="14" width="16" height="2" rx="1" fill="white" />
      <rect x="8" y="19" width="10" height="2" rx="1" fill="white" />
      <circle cx="24" cy="23" r="4" fill="#22c55e" />
      <path d="M22 23l1.5 1.5L26 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

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

// ─── Hero ─────────────────────────────────────────────────────────────────────

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

// ─── Mode tabs ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'default', label: 'Describe what you did' },
  { id: 'voice',   label: 'Speak instead' },
  { id: 'chips',   label: 'Tap to Build' },
]

function ModeTabs({ mode, setMode }) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Input mode">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={mode === t.id}
          onClick={() => setMode(t.id)}
          className={`
            min-h-[44px] flex-1 rounded-lg px-2 py-2 text-xs font-semibold leading-tight transition-all
            ${mode === t.id
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'}
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Voice panel ──────────────────────────────────────────────────────────────

function VoicePanel({ setExperience }) {
  const [phase,    setPhase]    = useState('idle') // idle | active | done
  const [liveText, setLiveText] = useState('')
  const [trail,    setTrail]    = useState([])
  const [error,    setError]    = useState('')
  const [didSave,  setDidSave]  = useState(false)

  const keepAlive  = useRef(false)
  const finalText  = useRef('')  // isFinal chunks only
  const interimText = useRef('') // latest interim chunk (not yet final)
  const currentRec = useRef(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  function addTrail(msg) {
    setTrail(prev => [...prev.slice(-4), msg])
  }

  function flush() {
    // Combine confirmed final text with any interim that was never finalised
    // (happens when the user taps Stop mid-sentence)
    const combined = [finalText.current, interimText.current]
      .map(s => s.trim())
      .filter(Boolean)
      .join(' ')
    if (combined) {
      setExperience(prev => {
        const base = prev.trim()
        // If it's still the untouched prefill, don't append — replace
        return base && base !== PREFILL ? `${base} ${combined}` : combined
      })
      setDidSave(true)
    }
  }

  function startSession() {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang            = 'en-US'
    rec.interimResults  = true
    rec.continuous      = true   // stay open across pauses; we call stop() manually
    rec.maxAlternatives = 1

    rec.onstart       = () => { addTrail('mic on');           setPhase('active') }
    rec.onaudiostart  = () =>   addTrail('audio capturing…')
    rec.onsoundstart  = () =>   addTrail('sound detected')
    rec.onspeechstart = () =>   addTrail('speech recognised!')

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalText.current +=
            (finalText.current ? ' ' : '') + chunk.trim()
          interimText.current = ''
        } else {
          interim += chunk
        }
      }
      interimText.current = interim
      setLiveText(
        finalText.current +
          (interim ? (finalText.current ? ' ' : '') + interim : '')
      )
    }

    rec.onerror = (e) => {
      addTrail(`error: ${e.error}`)
      if (e.error === 'no-speech') return  // continuous mode keeps going
      if (e.error === 'aborted')   return
      keepAlive.current = false
      setPhase('idle')
      setError(
        e.error === 'not-allowed'
          ? 'Microphone access denied. Check Chrome site permissions and Windows microphone privacy settings.'
          : e.error === 'network'
            ? 'Network error — Chrome needs internet to process speech. Check your connection.'
            : `Recognition failed (${e.error}). Try again or switch to the Describe tab.`
      )
    }

    rec.onend = () => {
      addTrail('session ended')
      if (keepAlive.current) {
        // continuous mode still fires onend on no-speech — restart after short gap
        setTimeout(() => {
          if (keepAlive.current) startSession()
        }, 200)
      } else {
        // user tapped Stop — flush everything collected so far
        flush()
        setPhase('done')
      }
    }

    currentRec.current = rec
    try {
      rec.start()
    } catch (err) {
      setError(`Could not start microphone: ${err.message}`)
      keepAlive.current = false
    }
  }

  const handleStart = () => {
    setError('')
    setLiveText('')
    setTrail([])
    setDidSave(false)
    finalText.current   = ''
    interimText.current = ''
    keepAlive.current   = true
    startSession()
  }

  const handleStop = () => {
    keepAlive.current = false
    try { currentRec.current?.stop() } catch (_) {}
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Voice input isn&apos;t supported in this browser.
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Try Chrome on Android, or use the &ldquo;Describe&rdquo; tab instead.
        </p>
      </div>
    )
  }

  const isActive = phase === 'active'

  return (
    <div className="text-center">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Tap the button, speak naturally, then tap again to stop. Words appear
        in real time and are added to the experience box below.
      </p>

      {/* Mic button */}
      <button
        onClick={isActive ? handleStop : handleStart}
        aria-label={isActive ? 'Stop recording' : 'Start recording'}
        className={`
          mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white
          shadow-lg transition-all active:scale-95
          ${isActive ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        <MicIcon />
      </button>

      {/* Status label */}
      <p className="mt-3 text-xs font-medium text-slate-500">
        {phase === 'idle'   && 'Tap to speak'}
        {phase === 'active' && 'Listening — tap to stop'}
        {phase === 'done'   && (didSave ? 'Added to your experience below.' : 'Nothing captured — try again.')}
      </p>

      {/* Event trail — shows exactly where the pipeline is up to */}
      {trail.length > 0 && (
        <p className="mt-1 text-xs text-blue-500 tracking-wide">
          {trail.join(' → ')}
        </p>
      )}

      {/* Live transcript box */}
      {(isActive || (phase === 'done' && liveText)) && !error && (
        <div className="mt-4 min-h-[60px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {isActive ? 'Transcript' : 'Captured'}
          </p>
          <p className="text-sm leading-relaxed text-slate-800">
            {liveText || (
              <span className="text-slate-300">Words will appear here as you speak…</span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Chips panel ──────────────────────────────────────────────────────────────

function ChipsPanel({ setExperience }) {
  const handleChip = useCallback((append) => {
    setExperience(prev => {
      const base = prev === PREFILL || !prev.trim() ? '' : prev.trim()
      return base ? `${base} ${append}` : append
    })
  }, [setExperience])

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">
        Tap the topics that match your background — each one adds a sentence to
        your experience description below.
      </p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => handleChip(chip.append)}
            className="
              min-h-[44px] rounded-full border border-slate-200 bg-white px-5 py-2
              text-sm font-medium text-slate-700 shadow-sm transition-all
              active:scale-95 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700
            "
          >
            + {chip.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Tap as many as apply — then edit the text below if you want to add details.
      </p>
    </div>
  )
}

// ─── Input system ─────────────────────────────────────────────────────────────

function InputSystem({ experience, setExperience }) {
  const [mode, setMode] = useState('default')

  return (
    <section className="px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Step 1 &mdash; Describe your experience
        </h2>

        <ModeTabs mode={mode} setMode={setMode} />

        <div className="mt-5">
          {mode === 'voice' && <VoicePanel setExperience={setExperience} />}
          {mode === 'chips' && <ChipsPanel setExperience={setExperience} />}
        </div>

        <div className={mode !== 'default' ? 'mt-5' : 'mt-4'}>
          {mode !== 'default' && (
            <p className="mb-2 text-xs font-medium text-slate-500">
              Your experience so far — edit freely
            </p>
          )}
          <textarea
            value={experience}
            onChange={e => setExperience(e.target.value)}
            rows={6}
            aria-label="Your experience"
            className="
              w-full resize-none rounded-xl border border-slate-200 bg-slate-50
              px-4 py-3 text-base leading-relaxed text-slate-900 shadow-inner
              outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100
            "
          />
          {mode === 'default' && (
            <p className="mt-1.5 text-xs text-slate-400">
              Fill in the blanks or write freely — anything works.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Job section ──────────────────────────────────────────────────────────────

function JobSection({ experience, jobDescription, setJobDescription, onSubmit, isLoading }) {
  const [expError, setExpError] = useState('')
  const [jobError, setJobError] = useState('')

  const experienceFilled =
    experience.trim().length > 0 && experience.trim() !== PREFILL

  const handleSubmit = () => {
    let valid = true

    if (!experienceFilled) {
      setExpError('Please describe your experience in Step 1 before continuing.')
      valid = false
    } else {
      setExpError('')
    }

    if (!jobDescription.trim()) {
      setJobError('Please paste a job description so we can tailor your resume.')
      valid = false
    } else {
      setJobError('')
    }

    if (!valid) return
    onSubmit()
  }

  return (
    <section className="px-4 pb-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-800">
          Step 2 &mdash; Paste the job description
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          We&apos;ll match your experience to the exact keywords the employer is looking for.
        </p>

        <textarea
          value={jobDescription}
          onChange={e => {
            setJobDescription(e.target.value)
            if (jobError) setJobError('')
          }}
          rows={8}
          placeholder="Paste the full job description here — title, requirements, responsibilities…"
          aria-label="Job description"
          className={`
            w-full resize-none rounded-xl border px-4 py-3 text-base leading-relaxed
            text-slate-900 outline-none transition
            ${jobError
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'}
          `}
        />

        {/* Inline field errors */}
        {jobError && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <span aria-hidden="true">&#9888;</span> {jobError}
          </p>
        )}
        {expError && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <span aria-hidden="true">&#9888;</span> {expError}
          </p>
        )}

        {/* Submit button — full width, large tap target */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`
            mt-5 flex w-full items-center justify-center gap-3 rounded-xl
            py-4 text-base font-bold text-white shadow-md transition-all
            active:scale-[0.98] disabled:cursor-not-allowed
            ${isLoading
              ? 'bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isLoading ? (
            <>
              <Spinner />
              Building your resume… this takes ~15 seconds
            </>
          ) : (
            'Create My Resume'
          )}
        </button>

        {!isLoading && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Preview is free &mdash; unlock the full package for $2.99
          </p>
        )}
      </div>
    </section>
  )
}

// ─── Preview section ──────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function SectionCard({ title, badge, children }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        {badge && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Full unlocked view ───────────────────────────────────────────────────────

function FullResume({ resume }) {
  const coverParas = (resume.coverLetter ?? '').split(/\n\n+/).filter(Boolean)

  return (
    <div className="space-y-4">

      {/* ① Professional Summary */}
      <SectionCard title="Professional Summary">
        <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
      </SectionCard>

      {/* ② Core Skills */}
      <SectionCard title="Core Skills">
        <div className="flex flex-wrap gap-2">
          {(resume.coreSkills ?? []).map((s, i) => (
            <span key={i} className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
              {s}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* ③ Professional Experience — all roles, all bullets */}
      {(resume.experience ?? []).map((role, ri) => (
        <SectionCard key={ri} title="Professional Experience">
          <div className="mb-3">
            <p className="font-semibold text-slate-800">{role.title}</p>
            <p className="text-sm text-slate-500">{role.company}&nbsp;·&nbsp;{role.period}</p>
          </div>
          <ul className="space-y-2">
            {(role.bullets ?? []).map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {b}
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}

      {/* ④ Civilian Translation */}
      <SectionCard title="Civilian Translation">
        <ul className="space-y-3">
          {(resume.civilianTranslation ?? []).map((line, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-0.5 flex-shrink-0 text-base">🔄</span>
              {line}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* ⑤ Tailored Cover Letter */}
      <SectionCard title="Tailored Cover Letter">
        <div className="space-y-3">
          {coverParas.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-700">{para}</p>
          ))}
        </div>
      </SectionCard>

      {/* ⑥ Why You Are a Strong Fit */}
      <SectionCard title="Why You Are a Strong Fit">
        <ul className="space-y-3">
          {(resume.whyStrongFit ?? []).map((b, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-0.5 flex-shrink-0 text-base">✅</span>
              {b}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* ⑦ Interview Prep */}
      <SectionCard title="Interview Prep">
        <div className="space-y-5">
          {(resume.interviewPrep ?? []).map((qa, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">Q: {qa.question}</p>
              <p className="text-sm leading-relaxed text-slate-600">{qa.answer}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Preview section ───────────────────────────────────────────────────────────

function PreviewSection({ resume, hasPaid }) {
  const ref              = useRef(null)
  const [unlocked,    setUnlocked]    = useState(false)
  const [unlocking,   setUnlocking]   = useState(false)
  const [unlockError, setUnlockError] = useState('')

  useEffect(() => {
    if (resume) {
      setUnlocked(false)
      setUnlockError('')
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }, [resume])

  // Force open when returning from a verified payment
  useEffect(() => {
    if (hasPaid) setUnlocked(true)
  }, [hasPaid])

  const handleUnlock = async () => {
    setUnlocking(true)
    setUnlockError('')
    try {
      // Persist resume so the Success page can restore it after redirect
      localStorage.setItem('resumeai_resume', JSON.stringify(resume))
      const { data } = await api.post('/create-checkout', {})
      window.location.href = data.url
    } catch (err) {
      setUnlockError(
        err?.response?.data?.error ?? 'Could not start checkout — please try again.'
      )
      setUnlocking(false)
    }
  }

  if (!resume) return null

  const role           = resume.experience?.[0] ?? {}
  const allBullets     = role.bullets ?? []
  const visibleBullets = allBullets.slice(0, 2)
  const hiddenBullets  = allBullets.slice(2)
  const coverParas     = (resume.coverLetter ?? '').split(/\n\n+/).filter(Boolean)

  return (
    <section ref={ref} id="preview-section" className="px-4 pb-16">

      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Resume Preview</h2>
          <p className="text-sm text-slate-500">
            {unlocked ? 'Full package — all 7 sections' : 'Free preview · Unlock the full package below'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasPaid ? (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Payment Verified ✓
            </span>
          ) : (
            <>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                AI Generated
              </span>
              <button
                onClick={() => setUnlocked(u => !u)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600"
              >
                {unlocked ? '🔒 Lock view' : '👁 See full'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Unlocked: all 7 sections ── */}
      {unlocked && <FullResume resume={resume} />}

      {/* ── Locked: summary + 2 bullets visible, rest blurred ── */}
      {!unlocked && (
        <>
          {/* ① Summary */}
          <SectionCard title="Professional Summary" badge="Visible">
            <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
          </SectionCard>

          {/* ② Experience partial */}
          <SectionCard title="Professional Experience" badge="Visible">
            <div className="mb-3">
              <p className="font-semibold text-slate-800">{role.title}</p>
              <p className="text-sm text-slate-500">{role.company}&nbsp;·&nbsp;{role.period}</p>
            </div>
            <ul className="space-y-2">
              {visibleBullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {b}
                </li>
              ))}
            </ul>
            {hiddenBullets.length > 0 && (
              <div className="relative mt-2 overflow-hidden">
                <ul className="pointer-events-none select-none space-y-2 blur-sm">
                  {hiddenBullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
              </div>
            )}
          </SectionCard>

          {/* ③ Blurred teaser */}
          <div className="relative mb-4 overflow-hidden rounded-2xl">
            <div className="pointer-events-none select-none space-y-4 blur-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Core Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(resume.coreSkills ?? []).map((s, i) => (
                    <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why You Are a Strong Fit</p>
                <ul className="space-y-2">
                  {(resume.whyStrongFit ?? []).map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tailored Cover Letter</p>
                {coverParas.slice(0, 2).map((p, i) => (
                  <p key={i} className="mt-1 text-sm leading-relaxed text-slate-700">{p}</p>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Interview Prep (3 answers)</p>
                <ul className="space-y-3">
                  {(resume.interviewPrep ?? []).map((qa, i) => (
                    <li key={i} className="text-sm font-medium text-slate-700">{qa.question}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/10 via-slate-50/60 to-slate-50" />
          </div>

          {/* ④ CTA */}
          <div className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-lg">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-green-500" />
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <LockIcon />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Unlock your full resume package</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Full resume · Cover letter · Why you&apos;re a strong fit · 3 interview answers
              </p>
              <div className="my-5 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-slate-900">$2.99</span>
                <span className="text-sm text-slate-500">one-time</span>
              </div>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed ${unlocking ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {unlocking ? (
                  <>
                    <Spinner />
                    Redirecting to checkout…
                  </>
                ) : (
                  'Unlock Now →'
                )}
              </button>
              {unlockError && (
                <p className="mt-3 text-xs text-red-600">{unlockError}</p>
              )}
              <p className="mt-4 text-xs text-slate-400">
                Instant delivery &nbsp;·&nbsp; One-time payment &nbsp;·&nbsp; No subscription
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function Home() {
  const [experience,     setExperience]     = useState(PREFILL)
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading,      setIsLoading]      = useState(false)
  const [resume,         setResume]         = useState(null)
  const [apiError,       setApiError]       = useState('')
  const [hasPaid,        setHasPaid]        = useState(false)

  // On return from Stripe, restore resume from localStorage and mark as paid
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paid') === '1') {
      try {
        const saved = localStorage.getItem('resumeai_resume')
        if (saved) {
          setResume(JSON.parse(saved))
          setHasPaid(true)
        }
      } catch {}
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    setResume(null)
    setApiError('')

    try {
      const { data } = await api.post('/generate', {
        experience:     experience.trim(),
        jobDescription: jobDescription.trim(),
      })
      setResume(data.resume)
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        (err?.code === 'ECONNABORTED' ? 'Request timed out — please try again.' : 'Something went wrong. Please try again.')
      setApiError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl">
        <Hero />

        <InputSystem experience={experience} setExperience={setExperience} />

        <JobSection
          experience={experience}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* API-level error (network failure, OpenAI error, etc.) */}
        {apiError && (
          <div className="mx-4 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Error: </span>{apiError}
          </div>
        )}

        <PreviewSection resume={resume} hasPaid={hasPaid} />
      </main>
    </div>
  )
}

export default Home
