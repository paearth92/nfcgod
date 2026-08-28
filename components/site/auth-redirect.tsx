'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side guard for auth pages.
 * If the user is already signed in, redirect to `next` (if a safe same-origin
 * path) or to /dashboard. Renders nothing while checking.
 */
export function AuthRedirect({ next }: { next?: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      const safeNext =
        next && typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
          ? next
          : '/dashboard';
      router.replace(safeNext);
    });
  }, [next, router]);

  return null;
}
