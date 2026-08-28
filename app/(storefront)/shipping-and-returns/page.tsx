import type { Metadata } from 'next';
import { Truck, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Shipping & Returns',
  description: 'NFCPlate shipping options, delivery times, and return policy.',
  path: '/shipping-and-returns',
});

const items = [
  {
    icon: Truck,
    title: 'Shipping',
    body: 'Standard U.S. shipping is free on orders $35 and up during our launch offer. Orders typically ship within 1–2 business days. Expedited options will be available in a later phase.',
  },
  {
    icon: Clock,
    title: 'Delivery times',
    body: 'Standard delivery is typically 3–5 business days within the U.S. after shipping. You will receive a confirmation when your order ships.',
  },
  {
    icon: RotateCcw,
    title: 'Returns',
    body: 'We accept returns on unprogrammed products within 30 days of delivery. Products must be in their original condition. Contact support@nfcplate.com to start a return.',
  },
  {
    icon: ShieldCheck,
    title: 'Damaged or incorrect items',
    body: 'If your order arrives damaged or incorrect, contact us within 7 days and we will make it right.',
  },
];

export default function ShippingAndReturnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shipping & Returns', path: '/shipping-and-returns' },
        ])}
      />
      <PageHeader
        eyebrow="Help"
        title="Shipping & Returns"
        description="Everything you need to know about delivery and returns."
      />
      <div className="container-np py-12">
        <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="card-np p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
