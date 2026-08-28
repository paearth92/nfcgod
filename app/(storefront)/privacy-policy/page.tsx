import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How NFCPlate collects, uses, and protects your information.',
  path: '/privacy-policy',
});

const sections = [
  {
    title: 'Overview',
    body: 'NFCPlate respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. This is a foundation policy; detailed provisions will be expanded in a later phase.',
  },
  {
    title: 'Information we collect',
    body: 'When you place an order, contact us, or subscribe to our newsletter, we may collect your name, email address, shipping address, and order details. We do not sell your personal information.',
  },
  {
    title: 'How we use information',
    body: 'We use your information to process orders, respond to support requests, send order updates, and — only if you opt in — share occasional growth tips. You can unsubscribe at any time.',
  },
  {
    title: 'Cookies and analytics',
    body: 'We may use cookies and privacy-friendly analytics to understand how the site is used. You can control cookies through your browser settings.',
  },
  {
    title: 'Your choices',
    body: 'You can request access to, correction of, or deletion of your personal information by contacting support@nfcplate.com.',
  },
  {
    title: 'Contact',
    body: 'Questions about this policy? Email support@nfcplate.com.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy-policy' },
        ])}
      />
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="How NFCPlate collects, uses, and protects your information." />
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
