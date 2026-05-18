import Stripe from 'stripe'

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

  const sessionId = event.queryStringParameters?.session_id
  if (!sessionId) return respond(400, { error: 'session_id is required' }, origin)

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return respond(500, { error: 'Payment service not configured' }, origin)

  const stripe = new Stripe(stripeKey)

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('Stripe error in /verify-payment:', err?.message ?? String(err))
    return respond(500, { error: 'Payment verification failed — please contact support.' }, origin)
  }

  return respond(200, { paid: session.payment_status === 'paid' }, origin)
}
