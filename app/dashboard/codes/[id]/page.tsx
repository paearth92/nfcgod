'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { DashboardCodeEdit } from '@/components/site/dashboard-code-edit';
import { createClient } from '@/lib/supabase/client';
import { formatCode, permanentCodeUrl } from '@/lib/code-utils';
import type { Database } from '@/lib/supabase/database.types';

type Code = Pick<
  Database['public']['Tables']['codes']['Row'],
  'id' | 'code' | 'status' | 'destination_url' | 'owner_id' | 'activated_at' | 'created_at'
>;

export default function DashboardCodePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [code, setCode] = React.useState<Code | null>(null);
  const [scanCount, setScanCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        router.replace('/auth/sign-in?next=/dashboard/codes');
        return;
      }

      const { data, error: codeError } = await supabase
        .from('codes')
        .select('id, code, status, destination_url, owner_id, activated_at, created_at')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!active) return;
      if (codeError) {
        setError(codeError.message);
        return;
      }
      if (!data) {
        router.replace('/dashboard/codes');
        return;
      }

      const { count, error: countError } = await supabase
        .from('code_events')
        .select('id', { count: 'exact', head: true })
        .eq('code_id', params.id)
        .eq('event_type', 'redirect');

      if (!active) return;
      if (countError) {
        setError(countError.message);
        return;
      }

      setCode(data as Code);
      setScanCount(count ?? 0);
    }

    void load();
    return () => { active = false; };
  }, [params.id, router]);

  if (error) {
    return (
      <div className="card-np p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-display text-xl font-bold">Code could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link href="/dashboard/codes" className="btn-secondary-np mt-5">Back to My Codes</Link>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading code…
      </div>
    );
  }

  const url = permanentCodeUrl(code.code);

  return (
    <div className="animate-fade-in-up space-y-6">
      <Link href="/dashboard/codes" className="text-sm text-muted-foreground hover:text-foreground hover:underline">← My Codes</Link>
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-2xl font-extrabold">{formatCode(code.code)}</h1>
        <span className="badge-np bg-secondary capitalize">{code.status}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCodeEdit code={code.code} permanentUrl={url} currentDestination={code.destination_url} />
        </div>
        <div className="card-np p-5 sm:p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Total scans</dt><dd className="font-semibold">{scanCount}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Activated</dt><dd>{code.activated_at ? new Date(code.activated_at).toLocaleDateString() : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{new Date(code.created_at).toLocaleDateString()}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
