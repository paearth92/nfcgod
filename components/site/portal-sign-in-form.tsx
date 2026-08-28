'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

type Portal = 'customer' | 'admin';

type SignInResponse =
  | {
      success: true;
      destination: string;
    }
  | {
      success: false;
      error: string;
    };

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type SignInValues = z.infer<typeof signInSchema>;

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

export function PortalSignInForm({
  portal,
  next,
}: {
  portal: Portal;
  next?: string | null;
}) {
  const isAdmin = portal === 'admin';

  const [values, setValues] = React.useState<SignInValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof SignInValues, string>>
  >({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function updateValue<K extends keyof SignInValues>(
    key: K,
    value: SignInValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));

    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setErrors({});

    const parsed = signInSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof SignInValues, string>> = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof SignInValues;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: parsed.data.email.trim().toLowerCase(),
          password: parsed.data.password,
          portal,
          next: next ?? null,
        }),
      });

      let result: SignInResponse;

      try {
        result = (await response.json()) as SignInResponse;
      } catch {
        setFormError(
          'The sign-in service returned an invalid response. Please try again.'
        );
        setLoading(false);
        return;
      }

      if (!response.ok || !result.success) {
        setFormError(
          result.success
            ? 'Unable to sign in. Please try again.'
            : result.error
        );
        setLoading(false);
        return;
      }

      window.location.replace(result.destination);
    } catch {
      setFormError(
        'Could not connect to the sign-in service. Check your connection and try again.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="card-np w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          {isAdmin ? 'Admin Sign In' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isAdmin
            ? 'Authorized NFCPlate administrators only.'
            : 'Sign in to manage your NFCPlate products.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label={isAdmin ? 'Admin sign in form' : 'Customer sign in form'}
      >
        {formError ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <label htmlFor={`${portal}-signin-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${portal}-signin-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            placeholder={isAdmin ? 'admin@nfcplate.com' : 'you@example.com'}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? `${portal}-signin-email-error` : undefined
            }
            className={cn(
              inputClass,
              errors.email && 'border-destructive/60'
            )}
            disabled={loading}
          />
          {errors.email ? (
            <p
              id={`${portal}-signin-email-error`}
              className="mt-1.5 text-xs text-destructive"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor={`${portal}-signin-password`} className={labelClass}>
              Password
            </label>
            {!isAdmin ? (
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-accent hover:text-accent-hover hover:underline"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <input
            id={`${portal}-signin-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={(event) => updateValue('password', event.target.value)}
            placeholder="Your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? `${portal}-signin-password-error` : undefined
            }
            className={cn(
              inputClass,
              errors.password && 'border-destructive/60'
            )}
            disabled={loading}
          />
          {errors.password ? (
            <p
              id={`${portal}-signin-password-error`}
              className="mt-1.5 text-xs text-destructive"
            >
              {errors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="btn-primary-np w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Signing in…
            </>
          ) : isAdmin ? (
            'Sign in to admin'
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isAdmin ? (
          <>
            Not an administrator?{' '}
            <Link
              href="/auth/sign-in"
              className="font-semibold text-accent hover:text-accent-hover hover:underline"
            >
              Customer sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href={
                next
                  ? `/auth/sign-up?next=${encodeURIComponent(next)}`
                  : '/auth/sign-up'
              }
              className="font-semibold text-accent hover:text-accent-hover hover:underline"
            >
              Create account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
