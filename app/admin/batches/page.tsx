import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

type BatchRow = Database['public']['Tables']['batches']['Row'];
type CodeRow = Database['public']['Tables']['codes']['Row'];

export const metadata = { title: 'Batches' };

type SortField = 'name' | 'created_at';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SortLink({
  field,
  currentField,
  currentDir,
  searchParams,
  children,
}: {
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
  searchParams: Record<string, string | string[] | undefined>;
  children: React.ReactNode;
}) {
  const isActive = currentField === field;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';
  const params = new URLSearchParams();
  params.set('sort', field);
  params.set('dir', nextDir);
  // Preserve other params (e.g. q) if present.
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === 'sort' || k === 'dir') continue;
    if (typeof v === 'string') params.set(k, v);
  }
  return (
    <Link
      href={`/admin/batches?${params.toString()}`}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {children}
      {isActive ? (
        <span aria-hidden="true" className="text-accent">
          {currentDir === 'asc' ? '↑' : '↓'}
        </span>
      ) : null}
    </Link>
  );
}

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: { sort?: string; dir?: string; [k: string]: string | string[] | undefined };
}) {
  const sortField: SortField = searchParams.sort === 'created_at' ? 'created_at' : 'name';
  const sortDir: SortDir = searchParams.dir === 'asc' ? 'asc' : 'desc';

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('batches')
    .select('id, name, prefix, notes, created_at')
    .order(sortField, { ascending: sortDir === 'asc' });

  const batchRows = (data ?? []) as Pick<BatchRow, 'id' | 'name' | 'prefix' | 'notes' | 'created_at'>[];
  const batchIds = batchRows.map((b) => b.id);

  // Count codes per batch in one query (avoid typed join that resolves to never).
  const codeCountByBatch: Record<string, number> = {};
  if (batchIds.length > 0) {
    const { data: batchCodes } = await admin
      .from('codes')
      .select('batch_id')
      .in('batch_id', batchIds);
    for (const c of (batchCodes ?? []) as Pick<CodeRow, 'batch_id'>[]) {
      if (c.batch_id) codeCountByBatch[c.batch_id] = (codeCountByBatch[c.batch_id] ?? 0) + 1;
    }
  }

  const batches = batchRows.map((b) => ({
    id: b.id,
    name: b.name,
    prefix: b.prefix,
    notes: b.notes,
    created_at: b.created_at,
    codeCount: codeCountByBatch[b.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Batches
          </h1>
          <p className="text-sm text-muted-foreground">{batches.length} total</p>
        </div>
        <Link href="/admin/batches/create" className="btn-primary-np w-full sm:w-auto">
          <span className="mr-2" aria-hidden="true">
            +
          </span>
          Create batch
        </Link>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Failed to load batches.
        </div>
      ) : batches.length === 0 ? (
        <div className="card-np p-10 text-center">
          <p className="text-sm font-semibold text-foreground">No batches yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first batch to generate NFC codes.
          </p>
          <Link href="/admin/batches/create" className="btn-primary-np mt-5 inline-flex">
            Create batch
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-np hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortLink field="name" currentField={sortField} currentDir={sortDir} searchParams={searchParams}>
                      Name
                    </SortLink>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Prefix
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Codes
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortLink field="created_at" currentField={sortField} currentDir={sortDir} searchParams={searchParams}>
                      Created
                    </SortLink>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/batches/${b.id}`} className="font-semibold text-foreground hover:text-accent">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {b.prefix ? b.prefix : '—'}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {b.notes ? b.notes : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-np bg-secondary text-secondary-foreground">{b.codeCount}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {batches.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/batches/${b.id}`} className="card-np block p-4 transition-colors hover:bg-secondary/40">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-foreground">{b.name}</p>
                    <span className="badge-np shrink-0 bg-secondary text-secondary-foreground">
                      {b.codeCount} codes
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                    <dt className="font-semibold uppercase tracking-wider">Prefix</dt>
                    <dd className="font-mono">{b.prefix ? b.prefix : '—'}</dd>
                    <dt className="font-semibold uppercase tracking-wider">Created</dt>
                    <dd>{formatDate(b.created_at)}</dd>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
