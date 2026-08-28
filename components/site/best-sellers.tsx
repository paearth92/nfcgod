import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { ProductCard } from './product-card';
import { getBestSellers } from '@/lib/products';

export function BestSellers() {
  const products = getBestSellers();
  return (
    <section className="section-pad">
      <div className="container-np">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Best sellers"
            title="Small tools. Big business impact."
            description="The products businesses reach for first — built for the counter, the pocket, and everywhere in between."
            align="left"
            className="max-w-xl"
          />
          <Link
            href="/shop"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="btn-secondary-np inline-flex">
            View all products
          </Link>
        </div>
      </div>
    </section>
  );
}
