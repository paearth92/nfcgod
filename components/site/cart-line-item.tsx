'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, Nfc, QrCode, Check } from 'lucide-react';
import type { CartLine } from './cart-context';
import { ProductVisual } from './product-visual';
import { formatPrice } from '@/lib/products';
import { useCart } from './cart-context';

export function CartLineItem({ line }: { line: CartLine }) {
  const { setQuantity, remove } = useCart();
  const lineTotal = line.price * line.quantity;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      {/* Thumbnail container — replaceable */}
      <Link
        href={`/products/${line.productSlug}`}
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-accent/50 to-accent/20 p-2 transition-colors hover:from-accent/60 hover:to-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`View ${line.productName}`}
      >
        <div className="scale-[0.22]">
          <ProductVisual type="stand" finish="black" />
        </div>
      </Link>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${line.productSlug}`}
          className="text-sm font-semibold text-foreground hover:text-primary"
        >
          {line.productName}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {line.variantName} · SKU {line.sku}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <Check className="h-3 w-3" /> In stock
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Nfc className="h-3 w-3 text-primary" /> NFC tap
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <QrCode className="h-3 w-3 text-primary" /> QR scan
          </span>
        </div>
      </div>

      {/* Quantity + price */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuantity(line.variantId, line.quantity - 1)}
            aria-label={`Decrease quantity of ${line.productName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{line.quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(line.variantId, line.quantity + 1)}
            aria-label={`Increase quantity of ${line.productName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="text-right sm:mt-1">
          <p className="text-xs text-muted-foreground">{formatPrice(line.price)} each</p>
          <p className="text-sm font-bold text-foreground">{formatPrice(lineTotal)}</p>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => remove(line.variantId)}
        aria-label={`Remove ${line.productName} from cart`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:self-start"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
