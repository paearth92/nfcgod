import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ProductBrowser } from '@/components/site/product-browser';
import { getCategoryBySlug, getProductsByCategory, categories } from '@/lib/products';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

interface CollectionPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: CollectionPageProps): Metadata {
  const category = getCategoryBySlug(params.slug);
  if (!category) return pageMetadata({ title: 'Collection', description: '', path: '/shop' });
  return pageMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: category.href,
  });
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();
  const items = getProductsByCategory(params.slug);
  const relatedCollections = category.relatedCollectionSlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: category.name, path: category.href },
        ])}
      />
      {/* Collection header */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-np py-8 md:py-10">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              { name: category.name },
            ]}
            className="mb-4"
          />
          <p className="eyebrow">{category.shortName}</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {category.description}
          </p>
          {/* Benefits */}
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {category.benefits.map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/85">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-np py-10 md:py-12">
        <ProductBrowser
          products={items}
          lockedCategories={[params.slug]}
          initialFilters={{ categories: [params.slug] }}
        />

        {/* Educational section */}
        <section className="mt-12 rounded-2xl border border-border bg-accent/20 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{category.education.heading}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {category.education.body}
              </p>
            </div>
          </div>
        </section>

        {/* Collection FAQ */}
        {category.faqs.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">{category.name} FAQ</h2>
            <Accordion type="single" collapsible className="mt-4">
              {category.faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        {/* Related collections + guides */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {relatedCollections.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Related collections</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {relatedCollections.map((rc) => (
                  <li key={rc.slug}>
                    <Link
                      href={rc.href}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {rc.name} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Learn more</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/guides/how-nfc-works" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  How NFC works <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/setup" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  Product setup <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/nfc-compatibility" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  NFC compatibility <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
