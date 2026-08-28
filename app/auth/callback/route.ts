import { NextResponse, type NextRequest } from 'next/server';
import { getSafeAuthDestination } from '@/lib/auth-redirect';
import { createRouteClient } from '@/lib/supabase/route';

/**
 * Auth callback route.
 * Exchanges the `code` query param for a session, then redirects to the
 * `next` param if it's a safe same-origin path, otherwise /dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');

  // Validate the next param: must be a same-origin relative path.
  const safeNext = getSafeAuthDestination(nextParam, 'customer');
  const { supabase, applyCookies } = createRouteClient(request);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to sign-in with an error indicator on failure.
      return applyCookies(NextResponse.redirect(`${origin}/auth/sign-in?error=auth_callback_failed`));
    }
  }

  return applyCookies(NextResponse.redirect(`${origin}${safeNext}`));
}
