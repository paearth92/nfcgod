import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'The terms that govern your use of NFCPlate products and services.',
  path: '/terms',
});

const sections = [
  {
    title: 'Acceptance of terms',
    body: 'By accessing or using NFCPlate, you agree to these terms. If you do not agree, please do not use the site or products.',
  },
  {
    title: 'Products',
    body: 'NFCPlate products are programmable NFC and QR products that open the link you set. You are responsible for the link you program and for compliance with the platform it points to.',
  },
  {
    title: 'Genuine reviews',
    body: 'NFCPlate products are designed to help you collect genuine customer reviews. We do not support review gating, incentivized reviews, or any practice that misrepresents customer feedback.',
  },
  {
    title: 'No affiliation',
    body: 'NFCPlate is not affiliated with or endorsed by Google, Instagram, Facebook, Yelp, or any other platform. Product names and logos belong to their respective owners.',
  },
  {
    title: 'Limitation of liability',
    body: 'NFCPlate products are tools to help you collect reviews. We do not guarantee specific review quantities, ratings, or ranking improvements.',
  },
  {
    title: 'Changes',
    body: 'We may update these terms from time to time. Continued use after changes constitutes acceptance.',
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ])}
      />
      <PageHeader eyebrow="Legal" title="Terms of Service" description="The terms that govern your use of NFCPlate products and services." />
      <div className="container-np py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
