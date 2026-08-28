import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Utensils,
  Scissors,
  Stethoscope,
  Wrench,
  Dumbbell,
  ShoppingBag,
  Hammer,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { industries } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';
import { breadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Industries — NFC Review Products for Every Business',
  description:
    'NFCPlate products work wherever business happens. Find your industry and see how a one-tap review product fits your counter.',
  path: '/industries',
});

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  scissors: Scissors,
  stethoscope: Stethoscope,
  wrench: Wrench,
  dumbbell: Dumbbell,
  'shopping-bag': ShoppingBag,
  hammer: Hammer,
  'heart-pulse': HeartPulse,
};

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Industries', path: '/industries' },
        ])}
      />
      <PageHeader
        eyebrow="Industries"
        title="Meet customers where business happens."
        description="At the counter, front desk or checkout—make your next review the easiest one to leave."
      />
      <div className="container-np py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const Icon = iconMap[industry.iconName] ?? ShoppingBag;
            return (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="card-np group flex flex-col gap-3 p-6 hover:-translate-y-0.5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="text-base font-semibold text-foreground">{industry.name}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{industry.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
