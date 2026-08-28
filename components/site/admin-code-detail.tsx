'use client';

import * as React from 'react';
import { updateCodeDestination, setCodeStatus } from '@/lib/admin-actions';
import { getAccessToken } from '@/lib/supabase/access-token';
import { formatCode, getHostname, permanentCodeUrl, destinationUrlSchema } from '@/lib/code-utils';
import { StatusBadge } from '@/components/site/admin-batch-detail';

type CodeStatus = 'unclaimed' | 'active' | 'disabled';

export function AdminCodeDetailActions({
  codeId,
  code,
  status,
  destinationUrl,
}: {
  codeId: string;
  code: string;
  status: CodeStatus;
  destinationUrl: string | null;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [url, setUrl] = React.useState(destinationUrl ?? '');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [qrOpen, setQrOpen] = React.useState(false);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function save() {
    setError(null);
    const parsed = destinationUrlSchema.safeParse(url.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid URL.');
      return;
    }
    setLoading(true);
    const accessToken = await getAccessToken();
    const result = await updateCodeDestination(accessToken, codeId, parsed.data);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditOpen(false);
    flash('Destination updated.');
    window.location.reload();
  }

  async function toggle() {
    setLoading(true);
    const next = status === 'disabled' ? 'enabled' : 'disabled';
    const accessToken = await getAccessToken();
    const result = await setCodeStatus(accessToken, codeId, next);
    setLoading(false);
    if (!result.success) {
      flash(result.error);
      return;
    }
    flash(next === 'disabled' ? 'Code disabled.' : 'Code re-enabled.');
    window.location.reload();
  }

  function copy() {
    navigator.clipboard?.writeText(permanentCodeUrl(code));
    flash('URL copied.');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { setUrl(destinationUrl ?? ''); setError(null); setEditOpen(true); }} className="btn-primary-np" disabled={loading}>
          Edit destination
        </button>
        <button type="button" onClick={toggle} className="btn-secondary-np" disabled={loading}>
          {status === 'disabled' ? 'Re-enable' : 'Disable'}
        </button>
        <button type="button" onClick={copy} className="btn-secondary-np" disabled={loading}>
          Copy URL
        </button>
        <button type="button" onClick={() => setQrOpen(true)} className="btn-secondary-np" disabled={loading}>
          View QR
        </button>
      </div>

      {/* Edit inline panel */}
      {editOpen ? (
        <div className="card-np p-5">
          <h2 className="font-display text-base font-bold tracking-tight">Edit destination</h2>
          <label htmlFor="code-url" className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination URL
          </label>
          <input
            id="code-url"
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="https://example.com/review"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            disabled={loading}
          />
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={save} className="btn-primary-np" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary-np" disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* QR */}
      {qrOpen ? (
        <div className="card-np p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold tracking-tight">QR code</h2>
            <button type="button" onClick={() => setQrOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close QR">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(permanentCodeUrl(code))}`}
              alt={`QR code for ${formatCode(code)}`}
              width={200}
              height={200}
              className="rounded-lg border border-border"
            />
            <p className="break-all text-center text-xs text-muted-foreground">{permanentCodeUrl(code)}</p>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg animate-fade-in-up">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
