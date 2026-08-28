'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProductBySlug } from '@/lib/products';
import { recentService } from '@/lib/cart-service';
import { ProductCard } from './product-card';

export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    const slugs = recentService.load().filter((s) => s !== currentSlug);
    const products = slugs.map((s) => getProductBySlug(s)).filter((p): p is Product => Boolean(p));
    setRecent(products);
  }, [currentSlug]);

  // Save current product to recently viewed
  useEffect(() => {
    const slugs = recentService.load();
    const updated = [currentSlug, ...slugs.filter((s) => s !== currentSlug)].slice(0, 6);
    recentService.save(updated);
  }, [currentSlug]);

  if (recent.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Recently viewed</h2>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recent.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
