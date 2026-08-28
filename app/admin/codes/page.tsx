import { createAdminClient } from '@/lib/supabase/admin';
import { AdminCodesTable } from '@/components/site/admin-codes-table';
import type { Database } from '@/lib/supabase/database.types';

type BatchRow = Database['public']['Tables']['batches']['Row'];

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Codes' };

export default async function AdminCodesPage() {
  const admin = createAdminClient();
  const { data } = await admin.from('batches').select('id, name').order('name', { ascending: true });
  const batches = ((data ?? []) as Pick<BatchRow, 'id' | 'name'>[]).map((b) => ({ id: b.id, name: b.name }));

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Codes
        </h1>
        <p className="text-sm text-muted-foreground">Search, filter, and manage all codes.</p>
      </header>

      <AdminCodesTable batches={batches} />
    </div>
  );
}
