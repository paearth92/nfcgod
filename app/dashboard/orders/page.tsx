'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Loader2, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPriceFromCents } from '@/lib/catalog';

type OrderRow = {
  id: string;
  order_number: string;
  payment_status: string;
  fulfillment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  variant_name: string;
  image_path: string | null;
  quantity: number;
  line_total_cents: number;
};

type OrdersData = {
  orders: OrderRow[];
  itemsByOrder: Record<string, OrderItemRow[]>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [data, setData] = React.useState<OrdersData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadOrders() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;
      if (userError || !user) {
        router.replace('/auth/sign-in?next=/dashboard/orders');
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, payment_status, fulfillment_status, total_cents, currency, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (ordersError) {
        setError(ordersError.message);
        return;
      }

      const orders = (ordersData ?? []) as OrderRow[];
      const orderIds = orders.map((order) => order.id);
      const itemsByOrder: Record<string, OrderItemRow[]> = {};

      if (orderIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('id, order_id, product_name, variant_name, image_path, quantity, line_total_cents')
          .in('order_id', orderIds);

        if (!active) return;
        if (itemsError) {
          setError(itemsError.message);
          return;
        }

        for (const item of (itemsData ?? []) as OrderItemRow[]) {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push(item);
        }
      }

      setData({ orders, itemsByOrder });
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="card-np p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-display text-xl font-bold">Orders could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading your orders…
      </div>
    );
  }

  if (data.orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <Package className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-foreground">No orders yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">When you place an order, it will appear here.</p>
        <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
          Shop products <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Your Orders</h1>
        <p className="text-sm text-muted-foreground">Track and review your NFCPlate purchases.</p>
      </header>

      <div className="space-y-4">
        {data.orders.map((order) => {
          const items = data.itemsByOrder[order.id] ?? [];
          const quantity = items.reduce((total, item) => total + item.quantity, 0);

          return (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-np bg-emerald-50 text-emerald-700 capitalize">{order.payment_status}</span>
                  <span className="badge-np bg-secondary text-secondary-foreground capitalize">{order.fulfillment_status}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">{quantity} item{quantity === 1 ? '' : 's'}</span>
                <span className="font-bold text-foreground">{formatPriceFromCents(order.total_cents)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
