import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminBatchDetail } from '@/components/site/admin-batch-detail';
import type { Database } from '@/lib/supabase/database.types';

type BatchRow = Database['public']['Tables']['batches']['Row'];
type CodeRow = Database['public']['Tables']['codes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const metadata = { title: 'Batch Detail' };

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminBatchDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: batchData } = await admin
    .from('batches')
    .select('id, name, prefix, notes, created_at, created_by')
    .eq('id', params.id)
    .maybeSingle();

  const batch = batchData as Pick<BatchRow, 'id' | 'name' | 'prefix' | 'notes' | 'created_at' | 'created_by'> | null;
  if (!batch) notFound();

  // Creator profile (email not in profiles table; fetch id/time only).
  let createdBy: string | null = null;
  if (batch.created_by) {
    const { data: creator } = await admin
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', batch.created_by)
      .maybeSingle();
    const c = creator as Pick<ProfileRow, 'full_name' | 'business_name'> | null;
    createdBy = c?.full_name ?? c?.business_name ?? batch.created_by.slice(0, 8);
  }

  // Codes + status counts.
  const { data: codeRows } = await admin
    .from('codes')
    .select('id, code, status, destination_url')
    .eq('batch_id', batch.id)
    .order('created_at', { ascending: true });

  const codes = ((codeRows ?? []) as Pick<CodeRow, 'id' | 'code' | 'status' | 'destination_url'>[]).map((c) => ({
    id: c.id,
    code: c.code,
    status: c.status,
    destination_url: c.destination_url,
  }));

  const counts = {
    unclaimed: codes.filter((c) => c.status === 'unclaimed').length,
    active: codes.filter((c) => c.status === 'active').length,
    disabled: codes.filter((c) => c.status === 'disabled').length,
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/batches" className="font-medium text-muted-foreground hover:text-foreground">
          ← Batches
        </Link>
      </nav>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Batch</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {batch.name}
          </h1>
        </div>
      </header>

      {/* Info grid */}
      <div className="card-np p-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Prefix" value={batch.prefix ? batch.prefix : '—'} mono />
          <InfoItem label="Created" value={formatDate(batch.created_at)} />
          <InfoItem label="Created by" value={createdBy ?? '—'} />
          <InfoItem label="Total codes" value={String(codes.length)} />
        </dl>
        {batch.notes ? (
          <div className="mt-4 border-t border-border pt-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">{batch.notes}</dd>
          </div>
        ) : null}
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 gap-4">
        <CountCard label="Unclaimed" value={counts.unclaimed} className="bg-amber-50" />
        <CountCard label="Active" value={counts.active} className="bg-emerald-50" />
        <CountCard label="Disabled" value={counts.disabled} className="bg-red-50" />
      </div>

      <AdminBatchDetail batchId={batch.id} batchName={batch.name} codes={codes} />
    </div>
  );
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function CountCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`card-np p-4 ${className ?? ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
