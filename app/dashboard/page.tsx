'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCode, getHostname } from '@/lib/code-utils';
import type { Database } from '@/lib/supabase/database.types';

type CodeRow = Pick<
  Database['public']['Tables']['codes']['Row'],
  | 'id'
  | 'code'
  | 'status'
  | 'destination_url'
  | 'activated_at'
  | 'created_at'
  | 'updated_at'
>;

type RecentEvent = {
  id: string;
  event_type: string;
  created_at: string;
  code_id: string;
};

type DashboardData = {
  codes: CodeRow[];
  recentScans: number;
  recentEvents: RecentEvent[];
};

const EVENT_LABELS: Record<string, string> = {
  scan: 'Scan',
  activation: 'Activation',
  redirect: 'Redirect',
  destination_update: 'Link updated',
  disabled: 'Disabled',
};

function timeAgo(dateString: string): string {
  const timestamp = new Date(dateString).getTime();

  if (Number.isNaN(timestamp)) return 'Recently';

  const difference = Math.round((timestamp - Date.now()) / 1000);
  const absoluteDifference = Math.abs(difference);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absoluteDifference < 60) {
    return formatter.format(difference, 'second');
  }

  if (absoluteDifference < 3_600) {
    return formatter.format(Math.round(difference / 60), 'minute');
  }

  if (absoluteDifference < 86_400) {
    return formatter.format(Math.round(difference / 3_600), 'hour');
  }

  if (absoluteDifference < 2_592_000) {
    return formatter.format(Math.round(difference / 86_400), 'day');
  }

  return formatter.format(Math.round(difference / 2_592_000), 'month');
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async () => {
    setError(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/auth/sign-in?next=/dashboard');
        return;
      }

      const { data: codesData, error: codesError } = await supabase
        .from('codes')
        .select(
          'id, code, status, destination_url, activated_at, created_at, updated_at'
        )
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (codesError) {
        throw new Error(codesError.message);
      }

      const codes = (codesData ?? []) as CodeRow[];
      const codeIds = codes.map((code) => code.id);

      let recentScans = 0;
      let recentEvents: RecentEvent[] = [];

      if (codeIds.length > 0) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [scanResult, eventsResult] = await Promise.all([
          supabase
            .from('code_events')
            .select('id', { count: 'exact', head: true })
            .in('code_id', codeIds)
            .eq('event_type', 'redirect')
            .gte('created_at', thirtyDaysAgo.toISOString()),

          supabase
            .from('code_events')
            .select('id, event_type, created_at, code_id')
            .in('code_id', codeIds)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (scanResult.error) {
          throw new Error(scanResult.error.message);
        }

        if (eventsResult.error) {
          throw new Error(eventsResult.error.message);
        }

        recentScans = scanResult.count ?? 0;
        recentEvents = (eventsResult.data ?? []) as RecentEvent[];
      }

      setData({
        codes,
        recentScans,
        recentEvents,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'The dashboard could not be loaded.'
      );
    }
  }, [router]);

  React.useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (error) {
    return (
      <div className="card-np p-6 text-center sm:p-10">
        <AlertCircle
          className="mx-auto h-10 w-10 text-destructive"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-display text-xl font-bold text-foreground">
          Dashboard data could not be loaded
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="btn-primary-np mt-5"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-medium text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading dashboard overview…
      </div>
    );
  }

  const totalProducts = data.codes.length;
  const activeLinks = data.codes.filter(
    (code) => code.status === 'active'
  ).length;
  const codeMap = new Map(data.codes.map((code) => [code.id, code]));

  return (
    <div className="animate-fade-in-up">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="portal-kicker">Your workspace</p>
          <h1 className="portal-title mt-1">Welcome to NFCPlate</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage every tap, scan, destination, and order from one place.
          </p>
        </div>

        <Link
          href="/dashboard/codes"
          className="btn-secondary-np h-10 self-start bg-white px-4 sm:self-auto"
        >
          View all codes
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total products" value={totalProducts} />
        <StatCard label="Active links" value={activeLinks} />
        <StatCard label="Scans (30 days)" value={data.recentScans} />
      </div>

      {totalProducts === 0 ? (
        <div className="portal-panel mt-6 overflow-hidden p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M8 12h8" />
              <path d="M12 8c1.5 1.5 1.5 5 0 6.5" opacity="0.7" />
              <path d="M14.5 8c1.5 1.5 1.5 5 0 6.5" opacity="0.4" />
            </svg>
          </div>

          <h2 className="font-display text-xl font-bold text-foreground">
            No NFCPlate products yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Once you activate an NFCPlate product, its link and activity will
            appear here.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-lg border border-border bg-secondary/40 p-4 text-left">
            <h3 className="text-sm font-semibold text-foreground">
              How to activate your product
            </h3>
            <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>1. Tap the NFCPlate product or scan its QR code.</li>
              <li>2. Sign in to your customer account.</li>
              <li>3. Enter and save the destination link.</li>
              <li>4. Future taps and scans open that link.</li>
            </ol>
          </div>

          <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
            Shop NFCPlate products
          </Link>
        </div>
      ) : (
        <section className="mt-6" aria-labelledby="recent-activity-heading">
          <h2
            id="recent-activity-heading"
            className="mb-3 font-display text-lg font-bold tracking-tight text-foreground"
          >
            Recent activity
          </h2>

          {data.recentEvents.length === 0 ? (
            <div className="portal-panel p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No activity yet. Customer taps and scans will appear here.
              </p>
            </div>
          ) : (
            <ul className="portal-panel divide-y divide-border overflow-hidden">
              {data.recentEvents.map((event) => {
                const code = codeMap.get(event.code_id);

                return (
                  <li
                    key={event.id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {EVENT_LABELS[event.event_type] ?? event.event_type}
                        {code ? (
                          <>
                            {' · '}
                            <Link
                              href={`/dashboard/codes/${code.id}`}
                              className="font-semibold hover:text-accent hover:underline"
                            >
                              {formatCode(code.code)}
                            </Link>
                          </>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {code?.destination_url
                          ? getHostname(code.destination_url)
                          : 'No destination link'}
                      </p>
                    </div>

                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={event.created_at}
                      title={new Date(event.created_at).toLocaleString()}
                    >
                      {timeAgo(event.created_at)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="portal-stat">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="relative z-10 mt-3 font-display text-3xl font-black tracking-[-0.04em] text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
