'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateBatch } from '@/lib/admin-actions';
import { getAccessToken } from '@/lib/supabase/access-token';
import { formatCode, permanentCodeUrl } from '@/lib/code-utils';

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60';

const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

export function AdminBatchCreate() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [prefix, setPrefix] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [quantity, setQuantity] = React.useState('100');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generated, setGenerated] = React.useState<string[] | null>(null);

  const qtyNum = Number(quantity);
  const qtyValid = Number.isFinite(qtyNum) && Number.isInteger(qtyNum) && qtyNum >= 1 && qtyNum <= 5000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Batch name is required.');
      return;
    }
    if (!qtyValid) {
      setError('Quantity must be a whole number between 1 and 5000.');
      return;
    }

    setLoading(true);
    const accessToken = await getAccessToken();
    const result = await generateBatch(
      accessToken,
      name.trim(),
      prefix.trim() || null,
      notes.trim() || null,
      qtyNum
    );
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setGenerated(result.codes ?? []);
  }

  if (generated) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {generated.length} {generated.length === 1 ? 'code' : 'codes'} generated successfully.
        </div>

        <div className="card-np p-5">
          <h2 className="font-display text-lg font-bold tracking-tight">Generated codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Batch <span className="font-semibold text-foreground">{name}</span> — {generated.length} codes.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3 lg:grid-cols-4">
            {generated.map((c) => (
              <span key={c} className="rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center">
                {formatCode(c)}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const text = generated.map((c) => permanentCodeUrl(c)).join('\n');
                navigator.clipboard?.writeText(text);
              }}
              className="btn-secondary-np"
            >
              Copy all URLs
            </button>
            <button
              type="button"
              onClick={() => {
                const csv = ['code,url', ...generated.map((c) => `${formatCode(c)},${permanentCodeUrl(c)}`)].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-codes.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="btn-secondary-np"
            >
              Download CSV
            </button>
            <Link href="/admin/batches" className="btn-primary-np">
              View batches
            </Link>
            <button
              type="button"
              onClick={() => {
                setName('');
                setPrefix('');
                setNotes('');
                setQuantity('100');
                setGenerated(null);
                setError(null);
              }}
              className="btn-secondary-np"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="batch-name" className={labelClass}>
          Batch name <span className="text-destructive">*</span>
        </label>
        <input
          id="batch-name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Holiday 2025 run"
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="batch-prefix" className={labelClass}>
            Prefix (optional)
          </label>
          <input
            id="batch-prefix"
            type="text"
            maxLength={16}
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="e.g. H25"
            className={inputClass}
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Stored for reference only (max 16 chars).</p>
        </div>

        <div>
          <label htmlFor="batch-quantity" className={labelClass}>
            Quantity <span className="text-destructive">*</span>
          </label>
          <input
            id="batch-quantity"
            type="number"
            min={1}
            max={5000}
            step={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`${inputClass} ${!qtyValid && quantity !== '' ? 'border-destructive/60' : ''}`}
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Between 1 and 5000 codes.</p>
        </div>
      </div>

      <div>
        <label htmlFor="batch-notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="batch-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this batch…"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary-np" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" aria-hidden="true" />
              Generating…
            </>
          ) : (
            <>Generate {qtyValid ? qtyNum : ''} codes</>
          )}
        </button>
        <button type="button" onClick={() => router.push('/admin/batches')} className="btn-secondary-np" disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
