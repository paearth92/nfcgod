/**
 * Loading skeleton for the My Codes page.
 */
export default function CodesLoading() {
  return (
    <div aria-hidden="true">
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <div className="mb-2 h-4 w-20 animate-pulse rounded bg-secondary" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-secondary" />
      </div>

      {/* Controls skeleton */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-11 flex-1 animate-pulse rounded-lg bg-secondary" />
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>

      {/* Table skeleton (desktop) */}
      <div className="card-np hidden overflow-hidden lg:block">
        <div className="border-b border-border bg-secondary/40 px-5 py-3">
          <div className="flex gap-8">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-16 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-8 px-5 py-3.5">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
              <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
              <div className="ml-auto h-4 w-8 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      </div>

      {/* Cards skeleton (mobile) */}
      <div className="space-y-3 lg:hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-np p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
