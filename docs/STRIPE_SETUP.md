# Stripe Setup Guide — NFCPlate Commerce

This guide covers setting up Stripe in test mode for the NFCPlate Phase 6 commerce system.

## 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account if you haven't already.
2. Switch to **Test Mode** using the toggle in the top right of the Stripe Dashboard.

## 2. Get Your API Keys

1. In the Stripe Dashboard, go to **Developers** > **API Keys**.
2. Copy the **Secret key** (starts with `sk_test_`).
3. Add it to your environment variables as `STRIPE_SECRET_KEY`.

## 3. Set Up the Webhook Endpoint

1. In the Stripe Dashboard, go to **Developers** > **Webhooks**.
2. Click **Add endpoint**.
3. Set the endpoint URL to:
   ```
   https://nfcplate.com/api/stripe/webhook
   ```
   For local development, use the Stripe CLI (see below).
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. After creating the endpoint, copy the **Signing secret** (starts with `whsec_`).
6. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`.

## 4. Environment Variables

Add these to your `.env` file (never commit this file):

```
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_SITE_URL=https://nfcplate.com
```

For Netlify deployment, add these in **Site settings** > **Environment variables**.

## 5. Local Testing with Stripe CLI

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Start forwarding webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. The CLI will print a webhook signing secret. Use that as your `STRIPE_WEBHOOK_SECRET` for local testing.
4. In a separate terminal, trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## 6. Test Card Numbers

Use these test card numbers in Stripe Checkout (test mode):

| Card Number | Description |
|---|---|
| `4242 4242 4242 4242` | Successful payment (Visa) |
| `4000 0025 0000 3155` | Requires 3DS authentication |
| `4000 0000 0000 9995` | Insufficient funds (declined) |

Use any future expiry date and any CVC.

## 7. Test Checkout Flow

1. Add products to your cart on the storefront.
2. Go to `/checkout` and click **Continue to secure payment**.
3. You'll be redirected to Stripe Checkout.
4. Enter a test card number and complete the purchase.
5. You should be redirected to `/checkout/success` with your order confirmation.
6. The order will appear in the admin portal at `/admin/orders`.

## 8. Webhook Events Handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Creates order with line items from verified checkout reference |
| `checkout.session.async_payment_succeeded` | Updates order payment status to paid |
| `checkout.session.async_payment_failed` | Updates order payment status to failed |
| `checkout.session.expired` | Updates order payment status to failed |
| `payment_intent.payment_failed` | Updates order payment status to failed |
| `charge.refunded` | Updates order payment status to refunded or partially_refunded |

All webhook events are stored in the `stripe_events` table for idempotency. Repeated deliveries of the same event ID are skipped.
