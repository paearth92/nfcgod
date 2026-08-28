import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Home, LifeBuoy } from 'lucide-react';
import { Logo } from '@/components/site/logo';

export const metadata: Metadata = {
  title: 'Invalid code',
  description: 'This NFCPlate code is not valid. Check the code on your plate and try again.',
  robots: { index: false, follow: true },
};

export default function InvalidCodePage() {
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
          This code isn&apos;t valid
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t find a NFCPlate plate matching that code. It may have been mistyped —
          double-check the characters printed on your plate and try tapping it again.
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
