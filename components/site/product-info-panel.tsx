'use client';

import { useState } from 'react';
import type { Product, ProductVariant, ProductColor } from '@/lib/types';
import { formatPrice, getStartingPrice } from '@/lib/products';
import { getReviewSummary } from '@/lib/reviews';
import { Breadcrumbs } from './breadcrumbs';
import { VariantSelector } from './variant-selector';
import { QuantitySelector } from './quantity-selector';
import { AddToCartButton } from './add-to-cart-button';
import { ColorSwatches } from './color-swatches';
import { Nfc, QrCode, Smartphone, ShieldCheck, Truck, Check, MapPin, RotateCcw, Wrench } from 'lucide-react';

interface ProductInfoPanelProps {
  product: Product;
}

function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400' : 'fill-border'}`}>
          <path d="M12 2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.9l1.5-6.7L2.3 9.6l6.8-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    inStockVariants[0] ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    selectedVariant.color
  );
  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');

  const reviewSummary = getReviewSummary(product.slug);
  const startingPrice = getStartingPrice(product);
  const hasSavings = selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price;
  const savingsPct = hasSavings
    ? Math.round(((selectedVariant.compareAtPrice! - selectedVariant.price) / selectedVariant.compareAtPrice!) * 100)
    : 0;

  function handleColorChange(color: ProductColor) {
    setSelectedColor(color);
    const match = product.variants.find((v) => v.color === color && v.inStock);
    if (match) setSelectedVariant(match);
  }

  function estimateDelivery() {
    if (!/^\d{5}$/.test(zipCode)) {
      setZipError('Enter a valid 5-digit U.S. ZIP code');
      setDeliveryEstimate('');
      return;
    }
    setZipError('');
    const firstDigit = parseInt(zipCode[0], 10);
    const baseDays = firstDigit <= 3 ? 2 : firstDigit <= 6 ? 3 : 4;
    const earliest = baseDays + 1;
    const latest = baseDays + 4;
    setDeliveryEstimate(`Estimated delivery in ${earliest}–${latest} business days. This is a general estimate, not a carrier guarantee.`);
  }

  return (
    <div className="lg:sticky lg:top-24">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: product.name },
        ]}
        className="mb-4"
      />

      {product.badge ? (
        <span className="badge-np mb-3 inline-flex bg-primary/10 text-primary">
          {product.badge}
        </span>
      ) : null}

      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {product.shortDescription}
      </p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {product.name}
      </h1>

      {/* Rating summary */}
      {reviewSummary ? (
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={reviewSummary.average} />
          <span className="text-sm font-semibold text-foreground">{reviewSummary.average.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">· {reviewSummary.count} reviews</span>
        </div>
      ) : null}

      {/* Price */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(selectedVariant.price)}
        </span>
        {hasSavings ? (
          <>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(selectedVariant.compareAtPrice!)}
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Save {savingsPct}%
            </span>
          </>
        ) : null}
        {product.inStock ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" /> In stock
          </span>
        ) : (
          <span className="text-xs font-semibold text-amber-700">Out of stock</span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      {/* Purchase box */}
      <div className="mt-6 rounded-2xl border border-white/60 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]">
        <VariantSelector
          product={product}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quantity
          </p>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        <div className="mt-5">
          <AddToCartButton
            product={product}
            variant={selectedVariant}
            quantity={quantity}
            showPrice
          />
        </div>
      </div>

      {/* Delivery estimator */}
      <div className="mt-4 rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur-xl shadow-[0_8px_32px_-16px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Estimate delivery</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your U.S. ZIP code for a general delivery estimate.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            placeholder="ZIP code"
            aria-label="ZIP code for delivery estimate"
            className="h-10 w-32 rounded-xl border border-white/40 bg-white/50 px-3 text-sm font-medium backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <button
            type="button"
            onClick={estimateDelivery}
            className="btn-secondary-np h-10 px-4 text-sm"
          >
            Estimate
          </button>
        </div>
        {zipError ? <p className="mt-2 text-xs font-medium text-destructive">{zipError}</p> : null}
        {deliveryEstimate ? (
          <p className="mt-2 text-xs font-medium text-foreground">{deliveryEstimate}</p>
        ) : null}
      </div>

      {/* Reassurance row */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3 py-2.5 text-xs text-slate-600 backdrop-blur-md">
          <Truck className="h-4 w-4 shrink-0 text-blue-500" />
          <span>Free U.S. shipping $35+</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3 py-2.5 text-xs text-slate-600 backdrop-blur-md">
          <RotateCcw className="h-4 w-4 shrink-0 text-blue-500" />
          <span>30-day returns</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3 py-2.5 text-xs text-slate-600 backdrop-blur-md">
          <Wrench className="h-4 w-4 shrink-0 text-blue-500" />
          <span>Easy self-setup</span>
        </div>
      </div>

      {/* NFC + QR compatibility summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/50 bg-white/50 p-5 text-xs backdrop-blur-xl">
        <span className="flex items-center gap-2 text-slate-600">
          <Nfc className="h-4 w-4 text-blue-500" /> NFC tap
        </span>
        <span className="flex items-center gap-2 text-slate-600">
          <QrCode className="h-4 w-4 text-blue-500" /> QR scan backup
        </span>
        <span className="flex items-center gap-2 text-slate-600">
          <Smartphone className="h-4 w-4 text-blue-500" /> iPhone & Android
        </span>
        <span className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4 text-blue-500" /> No customer app needed
        </span>
      </div>
    </div>
  );
}

export { Stars };
