/**
 * Matrix Advanced Solutions — Stripe Client Utilities
 *
 * Browser-side Stripe.js singleton. Safe to import in client components.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'

let _stripePromise: Promise<Stripe | null> | null = null

export function getStripeClient(): Promise<Stripe | null> {
  if (!_stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error(
        '[STRIPE_CLIENT] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set'
      )
      return Promise.resolve(null)
    }
    _stripePromise = loadStripe(key)
  }
  return _stripePromise
}
