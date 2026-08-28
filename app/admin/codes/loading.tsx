export default function AdminCodesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
        <div className="h-7 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-56 animate-pulse rounded bg-secondary/70" />
      </div>
      <div className="card-np p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
      <div className="card-np overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <div className="h-4 w-4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-secondary/70" />
            <div className="h-4 w-32 animate-pulse rounded bg-secondary/70" />
            <div className="ml-auto h-4 w-28 animate-pulse rounded bg-secondary/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
