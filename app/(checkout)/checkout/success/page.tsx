import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getStripe } from '@/lib/stripe-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceFromCents } from '@/lib/catalog';
import { CheckCircle2, Package, Truck, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your NFCPlate order has been confirmed.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AnySupabase = any;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect('/cart');
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    redirect('/cart');
  }

  // Verify payment status before showing confirmation
  if (session.payment_status !== 'paid') {
    redirect('/cart');
  }

  // Look up the order in the database
  const admin = createAdminClient() as unknown as AnySupabase;
  const { data: orderData } = await admin
    .from('orders')
    .select('id, order_number, total_cents, currency, customer_email, payment_status, fulfillment_status')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle();

  const order = orderData as {
    id: string;
    order_number: string;
    total_cents: number;
    currency: string;
    customer_email: string;
    payment_status: string;
    fulfillment_status: string;
  } | null;

  if (!order) {
    // The webhook may not have processed yet — show a generic confirmation
    return (
      <div className="container-np py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-xl font-extrabold tracking-tight text-foreground">
            Payment Received
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment has been confirmed. You will receive an email confirmation shortly with your order details.
          </p>
          <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-np py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-xl font-extrabold tracking-tight text-foreground">
            Order Confirmed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Order number</dt>
              <dd className="font-bold text-foreground font-mono">{order.order_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total paid</dt>
              <dd className="font-bold text-foreground">{formatPriceFromCents(order.total_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment status</dt>
              <dd className="font-semibold text-emerald-600 capitalize">{order.payment_status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fulfillment</dt>
              <dd className="font-semibold text-foreground capitalize">{order.fulfillment_status}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border bg-accent/20 p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              A confirmation email has been sent to <span className="font-semibold text-foreground">{order.customer_email}</span>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Your NFCPlate products will be shipped within 1–2 business days. Each product comes with a unique activation code.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Standard U.S. shipping: 4–7 business days. You will receive tracking information once your order ships.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/track-order" className="btn-secondary-np flex-1 text-center text-sm">
            Track your order
          </Link>
          <Link href="/shop" className="btn-primary-np flex-1 text-center text-sm">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
