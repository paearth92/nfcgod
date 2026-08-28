import Link from 'next/link';
import {
  Utensils,
  Scissors,
  Stethoscope,
  Wrench,
  Dumbbell,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { industries } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  scissors: Scissors,
  stethoscope: Stethoscope,
  wrench: Wrench,
  dumbbell: Dumbbell,
  'shopping-bag': ShoppingBag,
  hammer: Wrench,
  'heart-pulse': Stethoscope,
};

export function IndustriesSection() {
  const featured = industries.slice(0, 6);
  return (
    <section className="section-pad bg-accent/30">
      <div className="container-np">
        <SectionHeading
          eyebrow="Industries"
          title="Meet customers where business happens."
          description="At the counter, front desk or checkout—make your next review the easiest one to leave."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((industry) => {
            const Icon = iconMap[industry.iconName] ?? ShoppingBag;
            return (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="card-np group flex items-center gap-4 p-5 hover:-translate-y-0.5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">{industry.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {industry.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/industries" className="btn-secondary-np inline-flex">
            View all industries
          </Link>
        </div>
      </div>
    </section>
  );
}
