'use server';

import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { destinationUrlSchema, isSafeUrl } from '@/lib/code-utils';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env.server';
import type { Database } from '@/lib/supabase/database.types';

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

type AnySupabase = any;

/**
 * Creates a Supabase client using the currently signed-in user's token.
 *
 * This is necessary for database functions that check:
 * - auth.uid()
 * - public.is_admin()
 */
function createUserScopedClient(accessToken: string) {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}

/**
 * Validates the supplied access token and confirms that its user has the
 * admin role. The service-role client remains completely server-side.
 */
async function requireAdmin(accessToken: string) {
  if (!accessToken) {
    return null;
  }

  const admin = createAdminClient() as unknown as AnySupabase;

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: profileData, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return null;
  }

  const profile = profileData as { role: string } | null;

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return {
    admin,
    userId: user.id,
  };
}

/* -------------------------------------------------------------------------- */
/* Batch generation                                                           */
/* -------------------------------------------------------------------------- */

export async function generateBatch(
  accessToken: string,
  name: string,
  prefix: string | null,
  notes: string | null,
  quantity: number
): Promise<AdminActionResult & { codes?: string[] }> {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: 'Batch name is required.',
    };
  }

  if (trimmedName.length > 120) {
    return {
      success: false,
      error: 'Batch name is too long (max 120).',
    };
  }

  const cleanPrefix = prefix?.trim()
    ? prefix.trim().slice(0, 16)
    : null;

  const cleanNotes = notes?.trim()
    ? notes.trim().slice(0, 2000)
    : null;

  const qty = Math.trunc(quantity);

  if (!Number.isFinite(qty) || qty < 1 || qty > 5000) {
    return {
      success: false,
      error: 'Quantity must be between 1 and 5000.',
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  /*
   * Do not run generate_batch_codes through the service-role client.
   *
   * The PostgreSQL function checks auth.uid() and public.is_admin().
   * A service-role request does not represent the signed-in administrator,
   * causing the database to return "Admin access required".
   */
  const userClient = createUserScopedClient(
    accessToken
  ) as unknown as AnySupabase;

  const { data, error } = await userClient.rpc(
    'generate_batch_codes',
    {
      batch_name: trimmedName,
      batch_prefix: cleanPrefix,
      batch_notes: cleanNotes,
      quantity: qty,
    }
  );

  if (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate batch codes.',
    };
  }

  const codes = ((data ?? []) as { code: string }[]).map(
    (row) => row.code
  );

  return {
    success: true,
    codes,
  };
}

/* -------------------------------------------------------------------------- */
/* Destination assignment                                                     */
/* -------------------------------------------------------------------------- */

function validateDestination(destination: string): string | null {
  const trimmed = destination?.trim();

  if (!trimmed) {
    return 'Destination URL is required.';
  }

  const parsed = destinationUrlSchema.safeParse(trimmed);

  if (!parsed.success) {
    return (
      parsed.error.issues[0]?.message ??
      'Enter a valid URL.'
    );
  }

  if (!isSafeUrl(parsed.data)) {
    return 'URL must start with http:// or https://';
  }

  return null;
}

export async function assignDestination(
  accessToken: string,
  codeIds: string[],
  destination: string
): Promise<AdminActionResult> {
  if (!Array.isArray(codeIds) || codeIds.length === 0) {
    return {
      success: false,
      error: 'No codes selected.',
    };
  }

  const destinationError = validateDestination(destination);

  if (destinationError) {
    return {
      success: false,
      error: destinationError,
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  const { error } = await admin
    .from('codes')
    .update({
      destination_url: destination.trim(),
    })
    .in('id', codeIds);

  if (error) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to assign destination.',
    };
  }

  return {
    success: true,
  };
}

export async function assignDestinationToBatch(
  accessToken: string,
  batchId: string,
  destination: string
): Promise<AdminActionResult & { count?: number }> {
  if (!batchId) {
    return {
      success: false,
      error: 'Batch not found.',
    };
  }

  const destinationError = validateDestination(destination);

  if (destinationError) {
    return {
      success: false,
      error: destinationError,
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  const { count, error } = await admin
    .from('codes')
    .update({
      destination_url: destination.trim(),
    })
    .eq('batch_id', batchId);

  if (error) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to assign destination.',
    };
  }

  return {
    success: true,
    count: count ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Disable and enable codes                                                   */
/* -------------------------------------------------------------------------- */

export async function disableCodes(
  accessToken: string,
  codeIds: string[]
): Promise<AdminActionResult> {
  if (!Array.isArray(codeIds) || codeIds.length === 0) {
    return {
      success: false,
      error: 'No codes selected.',
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  const { error } = await admin
    .from('codes')
    .update({
      status: 'disabled',
    })
    .in('id', codeIds);

  if (error) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to disable codes.',
    };
  }

  return {
    success: true,
  };
}

export async function enableCodes(
  accessToken: string,
  codeIds: string[]
): Promise<AdminActionResult> {
  if (!Array.isArray(codeIds) || codeIds.length === 0) {
    return {
      success: false,
      error: 'No codes selected.',
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  /*
   * Codes without owners return to "unclaimed".
   */
  const { error: unclaimedError } = await admin
    .from('codes')
    .update({
      status: 'unclaimed',
    })
    .in('id', codeIds)
    .is('owner_id', null);

  if (unclaimedError) {
    return {
      success: false,
      error:
        unclaimedError.message ||
        'Failed to enable codes.',
    };
  }

  /*
   * Codes that already have owners become active.
   */
  const { error: activeError } = await admin
    .from('codes')
    .update({
      status: 'active',
    })
    .in('id', codeIds)
    .not('owner_id', 'is', null);

  if (activeError) {
    return {
      success: false,
      error:
        activeError.message ||
        'Failed to enable codes.',
    };
  }

  return {
    success: true,
  };
}

/* -------------------------------------------------------------------------- */
/* Single-code management                                                     */
/* -------------------------------------------------------------------------- */

export async function updateCodeDestination(
  accessToken: string,
  codeId: string,
  destination: string
): Promise<AdminActionResult> {
  if (!codeId) {
    return {
      success: false,
      error: 'Code not found.',
    };
  }

  const destinationError = validateDestination(destination);

  if (destinationError) {
    return {
      success: false,
      error: destinationError,
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  const { error } = await admin
    .from('codes')
    .update({
      destination_url: destination.trim(),
    })
    .eq('id', codeId);

  if (error) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to update destination.',
    };
  }

  return {
    success: true,
  };
}

export async function setCodeStatus(
  accessToken: string,
  codeId: string,
  status: 'disabled' | 'enabled'
): Promise<AdminActionResult> {
  if (!codeId) {
    return {
      success: false,
      error: 'Code not found.',
    };
  }

  const auth = await requireAdmin(accessToken);

  if (!auth) {
    return {
      success: false,
      error: 'Your admin session expired. Sign in again.',
    };
  }

  const { admin } = auth;

  if (status === 'disabled') {
    const { error } = await admin
      .from('codes')
      .update({
        status: 'disabled',
      })
      .eq('id', codeId);

    if (error) {
      return {
        success: false,
        error:
          error.message ||
          'Failed to disable code.',
      };
    }

    return {
      success: true,
    };
  }

  const { data: codeData, error: codeError } = await admin
    .from('codes')
    .select('owner_id')
    .eq('id', codeId)
    .maybeSingle();

  if (codeError) {
    return {
      success: false,
      error:
        codeError.message ||
        'Failed to load code.',
    };
  }

  const code = codeData as {
    owner_id: string | null;
  } | null;

  const newStatus = code?.owner_id
    ? 'active'
    : 'unclaimed';

  const { error } = await admin
    .from('codes')
    .update({
      status: newStatus,
    })
    .eq('id', codeId);

  if (error) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to enable code.',
    };
  }

  return {
    success: true,
  };
}