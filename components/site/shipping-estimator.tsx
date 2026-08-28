'use client';

import { useState } from 'react';
import { Truck, MapPin } from 'lucide-react';

export function ShippingEstimator({ className }: { className?: string }) {
  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [estimate, setEstimate] = useState('');

  function estimateDelivery() {
    if (!/^\d{5}$/.test(zipCode)) {
      setZipError('Enter a valid 5-digit U.S. ZIP code');
      setEstimate('');
      return;
    }
    setZipError('');
    const firstDigit = parseInt(zipCode[0], 10);
    const baseDays = firstDigit <= 3 ? 4 : firstDigit <= 6 ? 5 : 6;
    const earliest = baseDays;
    const latest = baseDays + 3;
    setEstimate(`Estimated delivery in ${earliest}–${latest} business days. This is a general estimate and will be confirmed during checkout.`);
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Estimate delivery</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Enter your U.S. ZIP code for a general delivery estimate.
      </p>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && estimateDelivery()}
            placeholder="ZIP code"
            aria-label="ZIP code for delivery estimate"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <button
          type="button"
          onClick={estimateDelivery}
          className="btn-secondary-np h-10 px-4 text-sm"
        >
          Estimate
        </button>
      </div>
      {zipError ? (
        <p className="mt-2 text-xs font-medium text-destructive" role="alert">{zipError}</p>
      ) : null}
      {estimate ? (
        <p className="mt-2 text-xs font-medium text-foreground">{estimate}</p>
      ) : null}
    </div>
  );
}
