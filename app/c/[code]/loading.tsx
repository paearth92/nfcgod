import { Logo } from '@/components/site/logo';

export default function Loading() {
  return (
    <div className="container-np flex min-h-[60vh] items-center justify-center py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo />
        <div className="flex items-center gap-3 text-muted-foreground">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent"
            aria-hidden="true"
          />
          <span className="text-sm font-medium">Redirecting…</span>
        </div>
      </div>
    </div>
  );
}
