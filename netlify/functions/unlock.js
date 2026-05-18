import OpenAI from 'openai'
import Stripe from 'stripe'
import { getStore } from '@netlify/blobs'

const ALLOWED_ORIGINS = [
  process.env.URL,
  'http://localhost:8888',
  'http://localhost:5173',
].filter(Boolean)

function getCorsHeaders(origin = '') {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? '')
  return {
    'Access-Control-Allow-Origin': allowed || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}

function respond(statusCode, body, origin) {
  return { statusCode, headers: getCorsHeaders(origin), body: JSON.stringify(body) }
}

// ─── Prompts (full 7-section generation — only reached after Stripe confirms payment) ─

const SYSTEM_PROMPT = `You are ResumeAI, an expert resume writer with 15+ years of experience \
turning military service records and entry-level backgrounds into compelling, \
ATS-optimised civilian resumes. You specialise in three profiles:
• Veterans who have never written a civilian resume
• Career beginners with minimal formal work history
• Anyone who describes their background in only a few words

━━━ MILITARY → CIVILIAN TRANSLATION REFERENCE ━━━
Mission            → Project / Initiative / Operation
Deployed           → Mobilised / Worked on-site / Assigned to
Squad / Platoon    → Team / Department / Unit
MOS / Rate         → Role / Function / Specialisation
Sergeant           → Operations Supervisor / Team Leader
Staff Sergeant     → Senior Operations Supervisor / Section Manager
Commander          → Director / Senior Manager
SITREP / AAR       → Status Report / After-Action Review
ROE / SOP          → Standard Operating Procedures / Policy Guidelines
S1 Personnel       → Human Resources / People Operations
S2 Intel           → Research & Analysis / Business Intelligence
S3 Operations      → Operations Management / Project Coordination
S4 Logistics       → Supply Chain / Inventory Management / Procurement
Combat environment → High-pressure / Mission-critical / Fast-paced environment
Chain of command   → Organisational hierarchy / Reporting structure
PT / Fitness       → Health & Wellness / Physical Training Programme

━━━ STRONG ACTION VERBS (start every bullet with one) ━━━
Leadership:   Led, Directed, Supervised, Managed, Oversaw, Commanded, Spearheaded
Operations:   Coordinated, Executed, Implemented, Streamlined, Optimised, Deployed
Development:  Developed, Designed, Built, Established, Launched, Created, Introduced
Training:     Trained, Mentored, Coached, Onboarded, Instructed, Facilitated
Results:      Achieved, Delivered, Reduced, Increased, Improved, Drove, Generated
Admin:        Administered, Maintained, Tracked, Reported, Documented, Ensured

━━━ NON-NEGOTIABLE RULES ━━━
1. EXPAND minimal input — "Army logistics 4 years" must produce a full, polished resume. \
   Infer plausible role details from context; never leave a field sparse.
2. TRANSLATE everything — never use military ranks, unit designations, or MOS codes in output.
3. ACTION VERBS — every bullet point must start with a past-tense action verb from the list above.
4. METRICS — at least 60 % of bullets must contain a measurable outcome. \
   If the user gave no numbers, invent credible ones: \
   team sizes (8–15 people), asset values ($500K–$5M), efficiency gains (15–30 %), timeframes.
5. ATS KEYWORDS — extract the most important keywords from the job description \
   and embed them naturally in the summary, core skills, and experience bullets.
6. COVER LETTER structure: \
   Para 1 — Strong opening hook + specific role interest. \
   Para 2 — Top 2–3 relevant skills with evidence. \
   Para 3 — Motivation / cultural alignment. \
   Para 4 — Confident call to action.
7. INTERVIEW ANSWERS — use STAR method (Situation → Task → Action → Result) for the \
   challenge question; use Present–Past–Future for "Tell me about yourself".
8. ALL 7 SECTIONS are mandatory — never omit or merge any section.
9. OUTPUT FORMAT — return raw JSON only. \
   Zero markdown, zero code fences, zero text before or after the JSON object.`

function buildUserPrompt(experience, jobDescription) {
  return `Generate a complete resume package for the applicant below.

━━━ APPLICANT EXPERIENCE ━━━
${experience}

━━━ TARGET JOB DESCRIPTION ━━━
${jobDescription}

━━━ REQUIRED OUTPUT ━━━
Return one JSON object with EXACTLY these 7 keys:

{
  "summary": string,
  // 3–4 sentences. Sentence 1: strong descriptor + total years of experience + domain.
  // Sentence 2–3: 2 core competencies with evidence. Sentence 4: value to THIS employer.

  "coreSkills": string[],
  // 8–12 items. Mix: hard skills pulled from job description + leadership/soft skills.
  // Format each as a noun phrase, e.g. "Inventory Management & Stock Control".

  "experience": [
    {
      "title": string,   // civilian job title — no ranks, no MOS
      "company": string, // organisation / branch name, civilian-friendly
      "period": string,  // "YYYY – YYYY"
      "bullets": string[] // 4–6 bullets. Every bullet: action verb + task + measurable result.
    }
  ],
  // 1–2 roles. If applicant only mentioned one role, produce one. Never fabricate a second unrelated role.

  "civilianTranslation": string[],
  // EXACTLY 3–5 items. Each item format:
  // "Military [concept] → [Civilian equivalent]: [one-sentence business value statement]."

  "coverLetter": string,
  // Full letter, 3–4 paragraphs separated by \\n\\n. No "Dear Hiring Manager" salutation needed.
  // Must reference the specific job title and at least 2 requirements from the job description.

  "whyStrongFit": string[],
  // EXACTLY 3 items. Each must reference a specific requirement from the job description.
  // Format: "[Skill/experience] directly addresses your need for [requirement from JD]."

  "interviewPrep": [
    { "question": "Tell me about yourself.",              "answer": string },
    { "question": "Why are you a good fit for this role?","answer": string },
    { "question": "Describe a challenge you overcame.",   "answer": string }
  ]
  // answers: 3–5 sentences each. Challenge answer must use STAR and end with a measurable result.
}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handler(event) {
  const origin = event.headers.origin || ''

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: getCorsHeaders(origin), body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, origin)
  }

  let session_id, experience, jobDescription
  try {
    ;({ session_id, experience, jobDescription } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' }, origin)
  }

  if (!session_id || !experience?.trim() || !jobDescription?.trim()) {
    return respond(400, { error: 'session_id, experience, and jobDescription are required' }, origin)
  }

  // ── Verify payment ────────────────────────────────────────────────────────────
  // Fast path: check Netlify Blobs for a record written by the Stripe webhook.
  // This handles the case where the browser closed before the redirect completed
  // but Stripe still delivered the webhook and we recorded the payment.
  // Slow path: fall back to a live Stripe API call (always reliable).

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return respond(500, { error: 'Payment service not configured' }, origin)

  let isPaid = false

  try {
    const store = getStore('paid-sessions')
    const cached = await store.get(session_id)
    if (cached) {
      const record = JSON.parse(cached)
      isPaid = record.paid === true
    }
  } catch (blobErr) {
    // Blobs unavailable (e.g. local dev without netlify dev context) — fall through
    console.warn('unlock: Blobs check skipped:', blobErr?.message)
  }

  if (!isPaid) {
    // Blobs had no record yet — verify directly with Stripe and cache the result
    const stripe = new Stripe(stripeKey)
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      isPaid = session.payment_status === 'paid'
      if (isPaid) {
        // Write to Blobs so future calls (e.g. page refresh) hit the fast path
        try {
          const store = getStore('paid-sessions')
          await store.set(session_id, JSON.stringify({
            paid: true,
            amount: session.amount_total,
            currency: session.currency,
            recordedAt: Date.now(),
          }))
        } catch {
          // Non-fatal — Stripe verification already confirmed payment
        }
      }
    } catch (err) {
      console.error('Stripe error in /unlock:', err?.message ?? String(err))
      return respond(402, { error: 'Payment verification failed — please contact support.' }, origin)
    }
  }

  if (!isPaid) {
    return respond(402, { error: 'Payment not confirmed. Please complete checkout before unlocking.' }, origin)
  }

  // ── Generate full 7-section resume ──────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return respond(500, { error: 'Service is not configured' }, origin)

  const openai = new OpenAI({ apiKey })

  let raw
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(experience.trim(), jobDescription.trim()) },
      ],
    })
    raw = completion.choices[0].message.content
  } catch (err) {
    console.error('OpenAI error in /unlock:', err?.message ?? String(err))
    return respond(500, { error: 'Generation failed — please contact support.' }, origin)
  }

  let resume
  try {
    resume = JSON.parse(raw)
  } catch {
    return respond(500, { error: 'Generation failed — please contact support.' }, origin)
  }

  const REQUIRED = [
    'summary', 'coreSkills', 'experience',
    'civilianTranslation', 'coverLetter', 'whyStrongFit', 'interviewPrep',
  ]
  const missing = REQUIRED.filter(k => !(k in resume))
  if (missing.length) {
    console.error('/unlock: response missing sections:', missing.join(', '))
    return respond(500, { error: 'Generation failed — please contact support.' }, origin)
  }

  return respond(200, { resume }, origin)
}
