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

  let imageBase64, mimeType
  try {
    ;({ imageBase64, mimeType } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'Invalid JSON body' })
  }

  if (!imageBase64 || !mimeType) {
    return respond(400, { error: 'imageBase64 and mimeType are required' })
  }

  const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!SUPPORTED.includes(mimeType)) {
    return respond(400, {
      error: `Unsupported file type "${mimeType}". Please upload a JPG, PNG, or WEBP image.`,
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return respond(500, { error: 'OPENAI_API_KEY is not configured' })

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
    if (!text) return respond(500, { error: 'No text could be extracted from this image.' })

    return respond(200, { text })
  } catch (err) {
    const msg = err?.message ?? String(err)
    return respond(500, { error: `Text extraction failed: ${msg}` })
  }
}
