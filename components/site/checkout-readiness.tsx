'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Lock, ShoppingCart, CreditCard, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from './cart-context';
import { formatPriceFromCents } from '@/lib/catalog';
import { cn } from '@/lib/utils';

const steps = [
  { icon: ShoppingCart, label: 'Cart' },
  { icon: Lock, label: 'Checkout' },
  { icon: CreditCard, label: 'Payment' },
];

export function CheckoutReadiness() {
  const { lines, subtotal, count, hydrated, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setError('Failed to start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-np py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
            <ShoppingCart className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a product to your cart before proceeding to checkout.
          </p>
          <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
            Shop products <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const subtotalCents = Math.round(subtotal * 100);
  const shippingCents = subtotalCents >= 3500 ? 0 : 599;
  const totalCents = subtotalCents + shippingCents;
  const freeShippingQualified = subtotalCents >= 3500;

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card">
        <div className="container-np flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-foreground">
            NFCPlate
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
        </div>
      </div>

      <div className="border-b border-border bg-accent/20">
        <div className="container-np py-4">
          <ol className="flex items-center justify-center gap-1 sm:gap-3">
            {steps.map((step, index) => {
              const isComplete = index < 1;
              const isCurrent = index === 1;
              return (
                <li key={step.label} className="flex items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        isComplete
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                          : 'bg-border text-muted-foreground'
                      )}
                    >
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : <step.icon className="h-3.5 w-3.5" />}
                    </span>
                    <span
                      className={cn(
                        'hidden text-xs font-semibold sm:inline',
                        isCurrent || isComplete ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 ? (
                    <span className={cn('h-px w-4 sm:w-8', isComplete ? 'bg-primary' : 'bg-border')} />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="container-np py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 lg:order-1">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Review your order
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You will enter your shipping address and payment details on the next screen via Stripe&rsquo;s secure checkout.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">Shipping</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Free standard U.S. shipping on orders of $35 or more. Otherwise $5.99. Shipping to U.S. addresses only.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Standard shipping (4–7 business days)</span>
                <span className="text-sm font-bold text-foreground">
                  {freeShippingQualified ? 'Free' : formatPriceFromCents(599)}
                </span>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4" role="alert">
                <p className="text-sm font-semibold text-destructive">{error}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || !hydrated}
              className="btn-primary-np mt-6 w-full disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to secure checkout…
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Continue to secure payment
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              You will be redirected to Stripe to complete your purchase securely.
            </p>
          </div>

          <aside className="order-1 lg:order-2">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((v) => !v)}
              aria-expanded={mobileSummaryOpen}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground lg:hidden"
            >
              <span>
                {count} item{count === 1 ? '' : 's'} · {formatPriceFromCents(subtotalCents)}
              </span>
              <ChevronRight className={cn('h-4 w-4 transition-transform', mobileSummaryOpen && 'rotate-90')} />
            </button>

            <div className={cn('mt-3 space-y-3 lg:mt-0', !mobileSummaryOpen && 'hidden lg:block')}>
              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">Order items</h2>
                <ul className="mt-3 space-y-3">
                  {lines.map((line) => (
                    <li key={line.variantId} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/40 text-xs font-bold text-primary">
                        {line.quantity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{line.productName}</p>
                        <p className="text-[11px] text-muted-foreground">{line.variantName}</p>
                      </div>
                      <p className="text-xs font-bold text-foreground">{formatPriceFromCents(Math.round(line.price * 100) * line.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">Order summary</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-semibold text-foreground">{formatPriceFromCents(subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-semibold text-foreground">
                      {freeShippingQualified ? 'Free' : formatPriceFromCents(599)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd className="font-semibold text-muted-foreground">$0.00</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">{formatPriceFromCents(totalCents)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
