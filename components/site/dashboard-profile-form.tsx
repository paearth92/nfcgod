'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60';

const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

/**
 * Client form for updating profile fields (full_name, business_name).
 *
 * Updates the `profiles` table directly via the browser Supabase client.
 * RLS policies must allow users to update their own profile row.
 */
export function DashboardProfileForm({
  fullName,
  businessName,
}: {
  fullName: string | null;
  businessName: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = React.useState({
    full_name: fullName ?? '',
    business_name: businessName ?? '',
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  function update<K extends keyof typeof values>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setFieldErrors((e) => ({ ...e, [key]: '' }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    const trimmedName = values.full_name.trim();
    const trimmedBusiness = values.business_name.trim();

    if (trimmedName.length > 80) errors.full_name = 'Name is too long (max 80 characters)';
    if (trimmedBusiness.length > 120) errors.business_name = 'Business name is too long (max 120 characters)';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setError('You must be signed in to update your profile.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName || null,
          business_name: trimmedBusiness || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        setError(updateError.message || 'Failed to update profile. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="card-np p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
        Profile details
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your name and business information.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4" aria-label="Update profile form">
        {error ? (
          <div role="alert" aria-live="polite" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div role="status" aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Profile updated successfully.
          </div>
        ) : null}

        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Full name
          </label>
          <input
            id="profile-name"
            name="full_name"
            type="text"
            autoComplete="name"
            value={values.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            placeholder="Jordan Smith"
            aria-invalid={!!fieldErrors.full_name}
            aria-describedby={fieldErrors.full_name ? 'profile-name-error' : undefined}
            className={cn(inputClass, fieldErrors.full_name && 'border-destructive/60')}
            disabled={loading}
          />
          {fieldErrors.full_name ? (
            <p id="profile-name-error" className="mt-1.5 text-xs text-destructive">
              {fieldErrors.full_name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="profile-business" className={labelClass}>
            Business name (optional)
          </label>
          <input
            id="profile-business"
            name="business_name"
            type="text"
            autoComplete="organization"
            value={values.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            placeholder="Main Street Diner"
            aria-invalid={!!fieldErrors.business_name}
            aria-describedby={fieldErrors.business_name ? 'profile-business-error' : undefined}
            className={cn(inputClass, fieldErrors.business_name && 'border-destructive/60')}
            disabled={loading}
          />
          {fieldErrors.business_name ? (
            <p id="profile-business-error" className="mt-1.5 text-xs text-destructive">
              {fieldErrors.business_name}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary-np" disabled={loading}>
          {loading ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </form>
    </div>
  );
}
