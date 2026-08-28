import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/env.server';

/**
 * Server-only admin client using the service role key.
 * NEVER import this in client components.
 * This client bypasses RLS and should only be used in server-side
 * code for privileged operations (admin portal, server actions).
 */
export function createAdminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
