'use client';

import Link from 'next/link';

/**
 * Error boundary for auth routes. Renders a friendly card with a retry link.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card-np w-full max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 text-destructive"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </span>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We couldn&apos;t load this page. Please try again.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Error reference: {error.digest}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary-np w-full sm:flex-1">
          Try again
        </button>
        <Link href="/" className="btn-secondary-np w-full sm:flex-1">
          Back to home
        </Link>
      </div>
    </div>
  );
}
