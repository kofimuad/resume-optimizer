import { useState, useRef, useCallback, useEffect } from 'react'
import api from '../lib/api'

const CHIPS = [
  { label: 'Managed people',  append: 'I managed and led a team of people. ' },
  { label: 'Logistics',       append: 'I coordinated logistics and supply chain operations. ' },
  { label: 'Training',        append: 'I trained and developed junior team members. ' },
  { label: 'Operations',      append: 'I oversaw day-to-day operations and ensured mission readiness. ' },
  { label: 'Equipment',       append: 'I maintained and managed equipment and inventory. ' },
  { label: 'Admin',           append: 'I handled administrative duties and documentation. ' },
]

const OL    = '#2C3A2C'   // olive primary
const OL_BG = '#0F1A0F'   // olive dark background (hero / header)

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShieldStarIcon({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 2L4 7v9c0 6.6 5.1 12.7 12 14.5C22.9 28.7 28 22.6 28 16V7L16 2z"
        fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
      <path d="M16 8l1.8 5.5H23l-4.2 3 1.6 5L16 18.3l-4.4 3.2 1.6-5L9 13.5h5.2L16 8z"
        fill="white" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5m0 0l7-7m-7 7l7 7" />
    </svg>
  )
}

function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function GraduationCapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
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

function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function DocPlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function MedalIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="15" r="5" />
      <path d="M12 12.8l.8 2.4h2.5l-2 1.5.8 2.4-2.1-1.5-2.1 1.5.8-2.4-2-1.5h2.5z"
        fill="currentColor" stroke="none" />
      <path d="M10.5 3h3l-0.75 5.5h-1.5L10.5 3z" />
      <path d="M10.5 8l-1 1.5M13.5 8l1 1.5" />
    </svg>
  )
}

function BriefcaseIcon2({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  )
}

function ShieldCheckIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5.5 3.6 10.7 8 12 4.4-1.3 8-6.5 8-12V6l-8-4z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function EyeSpotlightIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    </svg>
  )
}

function FileTextIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function MailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  )
}

function ArrowsExchangeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

// LandingHeader and HeroSection are merged into LandingScreen below for a seamless full-viewport dark block

function FeatureGrid() {
  const features = [
    { icon: <MedalIcon size={30} />,        color: '#3B4F3B', bg: '#EEF2EE', title: 'Built by Veterans',    desc: 'Designed specifically for military experience.' },
    { icon: <EyeSpotlightIcon size={30} />, color: '#3B3B6B', bg: '#EEEEF8', title: 'Get Noticed',          desc: 'ATS-optimized resumes that pass screening.' },
    { icon: <BriefcaseIcon2 size={30} />,   color: '#6B3B1A', bg: '#F8F0E8', title: 'Land More Interviews', desc: 'Professional resumes that get you in the door.' },
    { icon: <ShieldCheckIcon size={30} />,  color: '#6B4A1A', bg: '#F8F2E8', title: '100% Secure',          desc: 'Your information is safe with us. Always.' },
  ]
  return (
    <section className="bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {features.map(({ icon, color, bg, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: bg, color }}>
                {icon}
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-800">{title}</p>
              <p className="text-xs leading-snug text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialSection() {
  const stats = [
    { value: '10K+', label: 'Resumes Built' },
    { value: '85%',  label: 'More Interviews' },
    { value: '4.8 ★', label: 'Avg Rating' },
  ]
  return (
    <section className="bg-white px-4 pb-12 pt-2">
      <div className="mx-auto max-w-6xl px-2 sm:px-6 lg:px-8">

        {/* Mobile: compact stats strip + single-line quote */}
        <div className="sm:hidden">
          <div className="flex divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex-1 py-4 text-center">
                <p className="text-lg font-black text-slate-900">{value}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 px-1 text-sm italic leading-relaxed text-slate-500">
            &ldquo;CareerForge helped me turn my military experience into a resume that got me interviews.&rdquo;
            <span className="ml-2 not-italic font-semibold text-slate-400">— Jason T., U.S. Army Veteran</span>
          </p>
        </div>

        {/* Desktop: full layout */}
        <div className="hidden sm:flex gap-4 items-stretch">
          <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="mb-3 text-4xl leading-none text-slate-200">&ldquo;</div>
            <p className="mb-4 text-sm leading-relaxed text-slate-700">
              CareerForge helped me turn my military experience into a resume that finally got me interviews.
            </p>
            <p className="text-xs font-semibold text-slate-500">— Jason T., U.S. Army Veteran</p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-center min-w-[110px]">
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

function LandingScreen({ onStart }) {
  return (
    <div className="overflow-x-hidden">
      {/* Nav + hero merged into one seamless full-viewport dark section */}
      <div style={{ backgroundColor: OL_BG }} className="relative flex min-h-screen flex-col overflow-hidden">

        {/* Mobile: full-bleed soldier image with heavy dark overlay */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <img
            src="/images/soldier.png"
            alt=""
            className="h-full w-full object-cover object-[33%_30%]"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(15,26,15,0.80)' }} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0F1A0F] to-transparent" />
        </div>

        {/* Desktop: mask-blend on right side only */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[65%] lg:block"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 22%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 22%)',
          }}
        >
          <img
            src="/images/soldier.png"
            alt=""
            className="h-full w-full object-cover object-center"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(15,26,15,0.6) 0%, rgba(15,26,15,0.2) 50%, transparent 80%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0F1A0F] to-transparent" />
        </div>

        {/* Nav — no border, no shadow, inherits the dark section seamlessly */}
        <header className="relative z-50 w-full">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-white">
              <ShieldStarIcon size={26} />
              <span className="text-lg font-bold tracking-tight text-white">CareerForge</span>
            </div>
            <div className="ml-auto">
              <button
                onClick={onStart}
                className="flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <LockIcon size={13} /> $2.99 one-time
              </button>
            </div>
          </div>
        </header>

        {/* Hero text — flex-1 centers content in remaining viewport space */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6 lg:px-8">
            <div className="max-w-xl">

              {/* Badge */}
              <div className="mb-5 flex items-center gap-2 text-white/60">
                <ShieldStarIcon size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Built for Military Veterans &amp; Career Starters
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
                TURN YOUR<br />EXPERIENCE<br />INTO A JOB-READY<br />RESUME
              </h1>

              <div className="my-5 h-0.5 w-12 bg-white/30" />

              <p className="max-w-sm text-base leading-relaxed text-white/55">
                No resume needed. Just share your experience and we&apos;ll build a
                professional resume for your target job.
              </p>

              {/* 3-column feature strip — desktop only */}
              <div className="mt-8 hidden gap-5 lg:grid lg:grid-cols-3">
                {[
                  { icon: <ShieldCheckIcon size={18} />, title: 'Military to Civilian Translation', desc: 'We translate your military experience into civilian terms.' },
                  { icon: <TargetIcon size={18} />,      title: 'ATS-Optimized & Recruiter Friendly', desc: 'Resumes built to pass screening and impress recruiters.' },
                  { icon: <FileTextIcon size={18} />,    title: 'Cover Letter & Interview Answers', desc: 'Get a complete package to land more interviews.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title}>
                    <div className="mb-1.5 flex items-center gap-1.5 text-white/80">
                      {icon}
                      <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
                    </div>
                    <p className="text-xs leading-snug text-white/40">{desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10">
                <button
                  onClick={onStart}
                  style={{ backgroundColor: OL }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-black uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] sm:w-auto sm:px-10"
                >
                  Build My Resume <span className="text-xl">→</span>
                </button>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-white/35">
                  <LockIcon size={13} />
                  Preview is free — unlock the full resume for $2.99
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block"><FeatureGrid /></div>
      <TestimonialSection />
    </div>
  )
}

// ─── Build screen shell ───────────────────────────────────────────────────────

function BuildHeader({ onBack }) {
  return (
    <header style={{ backgroundColor: OL_BG }} className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
        <button onClick={onBack}
          className="flex items-center text-white/60 transition hover:text-white"
          aria-label="Back to home">
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center gap-2 text-white">
          <ShieldStarIcon size={22} />
          <span className="font-bold tracking-tight text-white">CareerForge</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-sm font-semibold text-white">
          <LockIcon size={13} /> $2.99 one-time
        </div>
      </div>
    </header>
  )
}

function StepProgress({ currentStep, maxStep, onStepClick }) {
  const steps = [
    { n: 1, label: 'Your Background' },
    { n: 2, label: 'Target Job' },
    { n: 3, label: 'Preview & Finish' },
  ]
  return (
    <div className="mb-7 flex items-start">
      {steps.map((s, i) => {
        const canNavigate = s.n !== currentStep && s.n <= (maxStep ?? currentStep)
        return (
          <div key={s.n} className="flex flex-1 items-start">
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="relative flex w-full items-center">
                <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : currentStep >= s.n ? 'bg-[#2C3A2C]' : 'bg-slate-200'}`} />
                <button
                  onClick={() => canNavigate && onStepClick(s.n)}
                  disabled={!canNavigate}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all
                    ${canNavigate ? 'cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-offset-1 hover:ring-[#2C3A2C]' : 'cursor-default'}
                    ${currentStep === s.n
                      ? 'text-white shadow-md'
                      : s.n <= (maxStep ?? currentStep)
                        ? 'text-white'
                        : 'border-2 border-slate-300 bg-white text-slate-400'}`}
                  style={s.n <= (maxStep ?? currentStep) ? { backgroundColor: OL } : {}}
                  title={canNavigate ? `Go to ${s.label}` : undefined}
                >
                  {s.n < currentStep || (s.n !== currentStep && s.n <= (maxStep ?? 1)) ? '✓' : s.n}
                </button>
                <div className={`flex-1 h-0.5 ${i === steps.length - 1 ? 'invisible' : s.n < (maxStep ?? currentStep) ? 'bg-[#2C3A2C]' : 'bg-slate-200'}`} />
              </div>
              <span className={`hidden text-center text-xs font-medium leading-tight sm:block
                ${currentStep === s.n ? 'text-slate-800' : canNavigate ? 'cursor-pointer text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline' : 'text-slate-400'}`}
                onClick={() => canNavigate && onStepClick(s.n)}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Voice panel ──────────────────────────────────────────────────────────────

function VoicePanel({ setExperience }) {
  const [phase,     setPhase]     = useState('idle')
  const [liveText,  setLiveText]  = useState('')
  const [trail,     setTrail]     = useState([])
  const [error,     setError]     = useState('')
  const [didSave,   setDidSave]   = useState(false)

  const keepAlive   = useRef(false)
  const finalText   = useRef('')
  const interimText = useRef('')
  const currentRec  = useRef(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  function addTrail(msg) { setTrail(prev => [...prev.slice(-4), msg]) }

  function flush() {
    const combined = [finalText.current, interimText.current]
      .map(s => s.trim()).filter(Boolean).join(' ')
    if (combined) {
      setExperience(prev => {
        const base = prev.trim()
        return base ? `${base} ${combined}` : combined
      })
      setDidSave(true)
    }
  }

  function startSession() {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true
    rec.continuous = true; rec.maxAlternatives = 1

    rec.onstart       = () => { addTrail('mic on'); setPhase('active') }
    rec.onaudiostart  = () => addTrail('audio capturing…')
    rec.onsoundstart  = () => addTrail('sound detected')
    rec.onspeechstart = () => addTrail('speech recognised!')

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalText.current += (finalText.current ? ' ' : '') + chunk.trim()
          interimText.current = ''
        } else { interim += chunk }
      }
      interimText.current = interim
      setLiveText(finalText.current + (interim ? (finalText.current ? ' ' : '') + interim : ''))
    }

    rec.onerror = (e) => {
      addTrail(`error: ${e.error}`)
      if (e.error === 'no-speech' || e.error === 'aborted') return
      keepAlive.current = false; setPhase('idle')
      setError(
        e.error === 'not-allowed'
          ? 'Microphone access denied. Check site permissions and device settings.'
          : e.error === 'network'
            ? 'Network error — speech recognition needs an internet connection.'
            : `Recognition failed (${e.error}). Try again or type instead.`
      )
    }

    rec.onend = () => {
      addTrail('session ended')
      if (keepAlive.current) {
        setTimeout(() => { if (keepAlive.current) startSession() }, 200)
      } else { flush(); setPhase('done') }
    }

    currentRec.current = rec
    try { rec.start() } catch (err) {
      setError(`Could not start microphone: ${err.message}`)
      keepAlive.current = false
    }
  }

  const handleStart = () => {
    setError(''); setLiveText(''); setTrail([]); setDidSave(false)
    finalText.current = ''; interimText.current = ''
    keepAlive.current = true; startSession()
  }

  const handleStop = () => {
    keepAlive.current = false
    try { currentRec.current?.stop() } catch (_) {}
  }

  if (!supported) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
        <p className="text-sm font-semibold text-amber-800">Voice not supported in this browser.</p>
        <p className="mt-1 text-xs text-amber-700">Try Chrome on Android, or type your experience instead.</p>
      </div>
    )
  }

  const isActive = phase === 'active'

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="mb-4 text-sm text-slate-600">
        Tap the button, speak naturally, then tap again to stop.
      </p>
      <button
        onClick={isActive ? handleStop : handleStart}
        aria-label={isActive ? 'Stop recording' : 'Start recording'}
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95
          ${isActive ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'hover:opacity-90'}`}
        style={!isActive ? { backgroundColor: OL } : {}}
      >
        <MicIcon size={24} />
      </button>
      <p className="mt-2 text-xs font-medium text-slate-500">
        {phase === 'idle'   && 'Tap to speak'}
        {phase === 'active' && 'Listening — tap to stop'}
        {phase === 'done'   && (didSave ? 'Added to your experience below.' : 'Nothing captured — try again.')}
      </p>
      {trail.length > 0 && (
        <p className="mt-1 text-xs text-slate-400">{trail.join(' → ')}</p>
      )}
      {(isActive || (phase === 'done' && liveText)) && !error && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {isActive ? 'Transcript' : 'Captured'}
          </p>
          <p className="text-sm leading-relaxed text-slate-800">
            {liveText || <span className="text-slate-300">Words will appear here…</span>}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
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
      const base = prev.trim()
      return base ? `${base} ${append}` : append
    })
  }, [setExperience])

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm text-slate-600">
        Tap topics that match your background — each adds a sentence to your experience.
      </p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => handleChip(chip.append)}
            className="min-h-[40px] rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition active:scale-95 hover:border-[#2C3A2C] hover:text-[#2C3A2C]"
          >
            + {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── File upload panel ────────────────────────────────────────────────────────

function FileUploadPanel({ onExtracted }) {
  const [status,  setStatus]  = useState('idle') // idle | uploading | done | error
  const [message, setMessage] = useState('')
  const photoRef   = useRef(null)
  const libraryRef = useRef(null)
  const fileRef    = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    const SUPPORTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!SUPPORTED.includes(file.type)) {
      setStatus('error')
      setMessage('Please upload a JPG, PNG, or WEBP image. For PDFs, take a photo of each page.')
      return
    }

    setStatus('uploading')
    setMessage('Extracting text from your document…')

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1]
      try {
        const { data } = await api.post('/extract-text', {
          imageBase64: base64,
          mimeType: file.type,
        })
        if (data.text) {
          onExtracted(data.text)
          setStatus('done')
          setMessage('Text extracted and added to your experience!')
        } else {
          throw new Error('No text found in image.')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err?.response?.data?.error ?? 'Could not extract text. Please type your experience manually.')
      }
    }
    reader.readAsDataURL(file)
  }

  const clearInput = (ref) => { if (ref.current) ref.current.value = '' }

  const uploadBtnCls = `flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5
    text-sm font-medium text-slate-700 shadow-sm transition active:scale-95
    hover:border-[#2C3A2C] hover:text-[#2C3A2C]`

  return (
    <div>
      {/* Drop zone */}
      <div className="mb-3 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
          <UploadIcon />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Upload files or take a photo</p>
          <p className="text-xs text-slate-400">Drag &amp; drop or use buttons below</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <input ref={photoRef}   type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => { handleFile(e.target.files[0]); clearInput(photoRef) }} />
        <input ref={libraryRef} type="file" accept="image/*" className="hidden"
          onChange={e => { handleFile(e.target.files[0]); clearInput(libraryRef) }} />
        <input ref={fileRef}    type="file" accept="image/*" className="hidden"
          onChange={e => { handleFile(e.target.files[0]); clearInput(fileRef) }} />

        <button onClick={() => photoRef.current?.click()}   className={uploadBtnCls}><CameraIcon /> Take Photo</button>
        <button onClick={() => libraryRef.current?.click()} className={uploadBtnCls}><ImageIcon /> Photo Library</button>
        <button onClick={() => fileRef.current?.click()}    className={uploadBtnCls}><FileIcon /> Choose Files</button>
      </div>

      {status === 'uploading' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <Spinner /> {message}
        </div>
      )}
      {status === 'done' && (
        <p className="mt-3 text-sm font-medium text-green-600">✓ {message}</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}
    </div>
  )
}

// ─── Step 1: Experience card ──────────────────────────────────────────────────

function ExperienceCard({ experience, setExperience, error }) {
  const [panel, setPanel] = useState(null) // null | 'voice' | 'chips' | 'upload'

  const togglePanel = (name) => setPanel(prev => prev === name ? null : name)

  const actionBtnCls = (name) =>
    `flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
      panel === name
        ? 'border-transparent text-white'
        : 'border-slate-200 bg-white text-slate-700 hover:border-[#2C3A2C] hover:text-[#2C3A2C]'
    }`

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Card header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <PersonIcon />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Tell us about your experience</h2>
          <p className="text-sm text-slate-500">Share your role, responsibilities, skills, and achievements.</p>
        </div>
      </div>

      {/* Expandable panels */}
      {panel === 'voice'  && <VoicePanel setExperience={setExperience} />}
      {panel === 'chips'  && <ChipsPanel setExperience={setExperience} />}
      {panel === 'upload' && (
        <div className="mb-4">
          <FileUploadPanel onExtracted={text => {
            setExperience(prev => {
              const base = prev.trim()
              return base ? `${base}\n\n${text}` : text
            })
          }} />
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={experience}
          onChange={e => setExperience(e.target.value.slice(0, 1000))}
          placeholder="Start typing here… e.g. I managed a team of 12 people. I was responsible for logistics and supply chain operations."
          rows={6}
          className={`w-full resize-none rounded-xl border px-4 py-3 pb-7 text-base leading-relaxed text-slate-900 outline-none transition
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 bg-slate-50 focus:border-[#2C3A2C] focus:bg-white focus:ring-2 focus:ring-[#2C3A2C]/15'}`}
        />
        <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-slate-400">
          {experience.length}/1000
        </span>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">⚠ {error}</p>}

      {/* Input method toggles */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => togglePanel('voice')}
          className={actionBtnCls('voice')}
          style={panel === 'voice' ? { backgroundColor: OL } : {}}>
          <MicIcon /> Speak instead
        </button>
        <button onClick={() => togglePanel('chips')}
          className={actionBtnCls('chips')}
          style={panel === 'chips' ? { backgroundColor: OL } : {}}>
          + Add quick phrases
        </button>
        <button onClick={() => togglePanel('upload')}
          className={actionBtnCls('upload')}
          style={panel === 'upload' ? { backgroundColor: OL } : {}}>
          <UploadIcon /> Upload past resume
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Job match card ───────────────────────────────────────────────────

function JobMatchCard({ jobs, isLoading, error, jobDescription, setJobDescription }) {
  const [selectedTitle, setSelectedTitle] = useState('')
  const [customTitle,   setCustomTitle]   = useState('')
  const [pasteOpen,     setPasteOpen]     = useState(false)

  const selectCard = (job) => {
    if (selectedTitle === job.title) {
      setSelectedTitle('')
      setJobDescription('')
    } else {
      setSelectedTitle(job.title)
      setCustomTitle('')
      setJobDescription(job.description)
    }
  }

  const handleCustomChange = (val) => {
    setCustomTitle(val)
    setSelectedTitle(val ? '__custom__' : '')
    if (!pasteOpen) setJobDescription(val ? `Targeting role: ${val}` : '')
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2C3A2C] focus:bg-white focus:ring-2 focus:ring-[#2C3A2C]/15'

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <TargetIcon />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">What job are you targeting?</h2>
          <p className="text-sm text-slate-500">Based on your background, here are roles you qualify for.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
            <Spinner />
          </div>
          <p className="text-sm font-medium text-slate-600">Finding your best matches…</p>
          <p className="mt-1 text-xs text-slate-400">Analyzing your military background</p>
        </div>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{error}</p>
          )}

          {jobs.length > 0 && (
            <div className="space-y-2">
              {jobs.map(job => {
                const selected = selectedTitle === job.title
                return (
                  <button
                    key={job.title}
                    onClick={() => selectCard(job)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? 'border-[#2C3A2C] bg-[#2C3A2C]/5'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">{job.title}</span>
                      <span className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition ${selected ? 'border-[#2C3A2C] bg-[#2C3A2C]' : 'border-slate-300'}`} />
                    </div>
                    <p className="mt-1 text-xs leading-snug text-slate-500">{job.matchReason}</p>
                  </button>
                )
              })}
            </div>
          )}

          {selectedTitle && selectedTitle !== '__custom__' && selectedTitle !== '__paste__' && !pasteOpen && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Generated job description — edit if needed
              </p>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={5}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </div>
          )}

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {jobs.length > 0 ? 'Or type your own job title' : 'Type the job you want to target'}
            </p>
            <input
              type="text"
              value={customTitle}
              onChange={e => handleCustomChange(e.target.value)}
              placeholder="e.g. Project Manager, Logistics Coordinator…"
              className={inputCls}
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              onClick={() => setPasteOpen(v => !v)}
              className="flex items-center gap-2 text-xs text-slate-400 transition hover:text-slate-600"
            >
              <span className="text-[10px]">{pasteOpen ? '▼' : '▶'}</span>
              Already have a specific job posting? Paste it here
            </button>
            {pasteOpen && (
              <textarea
                value={jobDescription}
                onChange={e => {
                  setJobDescription(e.target.value)
                  setSelectedTitle('__paste__')
                  setCustomTitle('')
                }}
                placeholder="Paste any part of the job description — title, requirements, responsibilities…"
                rows={6}
                className={`mt-3 ${inputCls} resize-none leading-relaxed`}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Step 3: Extras card ──────────────────────────────────────────────────────

function ExtrasCard({ onExtracted }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <DocPlusIcon />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">
            Add any documents that support your story{' '}
            <span className="text-sm font-normal text-slate-400">(optional)</span>
          </h2>
          <p className="text-sm text-slate-500">
            Certificates, awards, evaluations, or anything that helps.
          </p>
        </div>
      </div>
      <FileUploadPanel onExtracted={onExtracted} />
    </div>
  )
}

// ─── Education helpers ────────────────────────────────────────────────────────

const DEGREE_LEVELS = [
  "High School / GED",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
  "Certificate / Trade School",
  "Other",
]

function buildContext(experience, education, educationEnabled) {
  if (!educationEnabled || !education.some(e => e.school || e.level || e.years)) {
    return experience.trim()
  }
  const edText = education
    .filter(e => e.school || e.level || e.years)
    .map(e => [e.level, e.school, e.years ? `(${e.years})` : ''].filter(Boolean).join(', '))
    .join('; ')
  return `${experience.trim()}\n\nEducation: ${edText}`
}

// ─── Step 1: Education card ───────────────────────────────────────────────────

function EducationCard({ education, setEducation, enabled, setEnabled }) {
  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#2C3A2C] focus:bg-white focus:ring-2 focus:ring-[#2C3A2C]/15'

  const update = (i, key, val) =>
    setEducation(prev => prev.map((e, j) => j === i ? { ...e, [key]: val } : e))

  const addEntry = () =>
    setEducation(prev => [...prev, { school: '', level: '', years: '' }])

  const removeEntry = (i) =>
    setEducation(prev => prev.filter((_, j) => j !== i))

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <GraduationCapIcon />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Education</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Optional</span>
          </div>
          <p className="text-sm text-slate-500">Schools attended, degree level, and years.</p>
        </div>
        <button
          onClick={() => setEnabled(v => !v)}
          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
            enabled
              ? 'border-transparent text-white'
              : 'border-slate-200 text-slate-500 hover:border-[#2C3A2C] hover:text-[#2C3A2C]'
          }`}
          style={enabled ? { backgroundColor: OL } : {}}
        >
          {enabled ? 'Added ✓' : '+ Add'}
        </button>
      </div>

      {enabled && (
        <div className="mt-4 space-y-4">
          {education.map((ed, i) => (
            <div key={i}>
              {education.length > 1 && (
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">School {i + 1}</p>
                  <button
                    onClick={() => removeEntry(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="School / University *"
                  value={ed.school}
                  onChange={e => update(i, 'school', e.target.value)}
                  className={`sm:col-span-2 ${inputCls}`}
                />
                <select
                  value={ed.level}
                  onChange={e => update(i, 'level', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Degree level…</option>
                  {DEGREE_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Years (e.g. 2018 – 2022)"
                  value={ed.years}
                  onChange={e => update(i, 'years', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          ))}
          <button
            onClick={addEntry}
            className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-[#2C3A2C] hover:text-[#2C3A2C] transition-all"
          >
            + Add another school
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Existing preview / editor components (unchanged) ─────────────────────────

function DocHeading({ children }) {
  return (
    <div className="mb-2 mt-6 border-b border-slate-800 pb-0.5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-800">{children}</p>
    </div>
  )
}

const DOC_TABS = [
  { id: 'resume',      label: 'Resume' },
  { id: 'coverletter', label: 'Cover Letter' },
  { id: 'interview',   label: 'Interview Prep' },
]

const BASE_CSS = `*{box-sizing:border-box}body{font-family:'Times New Roman',serif;margin:.75in;font-size:11pt;color:#000;line-height:1.45}ul{margin:0;padding-left:16pt}li{margin:2pt 0}p{margin:3pt 0}`
const SEC = label => `<div style="font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #000;padding-bottom:2pt;margin:14pt 0 5pt">${label}</div>`
const HEADER = (name, contact, links) => `
  <h1 style="text-align:center;font-size:18pt;margin:0 0 3pt;font-weight:bold">${name || 'Your Name'}</h1>
  ${contact ? `<p style="text-align:center;font-size:10pt;margin:2pt 0">${contact}</p>` : ''}
  ${links   ? `<p style="text-align:center;font-size:10pt;margin:2pt 0">${links}</p>`   : ''}
`

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

function buildPlainText(resume) {
  const lines = []
  lines.push('PROFESSIONAL SUMMARY', resume.summary, '')
  lines.push('CORE SKILLS', (resume.coreSkills ?? []).join(' · '), '')
  ;(resume.experience ?? []).forEach(role => {
    lines.push('PROFESSIONAL EXPERIENCE')
    lines.push(`${role.title} — ${role.company} (${role.period})`)
    ;(role.bullets ?? []).forEach(b => lines.push(`• ${b}`))
    lines.push('')
  })
  lines.push('CIVILIAN TRANSLATION')
  ;(resume.civilianTranslation ?? []).forEach(l => lines.push(`• ${l}`))
  lines.push('')
  lines.push('COVER LETTER', resume.coverLetter ?? '', '')
  lines.push('WHY YOU ARE A STRONG FIT')
  ;(resume.whyStrongFit ?? []).forEach(b => lines.push(`• ${b}`))
  lines.push('')
  lines.push('INTERVIEW PREP')
  ;(resume.interviewPrep ?? []).forEach(qa => {
    lines.push(`Q: ${qa.question}`, `A: ${qa.answer}`, '')
  })
  return lines.join('\n')
}

function DocumentEditor({ resume }) {
  const [docType,       setDocType]       = useState('resume')
  const [info,          setInfo]          = useState({ name: '', email: '', phone: '', location: '', linkedin: '', github: '' })
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const [showEd,     setShowEd]     = useState(false)
  const [education,  setEducation]  = useState([{ school: '', degree: '', dates: '', coursework: '' }])
  const [showProj,   setShowProj]   = useState(false)
  const [projects,   setProjects]   = useState([{ name: '', description: '', tech: '', link: '' }])
  const [showRef,    setShowRef]    = useState(false)
  const [references, setReferences] = useState('')

  const paperRef       = useRef(null)
  const summaryRef     = useRef(null)
  const skillsRef      = useRef(null)
  const expBulletsRefs = useRef([])
  const coverRef       = useRef(null)
  const fitRef         = useRef(null)
  const interviewRef   = useRef(null)

  function field(key) {
    return { value: info[key], onChange: e => setInfo(p => ({ ...p, [key]: e.target.value })) }
  }
  function getText(ref, fallback = '') {
    return ref.current?.innerText?.trim() ?? fallback
  }
  function updateEd(i, key, val)   { setEducation(prev => prev.map((e, j) => j === i ? { ...e, [key]: val } : e)) }
  function updateProj(i, key, val) { setProjects(prev => prev.map((p, j) => j === i ? { ...p, [key]: val } : p)) }

  function docFilename(ext) {
    const base   = info.name || 'document'
    const suffix = docType === 'resume' ? 'Resume' : docType === 'coverletter' ? 'Cover-Letter' : 'Interview-Prep'
    return `${base}-${suffix}.${ext}`
  }

  async function buildResumePDF() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const margin = 54; const pageW = 612; const usableW = pageW - margin * 2
    let y = 54

    const checkY2  = need => { if (y + need > 792 - margin) { doc.addPage(); y = margin } }
    const heading2 = label => {
      checkY2(24); doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(label.toUpperCase(), margin, y)
      y += 4; doc.setLineWidth(0.75); doc.line(margin, y, pageW - margin, y); y += 12
    }
    const body2 = (text, indent = 0, size = 11, style = 'normal', leading = 14) => {
      if (!text) return
      doc.setFont('times', style); doc.setFontSize(size)
      doc.splitTextToSize(text, usableW - indent).forEach(line => { checkY2(leading); doc.text(line, margin + indent, y); y += leading })
    }

    doc.setFont('times', 'bold'); doc.setFontSize(18)
    doc.text(info.name || 'Your Name', pageW / 2, y, { align: 'center' }); y += 24
    const contact = [info.location, info.phone, info.email].filter(Boolean).join(' · ')
    if (contact) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(contact, pageW / 2, y, { align: 'center' }); y += 14 }
    const links = [info.linkedin, info.github].filter(Boolean).join(' · ')
    if (links)   { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(links,   pageW / 2, y, { align: 'center' }); y += 14 }
    y += 6

    heading2('Professional Summary')
    body2(getText(summaryRef, resume.summary)); y += 6

    heading2('Core Skills')
    body2(getText(skillsRef, (resume.coreSkills ?? []).join(' · '))); y += 6

    heading2('Professional Experience')
    ;(resume.experience ?? []).forEach((role, i) => {
      const rawBullets = expBulletsRefs.current[i]?.innerText ?? ''
      const bullets = rawBullets.split('\n').map(s => s.trim()).filter(Boolean)
      checkY2(42)
      doc.setFont('times', 'bold'); doc.setFontSize(11)
      doc.text(role.title, margin, y)
      doc.setFont('times', 'normal'); doc.setFontSize(10)
      doc.text(role.period, pageW - margin, y, { align: 'right' }); y += 14
      doc.setFont('times', 'italic'); doc.setFontSize(10)
      doc.text(role.company, margin, y); y += 14
      doc.setFont('times', 'normal'); doc.setFontSize(11)
      bullets.forEach(b => {
        const bLines = doc.splitTextToSize(`• ${b}`, usableW - 10)
        bLines.forEach((line, li) => { checkY2(14); doc.text(line, margin + (li > 0 ? 12 : 0), y); y += 14 })
      })
      y += 6
    })

    if (showEd && education.some(e => e.school || e.degree)) {
      heading2('Education')
      education.filter(e => e.school || e.degree).forEach(ed => {
        checkY2(28)
        doc.setFont('times', 'bold'); doc.setFontSize(11)
        doc.text(ed.degree || '', margin, y)
        if (ed.dates) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(ed.dates, pageW - margin, y, { align: 'right' }) }
        y += 14
        if (ed.school) { doc.setFont('times', 'italic'); doc.setFontSize(10); doc.text(ed.school, margin, y); y += 14 }
        if (ed.coursework) body2(`Relevant Coursework: ${ed.coursework}`, 0, 10, 'normal', 13)
        y += 4
      })
    }

    if (showProj && projects.some(p => p.name)) {
      heading2('Projects')
      projects.filter(p => p.name).forEach(proj => {
        checkY2(28)
        doc.setFont('times', 'bold'); doc.setFontSize(11)
        doc.text(proj.name, margin, y)
        if (proj.tech) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(proj.tech, pageW - margin, y, { align: 'right' }) }
        y += 14
        if (proj.description) {
          const bLines = doc.splitTextToSize(`• ${proj.description}`, usableW - 10)
          bLines.forEach((line, li) => { checkY2(14); doc.text(line, margin + (li > 0 ? 12 : 0), y); y += 14 })
        }
        if (proj.link) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(proj.link, margin, y); y += 13 }
        y += 4
      })
    }

    if (showRef && references.trim()) {
      heading2('References')
      body2(references)
    }

    doc.save(docFilename('pdf'))
  }

  async function buildCoverLetterPDF() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const margin = 54; const pageW = 612; const pageH = 792; const usableW = pageW - margin * 2
    let y = margin
    const checkY = need => { if (y + need > pageH - margin) { doc.addPage(); y = margin } }
    const heading = label => {
      checkY(24); doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(label.toUpperCase(), margin, y)
      y += 4; doc.setLineWidth(0.75); doc.line(margin, y, pageW - margin, y); y += 12
    }
    doc.setFont('times', 'bold'); doc.setFontSize(18)
    doc.text(info.name || 'Your Name', pageW / 2, y, { align: 'center' }); y += 24
    const contact = [info.location, info.phone, info.email].filter(Boolean).join(' · ')
    if (contact) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(contact, pageW / 2, y, { align: 'center' }); y += 14 }
    const links = [info.linkedin, info.github].filter(Boolean).join(' · ')
    if (links)   { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(links,   pageW / 2, y, { align: 'center' }); y += 14 }
    y += 6
    heading('Cover Letter')
    const coverText = getText(coverRef, resume.coverLetter ?? '')
    coverText.split(/\n\n+/).filter(Boolean).forEach(para => {
      doc.setFont('times', 'normal'); doc.setFontSize(11)
      doc.splitTextToSize(para, usableW).forEach(line => { checkY(14); doc.text(line, margin, y); y += 14 })
      y += 6
    })
    const fitText = getText(fitRef)
    if (fitText) {
      heading('Why You Are a Strong Fit')
      fitText.split('\n').map(s => s.trim()).filter(Boolean).forEach(b => {
        const bLines = doc.splitTextToSize(`• ${b}`, usableW - 10)
        bLines.forEach((line, li) => { checkY(14); doc.text(line, margin + (li > 0 ? 12 : 0), y); y += 14 })
      })
    }
    doc.save(docFilename('pdf'))
  }

  async function buildInterviewPDF() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const margin = 54; const pageW = 612; const pageH = 792; const usableW = pageW - margin * 2
    let y = margin
    const checkY = need => { if (y + need > pageH - margin) { doc.addPage(); y = margin } }
    doc.setFont('times', 'bold'); doc.setFontSize(16)
    doc.text('Interview Preparation Guide', pageW / 2, y, { align: 'center' }); y += 24
    if (info.name) { doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(`Prepared for: ${info.name}`, pageW / 2, y, { align: 'center' }); y += 14 }
    y += 8
    doc.setFont('times', 'bold'); doc.setFontSize(11)
    doc.text('INTERVIEW QUESTIONS & ANSWERS', margin, y); y += 4
    doc.setLineWidth(0.75); doc.line(margin, y, pageW - margin, y); y += 14
    ;(resume.interviewPrep ?? []).forEach(qa => {
      checkY(28)
      doc.setFont('times', 'bold'); doc.setFontSize(11)
      doc.splitTextToSize(`Q: ${qa.question}`, usableW).forEach(line => { checkY(14); doc.text(line, margin, y); y += 14 })
      y += 4
      doc.setFont('times', 'normal'); doc.setFontSize(11)
      doc.splitTextToSize(`A: ${qa.answer}`, usableW).forEach(line => { checkY(14); doc.text(line, margin, y); y += 14 })
      y += 10
    })
    doc.save(docFilename('pdf'))
  }

  const handlePDF = async () => {
    setGeneratingPDF(true)
    try {
      if (docType === 'resume')           await buildResumePDF()
      else if (docType === 'coverletter') await buildCoverLetterPDF()
      else                                await buildInterviewPDF()
    } catch { alert('Could not generate PDF — please try again.') }
    finally { setGeneratingPDF(false) }
  }

  function buildResumeHTML() {
    const contact = [info.location, info.phone, info.email].filter(Boolean).join(' · ')
    const links   = [info.linkedin, info.github].filter(Boolean).join(' · ')
    const summary = getText(summaryRef, resume.summary)
    const skills  = getText(skillsRef, (resume.coreSkills ?? []).join(' · '))
    const expHTML = (resume.experience ?? []).map((role, i) => {
      const bullets = (expBulletsRefs.current[i]?.innerText ?? '').split('\n').map(s => s.trim()).filter(Boolean)
      return `<div style="display:flex;justify-content:space-between;margin-bottom:2pt"><strong>${role.title}</strong><span style="font-size:10pt">${role.period}</span></div>
        <em style="font-size:10pt">${role.company}</em>
        <ul style="margin:4pt 0;padding-left:16pt">${bullets.map(b => `<li style="margin:2pt 0">${b}</li>`).join('')}</ul>`
    }).join('')
    let optHTML = ''
    if (showEd && education.some(e => e.school || e.degree)) {
      optHTML += SEC('Education')
      education.filter(e => e.school || e.degree).forEach(ed => {
        optHTML += `<div style="display:flex;justify-content:space-between"><strong>${ed.degree || ''}</strong><span style="font-size:10pt">${ed.dates || ''}</span></div>`
        if (ed.school)     optHTML += `<div><em style="font-size:10pt">${ed.school}</em></div>`
        if (ed.coursework) optHTML += `<p style="font-size:10pt;margin:3pt 0">Relevant Coursework: ${ed.coursework}</p>`
      })
    }
    if (showProj && projects.some(p => p.name)) {
      optHTML += SEC('Projects')
      projects.filter(p => p.name).forEach(proj => {
        optHTML += `<div style="display:flex;justify-content:space-between"><strong>${proj.name}</strong><span style="font-size:10pt">${proj.tech || ''}</span></div>`
        if (proj.description) optHTML += `<ul style="margin:4pt 0;padding-left:16pt"><li>${proj.description}</li></ul>`
        if (proj.link)        optHTML += `<p style="font-size:10pt;margin:2pt 0">${proj.link}</p>`
      })
    }
    if (showRef && references.trim()) optHTML += SEC('References') + `<p>${references}</p>`
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title><style>${BASE_CSS}</style></head><body>
      ${HEADER(info.name, contact, links)}
      ${SEC('Professional Summary')}<p>${summary}</p>
      ${SEC('Core Skills')}<p>${skills}</p>
      ${SEC('Professional Experience')}${expHTML}
      ${optHTML}
    </body></html>`
  }

  function buildCoverLetterHTML() {
    const contact  = [info.location, info.phone, info.email].filter(Boolean).join(' · ')
    const links    = [info.linkedin, info.github].filter(Boolean).join(' · ')
    const cover    = getText(coverRef, resume.coverLetter ?? '')
    const fit      = getText(fitRef)
    const coverHTML = cover.split('\n').filter(Boolean).map(p => `<p style="margin:6pt 0">${p}</p>`).join('')
    const fitHTML   = fit.split('\n').filter(Boolean).map(b => `<li style="margin:3pt 0">${b}</li>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cover Letter</title><style>${BASE_CSS}</style></head><body>
      ${HEADER(info.name, contact, links)}
      ${SEC('Cover Letter')}${coverHTML}
      ${fitHTML ? SEC('Why You Are a Strong Fit') + `<ul>${fitHTML}</ul>` : ''}
    </body></html>`
  }

  function buildInterviewHTML() {
    const interview = getText(interviewRef)
    const intHTML   = interview.split('\n').filter(Boolean).map(l => `<p style="margin:4pt 0">${l}</p>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Interview Prep</title><style>${BASE_CSS}</style></head><body>
      <h1 style="text-align:center;font-size:18pt;margin:0 0 4pt;font-weight:bold">Interview Preparation Guide</h1>
      ${info.name ? `<p style="text-align:center;font-size:10pt;margin:0 0 2pt">Prepared for: ${info.name}</p>` : ''}
      ${SEC('Interview Questions & Answers')}${intHTML}
    </body></html>`
  }

  function buildHTML() {
    if (docType === 'resume')      return buildResumeHTML()
    if (docType === 'coverletter') return buildCoverLetterHTML()
    return buildInterviewHTML()
  }

  const handleWord = () => {
    const blob = new Blob([buildHTML()], { type: 'application/vnd.ms-word' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: docFilename('doc') })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const inputCls  = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2C3A2C]'
  const editCls   = 'text-sm text-slate-800 outline-none rounded px-1 -mx-1 focus:bg-blue-50/40 focus:ring-1 focus:ring-blue-200'
  const addBtnCls = 'rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-[#2C3A2C] hover:text-[#2C3A2C] transition-all'

  return (
    <div>
      {/* Personal info */}
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Your Personal Details — shared across all documents
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Full Name *"               {...field('name')}     className={`col-span-2 ${inputCls}`} />
          <input placeholder="Email"                     {...field('email')}    className={inputCls} />
          <input placeholder="Phone"                     {...field('phone')}    className={inputCls} />
          <input placeholder="Location (City, Country)"  {...field('location')} className={`col-span-2 ${inputCls}`} />
          <input placeholder="LinkedIn URL"              {...field('linkedin')} className={inputCls} />
          <input placeholder="GitHub / Portfolio URL"    {...field('github')}   className={inputCls} />
        </div>
      </div>

      {/* Document type tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {DOC_TABS.map(t => (
          <button key={t.id} onClick={() => setDocType(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all
              ${docType === t.id ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            style={docType === t.id ? { color: OL } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Download buttons */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={handlePDF} disabled={generatingPDF}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed
            ${generatingPDF ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}>
          {generatingPDF ? <><Spinner /> Generating…</> : '⬇ PDF'}
        </button>
        <button onClick={handleWord}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95"
          style={{ backgroundColor: OL }}>
          ⬇ Word
        </button>
        <span className="ml-auto text-xs text-slate-400">Click any text below to edit</span>
      </div>

      {/* Document paper */}
      <div ref={paperRef} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Shared header */}
        <div className="border-b border-slate-100 px-10 pb-5 pt-8 text-center">
          <p className="text-2xl font-bold leading-tight text-slate-900">
            {info.name || <span className="text-lg font-normal text-slate-300">Enter your name above</span>}
          </p>
          {(info.location || info.phone || info.email) && (
            <p className="mt-1.5 text-sm text-slate-600">
              {[info.location, info.phone, info.email].filter(Boolean).join(' · ')}
            </p>
          )}
          {(info.linkedin || info.github) && (
            <p className="mt-0.5 text-sm text-slate-500">
              {[info.linkedin, info.github].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Resume */}
        {docType === 'resume' && (
          <div className="px-10 pb-10">
            <DocHeading>Professional Summary</DocHeading>
            <p ref={summaryRef} contentEditable suppressContentEditableWarning
              className={`leading-relaxed ${editCls}`}
              dangerouslySetInnerHTML={{ __html: resume.summary }} />

            <DocHeading>Core Skills</DocHeading>
            <p ref={skillsRef} contentEditable suppressContentEditableWarning
              className={editCls}
              dangerouslySetInnerHTML={{ __html: (resume.coreSkills ?? []).join(' · ') }} />

            <DocHeading>Professional Experience</DocHeading>
            {(resume.experience ?? []).map((role, i) => (
              <div key={i} className="mb-5">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-800">{role.title}</span>
                  <span className="text-xs text-slate-500">{role.period}</span>
                </div>
                <p className="mb-2 text-xs italic text-slate-500">{role.company}</p>
                <ul ref={el => { expBulletsRefs.current[i] = el }}
                  contentEditable suppressContentEditableWarning
                  className={`list-disc space-y-1 pl-5 ${editCls}`}
                  dangerouslySetInnerHTML={{ __html: (role.bullets ?? []).map(b => `<li>${b}</li>`).join('') }} />
              </div>
            ))}

            {showEd && (
              <>
                <DocHeading>Education</DocHeading>
                {education.map((ed, i) => (
                  <div key={i} className="mb-4">
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <input placeholder="Degree / Major *"               value={ed.degree}     onChange={e => updateEd(i, 'degree', e.target.value)}     className={inputCls} />
                      <input placeholder="Dates (e.g. 2018–2022)"         value={ed.dates}      onChange={e => updateEd(i, 'dates', e.target.value)}       className={inputCls} />
                      <input placeholder="School / University *"          value={ed.school}     onChange={e => updateEd(i, 'school', e.target.value)}      className={`col-span-2 ${inputCls}`} />
                      <input placeholder="Relevant Coursework (optional)" value={ed.coursework} onChange={e => updateEd(i, 'coursework', e.target.value)}  className={`col-span-2 ${inputCls}`} />
                    </div>
                    {education.length > 1 && (
                      <button onClick={() => setEducation(prev => prev.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEducation(prev => [...prev, { school: '', degree: '', dates: '', coursework: '' }])}
                  className={addBtnCls}>+ Add another education entry</button>
              </>
            )}

            {showProj && (
              <>
                <DocHeading>Projects</DocHeading>
                {projects.map((proj, i) => (
                  <div key={i} className="mb-4">
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <input placeholder="Project Name *"    value={proj.name}        onChange={e => updateProj(i, 'name', e.target.value)}        className={inputCls} />
                      <input placeholder="Technologies Used" value={proj.tech}        onChange={e => updateProj(i, 'tech', e.target.value)}        className={inputCls} />
                      <input placeholder="Brief Description" value={proj.description} onChange={e => updateProj(i, 'description', e.target.value)} className={`col-span-2 ${inputCls}`} />
                      <input placeholder="Link (optional)"   value={proj.link}        onChange={e => updateProj(i, 'link', e.target.value)}        className={`col-span-2 ${inputCls}`} />
                    </div>
                    {projects.length > 1 && (
                      <button onClick={() => setProjects(prev => prev.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setProjects(prev => [...prev, { name: '', description: '', tech: '', link: '' }])}
                  className={addBtnCls}>+ Add another project</button>
              </>
            )}

            {showRef && (
              <>
                <DocHeading>References</DocHeading>
                <textarea
                  placeholder="List your references here, or write 'Available upon request'"
                  value={references} onChange={e => setReferences(e.target.value)}
                  rows={3} className={`w-full resize-none ${inputCls}`} />
              </>
            )}

            {(!showEd || !showProj || !showRef) && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-4">
                <span className="text-xs text-slate-400">Add sections:</span>
                {!showEd   && <button onClick={() => setShowEd(true)}   className={addBtnCls}>+ Education</button>}
                {!showProj && <button onClick={() => setShowProj(true)} className={addBtnCls}>+ Projects</button>}
                {!showRef  && <button onClick={() => setShowRef(true)}  className={addBtnCls}>+ References</button>}
              </div>
            )}
          </div>
        )}

        {/* Cover Letter */}
        {docType === 'coverletter' && (
          <div className="px-10 pb-10">
            <DocHeading>Cover Letter</DocHeading>
            <div ref={coverRef} contentEditable suppressContentEditableWarning
              className={`space-y-3 leading-relaxed ${editCls}`}
              dangerouslySetInnerHTML={{ __html: (resume.coverLetter ?? '').split(/\n\n+/).filter(Boolean).map(p => `<p>${p}</p>`).join('') }} />
            <DocHeading>Why You Are a Strong Fit</DocHeading>
            <ul ref={fitRef} contentEditable suppressContentEditableWarning
              className={`list-disc space-y-1 pl-5 ${editCls}`}
              dangerouslySetInnerHTML={{ __html: (resume.whyStrongFit ?? []).map(b => `<li>${b}</li>`).join('') }} />
          </div>
        )}

        {/* Interview Prep */}
        {docType === 'interview' && (
          <div className="px-10 pb-10">
            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Interview Preparation Guide
            </p>
            <div ref={interviewRef} contentEditable suppressContentEditableWarning
              className={`mt-4 space-y-4 ${editCls}`}
              dangerouslySetInnerHTML={{ __html: (resume.interviewPrep ?? []).map(qa =>
                `<p><strong>Q: ${qa.question}</strong></p><p>${qa.answer}</p>`).join('<br>') }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Full unlocked view ───────────────────────────────────────────────────────

function FullResume({ resume }) {
  const [mode,   setMode]   = useState('cards')
  const [copied, setCopied] = useState(false)
  const coverParas = (resume.coverLetter ?? '').split(/\n\n+/).filter(Boolean)

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPlainText(resume)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[['cards', 'Cards'], ['document', 'Document + Download']].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                ${mode === id ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              style={mode === id ? { color: OL } : {}}>
              {label}
            </button>
          ))}
        </div>
        {mode === 'cards' && (
          <button onClick={handleCopy}
            className={`ml-auto flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all active:scale-95
              ${copied ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-700 hover:border-[#2C3A2C] hover:text-[#2C3A2C]'}`}>
            {copied ? '✓ Copied!' : '⎘ Copy All'}
          </button>
        )}
      </div>

      {mode === 'cards' && (
        <div className="space-y-4">
          <SectionCard title="Professional Summary">
            <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
          </SectionCard>

          <SectionCard title="Core Skills">
            <div className="flex flex-wrap gap-2">
              {(resume.coreSkills ?? []).map((s, i) => (
                <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">{s}</span>
              ))}
            </div>
          </SectionCard>

          {(resume.experience ?? []).map((role, ri) => (
            <SectionCard key={ri} title="Professional Experience">
              <div className="mb-3">
                <p className="font-semibold text-slate-800">{role.title}</p>
                <p className="text-sm text-slate-500">{role.company}&nbsp;·&nbsp;{role.period}</p>
              </div>
              <ul className="space-y-2">
                {(role.bullets ?? []).map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: OL }} />
                    {b}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}

          <SectionCard title="Civilian Translation">
            <ul className="space-y-3">
              {(resume.civilianTranslation ?? []).map((line, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0">🔄</span>
                  {line}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Tailored Cover Letter">
            <div className="space-y-3">
              {coverParas.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-700">{para}</p>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Why You Are a Strong Fit">
            <ul className="space-y-3">
              {(resume.whyStrongFit ?? []).map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0">✅</span>
                  {b}
                </li>
              ))}
            </ul>
          </SectionCard>

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
      )}

      {mode === 'document' && <DocumentEditor resume={resume} />}
    </div>
  )
}

// ─── Preview section ──────────────────────────────────────────────────────────

function PreviewSection({ preview, resume, hasPaid, contextForCheckout, jobDescription }) {
  const ref = useRef(null)
  const [unlocking,   setUnlocking]   = useState(false)
  const [unlockError, setUnlockError] = useState('')

  useEffect(() => {
    const data = preview || resume
    if (data) {
      setUnlockError('')
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }, [preview, resume])

  const handleUnlock = async () => {
    setUnlocking(true)
    setUnlockError('')
    try {
      // Store inputs (not the resume) so /unlock can regenerate server-side
      // after Stripe confirms payment.
      localStorage.setItem('resumeai_experience', contextForCheckout)
      localStorage.setItem('resumeai_jobDescription', jobDescription)
      const { data } = await api.post('/create-checkout', {})
      window.location.href = data.url
    } catch (err) {
      setUnlockError(err?.response?.data?.error ?? 'Could not start checkout — please try again.')
      setUnlocking(false)
    }
  }

  if (!preview && !resume) return null

  return (
    <section ref={ref} id="preview-section" className="pb-16">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Resume Preview</h2>
          <p className="text-sm text-slate-500">
            {resume ? 'Full package — all 7 sections' : 'Free preview · Unlock the full package below'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasPaid ? (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Payment Verified ✓
            </span>
          ) : (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              AI Generated
            </span>
          )}
        </div>
      </div>

      {resume && <FullResume resume={resume} />}

      {!resume && (
        <>
          <SectionCard title="Professional Summary" badge="Visible">
            <p className="text-sm leading-relaxed text-slate-700">{preview?.summary}</p>
          </SectionCard>

          {/* Blurred teaser — real coreSkills data, static placeholders for paid sections */}
          <div className="relative mb-4 overflow-hidden rounded-2xl">
            <div className="pointer-events-none select-none space-y-4 blur-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Core Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(preview?.coreSkills ?? []).map((s, i) => (
                    <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Professional Experience</p>
                <ul className="space-y-2">
                  {[
                    'Led cross-functional teams to deliver mission-critical outcomes on time and within scope.',
                    'Streamlined operational processes, increasing team efficiency by over 20%.',
                    'Managed high-value asset portfolios with full accountability and zero discrepancies.',
                    'Trained and mentored junior team members on technical and leadership competencies.',
                  ].map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: OL }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why You Are a Strong Fit</p>
                <ul className="space-y-2">
                  {[
                    'Proven leadership experience directly addresses the need for strong team management.',
                    'Technical proficiency aligns with the required skills outlined in the job description.',
                    'Track record of results-driven performance matches the expected outcomes for this role.',
                  ].map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tailored Cover Letter</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">With extensive experience in operations and team leadership, I am confident in my ability to make an immediate impact in this role and contribute meaningfully from day one.</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">My background has equipped me with the technical skills and leadership capabilities needed to excel in this position and drive results across the organisation.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Interview Prep (3 answers)</p>
                <ul className="space-y-3">
                  {['Tell me about yourself.', 'Why are you a good fit for this role?', 'Describe a challenge you overcame.'].map((q, i) => (
                    <li key={i} className="text-sm font-medium text-slate-700">{q}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/10 via-slate-50/60 to-slate-50" />
          </div>

          {/* Unlock CTA */}
          <div className="overflow-hidden rounded-2xl border-2 bg-white shadow-lg" style={{ borderColor: OL }}>
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${OL}, #3d7a3d)` }} />
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed"
                style={{ backgroundColor: unlocking ? '#5a8f5a' : OL }}
              >
                {unlocking ? <><Spinner /> Redirecting to checkout…</> : 'Unlock Now →'}
              </button>
              {unlockError && <p className="mt-3 text-xs text-red-600">{unlockError}</p>}
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

// ─── Build screen ─────────────────────────────────────────────────────────────

function BuildScreen({
  onBack,
  buildPhase, setBuildPhase,
  experience, setExperience,
  education, setEducation, educationEnabled, setEducationEnabled,
  jobDescription, setJobDescription,
  suggestedJobs, jobsLoading, jobsError,
  isLoading, isUnlocking, apiError, preview, resume, hasPaid,
  contextForCheckout,
  onSubmit, onMoveToJobMatch,
}) {
  const [expError, setExpError] = useState('')
  const currentStep = buildPhase === 'preview' ? 3 : buildPhase === 'job-match' ? 2 : 1
  const [maxStep, setMaxStep] = useState(1)
  useEffect(() => { setMaxStep(prev => Math.max(prev, currentStep)) }, [currentStep])

  const handleContinue = () => {
    if (buildPhase === 'form') {
      if (!experience.trim()) {
        setExpError('Please tell us about your experience before continuing.')
        return
      }
      setExpError('')
      onMoveToJobMatch()
      return
    }
    if (buildPhase === 'job-match') {
      onSubmit()
      setBuildPhase('preview')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <BuildHeader onBack={onBack} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Let&apos;s build your resume</h1>
          <p className="mt-1 text-sm text-slate-500">
            Follow the steps below. You can save and come back anytime.
          </p>
        </div>

        <StepProgress
          currentStep={currentStep}
          maxStep={maxStep}
          onStepClick={n => {
            if (n === 1) setBuildPhase('form')
            if (n === 2) setBuildPhase('job-match')
            if (n === 3) setBuildPhase('preview')
          }}
        />

        {(buildPhase === 'form' || buildPhase === 'job-match') && (
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 xl:grid-cols-[1fr_380px]">
            {/* ── Left: form steps ── */}
            <div>
              {buildPhase === 'form' && (
                <>
                  <ExperienceCard
                    experience={experience}
                    setExperience={setExperience}
                    error={expError}
                  />
                  <EducationCard
                    education={education}
                    setEducation={setEducation}
                    enabled={educationEnabled}
                    setEnabled={setEducationEnabled}
                  />
                  <ExtrasCard
                    onExtracted={text => setExperience(prev => {
                      const base = prev.trim()
                      return base ? `${base}\n\n${text}` : text
                    })}
                  />
                </>
              )}

              {buildPhase === 'job-match' && (
                <JobMatchCard
                  jobs={suggestedJobs}
                  isLoading={jobsLoading}
                  error={jobsError}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                />
              )}

              <button
                onClick={handleContinue}
                disabled={buildPhase === 'job-match' && jobsLoading}
                style={{ backgroundColor: OL }}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-base font-black uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buildPhase === 'form'
                  ? <>Find My Job Matches <span className="text-xl">→</span></>
                  : jobsLoading
                  ? <><Spinner /> Analyzing your background…</>
                  : <>Generate My Resume <span className="text-xl">→</span></>}
              </button>
              <p className="mb-8 mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-400">
                <LockIcon size={13} />
                Preview is free — unlock the full resume for $2.99
              </p>
            </div>

            {/* ── Right: sticky summary sidebar (desktop only) ── */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                {/* What you'll get */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                    What you&apos;ll get
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { icon: <FileTextIcon size={18} />,       color: '#2C3A2C', label: 'ATS-Optimized Resume',      desc: 'Professional format that passes screening software' },
                      { icon: <MailIcon size={18} />,           color: '#2C3A2C', label: 'Tailored Cover Letter',     desc: '4 paragraphs matched to the job description' },
                      { icon: <TargetIcon size={18} />,         color: '#9B2020', label: "Why You're a Strong Fit",   desc: '3 reasons backed by your experience' },
                      { icon: <MicIcon size={18} />,            color: '#1A3A5C', label: 'Interview Prep',            desc: 'STAR-method answers to common questions' },
                      { icon: <ArrowsExchangeIcon size={18} />, color: '#1A3A5C', label: 'Military Translation',      desc: 'Civilian-friendly language throughout' },
                    ].map(({ icon, color, label, desc }) => (
                      <li key={label} className="flex gap-3">
                        <span className="mt-0.5 flex-shrink-0" style={{ color }}>{icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{label}</p>
                          <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price card */}
                <div className="rounded-2xl border-2 bg-white p-6 text-center shadow-sm" style={{ borderColor: OL }}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Full package</p>
                  <div className="my-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-slate-900">$2.99</span>
                    <span className="text-sm text-slate-400">one-time</span>
                  </div>
                  <p className="text-xs text-slate-400">Preview free · No subscription</p>
                </div>

                {/* Testimonial */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm italic leading-relaxed text-slate-600">
                    &ldquo;I went from zero interviews to three callbacks in two weeks.&rdquo;
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">— Marcus J., U.S. Army Veteran</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {buildPhase === 'preview' && (
          <div className="mx-auto max-w-3xl">
            {(isLoading || isUnlocking) && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <Spinner />
                </div>
                <p className="text-base font-semibold text-slate-700">
                  {isUnlocking ? 'Generating your full package…' : 'Building your preview…'}
                </p>
                <p className="mt-1 text-sm text-slate-400">This takes about 10–15 seconds</p>
              </div>
            )}
            {apiError && !isLoading && !isUnlocking && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                <span className="font-semibold">Error: </span>{apiError}
                {!hasPaid && (
                  <button
                    onClick={() => setBuildPhase('job-match')}
                    className="ml-2 underline hover:text-red-900"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
            {(preview || resume) && !isLoading && !isUnlocking && (
              <PreviewSection
                preview={preview}
                resume={resume}
                hasPaid={hasPaid}
                contextForCheckout={contextForCheckout}
                jobDescription={jobDescription}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function Home() {
  const [screen,            setScreen]            = useState('landing')
  const [buildPhase,        setBuildPhase]        = useState('form')
  const [experience,        setExperience]        = useState('')
  const [education,         setEducation]         = useState([{ school: '', level: '', years: '' }])
  const [educationEnabled,  setEducationEnabled]  = useState(false)
  const [jobDescription,    setJobDescription]    = useState('')
  const [isLoading,         setIsLoading]         = useState(false)
  const [isUnlocking,       setIsUnlocking]       = useState(false)
  const [preview,           setPreview]           = useState(null)
  const [resume,            setResume]            = useState(null)
  const [apiError,          setApiError]          = useState('')
  const [hasPaid,           setHasPaid]           = useState(false)
  const [suggestedJobs,     setSuggestedJobs]     = useState([])
  const [jobsLoading,       setJobsLoading]       = useState(false)
  const [jobsError,         setJobsError]         = useState('')

  // After Stripe redirect: verify payment server-side then generate the full resume.
  // The session_id is passed by Success.jsx; experience + jobDescription were saved
  // to localStorage before the user was sent to Stripe checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return
    window.history.replaceState({}, '', '/')
    const savedExperience      = localStorage.getItem('resumeai_experience')
    const savedJobDescription  = localStorage.getItem('resumeai_jobDescription')
    if (!savedExperience || !savedJobDescription) return
    setIsUnlocking(true)
    setScreen('build')
    setBuildPhase('preview')
    api.post('/unlock', {
      session_id:     sessionId,
      experience:     savedExperience,
      jobDescription: savedJobDescription,
    })
      .then(({ data }) => {
        setResume(data.resume)
        setPreview({ summary: data.resume.summary, coreSkills: data.resume.coreSkills })
        setHasPaid(true)
        localStorage.removeItem('resumeai_experience')
        localStorage.removeItem('resumeai_jobDescription')
      })
      .catch(() => setApiError('Payment verified but generation failed — please contact support at csharpworks26@gmail.com.'))
      .finally(() => setIsUnlocking(false))
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    setPreview(null)
    setResume(null)
    setApiError('')
    try {
      const { data } = await api.post('/generate', {
        experience:     buildContext(experience, education, educationEnabled),
        jobDescription: jobDescription.trim(),
      })
      setPreview(data.preview)
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        (err?.code === 'ECONNABORTED' ? 'Request timed out — please try again.' : 'Something went wrong. Please try again.')
      setApiError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoveToJobMatch = async () => {
    setBuildPhase('job-match')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setJobsLoading(true)
    setJobsError('')
    setSuggestedJobs([])
    setJobDescription('')
    try {
      const { data } = await api.post('/suggest-jobs', { experience: buildContext(experience, education, educationEnabled) })
      setSuggestedJobs(data.jobs ?? [])
    } catch {
      setJobsError('Could not load suggestions — you can still type your own job title below.')
    } finally {
      setJobsLoading(false)
    }
  }

  const handleStart = () => {
    setScreen('build')
    setBuildPhase('form')
    setResume(null)
    setApiError('')
    setSuggestedJobs([])
    setJobsError('')
    setEducation([{ school: '', level: '', years: '' }])
    setEducationEnabled(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (screen === 'landing') {
    return <LandingScreen onStart={handleStart} />
  }

  return (
    <BuildScreen
      onBack={() => setScreen('landing')}
      buildPhase={buildPhase}
      setBuildPhase={setBuildPhase}
      experience={experience}
      setExperience={setExperience}
      education={education}
      setEducation={setEducation}
      educationEnabled={educationEnabled}
      setEducationEnabled={setEducationEnabled}
      jobDescription={jobDescription}
      setJobDescription={setJobDescription}
      suggestedJobs={suggestedJobs}
      jobsLoading={jobsLoading}
      jobsError={jobsError}
      isLoading={isLoading}
      isUnlocking={isUnlocking}
      apiError={apiError}
      preview={preview}
      resume={resume}
      hasPaid={hasPaid}
      contextForCheckout={buildContext(experience, education, educationEnabled)}
      onSubmit={handleSubmit}
      onMoveToJobMatch={handleMoveToJobMatch}
    />
  )
}

export default Home
