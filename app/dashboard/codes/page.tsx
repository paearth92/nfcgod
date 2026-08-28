'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  DashboardCodesList,
  type DashboardCodeItem,
} from '@/components/site/dashboard-codes-list';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type CodeRow = Database['public']['Tables']['codes']['Row'];
type CodeEventRow = Database['public']['Tables']['code_events']['Row'];

type OwnedCode = Pick<
  CodeRow,
  'id' | 'code' | 'status' | 'destination_url' | 'activated_at' | 'updated_at'
>;

type EventRow = Pick<
  CodeEventRow,
  'code_id' | 'event_type' | 'created_at'
>;

export default function DashboardCodesPage() {
  const router = useRouter();
  const [codes, setCodes] = React.useState<DashboardCodeItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadCodes = React.useCallback(async () => {
    setError(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/auth/sign-in?next=/dashboard/codes');
        return;
      }

      const { data: codesData, error: codesError } = await supabase
        .from('codes')
        .select('id, code, status, destination_url, activated_at, updated_at')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (codesError) {
        throw new Error(codesError.message);
      }

      const ownedCodes = (codesData ?? []) as OwnedCode[];
      const codeIds = ownedCodes.map((code) => code.id);

      if (codeIds.length === 0) {
        setCodes([]);
        return;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('code_events')
        .select('code_id, event_type, created_at')
        .in('code_id', codeIds)
        .order('created_at', { ascending: false });

      if (eventsError) {
        throw new Error(eventsError.message);
      }

      const events = (eventsData ?? []) as EventRow[];
      const statsByCode = new Map<
        string,
        {
          scanCount: number;
          lastScanAt: string | null;
        }
      >();

      for (const event of events) {
        const current = statsByCode.get(event.code_id) ?? {
          scanCount: 0,
          lastScanAt: null,
        };

        if (event.event_type === 'redirect') {
          current.scanCount += 1;

          if (!current.lastScanAt) {
            current.lastScanAt = event.created_at;
          }
        }

        statsByCode.set(event.code_id, current);
      }

      const items: DashboardCodeItem[] = ownedCodes.map((code) => ({
        id: code.id,
        code: code.code,
        status: code.status,
        destination_url: code.destination_url,
        activated_at: code.activated_at,
        updated_at: code.updated_at,
        scan_count: statsByCode.get(code.id)?.scanCount ?? 0,
        last_scan_at: statsByCode.get(code.id)?.lastScanAt ?? null,
      }));

      setCodes(items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Your NFCPlate codes could not be loaded.'
      );
    }
  }, [router]);

  React.useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-2">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            ← Overview
          </Link>
        </nav>

        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          My Codes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your activated NFCPlate products.
        </p>
      </div>

      {error ? (
        <div className="card-np p-6 text-center sm:p-10">
          <AlertCircle
            className="mx-auto h-10 w-10 text-destructive"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Your codes could not be loaded
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadCodes()}
            className="btn-primary-np mt-5"
          >
            Try again
          </button>
        </div>
      ) : codes ? (
        <DashboardCodesList codes={codes} />
      ) : (
        <div
          className="flex min-h-[40vh] items-center justify-center gap-3 text-sm font-medium text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading your NFCPlate codes…
        </div>
      )}
    </div>
  );
}
