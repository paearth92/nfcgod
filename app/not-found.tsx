import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-np flex min-h-[50vh] items-center py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" className="btn-primary-np mt-6 inline-flex">
          Back to home <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
