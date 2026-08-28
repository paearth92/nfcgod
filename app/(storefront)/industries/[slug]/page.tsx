import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { FinalCta } from '@/components/site/final-cta';
import { industries, getIndustryBySlug } from '@/lib/content';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

interface IndustryPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export function generateMetadata({ params }: IndustryPageProps): Metadata {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) return pageMetadata({ title: 'Industry', description: '', path: '/industries' });
  return pageMetadata({
    title: `${industry.name} — NFC Review Products`,
    description: industry.description,
    path: `/industries/${industry.slug}`,
  });
}

export default function IndustryPage({ params }: IndustryPageProps) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Industries', path: '/industries' },
          { name: industry.name, path: `/industries/${industry.slug}` },
        ])}
      />
      <PageHeader
        eyebrow="Industry"
        title={industry.name}
        description={industry.description}
      />
      <div className="container-np py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">
              How NFCPlate works for {industry.name.toLowerCase()}
            </h2>
            <ul className="mt-4 space-y-3">
              {[
                'Place a NFCPlate stand or card where customers finish their visit',
                'Customers tap with their phone or scan the QR code',
                'Your review page opens directly — no app, no searching',
                'Collect genuine reviews from happy customers',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
              Shop review products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <aside className="rounded-xl border border-border bg-accent/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">Recommended products</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/collections/review-stands" className="text-primary hover:underline">
                  Review Stands
                </Link>
              </li>
              <li>
                <Link href="/collections/review-cards" className="text-primary hover:underline">
                  Review Cards
                </Link>
              </li>
              <li>
                <Link href="/collections/bundles" className="text-primary hover:underline">
                  Bundles
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
      <FinalCta />
    </>
  );
}
