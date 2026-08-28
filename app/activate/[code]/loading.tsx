import { Logo } from '@/components/site/logo';

export default function ActivateLoading() {
  return (
    <div className="container-np flex min-h-[60vh] items-center justify-center py-16">
      <div className="card-np mx-auto w-full max-w-md p-10 text-center">
        <Logo className="justify-center" />

        <div
          className="mx-auto mt-8 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-hidden="true"
        />

        <p className="mt-5 text-sm text-muted-foreground">Preparing your activation…</p>
      </div>
    </div>
  );
}
