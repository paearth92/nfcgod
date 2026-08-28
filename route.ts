import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSafeAuthDestination } from '@/lib/auth-redirect';
import { createRouteClient } from '@/lib/supabase/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REQUEST_BYTES = 10_000;

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(254, 'Email is too long.')
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required.')
    .max(256, 'Password is too long.'),
  portal: z.enum(['customer', 'admin']),
  next: z.string().max(512, 'Redirect path is too long.').optional().nullable(),
});

type JsonBody =
  | { success: true; destination: string }
  | { success: false; error: string };

function json(body: JsonBody, status = 200): NextResponse<JsonBody> {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
    },
  });
}

function friendlyAuthError(message: string): {
  message: string;
  status: number;
} {
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return {
      message: 'Please confirm your email address before signing in.',
      status: 403,
    };
  }

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials')
  ) {
    return {
      message: 'Incorrect email or password. Please try again.',
      status: 401,
    };
  }

  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('over the rate limit')
  ) {
    return {
      message: 'Too many sign-in attempts. Please wait and try again.',
      status: 429,
    };
  }

  return {
    message: 'Unable to sign in right now. Please try again.',
    status: 400,
  };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return json({ success: false, error: 'Invalid sign-in request.' }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid sign-in request.' }, 400);
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return json(
      {
        success: false,
        error: firstIssue?.message ?? 'Check your email and password.',
      },
      400
    );
  }

  let routeClient: ReturnType<typeof createRouteClient>;
  try {
    routeClient = createRouteClient(request);
  } catch {
    return json(
      {
        success: false,
        error: 'Authentication is not configured correctly. Please contact support.',
      },
      500
    );
  }

  const { supabase, applyCookies } = routeClient;
  const { email, password, portal, next } = parsed.data;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const friendly = friendlyAuthError(error?.message ?? 'Invalid login credentials');
      return applyCookies(
        json({ success: false, error: friendly.message }, friendly.status)
      );
    }

    if (portal === 'admin') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const role = (profile as { role: string } | null)?.role;

      if (profileError || role !== 'admin') {
        await supabase.auth.signOut();

        return applyCookies(
          json(
            {
              success: false,
              error: 'This account is not authorized for the admin portal.',
            },
            403
          )
        );
      }
    }

    const destination = getSafeAuthDestination(next, portal);

    return applyCookies(
      json({
        success: true,
        destination,
      })
    );
  } catch {
    return applyCookies(
      json(
        {
          success: false,
          error: 'Unable to sign in right now. Please try again.',
        },
        500
      )
    );
  }
}
