import { SectionHeading } from './section-heading';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';
import { getProductBySlug } from '@/lib/products';

export function RelatedProducts({ product }: { product: Product }) {
  const related = product.relatedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (related.length === 0) return null;

  return (
    <section className="py-12">
      <SectionHeading
        eyebrow="Related"
        title="You might also like"
        align="left"
        className="max-w-xl"
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
