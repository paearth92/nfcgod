export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
        <div className="h-7 w-48 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded bg-secondary/70" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-np p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-secondary/70" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="card-np divide-y divide-border overflow-hidden">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-24 animate-pulse rounded bg-secondary/70" />
                </div>
                <div className="h-5 w-12 animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
