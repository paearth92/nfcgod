import { Search, UserRound } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AnySupabase = any;

export const metadata = { title: 'Customers' };
export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const admin = createAdminClient() as unknown as AnySupabase;
  const [{ data: profileData, error }, { data: codeData }, { data: orderData }] = await Promise.all([
    admin.from('profiles').select('id, full_name, business_name, role, created_at').eq('role', 'customer').order('created_at', { ascending: false }).limit(250),
    admin.from('codes').select('owner_id').not('owner_id', 'is', null),
    admin.from('orders').select('user_id').not('user_id', 'is', null),
  ]);

  const codeCounts: Record<string, number> = {};
  const orderCounts: Record<string, number> = {};
  for (const row of codeData ?? []) if (row.owner_id) codeCounts[row.owner_id] = (codeCounts[row.owner_id] ?? 0) + 1;
  for (const row of orderData ?? []) if (row.user_id) orderCounts[row.user_id] = (orderCounts[row.user_id] ?? 0) + 1;

  const needle = searchParams.q?.trim().toLowerCase() ?? '';
  const customers = ((profileData ?? []) as ProfileRow[]).filter((customer) => {
    if (!needle) return true;
    return customer.full_name?.toLowerCase().includes(needle) || customer.business_name?.toLowerCase().includes(needle);
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="portal-kicker">Relationships</p><h1 className="portal-title mt-1">Customers</h1><p className="mt-1 text-sm text-muted-foreground">Accounts, products, and order activity in one place.</p></div>
        <span className="inline-flex w-fit rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">{customers.length} customers</span>
      </header>

      <form method="GET" className="portal-panel p-3">
        <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search customers</span><input name="q" defaultValue={searchParams.q ?? ''} placeholder="Search by customer or business name" className="portal-input w-full pl-10" /></label>
      </form>

      {error ? (
        <div className="portal-panel p-8 text-center"><p className="font-bold text-foreground">Customers could not be loaded</p><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p></div>
      ) : customers.length === 0 ? (
        <div className="portal-panel p-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4b942]/20 text-[#8a5b00]"><UserRound className="h-5 w-5" /></span><h2 className="mt-4 font-bold text-foreground">No customers found</h2><p className="mt-1 text-sm text-muted-foreground">Customer accounts will appear here after signup.</p></div>
      ) : (
        <div className="portal-panel overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="border-b border-black/[0.07] bg-[#faf7f1]"><tr><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Customer</th><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Business</th><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Products</th><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Orders</th><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Joined</th></tr></thead><tbody className="divide-y divide-black/[0.06]">{customers.map((customer) => <tr key={customer.id} className="transition hover:bg-[#faf7f1]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171512] text-xs font-black text-[#f4b942]">{(customer.full_name || 'C').charAt(0).toUpperCase()}</span><span><span className="block font-bold text-foreground">{customer.full_name || 'Customer'}</span><span className="block font-mono text-[10px] text-muted-foreground">{customer.id.slice(0, 8)}…</span></span></div></td><td className="px-5 py-4 text-muted-foreground">{customer.business_name || '—'}</td><td className="px-5 py-4 font-bold text-foreground">{codeCounts[customer.id] ?? 0}</td><td className="px-5 py-4 font-bold text-foreground">{orderCounts[customer.id] ?? 0}</td><td className="px-5 py-4 text-muted-foreground">{formatDate(customer.created_at)}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
