'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/site/dashboard-shell';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'business_name' | 'role'
>;

type DashboardAccount = {
  email: string;
  profile: Profile;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [account, setAccount] = React.useState<DashboardAccount | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadAccount() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (userError || !user) {
          router.replace('/auth/sign-in?next=/dashboard');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, business_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (!active) return;

        if (profileError) {
          setLoadError('Your profile could not be loaded. Please refresh and try again.');
          return;
        }

        const profile: Profile = profileData
          ? (profileData as Profile)
          : {
              id: user.id,
              full_name: null,
              business_name: null,
              role: 'customer',
            };

        setAccount({
          email: user.email ?? '',
          profile,
        });
      } catch {
        if (!active) return;
        setLoadError('The dashboard could not be loaded. Please refresh and try again.');
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [router]);

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
        <div className="card-np w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="font-display text-xl font-bold text-foreground">
            Unable to open dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary-np mt-5"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
        <div
          className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading your dashboard…
        </div>
      </main>
    );
  }

  return (
    <DashboardShell email={account.email} profile={account.profile}>
      {children}
    </DashboardShell>
  );
}
