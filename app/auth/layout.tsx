import { Logo } from '@/components/site/logo';

export const metadata = {
  title: 'Account · NFCPlate',
  robots: { index: false, follow: false },
};

/**
 * Centered, distraction-free layout for all auth pages.
 * Renders the NFCPlate logo at the top and centers content.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-grid-subtle px-5 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center">
        <Logo />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Account
        </p>
      </div>
      <div className="container-np flex w-full flex-col items-center">{children}</div>
    </div>
  );
}
