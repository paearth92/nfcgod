'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPriceFromCents } from '@/lib/catalog';

type Order = {
  id: string;
  order_number: string;
  payment_status: string;
  fulfillment_status: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
};

type Item = {
  id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  line_total_cents: number;
};

export default function CustomerOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        router.replace('/auth/sign-in?next=/dashboard/orders');
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, payment_status, fulfillment_status, subtotal_cents, shipping_cents, tax_cents, total_cents, tracking_carrier, tracking_number, tracking_url, created_at')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!active) return;
      if (orderError) {
        setError(orderError.message);
        return;
      }
      if (!orderData) {
        router.replace('/dashboard/orders');
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .select('id, product_name, variant_name, quantity, line_total_cents')
        .eq('order_id', params.id);

      if (!active) return;
      if (itemError) {
        setError(itemError.message);
        return;
      }

      setOrder(orderData as Order);
      setItems((itemData ?? []) as Item[]);
    }

    void load();
    return () => { active = false; };
  }, [params.id, router]);

  if (error) {
    return (
      <div className="card-np p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-display text-xl font-bold">Order could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link href="/dashboard/orders" className="btn-secondary-np mt-5">Back to orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading order…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="font-mono text-2xl font-extrabold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">Placed {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <span className="badge-np bg-emerald-50 text-emerald-700 capitalize">{order.payment_status}</span>
          <span className="badge-np bg-secondary capitalize">{order.fulfillment_status}</span>
        </div>
      </header>

      {order.tracking_number ? (
        <div className="card-np p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4" /> Tracking</h2>
          <p className="mt-2 text-sm text-muted-foreground">{order.tracking_carrier ? `${order.tracking_carrier} · ` : ''}{order.tracking_number}</p>
          {order.tracking_url ? <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">Track shipment →</a> : null}
        </div>
      ) : null}

      <div className="card-np p-5">
        <h2 className="text-sm font-semibold">Items</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div><p className="text-sm font-semibold">{item.product_name}</p><p className="text-xs text-muted-foreground">{item.variant_name} · Qty {item.quantity}</p></div>
              <p className="text-sm font-semibold">{formatPriceFromCents(item.line_total_cents)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-np p-5">
        <h2 className="text-sm font-semibold">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPriceFromCents(order.subtotal_cents)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping_cents === 0 ? 'Free' : formatPriceFromCents(order.shipping_cents)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatPriceFromCents(order.tax_cents)}</dd></div>
          <div className="flex justify-between border-t border-border pt-2 font-bold"><dt>Total</dt><dd>{formatPriceFromCents(order.total_cents)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
