'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Safe redirect target: must be a same-origin path starting with "/". */
function safeNext(next: string | undefined): string {
  if (!next || typeof next !== 'string') return '/dashboard';
  // Reject anything that is not a relative path on this origin.
  if (!next.startsWith('/') || next.startsWith('//')) return '/dashboard';
  return next;
}

/** Friendly, human-readable Supabase auth error messages. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('email not confirmed')) {
    return 'This account exists but the email has not been confirmed.';
  }
  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  if (m.includes('for security purposes') || m.includes('over the rate limit')) {
    return 'For security, please wait a moment before trying again.';
  }
  return message || 'Something went wrong. Please try again.';
}

/** Consistent input styling matching the NFCPlate design system. */
const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60';

const labelClass =
  'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

/** Inline alert shown for errors. */
function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

/** Inline success banner. */
function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {message}
    </div>
  );
}

/** Reusable auth card shell with the NFCPlate logo at top. */
function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-np w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/" className="mb-4 inline-flex" aria-label="NFCPlate home">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M8 12h8" />
              <path d="M12 8c1.5 1.5 1.5 5 0 6.5" opacity="0.7" />
              <path d="M14.5 8c1.5 1.5 1.5 5 0 6.5" opacity="0.4" />
            </svg>
          </span>
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sign In                                                                    */
/* -------------------------------------------------------------------------- */

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm({ next }: { next?: string }) {
  const supabase = createClient();

  const [values, setValues] = React.useState<SignInValues>({ email: '', password: '' });
  const [errors, setErrors] = React.useState<Partial<Record<keyof SignInValues, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const destination = React.useMemo(() => safeNext(next), [next]);

  function update<K extends keyof SignInValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SignInValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SignInValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email.trim().toLowerCase(),
        password: parsed.data.password,
      });

      if (error) {
        setFormError(friendlyAuthError(error.message));
        setLoading(false);
        return;
      }

      // On success, hard-navigate to the destination. Using window.location
      // instead of router.push ensures the freshly-set auth cookies are
      // sent with a full page request, avoiding RSC streaming issues.
      window.location.assign(destination);
    } catch {
      setFormError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" description="Sign in to your NFCPlate account.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Sign in form">
        {formError ? <ErrorAlert message={formError} /> : null}

        <div>
          <label htmlFor="signin-email" className={labelClass}>
            Email
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signin-email-error' : undefined}
            className={cn(inputClass, errors.email && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.email ? (
            <p id="signin-email-error" className="mt-1.5 text-xs text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className={labelClass}>
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-accent hover:text-accent-hover hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'signin-password-error' : undefined}
            className={cn(inputClass, errors.password && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.password ? (
            <p id="signin-password-error" className="mt-1.5 text-xs text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary-np w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/sign-up${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sign Up                                                                    */
/* -------------------------------------------------------------------------- */

const signUpSchema = z
  .object({
    full_name: z.string().min(1, 'Your name is required').max(80, 'Name is too long'),
    business_name: z.string().max(120, 'Business name is too long').optional().or(z.literal('')),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password is too long'),
  })
  .refine((d) => d.business_name !== undefined, { path: ['business_name'], message: '' });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm({ next }: { next?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = React.useState<SignUpValues>({
    full_name: '',
    business_name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof SignUpValues, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const destination = React.useMemo(() => safeNext(next), [next]);

  function update<K extends keyof SignUpValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SignUpValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SignUpValues;
        if (key && !fieldErrors[key] && issue.message) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const email = parsed.data.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.full_name.trim(),
            business_name: parsed.data.business_name?.trim() || null,
          },
        },
      });

      if (error) {
        setFormError(friendlyAuthError(error.message));
        setLoading(false);
        return;
      }

      // If a session is returned immediately (email confirmation off),
      // the user is signed in — hard-navigate to the destination.
      if (data.session) {
        window.location.assign(destination);
        return;
      }

      // Otherwise (email confirmation on, or no session yet), show a
      // success state and then route to sign-in so they can sign in.
      setSuccess(true);
      setLoading(false);
    } catch {
      setFormError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Account created" description="You're almost ready to get started.">
        <SuccessBanner message="Your NFCPlate account has been created. Check your email to confirm your address, then sign in." />
        <button
          type="button"
          onClick={() => router.push(`/auth/sign-in${next ? `?next=${encodeURIComponent(next)}` : ''}`)}
          className="btn-primary-np mt-6 w-full"
        >
          Continue to sign in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" description="Start collecting reviews with one simple tap.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Sign up form">
        {formError ? <ErrorAlert message={formError} /> : null}

        <div>
          <label htmlFor="signup-name" className={labelClass}>
            Full name
          </label>
          <input
            id="signup-name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            value={values.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            placeholder="Jordan Smith"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? 'signup-name-error' : undefined}
            className={cn(inputClass, errors.full_name && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.full_name ? (
            <p id="signup-name-error" className="mt-1.5 text-xs text-destructive">
              {errors.full_name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-business" className={labelClass}>
            Business name (optional)
          </label>
          <input
            id="signup-business"
            name="business_name"
            type="text"
            autoComplete="organization"
            value={values.business_name ?? ''}
            onChange={(e) => update('business_name', e.target.value)}
            placeholder="Main Street Diner"
            aria-invalid={!!errors.business_name}
            aria-describedby={errors.business_name ? 'signup-business-error' : undefined}
            className={cn(inputClass, errors.business_name && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.business_name ? (
            <p id="signup-business-error" className="mt-1.5 text-xs text-destructive">
              {errors.business_name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-email" className={labelClass}>
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            className={cn(inputClass, errors.email && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.email ? (
            <p id="signup-email-error" className="mt-1.5 text-xs text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-password" className={labelClass}>
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="At least 6 characters"
            aria-describedby="signup-password-hint"
            aria-invalid={!!errors.password}
            className={cn(inputClass, errors.password && 'border-destructive/60')}
            disabled={loading}
          />
          <p id="signup-password-hint" className="mt-1.5 text-xs text-muted-foreground">
            Use at least 6 characters.
          </p>
          {errors.password ? (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary-np w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={`/auth/sign-in${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Forgot Password                                                           */
/* -------------------------------------------------------------------------- */

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        parsed.data.email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) {
        setError(friendlyAuthError(resetError.message));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Check your email" description="We sent you a password reset link.">
        <SuccessBanner message="If an account exists for that email, a reset link is on its way. It expires shortly, so check your inbox soon." />
        <Link href="/auth/sign-in" className="btn-secondary-np mt-6 w-full">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" description="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Forgot password form">
        {error ? <ErrorAlert message={error} /> : null}

        <div>
          <label htmlFor="forgot-email" className={labelClass}>
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldError(null);
              setError(null);
            }}
            placeholder="you@example.com"
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? 'forgot-email-error' : undefined}
            className={cn(inputClass, fieldError && 'border-destructive/60')}
            disabled={loading}
          />
          {fieldError ? (
            <p id="forgot-email-error" className="mt-1.5 text-xs text-destructive">
              {fieldError}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary-np w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
              Sending link…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Update Password                                                           */
/* -------------------------------------------------------------------------- */

const updateSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password is too long'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type UpdateValues = z.infer<typeof updateSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = React.useState<UpdateValues>({ password: '', confirm: '' });
  const [errors, setErrors] = React.useState<Partial<Record<keyof UpdateValues, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  function update<K extends keyof UpdateValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = updateSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UpdateValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof UpdateValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (updateError) {
        setFormError(friendlyAuthError(updateError.message));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setFormError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Password updated" description="Your new password is now active.">
        <SuccessBanner message="Your password has been updated successfully. You can now sign in with your new password." />
        <button
          type="button"
          onClick={() => {
            supabase.auth.signOut();
            router.push('/auth/sign-in');
            router.refresh();
          }}
          className="btn-primary-np mt-6 w-full"
        >
          Continue to sign in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" description="Choose a new password for your account.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Update password form">
        {formError ? <ErrorAlert message={formError} /> : null}

        <div>
          <label htmlFor="update-password" className={labelClass}>
            New password
          </label>
          <input
            id="update-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="At least 6 characters"
            aria-describedby="update-password-hint"
            aria-invalid={!!errors.password}
            className={cn(inputClass, errors.password && 'border-destructive/60')}
            disabled={loading}
          />
          <p id="update-password-hint" className="mt-1.5 text-xs text-muted-foreground">
            Use at least 6 characters.
          </p>
          {errors.password ? (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="update-confirm" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="update-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={values.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? 'update-confirm-error' : undefined}
            className={cn(inputClass, errors.confirm && 'border-destructive/60')}
            disabled={loading}
          />
          {errors.confirm ? (
            <p id="update-confirm-error" className="mt-1.5 text-xs text-destructive">
              {errors.confirm}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary-np w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
              Updating password…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </AuthCard>
  );
}
