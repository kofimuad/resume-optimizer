import OpenAI from 'openai'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function respond(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

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
  // Example: "Military logistics coordination → Supply chain management: ensured operational continuity
  //           by maintaining 100 % inventory accuracy across a $2M asset portfolio."

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
  // CORS pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let experience, jobDescription
  try {
    ;({ experience, jobDescription } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' })
  }

  if (!experience?.trim() || !jobDescription?.trim()) {
    return respond(400, { error: 'Both experience and jobDescription are required' })
  }

  // ── OpenAI call ─────────────────────────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return respond(500, { error: 'OPENAI_API_KEY is not configured' })
  }

  const openai = new OpenAI({ apiKey })

  let raw
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.6,   // lower = more consistent section coverage
      max_tokens: 4000,   // enough for all 7 sections in full
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(experience.trim(), jobDescription.trim()) },
      ],
    })

    raw = completion.choices[0].message.content
  } catch (err) {
    const msg = err?.message ?? String(err)
    const status = msg.includes('401') ? 401
      : msg.includes('429') ? 429
      : 500
    return respond(status, {
      error: status === 401 ? 'Invalid OpenAI API key'
        : status === 429 ? 'OpenAI rate limit or billing limit reached — check your usage dashboard'
        : `OpenAI request failed: ${msg}`,
    })
  }

  // ── Validate shape ───────────────────────────────────────────────────────────
  let resume
  try {
    resume = JSON.parse(raw)
  } catch {
    return respond(500, { error: 'OpenAI returned malformed JSON', raw })
  }

  const REQUIRED = [
    'summary', 'coreSkills', 'experience',
    'civilianTranslation', 'coverLetter', 'whyStrongFit', 'interviewPrep',
  ]
  const missing = REQUIRED.filter(k => !(k in resume))
  if (missing.length) {
    return respond(500, {
      error: `Response missing sections: ${missing.join(', ')}`,
      resume,
    })
  }

  return respond(200, { resume })
}
