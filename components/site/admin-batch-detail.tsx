'use client';

import * as React from 'react';
import Link from 'next/link';
import { assignDestinationToBatch } from '@/lib/admin-actions';
import { getAccessToken } from '@/lib/supabase/access-token';
import { formatCode, getHostname, permanentCodeUrl, destinationUrlSchema } from '@/lib/code-utils';

type CodeRow = {
  id: string;
  code: string;
  status: 'unclaimed' | 'active' | 'disabled';
  destination_url: string | null;
};

export function AdminBatchDetail({
  batchId,
  batchName,
  codes,
}: {
  batchId: string;
  batchName: string;
  codes: CodeRow[];
}) {
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignUrl, setAssignUrl] = React.useState('');
  const [assignError, setAssignError] = React.useState<string | null>(null);
  const [assignLoading, setAssignLoading] = React.useState(false);
  const [assignDone, setAssignDone] = React.useState<string | null>(null);

  const fileBase = batchName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'batch';

  function exportCsv() {
    const rows = ['code,status,destination,url', ...codes.map((c) => {
      const status = c.status;
      const dest = c.destination_url ?? '';
      const url = permanentCodeUrl(c.code);
      return `${formatCode(c.code)},${status},"${dest.replace(/"/g, '""')}",${url}`;
    })];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileBase}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleAssign() {
    setAssignError(null);
    const trimmed = assignUrl.trim();
    const parsed = destinationUrlSchema.safeParse(trimmed);
    if (!parsed.success) {
      setAssignError(parsed.error.issues[0]?.message ?? 'Enter a valid URL.');
      return;
    }
    setAssignLoading(true);
    const accessToken = await getAccessToken();
    const result = await assignDestinationToBatch(accessToken, batchId, parsed.data);
    setAssignLoading(false);
    if (!result.success) {
      setAssignError(result.error);
      return;
    }
    setAssignDone(`Destination assigned to ${result.count ?? codes.length} codes.`);
    setAssignOpen(false);
    setAssignUrl('');
    // Refresh server data so the table reflects the change.
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {/* Assign-to-all action card */}
      <div className="card-np flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight">Batch destination</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the same destination URL for all {codes.length} codes in this batch.
          </p>
          {assignDone ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">{assignDone}</p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={exportCsv} className="btn-secondary-np">
            Export CSV
          </button>
          <button type="button" onClick={() => setAssignOpen(true)} className="btn-primary-np">
            Assign to all
          </button>
        </div>
      </div>

      {/* Codes table */}
      <div className="card-np overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-bold tracking-tight">Codes in batch</h2>
          <span className="badge-np bg-secondary text-secondary-foreground">{codes.length}</span>
        </div>
        {codes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No codes in this batch.</p>
        ) : (
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {codes.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/codes/${c.id}`} className="font-mono font-semibold text-foreground hover:text-accent">
                        {formatCode(c.code)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-muted-foreground">
                      {c.destination_url ? getHostname(c.destination_url) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign-to-all confirmation modal */}
      {assignOpen ? (
        <Modal onClose={() => setAssignOpen(false)} title="Assign destination to all codes">
          <p className="text-sm text-muted-foreground">
            This will set the destination URL for all <span className="font-semibold text-foreground">{codes.length}</span> codes in
            batch <span className="font-semibold text-foreground">{batchName}</span>.
          </p>
          <label htmlFor="assign-all-url" className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination URL
          </label>
          <input
            id="assign-all-url"
            type="url"
            value={assignUrl}
            onChange={(e) => { setAssignUrl(e.target.value); setAssignError(null); }}
            placeholder="https://example.com/review"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled={assignLoading}
          />
          {assignError ? (
            <p className="mt-2 text-xs text-destructive">{assignError}</p>
          ) : null}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setAssignOpen(false)} className="btn-secondary-np" disabled={assignLoading}>
              Cancel
            </button>
            <button type="button" onClick={handleAssign} className="btn-primary-np" disabled={assignLoading}>
              {assignLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" aria-hidden="true" />
                  Assigning…
                </>
              ) : (
                `Assign to ${codes.length} codes`
              )}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: 'unclaimed' | 'active' | 'disabled' }) {
  const map = {
    unclaimed: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    disabled: 'bg-red-100 text-red-800',
  } as const;
  return <span className={`badge-np ${map[status]}`}>{status}</span>;
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="card-np relative z-10 w-full max-w-md p-6 animate-fade-in-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
