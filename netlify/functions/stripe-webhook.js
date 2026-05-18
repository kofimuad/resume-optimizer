import Stripe from 'stripe'
import { getStore } from '@netlify/blobs'

// ─── Stripe Webhook Handler ────────────────────────────────────────────────────
//
// Stripe POSTs here on every payment event (checkout.session.completed, etc.).
// We verify the signature, then write confirmed session IDs to Netlify Blobs.
//
// Setup steps:
//   1. In the Stripe dashboard → Developers → Webhooks → Add endpoint
//      URL: https://<your-site>.netlify.app/.netlify/functions/stripe-webhook
//      Events to listen for: checkout.session.completed
//   2. Copy the "Signing secret" Stripe shows you.
//   3. Add it to Netlify env vars as STRIPE_WEBHOOK_SECRET.
//
// Local testing with Stripe CLI:
//   stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
//   (prints a whsec_... secret to paste into a local .env)

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.error('stripe-webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return { statusCode: 500, body: 'Webhook not configured' }
  }

  // Netlify sometimes base64-encodes the raw body; decode it before passing to
  // Stripe's signature verifier which needs the exact original bytes.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body

  const sig = event.headers['stripe-signature']
  const stripe = new Stripe(stripeKey)

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    // Invalid signature — reject silently to avoid leaking info
    console.error('stripe-webhook: signature verification failed:', err.message)
    return { statusCode: 400, body: 'Bad signature' }
  }

  // ── Handle confirmed payments ────────────────────────────────────────────────
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object

    if (session.payment_status === 'paid') {
      try {
        const store = getStore('paid-sessions')
        // Value is a small JSON blob; Blobs has no cost-per-byte concern at this scale.
        await store.set(session.id, JSON.stringify({
          paid:      true,
          amount:    session.amount_total,
          currency:  session.currency,
          recordedAt: Date.now(),
        }))
        console.log('stripe-webhook: recorded paid session', session.id)
      } catch (err) {
        // Log but still return 200 — Stripe retries on non-2xx, so a Blobs hiccup
        // should not cause duplicate webhook deliveries.
        console.error('stripe-webhook: failed to write to Blobs:', err.message)
      }
    }
  }

  // Always acknowledge receipt so Stripe doesn't retry
  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
