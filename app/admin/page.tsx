import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCode, getHostname } from '@/lib/code-utils';
import type { Database } from '@/lib/supabase/database.types';

type BatchRow = Database['public']['Tables']['batches']['Row'];
type CodeRow = Database['public']['Tables']['codes']['Row'];

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Operations Overview' };

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={'portal-stat ' + (accent ? 'bg-[#171512] text-white' : '')}>
      <p className={'text-[10px] font-bold uppercase tracking-[0.18em] ' + (accent ? 'text-white/45' : 'text-muted-foreground')}>{label}</p>
      <p
        className={
          'relative z-10 mt-3 font-display text-3xl font-black tracking-[-0.04em] ' +
          (accent ? 'text-[#f4b942]' : 'text-foreground')
        }
      >
        {value}
      </p>
      {hint ? <p className={'relative z-10 mt-1 text-xs ' + (accent ? 'text-white/45' : 'text-muted-foreground')}>{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    batchesRes,
    codesRes,
    unclaimedRes,
    activeRes,
    disabledRes,
    scansRes,
    recentBatchesRes,
    recentActivationsRes,
  ] = await Promise.all([
    admin.from('batches').select('id', { count: 'exact', head: true }),
    admin.from('codes').select('id', { count: 'exact', head: true }),
    admin.from('codes').select('id', { count: 'exact', head: true }).eq('status', 'unclaimed'),
    admin.from('codes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('codes').select('id', { count: 'exact', head: true }).eq('status', 'disabled'),
    admin.from('code_events').select('id', { count: 'exact', head: true }).eq('event_type', 'redirect'),
    admin
      .from('batches')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('codes')
      .select('id, code, destination_url, activated_at')
      .not('activated_at', 'is', null)
      .order('activated_at', { ascending: false })
      .limit(5),
  ]);

  const totalBatches = batchesRes.count ?? 0;
  const totalCodes = codesRes.count ?? 0;
  const unclaimed = unclaimedRes.count ?? 0;
  const active = activeRes.count ?? 0;
  const disabled = disabledRes.count ?? 0;
  const totalScans = scansRes.count ?? 0;

  const recentBatchRows = (recentBatchesRes.data ?? []) as Pick<BatchRow, 'id' | 'name' | 'created_at'>[];
  const recentBatchIds = recentBatchRows.map((b) => b.id);
  const codeCountByBatch: Record<string, number> = {};
  if (recentBatchIds.length > 0) {
    const { data: batchCodes } = await admin
      .from('codes')
      .select('batch_id')
      .in('batch_id', recentBatchIds);
    for (const c of (batchCodes ?? []) as Pick<CodeRow, 'batch_id'>[]) {
      if (c.batch_id) codeCountByBatch[c.batch_id] = (codeCountByBatch[c.batch_id] ?? 0) + 1;
    }
  }
  const recentBatches = recentBatchRows.map((b) => ({
    id: b.id,
    name: b.name,
    created_at: b.created_at,
    codeCount: codeCountByBatch[b.id] ?? 0,
  }));

  const recentActivations = ((recentActivationsRes.data ?? []) as Pick<
    CodeRow, 'id' | 'code' | 'destination_url' | 'activated_at'
  >[]).map((c) => ({
    id: c.id,
    code: c.code,
    destination_url: c.destination_url,
    activated_at: c.activated_at,
  }));

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="portal-kicker">Command center</p>
          <h1 className="portal-title mt-1">Operations overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor production, activation, and customer activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/codes" className="btn-secondary-np h-10 bg-white px-4">Manage codes</Link>
          <Link href="/admin/batches/create" className="btn-accent-np h-10 px-4">+ Generate batch</Link>
        </div>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Statistics
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Batches" value={totalBatches} />
          <StatCard label="Codes" value={totalCodes} />
          <StatCard label="Unclaimed" value={unclaimed} />
          <StatCard label="Active" value={active} accent />
          <StatCard label="Disabled" value={disabled} />
          <StatCard label="Total scans" value={totalScans} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-batches-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-batches-heading" className="font-display text-lg font-bold tracking-tight">
              Recent batches
            </h2>
            <Link href="/admin/batches" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
              View all →
            </Link>
          </div>
          <div className="portal-panel divide-y divide-border overflow-hidden">
            {recentBatches.length === 0 ? (
              <EmptyRow label="No batches yet." />
            ) : (
              recentBatches.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/batches/${b.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.created_at)}</p>
                  </div>
                  <span className="badge-np ml-3 shrink-0 bg-secondary text-secondary-foreground">
                    {b.codeCount} {b.codeCount === 1 ? 'code' : 'codes'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section aria-labelledby="recent-activations-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-activations-heading" className="font-display text-lg font-bold tracking-tight">
              Recent activations
            </h2>
            <Link href="/admin/codes" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
              View all →
            </Link>
          </div>
          <div className="portal-panel divide-y divide-border overflow-hidden">
            {recentActivations.length === 0 ? (
              <EmptyRow label="No activations yet." />
            ) : (
              recentActivations.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/codes/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-foreground">{formatCode(c.code)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.destination_url ? getHostname(c.destination_url) : '—'}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                    {c.activated_at ? formatDate(c.activated_at) : '—'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-4 py-8 text-center text-sm text-muted-foreground">{label}</div>;
}
