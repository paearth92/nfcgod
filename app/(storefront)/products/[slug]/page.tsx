import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  ArrowRight,
  Nfc,
  QrCode,
  Ruler,
  Package,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { products, getProductBySlug, formatPrice, getStartingPrice } from '@/lib/products';
import { getReviewSummary } from '@/lib/reviews';
import { pageMetadata, breadcrumbSchema, productSchema, faqPageSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';
import { ProductGallery } from '@/components/site/product-gallery';
import { ProductInfoPanel } from '@/components/site/product-info-panel';
import { StickyPurchaseBar } from '@/components/site/sticky-purchase-bar';
import { TrustStrip } from '@/components/site/trust-strip';
import { ProductBenefits } from '@/components/site/product-benefits';
import { TapOrScanExplanation } from '@/components/site/tap-or-scan-explanation';
import { ProductComparison } from '@/components/site/product-comparison';
import { ProductSpecifications } from '@/components/site/product-specifications';
import { ProductFAQ } from '@/components/site/product-faq';
import { ReviewsSection } from '@/components/site/reviews-section';
import { RelatedProducts } from '@/components/site/related-products';
import { RecentlyViewed } from '@/components/site/recently-viewed';

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return pageMetadata({ title: 'Product', description: '', path: '/shop' });
  return pageMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/products/${product.slug}`,
  });
}

const compatibilityRows = [
  { device: 'iPhone 7 and newer', nfc: true },
  { device: 'Google Pixel 2 and newer', nfc: true },
  { device: 'Samsung Galaxy S8 and newer', nfc: true },
  { device: 'Most Android phones from 2018+', nfc: true },
  { device: 'Older or non-NFC phones', nfc: false },
];

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const reviewSummary = getReviewSummary(product.slug);
  const schemaData = ([
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: product.name, path: `/products/${product.slug}` },
    ]),
    productSchema(
      product.slug,
      reviewSummary ? { average: reviewSummary.average, count: reviewSummary.count } : undefined
    ),
    faqPageSchema(product),
  ].filter(Boolean) as Record<string, unknown>[]);

  return (
    <>
      <JsonLd data={schemaData} />

      {/* Gallery + Info */}
      <div className="bg-mesh py-6 md:py-10">
      <div className="container-np">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery product={product} />
          <ProductInfoPanel product={product} />
        </div>
      </div>
      </div>

      {/* Trust strip */}
      <div className="container-np">
        <TrustStrip />
      </div>

      {/* Benefits storytelling */}
      <div className="container-np">
        <ProductBenefits product={product} />
      </div>

      {/* Tap or scan explanation */}
      <TapOrScanExplanation />

      {/* Product comparison */}
      <div className="container-np">
        <ProductComparison product={product} />
      </div>

      {/* Specifications */}
      <div className="container-np">
        <ProductSpecifications specs={product.specifications} />
      </div>

      {/* Compatibility */}
      <section className="py-12 bg-gradient-to-b from-white/80 to-blue-50/40">
        <div className="container-np">
          <h2 className="text-lg font-bold text-slate-900">Phone compatibility</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Most modern phones support NFC taps. The printed QR code covers everything else.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.08)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Device</th>
                  <th className="px-5 py-3.5 font-semibold">NFC tap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {compatibilityRows.map((row) => (
                  <tr key={row.device}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.device}</td>
                    <td className="px-5 py-3.5">
                      {row.nfc ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Supported
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-600">
                          <QrCode className="h-4 w-4" /> Use QR scan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Setup, specs, care, shipping accordions */}
      <section className="py-12 bg-mesh">
        <div className="container-np">
          <h2 className="text-lg font-bold text-slate-900">Product details</h2>
          <Accordion type="single" collapsible className="mt-4" defaultValue="details">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                Product details
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>{product.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dimensions">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" /> Dimensions and materials</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <dl className="space-y-2">
                  {product.specifications.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="font-medium text-foreground">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="included">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> What is included</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="space-y-1.5">
                  {product.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="setup">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Setup and programming</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>Each NFCPlate product is programmable. You set your review link once and the product opens that page on every tap or scan. See the <Link href="/setup" className="text-primary hover:underline">Product Setup</Link> page for step-by-step instructions.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="compatibility">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                Phone compatibility
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>iPhone 7 and newer support NFC taps natively, as do most modern Android devices. For older or non-NFC phones, the printed QR code provides the same one-step experience.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                Care guidance
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>{product.careGuide?.body ?? 'Wipe with a soft, dry cloth. Avoid abrasive cleaners.'}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Shipping and returns</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free U.S. shipping on orders $35+. Ships within 1–2 business days.</p>
                <p className="mt-2 flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> Returns on unprogrammed products within 30 days. See <Link href="/shipping-and-returns" className="text-primary hover:underline">Shipping & Returns</Link>.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Reviews */}
      <div className="container-np">
        <ReviewsSection product={product} />
      </div>

      {/* FAQ */}
      <div className="container-np">
        <ProductFAQ product={product} />
      </div>

      {/* Related products */}
      <div className="container-np">
        <RelatedProducts product={product} />
      </div>

      {/* Recently viewed */}
      <div className="container-np">
        <RecentlyViewed currentSlug={product.slug} />
      </div>

      {/* Product-specific CTA */}
      <section className="py-12 bg-mesh">
        <div className="container-np">
          <div className="relative overflow-hidden rounded-[2rem] border border-blue-300/20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 px-6 py-12 text-center text-white shadow-[0_24px_60px_-30px_rgba(37,99,235,0.5)] sm:px-12">
            <div className="absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full border-[36px] border-white/8" />
            <div className="absolute -bottom-20 -right-14 -z-10 h-56 w-56 rounded-full border-[36px] border-white/6" />
            <h2 className="font-display text-xl font-black tracking-tight sm:text-2xl">
              Put your {product.shortDescription.toLowerCase()} one tap away.
            </h2>
            <p className="mt-2 text-sm text-white/85">
              Add the {product.name} to your cart and start connecting with customers.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-50 active:scale-[0.98]"
            >
              Shop NFCPlate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky mobile purchase bar */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <StickyPurchaseBar product={product} />
    </>
  );
}
