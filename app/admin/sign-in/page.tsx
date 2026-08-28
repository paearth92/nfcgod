import Link from 'next/link';
import { Logo } from '@/components/site/logo';
import { PortalSignInForm } from '@/components/site/portal-sign-in-form';

export const metadata = {
  title: 'Admin sign in · NFCPlate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSignInPage({
  searchParams,
}: {
  searchParams?: {
    next?: string;
  };
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-grid-subtle px-5 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center">
        <Link
          href="/"
          className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="Return to NFCPlate home"
        >
          <Logo />
        </Link>

        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Admin Portal
        </p>
      </div>

      <PortalSignInForm
        portal="admin"
        next={searchParams?.next}
      />
    </main>
  );
}
