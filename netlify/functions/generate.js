import OpenAI from 'openai'

// Allow only known origins; process.env.URL is set automatically by Netlify in production.
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

// ─── Preview prompt ────────────────────────────────────────────────────────────
// Returns only summary + coreSkills so the full resume is never sent to the
// browser before payment is confirmed. The complete 7-section generation is
// handled by the /unlock function after Stripe payment is verified.

const SYSTEM_PROMPT = `You are ResumeAI, an expert resume writer with 15+ years of experience \
turning military service records and entry-level backgrounds into compelling, \
ATS-optimised civilian resumes. You specialise in three profiles:
• Veterans who have never written a civilian resume
• Career beginners with minimal formal work history
• Anyone who describes their background in only a few words

━━━ NON-NEGOTIABLE RULES ━━━
1. EXPAND minimal input — infer plausible role details from context; never leave a field sparse.
2. TRANSLATE everything — never use military ranks, unit designations, or MOS codes in output.
3. ATS KEYWORDS — extract the most important keywords from the job description \
   and embed them naturally in the summary and core skills.
4. OUTPUT FORMAT — return raw JSON only. \
   Zero markdown, zero code fences, zero text before or after the JSON object.`

function buildPreviewPrompt(experience, jobDescription) {
  return `Generate a professional summary and core skills list for the applicant below.

━━━ APPLICANT EXPERIENCE ━━━
${experience}

━━━ TARGET JOB DESCRIPTION ━━━
${jobDescription}

Return raw JSON only with exactly 2 keys:
{
  "summary": "3-4 sentence professional summary. Sentence 1: strong descriptor + total years of experience + domain. Sentences 2-3: 2 core competencies with evidence. Sentence 4: value to THIS employer.",
  "coreSkills": ["8-12 items — mix hard skills pulled from the job description with leadership/soft skills. Format each as a noun phrase."]
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

  let experience, jobDescription
  try {
    ;({ experience, jobDescription } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' }, origin)
  }

  if (!experience?.trim() || !jobDescription?.trim()) {
    return respond(400, { error: 'Both experience and jobDescription are required' }, origin)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return respond(500, { error: 'Service is not configured' }, origin)
  }

  const openai = new OpenAI({ apiKey })

  let raw
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 800,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildPreviewPrompt(experience.trim(), jobDescription.trim()) },
      ],
    })
    raw = completion.choices[0].message.content
  } catch (err) {
    const msg = err?.message ?? String(err)
    console.error('OpenAI error in /generate:', msg)
    const status = msg.includes('401') ? 401 : msg.includes('429') ? 429 : 500
    return respond(status, {
      error: status === 401 ? 'Service authentication failed'
        : status === 429 ? 'Service rate limit reached — please try again later'
        : 'Generation failed — please try again',
    }, origin)
  }

  let preview
  try {
    preview = JSON.parse(raw)
  } catch {
    return respond(500, { error: 'Generation failed — please try again' }, origin)
  }

  if (!preview.summary || !Array.isArray(preview.coreSkills)) {
    return respond(500, { error: 'Generation failed — please try again' }, origin)
  }

  return respond(200, { preview }, origin)
}
