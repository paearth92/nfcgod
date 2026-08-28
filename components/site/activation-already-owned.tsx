'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Home, LifeBuoy } from 'lucide-react';
import { Logo } from '@/components/site/logo';
import { createClient } from '@/lib/supabase/client';

export function ActivationAlreadyOwned({
  codeId,
  ownerId,
}: {
  codeId: string;
  ownerId: string | null;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setChecking(false);
      return;
    }
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (user && user.id === ownerId) {
        router.replace(`/dashboard/codes/${codeId}`);
      } else {
        setChecking(false);
      }
    });
    return () => { cancelled = true; };
  }, [codeId, ownerId, router]);

  if (checking) {
    return (
      <div className="container-np flex min-h-[60vh] items-center justify-center py-16">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

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
          This code has already been activated
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This NFCPlate plate is already linked to an account. If you believe this is an error, our
          support team can help sort it out.
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
