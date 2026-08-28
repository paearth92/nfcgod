import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type AnySupabase = any;

const MAX_ORDER_NUMBER_LEN = 20;
const MAX_EMAIL_LEN = 254;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { orderNumber, email } = body as { orderNumber?: string; email?: string };

  if (!orderNumber?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
  }

  const trimmedOrder = orderNumber.trim().slice(0, MAX_ORDER_NUMBER_LEN);
  const trimmedEmail = email.trim().toLowerCase().slice(0, MAX_EMAIL_LEN);

  const admin = createAdminClient() as unknown as AnySupabase;

  const { data, error } = await admin.rpc('guest_order_lookup', {
    order_number_input: trimmedOrder,
    email_input: trimmedEmail,
  });

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { error: 'Unable to find your order. Check your order number and the email used at checkout.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const order = data[0] as {
    order_number: string;
    payment_status: string;
    fulfillment_status: string;
    total_cents: number;
    currency: string;
    created_at: string;
    tracking_carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
  };

  let safeTrackingUrl: string | null = null;
  if (order.tracking_url) {
    const url = order.tracking_url;
    if (url.match(/^https?:\/\//) && !url.match(/[\x00-\x1F]/)) {
      safeTrackingUrl = url;
    }
  }

  return NextResponse.json(
    {
      order: {
        order_number: order.order_number,
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,
        total_cents: order.total_cents,
        currency: order.currency,
        created_at: order.created_at,
        tracking_carrier: order.tracking_carrier,
        tracking_number: order.tracking_number,
        tracking_url: safeTrackingUrl,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
