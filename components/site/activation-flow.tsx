'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Link2,
  AlertCircle,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { destinationUrlSchema, getHostname, permanentCodeUrl } from '@/lib/code-utils';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/site/logo';

type ActivationFlowProps = {
  code: string;
  formattedCode: string;
  nextPath: string;
  currentDestination: string | null;
};

const TOTAL_STEPS = 4;

export function ActivationFlow({
  code,
  formattedCode,
  nextPath,
  currentDestination,
}: ActivationFlowProps) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState(currentDestination ?? '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setIsAuthenticated(Boolean(user));
    });
    return () => { cancelled = true; };
  }, []);

  const router = useRouter();
  const permanentUrl = permanentCodeUrl(code);

  function goToStep(n: number) {
    setStep(Math.min(TOTAL_STEPS, Math.max(1, n)));
  }

  function validateUrl(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) return 'Destination URL is required';
    const result = destinationUrlSchema.safeParse(trimmed);
    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Enter a valid URL';
    }
    return null;
  }

  function handleContinueFromUrl() {
    const err = validateUrl(url);
    setUrlError(err);
    if (err) return;
    goToStep(3);
  }

  async function handleActivate() {
    const trimmed = url.trim();
    const err = validateUrl(trimmed);
    if (err) {
      setUrlError(err);
      setStep(2);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('claim_code', {
        code_input: code,
        destination_input: trimmed,
      });

      if (error) {
        setSubmitError(error.message || 'We couldn’t activate this code. Please try again.');
        return;
      }

      const result = Array.isArray(data) ? data[0] : undefined;

      if (!result) {
        setSubmitError('We couldn’t activate this code. Please try again.');
        return;
      }

      if (result.success) {
        goToStep(4);
        return;
      }

      // Already owned by this user → send them to manage it.
      const msg = (result.error ?? '').toLowerCase();
      if (msg.includes('own') || msg.includes('already') || msg.includes('claim')) {
        router.push('/dashboard/codes');
        return;
      }

      setSubmitError(result.error || 'We couldn’t activate this code. Please try again.');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const hostname = (() => {
    const trimmed = url.trim();
    if (trimmed.length === 0) return '';
    return getHostname(trimmed);
  })();

  return (
    <div className="container-np flex min-h-[100svh] flex-col items-center py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <ProgressDots current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step 1 — Code info */}
        {step === 1 && (
          <div className="card-np p-7 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent"
                aria-hidden="true"
              >
                <Sparkles className="h-7 w-7" />
              </span>

              <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground">
                Activate your plate
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This NFCPlate product is ready to activate. Link it to a destination in just a few
                taps.
              </p>
            </div>

            {/* Code card */}
            <div className="mt-7 rounded-xl border border-border bg-accent/5 p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Your code
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-[0.12em] text-foreground">
                {formattedCode}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                <span className="break-all">{permanentUrl.replace(/^https?:\/\//, '')}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This link will always send visitors to your chosen destination.
              </p>
            </div>

            <div className="mt-7">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="btn-primary-np w-full text-base"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    Sign in or create a free account to continue.
                  </p>
                  <Link
                    href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
                    className="btn-primary-np w-full text-base"
                  >
                    Sign in <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href={`/auth/sign-up?next=${encodeURIComponent(nextPath)}`}
                    className="btn-secondary-np w-full text-base"
                  >
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Destination URL */}
        {step === 2 && (
          <div className="card-np p-7 sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Where should it go?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enter the web address your plate should open when tapped. You can change this later.
            </p>

            <div className="mt-6">
              <label
                htmlFor="destination-url"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Destination URL
              </label>
              <input
                id="destination-url"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://your-link.com"
                className="mt-2 h-14 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-invalid={urlError ? true : undefined}
              />
              {urlError ? (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{urlError}</span>
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Must start with http:// or https://
                </p>
              )}
            </div>

            <Link
              href="/tools/google-review-link-generator"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Wrench className="h-4 w-4" />
              Need a Google review link? Use our free generator
            </Link>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="btn-secondary-np w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleContinueFromUrl}
                className="btn-primary-np w-full text-base sm:w-auto"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="card-np p-7 sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Looks good?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Review the details below, then activate your plate.
            </p>

            <dl className="mt-6 space-y-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Code
                </dt>
                <dd className="mt-1 font-display text-xl font-extrabold tracking-[0.1em] text-foreground">
                  {formattedCode}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-foreground">{url.trim()}</dd>
                {hostname ? (
                  <dd className="mt-1 text-xs text-muted-foreground">{hostname}</dd>
                ) : null}
              </div>
            </dl>

            {submitError ? (
              <p className="mt-5 flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </p>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={submitting}
                className="btn-secondary-np w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleActivate}
                disabled={submitting}
                className="btn-primary-np w-full text-base sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Activating…
                  </>
                ) : (
                  <>
                    Activate <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="card-np p-7 text-center sm:p-8">
            <span
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent"
              aria-hidden="true"
            >
              <Check className="h-8 w-8" />
            </span>

            <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground">
              Your code is active!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your plate is now linked. Tap it or share the link to send people straight to your
              destination.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-accent/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Code
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-[0.12em] text-foreground">
                {formattedCode}
              </p>
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination
                </p>
                <p className="mt-1 break-all text-sm font-medium text-foreground">{url.trim()}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <a
                href={url.trim() || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-np w-full text-base"
              >
                Test link <ExternalLink className="ml-2 h-5 w-5" />
              </a>
              <Link href="/dashboard/codes" className="btn-primary-np w-full text-base">
                Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Having trouble?{' '}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={n}>
            <span
              className={
                'block h-2 w-2 rounded-full transition-colors ' +
                (active
                  ? 'bg-accent'
                  : done
                    ? 'bg-accent/50'
                    : 'bg-border')
              }
              aria-hidden="true"
            />
            <span className="sr-only">Step {n}{active ? ' (current)' : done ? ' (done)' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
