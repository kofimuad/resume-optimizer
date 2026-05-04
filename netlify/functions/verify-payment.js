// Netlify Function: /.netlify/functions/verify-payment
// Day 5 (Task 12): verify Stripe Checkout session by session_id, return { paid: boolean }.

export async function handler(event) {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // TODO (Day 5):
  //   1. Read session_id from event.queryStringParameters or event.body
  //   2. stripe.checkout.sessions.retrieve(sessionId)
  //   3. Return { paid: session.payment_status === 'paid' }

  return {
    statusCode: 501,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Not implemented yet — wire up on Day 5.',
    }),
  }
}
