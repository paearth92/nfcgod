/**
 * Server-only environment variable validation.
 * Import this in any server route or server action to fail fast
 * with a clear configuration error when required variables are missing.
 * NEVER import this in client components.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function getSupabaseServiceRoleKey(): string {
  return required('SUPABASE_SERVICE_ROLE_KEY');
}

export function getStripeSecretKey(): string {
  return required('STRIPE_SECRET_KEY');
}

export function getStripeWebhookSecretEnv(): string {
  return required('STRIPE_WEBHOOK_SECRET');
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nfcplate.com';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SITE_URL must start with http:// or https://');
  }
  return url.replace(/\/$/, '');
}
