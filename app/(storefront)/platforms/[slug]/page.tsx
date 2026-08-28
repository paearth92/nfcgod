import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { FinalCta } from '@/components/site/final-cta';
import { platforms } from '@/lib/products';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

interface PlatformPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return platforms.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PlatformPageProps): Metadata {
  const platform = platforms.find((p) => p.slug === params.slug);
  if (!platform) return pageMetadata({ title: 'Platform', description: '', path: '/shop' });
  return pageMetadata({
    title: `${platform.name} — NFCPlate`,
    description: platform.description,
    path: platform.href,
  });
}

const platformContent: Record<string, { benefits: string[] }> = {
  google: {
    benefits: [
      'Direct link to your Google review page',
      'NFC tap opens the page in one second',
      'QR backup for every non-NFC phone',
      'Genuine reviews only — no gating',
    ],
  },
  instagram: {
    benefits: [
      'Open your Instagram profile with one tap',
      'Help customers follow you before they leave',
      'QR backup included on every product',
      'Great for counters and checkout',
    ],
  },
  facebook: {
    benefits: [
      'Send customers straight to your Facebook page',
      'Build your following with one tap',
      'QR backup for non-NFC phones',
      'Programmable to any Facebook URL',
    ],
  },
  yelp: {
    benefits: [
      'Direct link to your Yelp review page',
      'NFC tap plus QR backup',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
  },
  'multi-link': {
    benefits: [
      'One tap opens all your links',
      'Send customers to a single link page',
      'QR backup included',
      'Update your links anytime',
    ],
  },
};

export default function PlatformPage({ params }: PlatformPageProps) {
  const platform = platforms.find((p) => p.slug === params.slug);
  if (!platform) notFound();
  const content = platformContent[platform.slug] ?? { benefits: [] };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/shop' },
          { name: platform.name, path: platform.href },
        ])}
      />
      <PageHeader
        eyebrow="Solutions"
        title={
          platform.slug === 'google'
            ? 'Get Google reviews with one tap'
            : platform.slug === 'instagram'
            ? 'Grow on Instagram with one tap'
            : platform.slug === 'facebook'
            ? 'Connect on Facebook with one tap'
            : platform.slug === 'yelp'
            ? 'Yelp review products with one tap'
            : 'Multi-link products with one tap'
        }
        description={platform.description}
      />
      <div className="container-np py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Why it works</h2>
            <ul className="mt-4 space-y-3">
              {content.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
              Shop {platform.name} products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <aside className="rounded-xl border border-border bg-accent/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/collections/review-stands" className="text-primary hover:underline">Review Stands</Link></li>
              <li><Link href="/collections/review-cards" className="text-primary hover:underline">Review Cards</Link></li>
              <li><Link href="/collections/bundles" className="text-primary hover:underline">Bundles</Link></li>
              <li><Link href="/how-it-works" className="text-primary hover:underline">How it works</Link></li>
            </ul>
          </aside>
        </div>
      </div>
      <FinalCta />
    </>
  );
}
