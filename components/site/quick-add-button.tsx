'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { useCart } from './cart-context';
import { cn } from '@/lib/utils';

export function QuickAddButton({ product, className }: { product: Product; className?: string }) {
  const { add, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const firstVariant = product.variants[0];

  function handleAdd() {
    if (!firstVariant) return;
    add(product, firstVariant, 1);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Add ${product.name} to cart`}
      className={cn(
        'inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className
      )}
    >
      {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {added ? 'Added' : 'Quick add'}
    </button>
  );
}
