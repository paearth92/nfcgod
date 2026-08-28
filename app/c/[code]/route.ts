import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeCode, formatCode, isValidCode, isSafeUrl } from '@/lib/code-utils';

type CodeLookup = {
  code: string;
  status: string;
  destination_url: string | null;
};

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const rawCode = params.code ?? '';
  const normalized = normalizeCode(rawCode);

  // Reject malformed codes — never reveal whether the shape was wrong vs. missing.
  if (!isValidCode(normalized)) {
    return NextResponse.redirect(new URL('/invalid-code', request.url));
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('codes')
    .select('code, status, destination_url')
    .eq('code', normalized)
    .maybeSingle();

  // On lookup failure, fail closed to the generic invalid page — no DB details leaked.
  if (error || !data) {
    return NextResponse.redirect(new URL('/invalid-code', request.url));
  }

  const row = data as CodeLookup;
  const formattedCode = formatCode(normalized);

  if (row.status === 'disabled') {
    return NextResponse.redirect(new URL('/inactive-code', request.url));
  }

  if (row.status === 'unclaimed') {
    return NextResponse.redirect(new URL(`/activate/${formattedCode}`, request.url));
  }

  if (row.status === 'active') {
    const destination = row.destination_url;

    if (destination && isSafeUrl(destination)) {
      // Record the redirect event. Fire-and-forget: don't block the redirect on logging.
      // Referrer comes from request headers; we intentionally do NOT collect IP addresses.
      const referrer = request.headers.get('referer') ?? null;
      const userAgent = request.headers.get('user-agent') ?? null;

      // `record_code_event` is typed `Returns: void`, which makes Supabase's rpc
      // overload resolve to `undefined`; cast through `unknown` to call it.
      const rpc = supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<unknown>;
      void rpc('record_code_event', {
        code_input: normalized,
        event_type_input: 'redirect',
        referrer_input: referrer,
        user_agent_input: userAgent,
      });

      return NextResponse.redirect(destination, { status: 307 });
    }

    // Active but missing/invalid destination — send the owner to activation.
    return NextResponse.redirect(new URL(`/activate/${formattedCode}`, request.url));
  }

  // Unknown status: fail closed.
  return NextResponse.redirect(new URL('/invalid-code', request.url));
}
