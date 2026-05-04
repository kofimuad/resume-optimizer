// Netlify Function: /.netlify/functions/generate
// Day 3–4 (Tasks 7–8): wire this up to OpenAI gpt-4o with the master prompt.
// For now, returns a clear "not implemented" response so the frontend can hit a real endpoint.

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // TODO (Day 3–4):
  //   1. Parse { experience, jobDescription } from event.body
  //   2. Call OpenAI Chat Completions (model: gpt-4o) with master prompt
  //   3. Return structured JSON: { summary, coreSkills, experience, civilianTranslation,
  //      coverLetter, whyStrongFit, interviewPrep }

  return {
    statusCode: 501,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Not implemented yet — wire up on Day 3–4.',
    }),
  }
}
