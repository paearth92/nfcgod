'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { DashboardProfileForm } from '@/components/site/dashboard-profile-form';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'business_name' | 'role' | 'created_at'
>;

type ProfileData = {
  email: string;
  profile: Profile | null;
};

export default function DashboardProfilePage() {
  const router = useRouter();
  const [data, setData] = React.useState<ProfileData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        router.replace('/auth/sign-in?next=/dashboard/profile');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, role, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setData({
        email: user.email ?? '',
        profile: profileData as Profile | null,
      });
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="card-np p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-display text-xl font-bold">Profile could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          ← Overview
        </Link>
      </nav>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardProfileForm
            fullName={data.profile?.full_name ?? null}
            businessName={data.profile?.business_name ?? null}
          />
        </div>

        <div className="space-y-6">
          <div className="card-np p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Email</h2>
            <p className="mt-2 break-all text-sm font-medium text-foreground">{data.email}</p>
          </div>

          <div className="card-np p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Account</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium capitalize text-foreground">{data.profile?.role ?? 'customer'}</dd>
              </div>
              {data.profile?.created_at ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="text-foreground">
                    {new Date(data.profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="card-np p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Session</h2>
            <form action="/auth/sign-out" method="POST" className="mt-3">
              <button type="submit" className="btn-secondary-np w-full">Sign out</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
