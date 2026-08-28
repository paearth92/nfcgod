import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getComparisonData } from '@/lib/reviews';
import { formatPrice, getStartingPrice } from '@/lib/products';
import { cn } from '@/lib/utils';

export function ProductComparison({ product }: { product: Product }) {
  const { rows, products: allProducts, currentIndex } = getComparisonData(product.slug);
  if (currentIndex < 0) return null;

  // Show current product + up to 3 others for comparison
  const compareProducts = [product, ...allProducts.filter((p) => p.slug !== product.slug).slice(0, 3)];

  return (
    <section className="py-12">
      <div className="container-np">
        <h2 className="text-lg font-semibold text-foreground">Compare NFCPlate products</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          See how {product.name} compares to other NFCPlate products.
        </p>

        {/* Desktop: table */}
        <div className="mt-6 hidden overflow-hidden rounded-xl border border-border lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Feature</th>
                {compareProducts.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      'px-4 py-3 font-semibold',
                      p.slug === product.slug && 'bg-primary/5 text-primary'
                    )}
                  >
                    <Link href={`/products/${p.slug}`} className="hover:underline">
                      {p.name}
                    </Link>
                    <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                      From {formatPrice(getStartingPrice(p))}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-medium text-muted-foreground">{row.label}</td>
                  {compareProducts.map((p, idx) => {
                    const valueIdx = allProducts.findIndex((ap) => ap.slug === p.slug);
                    const value = row.values[valueIdx] ?? '—';
                    const isYes = value === 'Yes';
                    return (
                      <td
                        key={p.id}
                        className={cn(
                          'px-4 py-3 text-foreground',
                          p.slug === product.slug && 'bg-primary/5 font-medium'
                        )}
                      >
                        {isYes ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700">
                            <Check className="h-4 w-4" /> {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: horizontal scroll cards */}
        <div className="mt-6 -mx-5 overflow-x-auto px-5 pb-4 lg:hidden">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {compareProducts.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'w-64 shrink-0 rounded-xl border bg-card p-4',
                  p.slug === product.slug ? 'border-primary ring-1 ring-primary/20' : 'border-border'
                )}
              >
                <Link href={`/products/${p.slug}`} className="text-sm font-semibold text-foreground hover:text-primary">
                  {p.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">From {formatPrice(getStartingPrice(p))}</p>
                {p.slug === product.slug ? (
                  <span className="mt-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Current
                  </span>
                ) : null}
                <dl className="mt-3 space-y-1.5 text-xs">
                  {rows.map((row) => {
                    const valueIdx = allProducts.findIndex((ap) => ap.slug === p.slug);
                    const value = row.values[valueIdx] ?? '—';
                    return (
                      <div key={row.label} className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium text-foreground text-right">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
