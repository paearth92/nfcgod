'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { Logo } from '@/components/site/logo';

export default function ActivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error boundary digest to the console for debugging.
    // Avoid logging the full error object in production paths.
    console.error('Activation page error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-np flex min-h-[60vh] items-center py-16">
      <div className="card-np mx-auto w-full max-w-md p-10 text-center">
        <Logo className="justify-center" />

        <h1 className="mt-8 font-display text-2xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We hit a snag loading this activation. You can try again, or head back home.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-primary-np">
            Try again <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <Link href="/" className="btn-secondary-np">
            <Home className="mr-2 h-4 w-4" /> Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
