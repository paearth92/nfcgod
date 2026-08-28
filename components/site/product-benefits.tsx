import { MapPin, Smartphone, Star, TrendingUp, Target, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';

export function ProductBenefits({ product }: { product: Product }) {
  const s = product.storytelling;
  if (!s) return null;

  const journey = [
    { icon: MapPin, title: '1. Place it', body: `Best placement: ${s.bestPlacement}. Set it where customers naturally finish their visit.` },
    { icon: Smartphone, title: '2. Tap or scan', body: 'Customers tap the NFC spot or scan the QR code with their own phone. No app required.' },
    { icon: Star, title: '3. Reach the page', body: 'Your intended destination opens directly — review page, social profile, or link page.' },
  ];

  return (
    <section className="py-12">
      <div className="container-np">
        {/* Storytelling header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why this product</p>
          <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {s.primaryBenefit}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Best for {s.bestFor}.
          </p>
        </div>

        {/* Four benefit points */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.benefits.map((benefit, i) => {
            const icons = [TrendingUp, Target, Sparkles, Star];
            const Icon = icons[i] ?? Star;
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-foreground leading-snug">{benefit}</p>
              </div>
            );
          })}
        </div>

        {/* Three-step journey */}
        <div className="mt-10">
          <h3 className="text-center text-lg font-semibold text-foreground">How it works in three steps</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {journey.map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-accent/20 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 text-base font-semibold text-foreground">{step.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-foreground">Best used by</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.useCases.map((uc) => (
              <div key={uc.title} className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground">{uc.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{uc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
