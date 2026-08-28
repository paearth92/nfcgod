'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/products';
import { useCart } from './cart-context';

export function StickyPurchaseBar({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const firstVariant: ProductVariant = product.variants[0];

  function handleAdd() {
    add(product, firstVariant, 1);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-[0_-4px_20px_-8px_rgba(15,23,42,0.15)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{product.name}</p>
          <p className="text-base font-bold text-foreground">{formatPrice(firstVariant.price)}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={added || !product.inStock}
          className="btn-primary-np flex h-11 items-center px-5"
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? <Check className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
          {added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
