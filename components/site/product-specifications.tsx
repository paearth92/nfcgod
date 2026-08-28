import type { ProductSpecification } from '@/lib/types';

export function ProductSpecifications({ specs }: { specs: ProductSpecification[] }) {
  return (
    <section className="py-12">
      <h2 className="text-lg font-semibold text-foreground">Specifications</h2>
      <dl className="mt-4 overflow-hidden rounded-xl border border-border">
        {specs.map((spec, index) => (
          <div key={spec.label} className={`flex justify-between gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-card' : 'bg-accent/20'} ${index > 0 ? 'border-t border-border' : ''}`}>
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="font-medium text-foreground text-right">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
