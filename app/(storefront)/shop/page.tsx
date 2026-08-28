import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ShopHero } from '@/components/site/shop-hero';
import { ProductBrowser } from '@/components/site/product-browser';
import { products, categories } from '@/lib/products';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Shop NFC + QR Review Products',
  description:
    'Browse all NFCPlate NFC + QR review products — stands, cards, stickers, plates, bundles, and social products. Tap or scan to your review page.',
  path: '/shop',
});

export default function ShopPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />
      <ShopHero />
      <div className="bg-mesh py-10 md:py-12">
        <div className="container-np">
          {/* Category chips */}
          <div className="mb-8 flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className="rounded-full border border-blue-300/40 bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)] backdrop-blur-md"
            >
              All products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className="rounded-full border border-white/60 bg-white/60 px-5 py-2 text-xs font-semibold text-slate-600 backdrop-blur-md transition-all hover:border-blue-200 hover:bg-white/80 hover:text-blue-600 hover:shadow-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <ProductBrowser products={products} />

          <div className="mt-12 rounded-2xl border border-white/60 bg-white/60 p-7 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-bold text-slate-900">Why NFCPlate products</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'NFC tap opens your review page instantly',
                'Printed QR backup for non-NFC phones',
                'Works with iPhone and Android',
                'No app required for your customers',
                'Programmable to your review link',
                'Genuine reviews only — no gating, ever',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/how-it-works"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              See how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
