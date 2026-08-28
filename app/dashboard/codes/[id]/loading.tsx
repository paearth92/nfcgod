/**
 * Loading skeleton for the code detail page.
 */
export default function CodeDetailLoading() {
  return (
    <div aria-hidden="true">
      {/* Breadcrumb */}
      <div className="mb-4 h-4 w-20 animate-pulse rounded bg-secondary" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-secondary" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Edit card */}
          <div className="card-np p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-secondary" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-secondary" />
            <div className="mt-4 space-y-3">
              <div>
                <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
                <div className="mt-1.5 h-11 w-full animate-pulse rounded-lg bg-secondary" />
              </div>
              <div className="flex gap-3">
                <div className="h-11 w-36 animate-pulse rounded-lg bg-secondary" />
                <div className="h-11 w-28 animate-pulse rounded-lg bg-secondary" />
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
              <div className="mt-2 flex gap-2">
                <div className="h-11 flex-1 animate-pulse rounded-lg bg-secondary" />
                <div className="h-11 w-20 animate-pulse rounded-lg bg-secondary" />
              </div>
            </div>
          </div>

          {/* Activity card */}
          <div className="card-np p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* QR card */}
          <div className="card-np p-6">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
            <div className="mt-4 flex justify-center rounded-lg border border-border bg-white p-4">
              <div className="h-[200px] w-[200px] animate-pulse rounded bg-secondary" />
            </div>
          </div>

          {/* Details card */}
          <div className="card-np p-6">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
            <div className="mt-4 space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
