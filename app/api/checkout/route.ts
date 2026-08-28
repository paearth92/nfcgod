import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-server';
import { validateAndCalculateOrder, type CheckoutLineInput } from '@/lib/checkout-validation';
import { createRouteClient } from '@/lib/supabase/route';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteUrl } from '@/lib/env.server';
import type { Database } from '@/lib/supabase/database.types';

export const runtime = 'nodejs';

type AnySupabase = any;

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteClient(request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { lines } = body as { lines?: CheckoutLineInput[] };

  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  let validated: ReturnType<typeof validateAndCalculateOrder>;
  try {
    validated = validateAndCalculateOrder(lines);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Order validation failed.' },
      { status: 400 }
    );
  }

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Guest checkout — no session
  }

  const admin = createAdminClient() as unknown as AnySupabase;

  // Create a checkout intent with the validated line-item snapshot
  const { data: intentData, error: intentError } = await admin
    .from('checkout_intents')
    .insert({
      user_id: userId,
      line_items: JSON.stringify(validated.lineItems),
      subtotal_cents: validated.subtotalCents,
      discount_cents: 0,
      shipping_cents: validated.shippingCents,
      tax_cents: validated.taxCents,
      total_cents: validated.totalCents,
      currency: validated.currency,
      status: 'pending',
    })
    .select('id')
    .single();

  if (intentError || !intentData) {
    return NextResponse.json(
      { error: 'Unable to start checkout. Please try again.' },
      { status: 500 }
    );
  }

  const intentId = intentData.id as string;
  const siteUrl = getSiteUrl();

  const stripeLineItems = validated.lineItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: validated.currency,
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.bundleComponents
          ? `${item.productName} (Bundle: ${item.bundleComponents.map((c) => c.productName).join(', ')})`
          : item.productName,
        description: item.variantName,
        ...(item.imagePath
          ? { images: [`${siteUrl}${item.imagePath}`] }
          : {}),
      },
    },
  }));

  if (validated.shippingCents > 0) {
    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: validated.currency,
        unit_amount: validated.shippingCents,
        product_data: {
          name: 'Standard U.S. Shipping',
          description: '4–7 business days',
        },
      },
    });
  }

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        checkout_intent_id: intentId,
        ...(userId ? { user_id: userId } : {}),
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    // Store the Stripe session ID on the checkout intent
    await admin
      .from('checkout_intents')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', intentId);

    return applyCookies(NextResponse.json({ url: session.url }));
  } catch (err) {
    return applyCookies(NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    ));
  }
}
