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
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' }, origin)

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return respond(500, { error: 'Payment service not configured' }, origin)

  const stripe = new Stripe(stripeKey)

  // process.env.URL is set automatically by Netlify in production
  const siteUrl = process.env.URL || 'http://localhost:8888'

  let session
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ResumeAI — Full Package',
              description: 'Complete resume · Tailored cover letter · Interview prep answers',
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
    })
  } catch (err) {
    console.error('Stripe error in /create-checkout:', err?.message ?? String(err))
    return respond(500, { error: 'Could not create checkout session — please try again.' }, origin)
  }

  return respond(200, { url: session.url }, origin)
}
