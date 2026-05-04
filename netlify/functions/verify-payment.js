import Stripe from 'stripe'

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

  const sessionId = event.queryStringParameters?.session_id
  if (!sessionId) return respond(400, { error: 'session_id is required' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return respond(500, { error: 'Stripe is not configured' })

  const stripe = new Stripe(stripeKey)

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    return respond(500, { error: `Stripe error: ${err.message}` })
  }

  return respond(200, { paid: session.payment_status === 'paid' })
}
