'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { formatPriceFromCents } from '@/lib/catalog';

interface GuestOrderResult {
  order_number: string;
  payment_status: string;
  fulfillment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuestOrderResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to find your order. Check your order number and email.');
        setLoading(false);
        return;
      }
      setResult(data.order);
    } catch {
      setError('Network error. Check your connection and try again.');
    }
    setLoading(false);
  }

  return (
    <div className="container-np py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="eyebrow">Help</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Track your order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your order number and the email you used at checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="orderNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Order number
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="NFP-XXXX-XXXX"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-np w-full disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Looking up your order…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find my order
              </>
            )}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4" role="alert">
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-bold text-foreground">{result.order_number}</p>
              <div className="flex items-center gap-2">
                <span className="badge-np bg-emerald-50 text-emerald-700 capitalize">{result.payment_status}</span>
                <span className="badge-np bg-secondary text-secondary-foreground capitalize">{result.fulfillment_status}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Placed {formatDate(result.created_at)}</p>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-bold text-foreground">{formatPriceFromCents(result.total_cents)}</dd>
              </div>
            </dl>

            {result.tracking_number ? (
              <div className="mt-4 rounded-lg bg-accent/20 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Tracking
                </p>
                {result.tracking_carrier ? <p className="mt-1 text-xs text-muted-foreground">Carrier: {result.tracking_carrier}</p> : null}
                <p className="text-xs text-muted-foreground">Tracking: {result.tracking_number}</p>
                {result.tracking_url ? (
                  <a href={result.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-accent hover:underline">
                    Track shipment →
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
