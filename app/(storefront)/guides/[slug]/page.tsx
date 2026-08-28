import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { guides, getGuideBySlug } from '@/lib/content';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

interface GuidePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: GuidePageProps): Metadata {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return pageMetadata({ title: 'Guide', description: '', path: '/guides' });
  return pageMetadata({
    title: `${guide.title} — NFCPlate Guide`,
    description: guide.description,
    path: `/guides/${guide.slug}`,
  });
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />
      <PageHeader eyebrow={guide.category} title={guide.title} description={guide.description}>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {guide.readTime} read
        </p>
      </PageHeader>
      <div className="container-np py-12">
        <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-foreground/85">
          <p>
            This guide is part of the NFCPlate resource library. In Phase 1 we are shipping the
            foundation page so every link resolves to a real, connected route. The full guide
            content for <strong>{guide.title}</strong> will be published in a later phase.
          </p>
          <p>
            In the meantime, here is the short version: NFCPlate products use NFC and a printed QR
            code to open your review page the moment a customer is ready to leave a review. Place
            the product where customers finish their visit, let them tap or scan, and your review
            page opens directly — no app required.
          </p>
          <div className="rounded-xl border border-border bg-accent/30 p-5">
            <h2 className="text-base font-semibold text-foreground">Next steps</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/setup" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  Product setup <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link href="/nfc-compatibility" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  NFC compatibility <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  FAQs <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </>
  );
}
