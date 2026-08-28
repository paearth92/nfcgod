'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShieldCheck, Truck, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, ProductColor } from '@/lib/types';
import { formatPrice, getStartingPrice } from '@/lib/products';
import { getImagePathForSlug, getAltForSlug } from '@/lib/product-media';
import { useCart } from './cart-context';
import { ColorSwatches } from './color-swatches';
import { cn } from '@/lib/utils';

const badgeStyles: Record<string, string> = {
  'Best Seller': 'bg-blue-500/15 text-blue-700 border border-blue-300/30',
  'Save 9%': 'bg-emerald-500/15 text-emerald-700 border border-emerald-300/30',
};

export function ProductCard({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product.variants.find((v) => v.color)?.color
  );
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean))
  ) as ProductColor[];

  const variantForColor = selectedColor
    ? product.variants.find((v) => v.color === selectedColor) ?? product.variants[0]
    : product.variants[0];

  const startingPrice = getStartingPrice(product);
  const hasMultiplePrices = product.variants.some((v) => v.price !== product.variants[0].price);
  const compareAt = variantForColor?.compareAtPrice;

  const imageVariant = variantForColor?.color ?? undefined;
  const imagePath = getImagePathForSlug(product.slug, imageVariant);
  const imageAlt = getAltForSlug(product.slug, imageVariant);

  function handleQuickAdd() {
    add(product, variantForColor, 1);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  }

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWished((w) => !w);
    toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist');
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_2px_8px_rgba(30,25,20,0.04),0_12px_32px_-16px_rgba(30,25,20,0.14)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200/80 hover:shadow-[0_8px_16px_rgba(30,25,20,0.06),0_24px_48px_-20px_rgba(37,99,235,0.28)]">
      {/* Glass shine effect on top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent opacity-60" />

      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="relative block overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-50/80 via-white/60 to-indigo-50/40"
          aria-label={`${product.name} — ${product.shortDescription}`}
        >
          <div className="relative flex aspect-[4/3] items-center justify-center p-6">
            {product.badge ? (
              <span
                className={cn(
                  'badge-np absolute left-4 top-4 z-10',
                  badgeStyles[product.badge] ?? 'bg-blue-500/15 text-blue-700 border border-blue-300/30'
                )}
              >
                {product.badge}
              </span>
            ) : null}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wished}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-500 backdrop-blur-md transition-all hover:scale-110 hover:border-blue-200 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Heart className={cn('h-4 w-4 transition-all', wished && 'fill-blue-500 text-blue-500')} />
            </button>
            <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]">
              <Image
                src={imagePath}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain drop-shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                priority={false}
              />
            </div>
          </div>
        </Link>
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {product.shortDescription}
          </p>
          {product.badge === 'Best Seller' ? (
            <Sparkles className="h-3 w-3 text-amber-500" />
          ) : null}
        </div>
        <h3 className="mt-1.5 text-base font-bold text-slate-900">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-blue-600">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {hasMultiplePrices ? (
            <span className="text-sm font-medium text-slate-500">From</span>
          ) : null}
          <span className="text-xl font-bold text-slate-900">
            {formatPrice(variantForColor?.price ?? startingPrice)}
          </span>
          {compareAt ? (
            <span className="text-sm text-slate-400 line-through">{formatPrice(compareAt)}</span>
          ) : null}
        </div>
        {colors.length > 1 ? (
          <div className="mt-3">
            <ColorSwatches
              colors={colors}
              selected={selectedColor}
              onSelect={(c) => setSelectedColor(c)}
              size="sm"
            />
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Genuine reviews
          </span>
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-blue-500" /> Free $35+
          </span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={added}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.6)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-70 active:scale-[0.98]"
          >
            {added ? <Check className="h-4 w-4" /> : null}
            {added ? 'Added' : 'Quick add'}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 px-4 text-sm font-medium text-slate-600 backdrop-blur-sm transition-all hover:border-blue-300 hover:bg-white hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={`View ${product.name} details`}
          >
            Details
          </Link>
        </div>
        {!product.inStock ? (
          <p className="mt-2 text-xs font-medium text-amber-700">Out of stock</p>
        ) : null}
      </div>
    </article>
  );
}
