export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        Loading your dashboard…
      </div>
    </div>
  );
}