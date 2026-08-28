import Link from 'next/link';
import { AdminBatchCreate } from '@/components/site/admin-batch-create';

export const metadata = { title: 'Create Batch' };

export default function AdminBatchCreatePage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/batches" className="font-medium text-muted-foreground hover:text-foreground">
          ← Batches
        </Link>
      </nav>

      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Create batch
        </h1>
        <p className="text-sm text-muted-foreground">Generate a new set of NFC codes.</p>
      </header>

      <div className="card-np max-w-2xl p-6 sm:p-8">
        <AdminBatchCreate />
      </div>
    </div>
  );
}
