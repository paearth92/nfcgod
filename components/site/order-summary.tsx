'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Check, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/products';
import { findPromoRule, calculatePromoDiscount, promoService, type PromoRule } from '@/lib/promo-service';

export const FREE_SHIPPING_THRESHOLD = 35;

interface OrderSummaryProps {
  subtotal: number;
  compact?: boolean;
}

export function OrderSummary({ subtotal, compact = false }: OrderSummaryProps) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedRule, setAppliedRule] = useState<PromoRule | null>(null);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    const stored = promoService.load();
    if (stored) {
      const rule = findPromoRule(stored);
      if (rule) {
        setAppliedCode(stored);
        setAppliedRule(rule);
        setPromoStatus('success');
        setPromoMessage(`${rule.code} applied — ${rule.description.toLowerCase()}`);
      } else {
        promoService.clear();
      }
    }
  }, []);

  function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    const rule = findPromoRule(code);
    if (rule) {
      setAppliedCode(rule.code);
      setAppliedRule(rule);
      setPromoStatus('success');
      setPromoMessage(`${rule.code} applied — ${rule.description.toLowerCase()}`);
      setPromoInput('');
      promoService.save(rule.code);
    } else {
      setPromoStatus('error');
      setPromoMessage('That code is not valid. Try WELCOME10 for a 10% demonstration discount.');
    }
  }

  function removePromo() {
    setAppliedCode(null);
    setAppliedRule(null);
    setPromoStatus('idle');
    setPromoMessage('');
    promoService.clear();
  }

  const promoDiscount = calculatePromoDiscount(subtotal, appliedRule);
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  const freeShippingQualified = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const estimatedShipping = freeShippingQualified ? 0 : null;
  const estimatedTotal = discountedSubtotal + (estimatedShipping ?? 0);
  const progress = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">Order summary</h2>

      {/* Free shipping progress */}
      {!compact ? (
        <div className="mt-4 rounded-lg border border-border bg-accent/20 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" />
            {freeShippingQualified ? (
              <span className="font-semibold text-emerald-700">You qualify for free U.S. shipping</span>
            ) : (
              <>Add <span className="font-bold text-primary">{formatPrice(remaining)}</span> for free U.S. shipping</>
            )}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Merchandise subtotal</dt>
          <dd className="font-semibold text-foreground">{formatPrice(subtotal)}</dd>
        </div>

        {promoDiscount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <dt className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Demonstration discount ({appliedCode})
            </dt>
            <dd className="font-semibold">−{formatPrice(promoDiscount)}</dd>
          </div>
        ) : null}

        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated shipping</dt>
          <dd className="font-semibold text-foreground">
            {freeShippingQualified ? 'Free' : 'Calculated at checkout'}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated tax</dt>
          <dd className="font-semibold text-muted-foreground">Calculated at checkout</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-foreground">Estimated total</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(estimatedTotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Taxes and shipping confirmed during checkout. This total excludes tax and shipping.
        </p>
      </div>

      {/* Promo code field */}
      <div className="mt-5 border-t border-border pt-4">
        <label htmlFor="promo-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Promotional code
        </label>

        {appliedRule ? (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {appliedCode}
            </span>
            <button
              type="button"
              onClick={removePromo}
              aria-label={`Remove promotional code ${appliedCode}`}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-emerald-700 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              id="promo-code"
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                if (promoStatus === 'error') setPromoStatus('idle');
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              placeholder="Enter code"
              aria-label="Promotional code"
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-medium uppercase placeholder:normal-case placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="btn-secondary-np h-10 px-4 text-sm"
            >
              Apply
            </button>
          </div>
        )}

        {promoStatus === 'error' ? (
          <p className="mt-2 text-xs font-medium text-destructive" role="alert">{promoMessage}</p>
        ) : null}
        {promoStatus === 'success' && !appliedRule ? (
          <p className="mt-2 text-xs font-medium text-emerald-700">{promoMessage}</p>
        ) : null}
        {promoStatus === 'success' && appliedRule ? (
          <p className="mt-2 text-xs font-medium text-emerald-700" role="status">{promoMessage}</p>
        ) : null}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Try <span className="font-semibold text-foreground">WELCOME10</span> for a 10% demonstration discount.
        </p>
      </div>
    </div>
  );
}
