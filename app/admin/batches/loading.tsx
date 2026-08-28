export default function AdminBatchesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
          <div className="h-7 w-40 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-11 w-32 animate-pulse rounded-lg bg-secondary" />
      </div>
      <div className="card-np overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
            <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-16 animate-pulse rounded bg-secondary/70" />
            <div className="h-4 w-48 animate-pulse rounded bg-secondary/70" />
            <div className="ml-auto h-5 w-10 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-24 animate-pulse rounded bg-secondary/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
