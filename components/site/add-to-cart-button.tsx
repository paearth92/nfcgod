'use client';

import { useState } from 'react';
import { Check, ShoppingBag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/products';
import { useCart } from './cart-context';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
  className?: string;
  label?: string;
  showPrice?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  label = 'Add to cart',
  showPrice = false,
}: AddToCartButtonProps) {
  const { add, openCart } = useCart();
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    add(product, variant, quantity);
    setAdding(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => {
      setAdding(false);
      openCart();
    }, 600);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!variant.inStock || adding}
        className="btn-primary-np w-full"
      >
        {adding ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <ShoppingBag className="mr-2 h-4 w-4" />
        )}
        {adding ? 'Added' : label}
        {showPrice ? ` — ${formatPrice(variant.price * quantity)}` : ''}
      </button>
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground/60 opacity-70"
        aria-label="Buy now (coming soon)"
      >
        <Zap className="h-4 w-4" />
        Buy now
        <span className="text-xs font-normal text-muted-foreground">(coming soon)</span>
      </button>
    </div>
  );
}
