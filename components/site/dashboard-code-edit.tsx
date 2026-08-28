'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { destinationUrlSchema } from '@/lib/code-utils';
import { cn } from '@/lib/utils';

const inputClass =
  'h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60';

/**
 * Client component for editing a code's destination URL.
 *
 * - Validates the URL with the shared `destinationUrlSchema` (http/https only).
 * - Shows a confirmation dialog before replacing the current destination.
 * - Calls `supabase.rpc('update_destination', …)` on confirm.
 * - Provides "Test link" (opens destination in a new tab) and "Copy permanent URL" actions.
 */
export function DashboardCodeEdit({
  code,
  permanentUrl,
  currentDestination,
}: {
  code: string;
  permanentUrl: string;
  currentDestination: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [url, setUrl] = React.useState(currentDestination ?? '');
  const [error, setError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Reset to current destination if the prop changes (e.g. after refresh)
  React.useEffect(() => {
    setUrl(currentDestination ?? '');
  }, [currentDestination]);

  // Clear the "copied" indicator after a couple seconds
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Close the dialog on Escape
  React.useEffect(() => {
    if (!showConfirm) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowConfirm(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm]);

  function handleUrlChange(val: string) {
    setUrl(val);
    setFieldError(null);
    setError(null);
    setSuccess(null);
  }

  function validate(): boolean {
    const parsed = destinationUrlSchema.safeParse(url);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Enter a valid URL');
      return false;
    }
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!validate()) return;

    // If the URL hasn't changed, nothing to do
    if (url.trim() === (currentDestination ?? '').trim()) {
      setSuccess('Destination is already set to this URL.');
      return;
    }

    // Open the confirmation dialog
    setShowConfirm(true);
  }

  async function confirmUpdate() {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('update_destination', {
        code_input: code,
        destination_input: url.trim(),
      });

      if (rpcError) {
        setError(rpcError.message || 'Failed to update destination. Please try again.');
        setLoading(false);
        return;
      }

      // The RPC returns { success: boolean; error: string }[]
      const result = (data as { success: boolean; error: string } | { success: boolean; error: string }[] | null);
      const first = Array.isArray(result) ? result[0] : result;

      if (first && !first.success) {
        setError(first.error || 'Failed to update destination. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Destination updated successfully. Future taps will redirect to your new link.');
      setLoading(false);
      // Refresh server data so the page reflects the new destination
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  function cancelConfirm() {
    setShowConfirm(false);
  }

  async function copyPermanentUrl() {
    try {
      await navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = permanentUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        setError('Could not copy to clipboard. Please copy the URL manually.');
      }
      document.body.removeChild(textarea);
    }
  }

  const hasDestination = !!url.trim() && url.trim().startsWith('http');

  return (
    <div className="card-np p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
        Destination URL
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is where customers go when they tap your NFCPlate product.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3" aria-label="Update destination URL">
        {error ? (
          <div role="alert" aria-live="polite" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div role="status" aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <div>
          <label htmlFor="destination-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination URL
          </label>
          <input
            id="destination-url"
            name="destination_url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://your-review-page.com"
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? 'destination-url-error' : 'destination-url-hint'}
            className={cn(inputClass, fieldError && 'border-destructive/60')}
            disabled={loading}
            autoComplete="url"
          />
          {fieldError ? (
            <p id="destination-url-error" className="mt-1.5 text-xs text-destructive">
              {fieldError}
            </p>
          ) : (
            <p id="destination-url-hint" className="mt-1.5 text-xs text-muted-foreground">
              Must start with http:// or https://
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn-primary-np"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              'Save destination'
            )}
          </button>

          {hasDestination && (
            <a
              href={url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-np"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
              Test link
            </a>
          )}
        </div>
      </form>

      {/* Permanent URL + copy */}
      <div className="mt-6 border-t border-border pt-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Permanent NFCPlate URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground">
            {permanentUrl}
          </code>
          <button
            type="button"
            onClick={copyPermanentUrl}
            className="btn-secondary-np shrink-0"
            aria-label="Copy permanent URL to clipboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1.5">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Share this link or print its QR code — it always redirects to your current destination.
        </p>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelConfirm();
          }}
        >
          <div className="card-np w-full max-w-sm p-6">
            <h3 id="confirm-dialog-title" className="font-display text-lg font-bold text-foreground">
              Replace destination link?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will replace the current destination. Future taps of your NFCPlate product
              will go to the new URL.
            </p>
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current</span>
                <p className="mt-0.5 truncate text-foreground">
                  {currentDestination || 'None'}
                </p>
              </div>
              <div className="border-t border-border pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New</span>
                <p className="mt-0.5 truncate text-foreground">{url.trim()}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={cancelConfirm}
                className="btn-secondary-np flex-1"
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpdate}
                className="btn-primary-np flex-1"
              >
                Confirm update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
