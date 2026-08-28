import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env.server';
import type { Database } from '@/lib/supabase/database.types';

type PendingCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

/**
 * Creates a Supabase client for a Next.js Route Handler.
 *
 * Supabase can refresh or create several authentication cookies during one
 * request. Route Handlers must attach every one of those cookies to the final
 * NextResponse. Calling applyCookies(response) before returning guarantees
 * that the following request can read the newly-created session.
 */
export function createRouteClient(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            const existingIndex = pendingCookies.findIndex(
              (pendingCookie) => pendingCookie.name === cookie.name
            );

            if (existingIndex >= 0) {
              pendingCookies[existingIndex] = cookie;
            } else {
              pendingCookies.push(cookie);
            }
          }
        },
      },
    }
  );

  function applyCookies<T extends NextResponse>(response: T): T {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }

    return response;
  }

  return {
    supabase,
    applyCookies,
  };
}
