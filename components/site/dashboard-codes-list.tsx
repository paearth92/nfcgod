'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatCode, getHostname } from '@/lib/code-utils';
import type { Database } from '@/lib/supabase/database.types';

type CodeRow = Database['public']['Tables']['codes']['Row'];

export interface DashboardCodeItem {
  id: string;
  code: string;
  status: Database['public']['Tables']['codes']['Row']['status'];
  destination_url: string | null;
  activated_at: string | null;
  updated_at: string;
  scan_count: number;
  last_scan_at: string | null;
}

type StatusFilter = 'all' | 'active' | 'unclaimed' | 'disabled';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  unclaimed: 'bg-amber-50 text-amber-700',
  disabled: 'bg-secondary text-muted-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  unclaimed: 'Unclaimed',
  disabled: 'Disabled',
};

/** Format a date string as a compact, locale-aware date. */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Client-side codes list with search and status filter.
 *
 * Receives the full set of owned codes as props (fetched server-side) and
 * filters them in the browser. Renders a table on desktop and cards on mobile.
 */
export function DashboardCodesList({ codes }: { codes: DashboardCodeItem[] }) {
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      const formatted = formatCode(c.code).toLowerCase();
      const hostname = c.destination_url ? getHostname(c.destination_url).toLowerCase() : '';
      return formatted.includes(q) || hostname.includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [codes, query, status]);

  const statusCounts = React.useMemo(() => {
    const counts = { all: codes.length, active: 0, unclaimed: 0, disabled: 0 };
    for (const c of codes) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  }, [codes]);

  const statusOptions: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'active', label: 'Active', count: statusCounts.active ?? 0 },
    { value: 'unclaimed', label: 'Unclaimed', count: statusCounts.unclaimed ?? 0 },
    { value: 'disabled', label: 'Disabled', count: statusCounts.disabled ?? 0 },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="code-search" className="sr-only">
            Search codes
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            id="code-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code or destination…"
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              aria-pressed={status === opt.value}
              className={
                'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
                (status === opt.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-secondary hover:text-foreground')
              }
            >
              {opt.label}
              <span className="text-xs opacity-70">({opt.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card-np p-8 text-center sm:p-12">
          {codes.length === 0 ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M8 12h8" />
                  <path d="M12 8c1.5 1.5 1.5 5 0 6.5" opacity="0.7" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                No codes yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Once you activate an NFCPlate product, it will appear here. Tap your product
                or scan its QR code to get started.
              </p>
              <div className="mx-auto mt-6 max-w-md rounded-lg border border-border bg-secondary/40 p-4 text-left">
                <h3 className="text-sm font-semibold text-foreground">How to activate</h3>
                <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">1.</span>
                    <span>Tap your NFCPlate product with your phone.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">2.</span>
                    <span>Sign in or create an account on the activation page.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">3.</span>
                    <span>Enter your destination URL and save.</span>
                  </li>
                </ol>
              </div>
              <Link href="/shop" className="btn-primary-np mt-6 inline-flex">
                Shop NFCPlate products
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                No codes match your search or filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                }}
                className="btn-secondary-np mt-4 inline-flex"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-np hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Code
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Destination
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Activated
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Last scan
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Scans
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((code) => (
                  <tr key={code.id}>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/codes/${code.id}`}
                        className="font-mono text-sm font-semibold text-foreground hover:text-accent hover:underline"
                      >
                        {formatCode(code.code)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge-np ${STATUS_BADGE[code.status] ?? STATUS_BADGE.disabled}`}>
                        {STATUS_LABEL[code.status] ?? code.status}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-5 py-3.5">
                      {code.destination_url ? (
                        <span className="block truncate text-muted-foreground" title={code.destination_url}>
                          {getHostname(code.destination_url)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                      {formatDate(code.activated_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                      {formatDate(code.last_scan_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {code.scan_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((code) => (
              <li key={code.id}>
                <Link
                  href={`/dashboard/codes/${code.id}`}
                  className="card-np block p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatCode(code.code)}
                    </span>
                    <span className={`badge-np ${STATUS_BADGE[code.status] ?? STATUS_BADGE.disabled}`}>
                      {STATUS_LABEL[code.status] ?? code.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">
                      {code.destination_url ? getHostname(code.destination_url) : 'No destination'}
                    </span>
                    <span className="shrink-0">{code.scan_count} scans</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground/80">
                    <span>Activated: {formatDate(code.activated_at)}</span>
                    <span>Last scan: {formatDate(code.last_scan_at)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
