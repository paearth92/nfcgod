import { BadgeCheck, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getReviewSummary } from '@/lib/reviews';

/**
 * SAMPLE STOREFRONT REVIEW CONTENT
 * These reviews are typed local seed data for layout demonstration only.
 * They are NOT imported from any external reviews platform.
 * Replace with a real reviews database in a later phase.
 */
export function ReviewsSection({ product }: { product: Product }) {
  const summary = getReviewSummary(product.slug);
  if (!summary) return null;

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const maxCount = Math.max(...summary.distribution.map((d) => d.count), 1);

  return (
    <section className="py-12">
      <div className="container-np">
        <h2 className="text-lg font-semibold text-foreground">Customer reviews</h2>

        {/* Summary + distribution */}
        <div className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[200px_1fr]">
          <div className="text-center sm:border-r sm:border-border sm:pr-6">
            <p className="text-4xl font-extrabold text-foreground">{summary.average.toFixed(1)}</p>
            <div className="mt-2 flex items-center justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i <= Math.round(summary.average) ? 'fill-amber-400 text-amber-400' : 'fill-border text-border'}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{summary.count} reviews</p>
          </div>
          <div className="space-y-2">
            {summary.distribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-3">
                <span className="flex w-12 items-center gap-1 text-xs font-medium text-muted-foreground">
                  {d.rating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-border text-border'}`}
                      />
                    ))}
                  </div>
                  {review.verifiedPurchase ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
                    </span>
                  ) : null}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{review.author}</span>
                <span>{formatDate(review.date)}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Sample storefront review content shown for demonstration. These are not imported from any external reviews platform.
        </p>
      </div>
    </section>
  );
}
