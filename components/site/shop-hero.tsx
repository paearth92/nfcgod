import Link from 'next/link';
import { Nfc, QrCode, ArrowRight, Smartphone, Zap } from 'lucide-react';
import { ProductVisual } from './product-visual';
import { Breadcrumbs } from './breadcrumbs';

export function ShopHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/60">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-mesh" />
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(37,99,235,0.15)_0.7px,transparent_0.7px)] [background-size:20px_20px]" />
      {/* Decorative orbs */}
      <div className="absolute -right-24 -top-12 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-cyan-100/30 to-blue-100/20 blur-3xl" />

      <div className="container-np relative py-10 md:py-16">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Shop' }]} className="mb-5" />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700 shadow-sm backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              NFCPlate Shop
            </div>
            <h1 className="mt-5 font-display text-3xl font-black leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-4xl md:text-[3rem]">
              Smart tools for stronger{' '}
              <span className="relative">
                customer connections.
                <span className="absolute -bottom-1 left-0 h-[0.25em] w-full -rotate-1 rounded-full bg-gradient-to-r from-blue-300/50 to-indigo-300/40" aria-hidden="true" />
              </span>
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-500">
              Every NFCPlate product supports NFC tap and QR scan — so every customer can reach your review page or social profile, no app required. Browse stands, cards, stickers, plates, and bundles built for daily business use.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md">
                <Nfc className="h-4 w-4 text-blue-500" /> NFC tap
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md">
                <QrCode className="h-4 w-4 text-blue-500" /> QR scan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md">
                <Smartphone className="h-4 w-4 text-blue-500" /> No app needed
              </span>
            </div>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="absolute -inset-8 rounded-[2.5rem] border border-blue-200/30" />
            <div className="absolute -inset-4 rounded-[2rem] border border-blue-200/20" />
            <div className="relative flex -rotate-6 gap-4">
              <div className="scale-90 drop-shadow-[0_20px_40px_rgba(37,99,235,0.18)]">
                <div className="rounded-3xl border border-white/60 bg-white/50 p-4 backdrop-blur-xl">
                  <ProductVisual type="stand" finish="blue" />
                </div>
              </div>
              <div className="scale-90 self-end pb-8 drop-shadow-[0_20px_40px_rgba(37,99,235,0.18)]">
                <div className="rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-xl">
                  <ProductVisual type="bundle" finish="black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
