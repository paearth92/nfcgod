import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCode, getHostname, permanentCodeUrl } from '@/lib/code-utils';
import { StatusBadge } from '@/components/site/admin-batch-detail';
import { AdminCodeDetailActions } from '@/components/site/admin-code-detail';
import type { Database } from '@/lib/supabase/database.types';

type CodeRow = Database['public']['Tables']['codes']['Row'];
type CodeEvent = Database['public']['Tables']['code_events']['Row'];
type BatchRow = Database['public']['Tables']['batches']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const metadata = { title: 'Code Detail' };

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminCodeDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: codeData } = await admin
    .from('codes')
    .select('id, code, status, destination_url, created_at, activated_at, owner_id, batch_id')
    .eq('id', params.id)
    .maybeSingle();

  const code = codeData as Pick<
    CodeRow, 'id' | 'code' | 'status' | 'destination_url' | 'created_at' | 'activated_at' | 'owner_id' | 'batch_id'
  > | null;
  if (!code) notFound();

  // Batch + owner profile via separate lookups (no typed join).
  let batchName: string | null = null;
  if (code.batch_id) {
    const { data: b } = await admin
      .from('batches')
      .select('name')
      .eq('id', code.batch_id)
      .maybeSingle();
    batchName = (b as Pick<BatchRow, 'name'> | null)?.name ?? null;
  }

  let ownerEmail: string | null = null;
  let ownerName: string | null = null;
  if (code.owner_id) {
    const { data: p } = await admin
      .from('profiles')
      .select('email, full_name, business_name')
      .eq('id', code.owner_id)
      .maybeSingle();
    // profiles table has no email column; email lives on auth.users. Show name fields only.
    const prof = p as Pick<ProfileRow, 'full_name' | 'business_name'> | null;
    ownerName = prof?.full_name ?? prof?.business_name ?? null;
  }

  const { data: eventData } = await admin
    .from('code_events')
    .select('id, event_type, created_at, referrer, user_agent')
    .eq('code_id', code.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const events = (eventData ?? []) as Pick<
    CodeEvent, 'id' | 'event_type' | 'created_at' | 'referrer' | 'user_agent'
  >[];

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/codes" className="font-medium text-muted-foreground hover:text-foreground">
          ← Codes
        </Link>
      </nav>

      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Code</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {formatCode(code.code)}
          </h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">{permanentCodeUrl(code.code)}</p>
        </div>
        <StatusBadge status={code.status} />
      </header>

      {/* Info grid */}
      <div className="card-np p-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Status" value={code.status} />
          <InfoItem label="Destination" value={code.destination_url ?? '—'} />
          <InfoItem label="Destination host" value={code.destination_url ? getHostname(code.destination_url) : '—'} />
          <InfoItem label="Batch" value={batchName ? batchName : '—'} />
          <InfoItem label="Owner" value={ownerName ?? (code.owner_id ? code.owner_id.slice(0, 8) : 'Unclaimed')} />
          <InfoItem label="Created" value={formatDateTime(code.created_at)} />
          <InfoItem label="Activated" value={code.activated_at ? formatDateTime(code.activated_at) : '—'} />
        </dl>
        {batchName && code.batch_id ? (
          <div className="mt-4 border-t border-border pt-4">
            <Link href={`/admin/batches/${code.batch_id}`} className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
              View batch →
            </Link>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <AdminCodeDetailActions
        codeId={code.id}
        code={code.code}
        status={code.status}
        destinationUrl={code.destination_url}
      />

      {/* Events */}
      <div className="card-np overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-bold tracking-tight">Event history</h2>
          <span className="badge-np bg-secondary text-secondary-foreground">{events?.length ?? 0}</span>
        </div>
        {events && events.length > 0 ? (
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="badge-np bg-secondary text-secondary-foreground">{e.event_type}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                </div>
                {e.referrer ? (
                  <p className="mt-1.5 truncate text-xs text-muted-foreground">Referrer: {e.referrer}</p>
                ) : null}
                {e.user_agent ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">UA: {e.user_agent}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No events recorded.</p>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}
