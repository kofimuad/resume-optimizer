// Netlify Function: /.netlify/functions/create-checkout
// Day 5 (Task 11): create Stripe Checkout session for $2.99, return checkout URL.

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // TODO (Day 5):
  //   1. import Stripe from 'stripe' and init with process.env.STRIPE_SECRET_KEY
  //   2. Create Checkout Session: mode='payment', $2.99 line item
  //   3. success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`
  //   4. cancel_url: `${siteUrl}/`
  //   5. Return { url: session.url }

  return {
    statusCode: 501,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Not implemented yet — wire up on Day 5.',
    }),
  }
}
