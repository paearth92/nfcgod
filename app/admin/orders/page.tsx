import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceFromCents } from '@/lib/catalog';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Orders',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type AnySupabase = any;

type OrderRow = {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  payment_status: string;
  fulfillment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; payment?: string; fulfillment?: string };
}) {
  const admin = createAdminClient() as unknown as AnySupabase;

  let query = admin
    .from('orders')
    .select('id, order_number, customer_email, customer_name, payment_status, fulfillment_status, total_cents, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (searchParams.payment) {
    query = query.eq('payment_status', searchParams.payment);
  }
  if (searchParams.fulfillment) {
    query = query.eq('fulfillment_status', searchParams.fulfillment);
  }

  const { data: ordersData } = await query;
  let orders = (ordersData ?? []) as OrderRow[];

  // Simple server-side search
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        (o.customer_name?.toLowerCase().includes(q) ?? false)
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and fulfill customer orders.</p>
      </header>

      {/* Filters */}
      <form className="flex flex-wrap gap-3" method="GET">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Search by order number, email, or name"
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <select
          name="payment"
          defaultValue={searchParams.payment ?? ''}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          name="fulfillment"
          defaultValue={searchParams.fulfillment ?? ''}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <option value="">All fulfillment</option>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="btn-secondary-np h-10 px-4 text-sm">Filter</button>
      </form>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="card-np overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fulfillment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-foreground hover:text-accent">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{order.customer_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="badge-np capitalize">{order.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-np capitalize">{order.fulfillment_status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{formatPriceFromCents(order.total_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center text-accent hover:text-accent-hover">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
