/**
 * Matrix Advanced Solutions — Stripe Server Utilities
 *
 * Server-side Stripe client. Never import this on the client.
 * Lazy-initialized to avoid build-time errors when env vars aren't set.
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}
