'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from './cart-context';
import { Breadcrumbs } from './breadcrumbs';
import { CartLineItem } from './cart-line-item';
import { OrderSummary } from './order-summary';
import { ShippingEstimator } from './shipping-estimator';
import { PurchaseReassurance } from './purchase-reassurance';
import { CartRecommendations } from './cart-recommendations';

export function CartContents() {
  const { lines, subtotal, count, hydrated } = useCart();

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-np py-16">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Cart' }]} className="mb-8" />
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse our NFC + QR review products and add your favorites. Every product supports tap with NFC or scan the QR code.
          </p>
          <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
            Shop products <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-np py-8 md:py-10">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Cart' }]} className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hydrated ? `${count} item${count === 1 ? '' : 's'}` : 'Loading…'}
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex sm:items-center sm:gap-1"
        >
          Continue shopping <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Line items + estimator */}
        <div className="space-y-4 lg:col-span-2">
          <div className="space-y-3">
            {lines.map((line) => (
              <CartLineItem key={line.variantId} line={line} />
            ))}
          </div>

          <ShippingEstimator />

          <PurchaseReassurance className="mt-2" />

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
          >
            Continue shopping <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <OrderSummary subtotal={subtotal} />
          <Link href="/checkout" className="btn-primary-np w-full">
            Continue to checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            You will review your order before any payment step.
          </p>
        </aside>
      </div>

      {/* Recommendations */}
      <CartRecommendations />
    </div>
  );
}
