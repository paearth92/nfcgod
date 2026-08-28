/**
 * Server-only Stripe client.
 * NEVER import this in client components.
 */

import Stripe from 'stripe';
import { getStripeSecretKey, getStripeWebhookSecretEnv } from '@/lib/env.server';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripeInstance;
}

export function getStripeWebhookSecret(): string {
  return getStripeWebhookSecretEnv();
}
