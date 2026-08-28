import Link from 'next/link';
import { ArrowRight, SearchX } from 'lucide-react';

export function EmptyProductState({ message }: { message?: string }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-border bg-accent/20 p-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
        <SearchX className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">No products match your filters</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? 'Try adjusting your filters or sorting to see more products.'}
      </p>
      <Link href="/shop" className="btn-secondary-np mt-5 inline-flex">
        Clear filters <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
