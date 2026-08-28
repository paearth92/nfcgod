import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="section-pad">
      <div className="container-np">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2b5bd7] to-[#1641a3] px-6 py-12 text-center text-white shadow-[0_24px_60px_-30px_rgba(43,91,215,0.6)] sm:px-12 md:py-16">
          {/* NFC signal decoration */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-xl">
            <span
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12a7 7 0 0112-5M7 12a5 5 0 018-3.5M9 12a3 3 0 014.5-2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" />
              </svg>
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl md:text-[2rem] md:leading-[1.15]">
              Make every happy customer count.
            </h2>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              Put your review page one tap away.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-[#1641a3] shadow-sm transition-all hover:bg-white/90 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop NFCPlate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
