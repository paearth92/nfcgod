import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { guides } from '@/lib/content';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Guides — Learn How NFC Review Products Work',
  description:
    'Plain-language guides on NFC, product setup, compatibility, and getting more genuine reviews.',
  path: '/guides',
});

const categoryOrder: Array<{ key: string; label: string }> = [
  { key: 'Getting started', label: 'Getting started' },
  { key: 'NFC', label: 'NFC' },
  { key: 'Setup', label: 'Setup' },
  { key: 'Platforms', label: 'Platforms' },
];

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ])}
      />
      <PageHeader
        eyebrow="Resources"
        title="Guides"
        description="Plain-language guides on NFC, product setup, compatibility, and getting more genuine reviews."
      />
      <div className="container-np py-12">
        <div className="space-y-10">
          {categoryOrder.map((cat) => {
            const items = guides.filter((g) => g.category === cat.key);
            if (items.length === 0) return null;
            return (
              <section key={cat.key}>
                <h2 className="text-base font-semibold text-foreground">{cat.label}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="card-np group flex flex-col gap-2 p-5 hover:-translate-y-0.5"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {guide.category}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {guide.readTime}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
