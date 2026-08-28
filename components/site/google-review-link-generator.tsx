'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function GoogleReviewLinkGenerator() {
  const [placeId, setPlaceId] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmedId = placeId.trim();
  const trimmedName = name.trim();
  const reviewUrl =
    trimmedId.length > 0
      ? `https://search.google.com/local/writereview?placeid=${trimmedId}`
      : '';

  function handleCopy() {
    if (!reviewUrl) return;
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    toast.success('Review link copied');
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Generate your link</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your Google Place ID to generate a direct link to your review page.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="business-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Business name (optional)
            </label>
            <input
              id="business-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Street Diner"
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div>
            <label htmlFor="place-id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Google Place ID
            </label>
            <input
              id="place-id"
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="e.g. ChIJN1t_tDeuEmsRUsoyGh..."
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Find your Place ID at{' '}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Google&apos;s Place ID finder <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-accent/30 p-6">
        <h2 className="text-base font-semibold text-foreground">Your review link</h2>
        {reviewUrl ? (
          <>
            <div className="mt-4 break-all rounded-lg border border-border bg-card p-3 text-sm text-foreground">
              {reviewUrl}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-primary-np inline-flex"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-np inline-flex"
              >
                Test link <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
            {trimmedName ? (
              <p className="mt-4 text-xs text-muted-foreground">
                For <span className="font-semibold text-foreground">{trimmedName}</span>
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Your generated link will appear here once you enter a Place ID.
          </p>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          This tool creates a standard Google review URL. NFCPlate is not affiliated with or endorsed by Google.
        </p>
      </div>
    </div>
  );
}
