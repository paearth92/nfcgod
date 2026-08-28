'use client';

import * as React from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="card-np max-w-md p-8">
        <p className="eyebrow">Error</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The admin portal hit an unexpected error while loading this page. You can try again or head back to the dashboard.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground/70">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary-np">
            Try again
          </button>
          <Link href="/admin" className="btn-secondary-np">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
