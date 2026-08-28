'use client';

import * as React from 'react';
import Link from 'next/link';

/**
 * Dashboard error boundary.
 *
 * Catches runtime errors in any dashboard route segment and shows a
 * friendly message with a retry button and a link back to the overview.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log to the console for debugging; in production this would go to
    // an error reporting service.
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We hit an unexpected error while loading your dashboard. Please try again.
        If the problem persists, contact support.
      </p>

      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted-foreground/70">
          Error ID: {error.digest}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary-np">
          Try again
        </button>
        <Link href="/dashboard" className="btn-secondary-np">
          Back to overview
        </Link>
      </div>
    </div>
  );
}
