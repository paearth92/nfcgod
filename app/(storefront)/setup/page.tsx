import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Nfc, QrCode, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Product Setup — Set Your Review Link',
  description:
    'Step-by-step instructions to program your NFCPlate product with your Google review link.',
  path: '/setup',
});

export default function SetupPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Product Setup', path: '/setup' },
        ])}
      />
      <PageHeader
        eyebrow="Help"
        title="Product Setup"
        description="Set your NFCPlate product to open your review page in a few simple steps."
      />
      <div className="container-np py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <ol className="space-y-5">
            {[
              {
                title: 'Find your review link',
                body: 'Open your Google business profile and copy your review link. Need help generating one? Use our free Google Review Link Generator.',
              },
              {
                title: 'Tap your NFCPlate product',
                body: 'With your phone unlocked, tap the NFC spot on your NFCPlate product. The default setup page opens in your browser.',
              },
              {
                title: 'Paste your review link',
                body: 'Paste your review link into the setup field and confirm. Your product is now programmed to open that link on every tap.',
              },
              {
                title: 'Test it',
                body: 'Tap your product again with your phone to confirm your review page opens directly. The printed QR code opens the same page.',
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="grid gap-3 rounded-xl border border-border bg-accent/30 p-5 sm:grid-cols-3">
            <span className="flex items-center gap-2 text-sm text-foreground/85">
              <Nfc className="h-4 w-4 text-primary" /> NFC programmable
            </span>
            <span className="flex items-center gap-2 text-sm text-foreground/85">
              <QrCode className="h-4 w-4 text-primary" /> QR backup included
            </span>
            <span className="flex items-center gap-2 text-sm text-foreground/85">
              <Smartphone className="h-4 w-4 text-primary" /> iPhone & Android
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Good to know</h2>
            <ul className="mt-3 space-y-2">
              {[
                'You can update your link at any time — re-tap to reprogram',
                'One product, one link — perfect for a single review page',
                'No app required for you or your customers',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/tools/google-review-link-generator"
              className="btn-primary-np mt-5 inline-flex"
            >
              Generate your review link <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
