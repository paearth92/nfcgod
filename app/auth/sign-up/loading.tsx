/**
 * Loading skeleton for the sign-up page.
 */
export default function SignUpLoading() {
  return (
    <div className="card-np w-full max-w-md p-6 sm:p-8" aria-hidden="true">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-4 h-9 w-9 animate-pulse rounded-md bg-secondary" />
        <div className="h-7 w-48 animate-pulse rounded-md bg-secondary" />
        <div className="mt-3 h-4 w-60 animate-pulse rounded bg-secondary" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-secondary" />
        </div>
        <div>
          <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-secondary" />
        </div>
        <div>
          <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-secondary" />
        </div>
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-secondary" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-lg bg-secondary" />
        <div className="mx-auto h-4 w-48 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
