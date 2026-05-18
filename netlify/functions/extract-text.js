import OpenAI from 'openai'

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

export async function handler(event) {
  const origin = event.headers.origin || ''

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: getCorsHeaders(origin), body: '' }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' }, origin)

  let imageBase64, mimeType
  try {
    ;({ imageBase64, mimeType } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' }, origin)
  }

  if (!imageBase64 || !mimeType) {
    return respond(400, { error: 'imageBase64 and mimeType are required' }, origin)
  }

  // ~5 MB base64 ≈ 3.75 MB decoded — reject oversized uploads before hitting OpenAI
  if (imageBase64.length > 5_000_000) {
    return respond(413, { error: 'Image too large. Please upload a smaller file (under ~3.75 MB).' }, origin)
  }

  const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!SUPPORTED.includes(mimeType)) {
    return respond(400, {
      error: `Unsupported file type "${mimeType}". Please upload a JPG, PNG, or WEBP image.`,
    }, origin)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return respond(500, { error: 'Service is not configured' }, origin)

  const openai = new OpenAI({ apiKey })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: 'Extract all readable text from this document image. Return only the raw text, preserving the original structure as much as possible. No commentary, no formatting labels — just the text content.',
            },
          ],
        },
      ],
    })

    const text = completion.choices[0].message.content?.trim()
    if (!text) return respond(500, { error: 'No text could be extracted from this image.' }, origin)

    return respond(200, { text }, origin)
  } catch (err) {
    console.error('OpenAI error in /extract-text:', err?.message ?? String(err))
    return respond(500, { error: 'Text extraction failed — please try again.' }, origin)
  }
}
