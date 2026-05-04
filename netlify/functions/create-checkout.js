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
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return respond(500, { error: 'Stripe is not configured' })

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
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
    })
  } catch (err) {
    return respond(500, { error: `Stripe error: ${err.message}` })
  }

  return respond(200, { url: session.url })
}
