import OpenAI from 'openai'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function respond(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let experience
  try {
    ;({ experience } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' })
  }

  if (!experience?.trim()) return respond(400, { error: 'experience is required' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return respond(500, { error: 'OPENAI_API_KEY is not configured' })

  const openai = new OpenAI({ apiKey })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `You are a career counselor specializing in military-to-civilian transitions.
Analyze the military experience and return EXACTLY 4 realistic civilian job matches.
Return only valid JSON matching this shape exactly:
{
  "jobs": [
    {
      "title": "Civilian job title (3–5 words max)",
      "matchReason": "One sentence explaining why this person qualifies, referencing their specific background.",
      "description": "A 150-200 word job description written as a real job posting. Include key responsibilities and requirements that match their background. Write in second person ('You will…'). End with a note on why military experience is valued."
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Military background:\n\n${experience.trim()}\n\nSuggest 4 civilian jobs this person is well-qualified for.`,
        },
      ],
    })

    let parsed
    try {
      parsed = JSON.parse(completion.choices[0].message.content)
    } catch {
      return respond(500, { error: 'AI returned malformed JSON' })
    }

    if (!Array.isArray(parsed.jobs) || parsed.jobs.length === 0) {
      return respond(500, { error: 'AI returned no job suggestions' })
    }

    return respond(200, { jobs: parsed.jobs.slice(0, 4) })
  } catch (err) {
    const msg = err?.message ?? String(err)
    return respond(500, { error: `Job suggestion failed: ${msg}` })
  }
}
