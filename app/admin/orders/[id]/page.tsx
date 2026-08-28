import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceFromCents } from '@/lib/catalog';
import { AdminOrderActions } from '@/components/site/admin-order-actions';
import Link from 'next/link';
import { ArrowLeft, Package, QrCode } from 'lucide-react';
import { formatCode } from '@/lib/code-utils';

export const metadata: Metadata = {
  title: 'Admin Order Detail',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AnySupabase = any;

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  payment_status: string;
  fulfillment_status: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  currency: string;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

type OrderItemRow = {
  id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  image_path: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  bundle_components: string | null;
};

type AssignedCode = {
  id: string;
  code: string;
  status: string;
  owner_id: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* eslint-disable @next/next/no-img-element */

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient() as unknown as AnySupabase;

  const { data: orderData } = await admin
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  const order = orderData as OrderRow | null;
  if (!order) {
    redirect('/admin/orders');
  }

  const { data: itemsData } = await admin
    .from('order_items')
    .select('id, product_name, variant_name, sku, image_path, unit_price_cents, quantity, line_total_cents, bundle_components')
    .eq('order_id', order.id);

  const items = (itemsData ?? []) as OrderItemRow[];

  // Fetch assigned codes
  const itemIds = items.map((i) => i.id);
  let codesByItem: Record<string, AssignedCode[]> = {};
  if (itemIds.length > 0) {
    const { data: codesData } = await admin
      .from('codes')
      .select('id, code, status, owner_id, order_item_id')
      .in('order_item_id', itemIds);
    for (const code of (codesData ?? []) as (AssignedCode & { order_item_id: string })[]) {
      if (!codesByItem[code.order_item_id]) codesByItem[code.order_item_id] = [];
      codesByItem[code.order_item_id].push({ id: code.id, code: code.code, status: code.status, owner_id: code.owner_id });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground font-mono">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-np bg-emerald-50 text-emerald-700 capitalize">{order.payment_status}</span>
          <span className="badge-np bg-secondary text-secondary-foreground capitalize">{order.fulfillment_status}</span>
        </div>
      </header>

      {/* Customer & Shipping */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Customer</h2>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{order.customer_name ?? '—'}</p>
            <p>{order.customer_email}</p>
            {order.customer_phone ? <p>{order.customer_phone}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-primary" /> Shipping address
          </h2>
          <div className="mt-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{order.shipping_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 ? <p>{order.shipping_address_line2}</p> : null}
            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>
      </div>

      {/* Items with code assignment */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Items &amp; Code Assignment</h2>
        <ul className="mt-4 space-y-4">
          {items.map((item) => {
            const codes = codesByItem[item.id] ?? [];
            return (
              <li key={item.id} className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  {item.image_path ? (
                    <img src={item.image_path} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent text-xs font-bold text-primary">
                      {item.quantity}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.variant_name} · {item.sku}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity} · {formatPriceFromCents(item.line_total_cents)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {codes.length}/{item.quantity} codes
                    </p>
                    {codes.length < item.quantity ? (
                      <p className="text-xs text-amber-600">Needs {item.quantity - codes.length} more</p>
                    ) : (
                      <p className="text-xs text-emerald-600">Complete</p>
                    )}
                  </div>
                </div>
                {codes.length > 0 ? (
                  <div className="ml-19 space-y-1 rounded-lg bg-accent/20 p-3">
                    {codes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground">
                          <QrCode className="h-3.5 w-3.5 text-primary" />
                          {formatCode(code.code)}
                        </span>
                        {code.owner_id ? (
                          <span className="badge-np bg-emerald-50 text-emerald-700">Activated</span>
                        ) : (
                          <span className="badge-np bg-secondary text-secondary-foreground">Assigned</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Totals */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Totals</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold text-foreground">{formatPriceFromCents(order.subtotal_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-semibold text-foreground">{order.shipping_cents === 0 ? 'Free' : formatPriceFromCents(order.shipping_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="font-semibold text-foreground">{formatPriceFromCents(order.tax_cents)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-bold text-foreground">{formatPriceFromCents(order.total_cents)}</dd>
          </div>
        </dl>
      </div>

      {/* Fulfillment actions */}
      <AdminOrderActions
        orderId={order.id}
        orderItems={items.map((item) => ({
          id: item.id,
          productName: item.product_name,
          quantity: item.quantity,
          assignedCount: codesByItem[item.id]?.length ?? 0,
        }))}
        currentStatus={order.fulfillment_status}
        trackingCarrier={order.tracking_carrier}
        trackingNumber={order.tracking_number}
        trackingUrl={order.tracking_url}
      />
    </div>
  );
}
