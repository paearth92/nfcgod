import Link from 'next/link';
import { ArrowRight, Star, Zap, Smartphone } from 'lucide-react';
import { ProductVisual } from './product-visual';

const trustItems = [
  { label: 'Secure checkout', icon: 'shield' },
  { label: 'iPhone & Android', icon: 'phone' },
  { label: 'NFC + QR backup', icon: 'nfc' },
  { label: 'No app needed', icon: 'zap' },
];

function TrustIcon({ name }: { name: string }) {
  const cls = 'h-4 w-4 text-primary';
  if (name === 'shield')
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" strokeLinejoin="round" />
      </svg>
    );
  if (name === 'phone')
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M11 18h2" strokeLinecap="round" />
      </svg>
    );
  if (name === 'nfc')
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12a7 7 0 0112-5M7 12a5 5 0 018-3.5M9 12a3 3 0 014.5-2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  return <Zap className={cls} />;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/40 via-background to-background">
      <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-32 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl md:block"
        aria-hidden="true"
      />
      <div className="container-np relative py-12 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          <div className="max-w-xl">
            <p className="eyebrow">Smart tools for growing businesses</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.08]">
              More reviews.
              <br />
              One simple tap.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn happy customers into lasting credibility with NFC-powered review
              products built for the front counter.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary-np">
                Shop review products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary-np">
                See how it works
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </span>
              <span>Designed for genuine customer reviews</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto flex min-h-[360px] items-end justify-center">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <span className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-nfc-pulse rounded-full border border-primary/30" />
                <span
                  className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-nfc-pulse rounded-full border border-primary/30"
                  style={{ animationDelay: '0.8s' }}
                />
              </div>
              <div className="animate-float-soft relative z-10">
                <ProductVisual type="stand" finish="black" />
              </div>

              <div
                className="absolute -left-2 top-6 hidden animate-float-soft-delayed rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex sm:items-center sm:gap-2.5 md:absolute"
                aria-hidden="false"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Instant connection</p>
                  <p className="text-muted-foreground">No app required</p>
                </div>
              </div>
              <div
                className="absolute -right-2 bottom-10 hidden animate-float-soft rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex sm:items-center sm:gap-2.5 md:absolute"
                aria-hidden="false"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">NFC + QR</p>
                  <p className="text-muted-foreground">iPhone & Android</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur sm:grid-cols-4 md:mt-12">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-2 text-xs font-medium text-foreground sm:text-sm">
              <TrustIcon name={item.icon} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
