import { NextResponse, type NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase/route';

/**
 * Sign-out route.
 * POST handler that signs the user out and redirects to the home page.
 */
export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteClient(request);
  await supabase.auth.signOut();

  const origin = request.nextUrl.origin;
  return applyCookies(NextResponse.redirect(`${origin}/`, {
    status: 303,
  }));
}

/**
 * Support GET sign-out as a fallback (e.g. direct link click) — still
 * redirects to home after clearing the session.
 */
export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteClient(request);
  await supabase.auth.signOut();

  const origin = request.nextUrl.origin;
  return applyCookies(NextResponse.redirect(`${origin}/`, {
    status: 303,
  }));
}
