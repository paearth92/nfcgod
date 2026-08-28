import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe-server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  createOrderFromCheckoutIntent,
  updateOrderPaymentStatus,
} from '@/lib/order-actions';

type AnySupabase = any;

export const runtime = 'nodejs';

async function markEvent(
  admin: AnySupabase,
  eventId: string,
  eventType: string,
  status: string,
  orderId?: string,
  errorMessage?: string
): Promise<void> {
  await admin.from('stripe_events').upsert({
    id: eventId,
    event_type: eventType,
    status,
    order_id: orderId ?? null,
    error_message: errorMessage ?? null,
    processed_at: new Date().toISOString(),
  }, { onConflict: 'id' });
}

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const webhookSecret = getStripeWebhookSecret();
  const stripe = getStripe();

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient() as unknown as AnySupabase;

  // Idempotency: check if we've already processed this event
  const { data: existingEvent } = await admin
    .from('stripe_events')
    .select('id, status, order_id')
    .eq('id', event.id)
    .maybeSingle();

  if (existingEvent && (existingEvent as { status: string }).status === 'processed') {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record the event as processing
  await markEvent(admin, event.id, event.type, 'processing');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const intentId = session.metadata?.checkout_intent_id;
        if (!intentId) {
          await markEvent(admin, event.id, event.type, 'failed', undefined, 'Missing checkout_intent_id in metadata');
          return NextResponse.json({ error: 'Missing checkout intent reference' }, { status: 400 });
        }

        // Check if order already exists for this session (idempotency)
        const { data: existingOrder } = await admin
          .from('orders')
          .select('id, order_number')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle();

        let orderId: string;
        if (existingOrder) {
          orderId = (existingOrder as { id: string }).id;
          if (session.payment_status === 'paid') {
            await updateOrderPaymentStatus(orderId, 'paid');
          }
        } else {
          const result = await createOrderFromCheckoutIntent(session, intentId);
          if ('error' in result) {
            await markEvent(admin, event.id, event.type, 'failed', undefined, result.error);
            return NextResponse.json({ error: result.error }, { status: 500 });
          }
          orderId = result.orderId;
        }

        await markEvent(admin, event.id, event.type, 'processed', orderId);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { data: order } = await admin
          .from('orders')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle();

        if (order) {
          await updateOrderPaymentStatus((order as { id: string }).id, 'paid');
          await markEvent(admin, event.id, event.type, 'processed', (order as { id: string }).id);
        } else {
          await markEvent(admin, event.id, event.type, 'skipped', undefined, 'No order for session');
        }
        break;
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Mark the checkout intent as expired/failed
        const intentId = session.metadata?.checkout_intent_id;
        if (intentId) {
          await admin
            .from('checkout_intents')
            .update({
              status: event.type === 'checkout.session.expired' ? 'expired' : 'failed',
              processed_at: new Date().toISOString(),
            })
            .eq('id', intentId);
        }

        const { data: order } = await admin
          .from('orders')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle();

        if (order) {
          await updateOrderPaymentStatus((order as { id: string }).id, 'failed');
          await markEvent(admin, event.id, event.type, 'processed', (order as { id: string }).id);
        } else {
          await markEvent(admin, event.id, event.type, 'skipped');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { data: order } = await admin
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .maybeSingle();

        if (order) {
          await updateOrderPaymentStatus((order as { id: string }).id, 'failed', paymentIntent.id);
          await markEvent(admin, event.id, event.type, 'processed', (order as { id: string }).id);
        } else {
          await markEvent(admin, event.id, event.type, 'skipped');
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const { data: order } = await admin
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', charge.payment_intent)
          .maybeSingle();

        if (order) {
          const refundStatus = charge.amount_refunded < charge.amount_captured ? 'partially_refunded' : 'refunded';
          await updateOrderPaymentStatus((order as { id: string }).id, refundStatus);
          await markEvent(admin, event.id, event.type, 'processed', (order as { id: string }).id);
        } else {
          await markEvent(admin, event.id, event.type, 'skipped');
        }
        break;
      }

      default:
        await markEvent(admin, event.id, event.type, 'skipped');
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await markEvent(admin, event.id, event.type, 'failed', undefined, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
