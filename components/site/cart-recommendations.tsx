'use client';

import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { products } from '@/lib/products';
import type { Product } from '@/lib/types';
import { useCart } from './cart-context';
import { ProductCard } from './product-card';

export function CartRecommendations() {
  const { lines } = useCart();

  const recommendations = useMemo(() => {
    const cartSlugs = new Set(lines.map((l) => l.productSlug));
    const cartProducts = products.filter((p) => cartSlugs.has(p.slug));

    const relatedSlugs = new Set<string>();
    cartProducts.forEach((p) => {
      p.relatedProductSlugs.forEach((s) => {
        if (!cartSlugs.has(s)) relatedSlugs.add(s);
      });
    });

    let candidates = products.filter(
      (p) => !cartSlugs.has(p.slug) && relatedSlugs.has(p.slug) && p.inStock
    );

    if (candidates.length < 3) {
      const fallback = products.filter(
        (p) => !cartSlugs.has(p.slug) && !relatedSlugs.has(p.slug) && p.inStock
      );
      candidates = [...candidates, ...fallback];
    }

    return candidates.slice(0, 3);
  }, [lines]);

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">You might also like</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Popular NFCPlate products that pair well with your cart.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
