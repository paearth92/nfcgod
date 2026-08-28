'use client';

import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  assignDestination,
  disableCodes,
  enableCodes,
  updateCodeDestination,
  setCodeStatus,
} from '@/lib/admin-actions';
import { getAccessToken } from '@/lib/supabase/access-token';
import {
  formatCode,
  getHostname,
  permanentCodeUrl,
  destinationUrlSchema,
} from '@/lib/code-utils';
import { Modal, StatusBadge } from '@/components/site/admin-batch-detail';

type CodeStatus = 'unclaimed' | 'active' | 'disabled';

type CodeRow = {
  id: string;
  code: string;
  status: CodeStatus;
  destination_url: string | null;
  created_at: string;
  batch_id: string | null;
  batch_name: string | null;
  owner_email: string | null;
};

type SortField = 'code' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

const inputClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const selectClass =
  'h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AdminCodesTable({ batches }: { batches: { id: string; name: string }[] }) {
  const supabase = React.useMemo(() => createClient(), []);

  const [search, setSearch] = React.useState('');
  const [batchFilter, setBatchFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | CodeStatus>('all');
  const [claimedFilter, setClaimedFilter] = React.useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [sortField, setSortField] = React.useState<SortField>('created_at');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const [rows, setRows] = React.useState<CodeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);

  // Bulk-action dialog state
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignUrl, setAssignUrl] = React.useState('');
  const [assignError, setAssignError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Per-row QR + edit state
  const [qrCode, setQrCode] = React.useState<CodeRow | null>(null);
  const [editCode, setEditCode] = React.useState<CodeRow | null>(null);
  const [editUrl, setEditUrl] = React.useState('');
  const [editError, setEditError] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  // Fetch whenever filters/sort/page change.
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const result = await fetchPage(
        supabase,
        debouncedSearch,
        batchFilter,
        statusFilter,
        claimedFilter,
        sortField,
        sortDir,
        page
      );

      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setRows(result.rows);
      setTotal(result.total);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, debouncedSearch, batchFilter, statusFilter, claimedFilter, sortField, sortDir, page]);

  // Reset to first page when filters change.
  React.useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [debouncedSearch, batchFilter, statusFilter, claimedFilter, sortField, sortDir]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = rows;
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const selectedCount = selected.size;

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function refreshCurrentPage() {
    setLoading(true);
    const result = await fetchPage(
      supabase,
      debouncedSearch,
      batchFilter,
      statusFilter,
      claimedFilter,
      sortField,
      sortDir,
      page
    );
    if (result.error) {
      setError(result.error);
    } else {
      setRows(result.rows);
      setTotal(result.total);
      setError(null);
    }
    setLoading(false);
  }

  /* ---------------- Bulk actions ---------------- */

  async function handleBulkAssign() {
    setAssignError(null);
    const parsed = destinationUrlSchema.safeParse(assignUrl.trim());
    if (!parsed.success) {
      setAssignError(parsed.error.issues[0]?.message ?? 'Enter a valid URL.');
      return;
    }
    setActionLoading(true);
    const ids = Array.from(selected);
    const accessToken = await getAccessToken();
    const result = await assignDestination(accessToken, ids, parsed.data);
    setActionLoading(false);
    if (!result.success) {
      setAssignError(result.error);
      return;
    }
    setAssignOpen(false);
    setAssignUrl('');
    flash(`Destination assigned to ${ids.length} codes.`);
    clearSelection();
    refreshCurrentPage();
  }

  async function handleBulkDisable() {
    if (selectedCount === 0) return;
    setActionLoading(true);
    const ids = Array.from(selected);
    const accessToken = await getAccessToken();
    const result = await disableCodes(accessToken, ids);
    setActionLoading(false);
    if (!result.success) {
      flash(result.error);
      return;
    }
    flash(`Disabled ${ids.length} codes.`);
    clearSelection();
    refreshCurrentPage();
  }

  async function handleBulkEnable() {
    if (selectedCount === 0) return;
    setActionLoading(true);
    const ids = Array.from(selected);
    const accessToken = await getAccessToken();
    const result = await enableCodes(accessToken, ids);
    setActionLoading(false);
    if (!result.success) {
      flash(result.error);
      return;
    }
    flash(`Re-enabled ${ids.length} codes.`);
    clearSelection();
    refreshCurrentPage();
  }

  /* ---------------- Single-row actions ---------------- */

  async function handleEditSave() {
    if (!editCode) return;
    setEditError(null);
    const parsed = destinationUrlSchema.safeParse(editUrl.trim());
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Enter a valid URL.');
      return;
    }
    setActionLoading(true);
    const accessToken = await getAccessToken();
    const result = await updateCodeDestination(accessToken, editCode.id, parsed.data);
    setActionLoading(false);
    if (!result.success) {
      setEditError(result.error);
      return;
    }
    setEditCode(null);
    setEditUrl('');
    flash('Destination updated.');
    refreshCurrentPage();
  }

  async function handleToggleRowStatus(row: CodeRow) {
    const next = row.status === 'disabled' ? 'enabled' : 'disabled';
    const accessToken = await getAccessToken();
    const result = await setCodeStatus(accessToken, row.id, next);
    if (!result.success) {
      flash(result.error);
      return;
    }
    flash(next === 'disabled' ? 'Code disabled.' : 'Code re-enabled.');
    refreshCurrentPage();
  }

  function copyUrl(row: CodeRow) {
    const url = permanentCodeUrl(row.code);
    navigator.clipboard?.writeText(url);
    flash('URL copied.');
  }

  function setSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'created_at' ? 'desc' : 'asc');
    }
  }

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card-np p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label htmlFor="code-search" className="sr-only">Search codes</label>
            <input
              id="code-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code…"
              className={inputClass}
            />
          </div>
          <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className={selectClass} aria-label="Filter by batch">
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | CodeStatus)} className={selectClass} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <select value={claimedFilter} onChange={(e) => setClaimedFilter(e.target.value as 'all' | 'claimed' | 'unclaimed')} className={selectClass} aria-label="Filter by claim">
            <option value="all">Claimed & unclaimed</option>
            <option value="claimed">Claimed only</option>
            <option value="unclaimed">Unclaimed only</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 ? (
        <div className="card-np flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="px-2 text-sm font-semibold text-foreground">
            {selectedCount} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAssignOpen(true)} className="btn-primary-np h-9 px-4" disabled={actionLoading}>
              Assign destination
            </button>
            <button type="button" onClick={handleBulkDisable} className="btn-secondary-np h-9 px-4" disabled={actionLoading}>
              Disable
            </button>
            <button type="button" onClick={handleBulkEnable} className="btn-secondary-np h-9 px-4" disabled={actionLoading}>
              Re-enable
            </button>
            <button type="button" onClick={clearSelection} className="btn-secondary-np h-9 px-4" disabled={actionLoading}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Desktop table */}
      <div className="card-np hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all on page"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="h-4 w-4 rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Code" field="code" onClick={setSort} indicator={sortIndicator('code')} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Status" field="status" onClick={setSort} indicator={sortIndicator('status')} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destination</th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Created" field="created_at" onClick={setSort} indicator={sortIndicator('created_at')} />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No codes match these filters.</td></tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className={`transition-colors hover:bg-secondary/30 ${selected.has(r.id) ? 'bg-accent/5' : ''}`}>
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${formatCode(r.code)}`}
                      checked={selected.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/codes/${r.id}`} className="font-mono font-semibold text-foreground hover:text-accent">
                      {formatCode(r.code)}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="max-w-[140px] truncate px-4 py-2.5 text-muted-foreground">
                    {r.batch_name ?? '—'}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-2.5 text-muted-foreground">
                    {r.owner_email ?? '—'}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-2.5 text-muted-foreground">
                    {r.destination_url ? getHostname(r.destination_url) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <RowActions row={r} onEdit={() => { setEditCode(r); setEditUrl(r.destination_url ?? ''); setEditError(null); }} onToggle={() => handleToggleRowStatus(r)} onQr={() => setQrCode(r)} onCopy={() => copyUrl(r)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {loading ? (
          <li className="card-np p-6 text-center text-sm text-muted-foreground">Loading…</li>
        ) : pageRows.length === 0 ? (
          <li className="card-np p-6 text-center text-sm text-muted-foreground">No codes match these filters.</li>
        ) : (
          pageRows.map((r) => (
            <li key={r.id} className={`card-np p-4 ${selected.has(r.id) ? 'ring-2 ring-accent/40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Select ${formatCode(r.code)}`}
                    checked={selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Link href={`/admin/codes/${r.id}`} className="font-mono text-sm font-semibold text-foreground">
                    {formatCode(r.code)}
                  </Link>
                </label>
                <StatusBadge status={r.status} />
              </div>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2"><dt>Batch</dt><dd className="truncate text-right">{r.batch_name ?? '—'}</dd></div>
                <div className="flex justify-between gap-2"><dt>Owner</dt><dd className="truncate text-right">{r.owner_email ?? '—'}</dd></div>
                <div className="flex justify-between gap-2"><dt>Destination</dt><dd className="truncate text-right">{r.destination_url ? getHostname(r.destination_url) : '—'}</dd></div>
                <div className="flex justify-between gap-2"><dt>Created</dt><dd>{formatDate(r.created_at)}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <RowActions row={r} onEdit={() => { setEditCode(r); setEditUrl(r.destination_url ?? ''); setEditError(null); }} onToggle={() => handleToggleRowStatus(r)} onQr={() => setQrCode(r)} onCopy={() => copyUrl(r)} compact />
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          {total} total · Page {page + 1} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} className="btn-secondary-np h-9 px-4 disabled:opacity-50">
            Prev
          </button>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1 || loading} className="btn-secondary-np h-9 px-4 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {/* Bulk assign modal */}
      {assignOpen ? (
        <Modal title="Assign destination" onClose={() => setAssignOpen(false)}>
          <p className="text-sm text-muted-foreground">
            Set the destination URL for <span className="font-semibold text-foreground">{selectedCount}</span> selected codes.
          </p>
          <label htmlFor="bulk-assign-url" className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination URL
          </label>
          <input
            id="bulk-assign-url"
            type="url"
            value={assignUrl}
            onChange={(e) => { setAssignUrl(e.target.value); setAssignError(null); }}
            placeholder="https://example.com/review"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled={actionLoading}
          />
          {assignError ? <p className="mt-2 text-xs text-destructive">{assignError}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setAssignOpen(false)} className="btn-secondary-np" disabled={actionLoading}>Cancel</button>
            <button type="button" onClick={handleBulkAssign} className="btn-primary-np" disabled={actionLoading}>
              {actionLoading ? 'Assigning…' : `Assign to ${selectedCount} codes`}
            </button>
          </div>
        </Modal>
      ) : null}

      {/* Edit destination modal */}
      {editCode ? (
        <Modal title={`Edit destination · ${formatCode(editCode.code)}`} onClose={() => setEditCode(null)}>
          <label htmlFor="edit-url" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination URL
          </label>
          <input
            id="edit-url"
            type="url"
            value={editUrl}
            onChange={(e) => { setEditUrl(e.target.value); setEditError(null); }}
            placeholder="https://example.com/review"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled={actionLoading}
          />
          {editError ? <p className="mt-2 text-xs text-destructive">{editError}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditCode(null)} className="btn-secondary-np" disabled={actionLoading}>Cancel</button>
            <button type="button" onClick={handleEditSave} className="btn-primary-np" disabled={actionLoading}>
              {actionLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      ) : null}

      {/* QR modal */}
      {qrCode ? (
        <Modal title={`QR code · ${formatCode(qrCode.code)}`} onClose={() => setQrCode(null)}>
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(permanentCodeUrl(qrCode.code))}`}
              alt={`QR code for ${formatCode(qrCode.code)}`}
              width={200}
              height={200}
              className="rounded-lg border border-border"
            />
            <p className="break-all text-center text-xs text-muted-foreground">{permanentCodeUrl(qrCode.code)}</p>
            <button type="button" onClick={() => copyUrl(qrCode)} className="btn-secondary-np">Copy URL</button>
          </div>
        </Modal>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg animate-fade-in-up">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function SortButton({ label, field, onClick, indicator }: { label: string; field: SortField; onClick: (f: SortField) => void; indicator: string }) {
  return (
    <button type="button" onClick={() => onClick(field)} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
      {label}
      {indicator ? <span className="text-accent" aria-hidden="true">{indicator}</span> : null}
    </button>
  );
}

function RowActions({
  row,
  onEdit,
  onToggle,
  onQr,
  onCopy,
  compact,
}: {
  row: CodeRow;
  onEdit: () => void;
  onToggle: () => void;
  onQr: () => void;
  onCopy: () => void;
  compact?: boolean;
}) {
  const btn = compact
    ? 'inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-foreground hover:bg-secondary'
    : 'inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-foreground hover:bg-secondary';
  return (
    <div className="flex justify-end gap-1.5">
      <button type="button" onClick={onEdit} className={btn} aria-label="Edit destination">Edit</button>
      <button type="button" onClick={onQr} className={btn} aria-label="View QR">QR</button>
      <button type="button" onClick={onCopy} className={btn} aria-label="Copy URL">Copy</button>
      <button type="button" onClick={onToggle} className={btn} aria-label={row.status === 'disabled' ? 'Re-enable' : 'Disable'}>
        {row.status === 'disabled' ? 'Enable' : 'Disable'}
      </button>
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Fetch one page of codes with the given filters. Avoids PostgREST typed joins
 * (the hand-written Database type has no Relationships, so joins resolve to
 * never). Instead we query codes, then resolve batch names + owner labels via
 * separate lightweight lookups.
 */
async function fetchPage(
  supabase: ReturnType<typeof createClient>,
  search: string,
  batchFilter: string,
  statusFilter: 'all' | CodeStatus,
  claimedFilter: 'all' | 'claimed' | 'unclaimed',
  sortField: SortField,
  sortDir: SortDir,
  page: number
): Promise<{ rows: CodeRow[]; total: number; error: string | null }> {
  let query = supabase
    .from('codes')
    .select('id, code, status, destination_url, created_at, batch_id, owner_id', { count: 'exact' });

  if (search) {
    query = query.ilike('code', `%${search.toUpperCase().replace(/[^A-Z0-9%]/g, '')}%`);
  }
  if (batchFilter !== 'all') query = query.eq('batch_id', batchFilter);
  if (statusFilter !== 'all') query = query.eq('status', statusFilter);
  if (claimedFilter === 'claimed') query = query.not('owner_id', 'is', null);
  else if (claimedFilter === 'unclaimed') query = query.is('owner_id', null);

  query = query.order(sortField, { ascending: sortDir === 'asc' });
  query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) return { rows: [], total: 0, error: error.message || 'Failed to load codes.' };

  const raw = (data ?? []) as Array<{
    id: string; code: string; status: CodeStatus; destination_url: string | null;
    created_at: string; batch_id: string | null; owner_id: string | null;
  }>;

  // Resolve batch names for the codes on this page.
  const batchIds = Array.from(new Set(raw.map((r) => r.batch_id).filter((x): x is string => !!x)));
  const batchNameById: Record<string, string> = {};
  if (batchIds.length > 0) {
    const { data: bRows } = await supabase
      .from('batches')
      .select('id, name')
      .in('id', batchIds);
    for (const b of (bRows ?? []) as Array<{ id: string; name: string }>) {
      batchNameById[b.id] = b.name;
    }
  }

  // Owner label — profiles has no email column; show full_name / business_name.
  const ownerIds = Array.from(new Set(raw.map((r) => r.owner_id).filter((x): x is string => !!x)));
  const ownerLabelById: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: pRows } = await supabase
      .from('profiles')
      .select('id, full_name, business_name')
      .in('id', ownerIds);
    for (const p of (pRows ?? []) as Array<{ id: string; full_name: string | null; business_name: string | null }>) {
      ownerLabelById[p.id] = p.full_name ?? p.business_name ?? p.id.slice(0, 8);
    }
  }

  const rows: CodeRow[] = raw.map((r) => ({
    id: r.id,
    code: r.code,
    status: r.status,
    destination_url: r.destination_url,
    created_at: r.created_at,
    batch_id: r.batch_id,
    batch_name: r.batch_id ? batchNameById[r.batch_id] ?? null : null,
    owner_email: r.owner_id ? ownerLabelById[r.owner_id] ?? null : null,
  }));

  return { rows, total: count ?? 0, error: null };
}
