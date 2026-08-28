import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  Nfc,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { FinalCta } from '@/components/site/final-cta';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';
import { breadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'How It Works — NFC Reviews in Seconds',
  description:
    'See how a NFCPlate NFC product turns a happy customer into a genuine review in seconds. Place it, tap or scan, leave a review.',
  path: '/how-it-works',
});

const steps = [
  {
    icon: Smartphone,
    title: '1. Place it',
    description: 'Set your NFCPlate product where customers naturally finish their visit — the counter, front desk, or checkout.',
  },
  {
    icon: Nfc,
    title: '2. Tap or scan',
    description: 'Customers tap the NFC spot with their phone, or scan the printed QR code. No app to download.',
  },
  {
    icon: QrCode,
    title: '3. Leave a review',
    description: 'Your genuine review page opens directly. The customer writes their review — that is it.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'How It Works', path: '/how-it-works' },
        ])}
      />
      <PageHeader
        eyebrow="How it works"
        title="From happy customer to new review—in seconds."
        description="NFCPlate products use NFC and a printed QR backup to open your review page the moment a customer is ready to leave a review."
      />
      <div className="container-np py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="card-np p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 rounded-2xl border border-border bg-accent/20 p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Why NFC + QR together</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              NFC gives the fastest experience for modern phones. The printed QR code ensures every customer can reach your review page — even on older devices. Every NFCPlate product includes both.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'iPhone 7 and newer support NFC taps natively',
                'Most modern Android phones support NFC',
                'The QR code covers every other phone',
                'No app download required for your customer',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-xl bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-foreground">Genuine reviews only</h3>
            <p className="text-sm text-muted-foreground">
              NFCPlate does not use review gating. Every customer is directed to the same review page — no filtering positive from negative feedback. We help you collect honest reviews.
            </p>
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Read FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <FinalCta />
    </>
  );
}
