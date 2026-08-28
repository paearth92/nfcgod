import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Home, LifeBuoy } from 'lucide-react';
import { Logo } from '@/components/site/logo';

export const metadata: Metadata = {
  title: 'Code not active',
  description: 'This NFCPlate code has been disabled. Contact support to reactivate it.',
  robots: { index: false, follow: true },
};

export default function InactiveCodePage() {
  return (
    <div className="container-np flex min-h-[60vh] items-center py-16">
      <div className="card-np mx-auto w-full max-w-md p-10 text-center">
        <Logo className="justify-center" />

        <span
          className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent"
          aria-hidden="true"
        >
          <LifeBuoy className="h-7 w-7" />
        </span>

        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground">
          This code is not active
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This NFCPlate plate has been disabled. If you believe this is a mistake or you&apos;d like
          to reactivate it, our support team can help.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/contact" className="btn-primary-np">
            Contact support <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/" className="btn-secondary-np">
            <Home className="mr-2 h-4 w-4" /> Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
