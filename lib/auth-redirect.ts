export type AuthPortal = 'customer' | 'admin';

const BASE_ORIGIN = 'https://nfcplate.invalid';
const MAX_REDIRECT_LENGTH = 512;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

const DEFAULT_DESTINATIONS: Record<AuthPortal, string> = {
  customer: '/dashboard',
  admin: '/admin',
};

function decodeRedirectValue(value: string): string | null {
  let decoded = value;

  try {
    // Decode more than once so values such as %252F%252Fevil.com cannot
    // bypass the protocol-relative URL checks.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) break;
      decoded = nextValue;
    }

    return decoded;
  } catch {
    return null;
  }
}

function matchesPath(pathname: string, allowedRoot: string): boolean {
  return pathname === allowedRoot || pathname.startsWith(`${allowedRoot}/`);
}

/**
 * Returns a safe same-origin destination for a customer or admin login.
 *
 * Customer logins may return only to the dashboard or an NFC activation page.
 * Admin logins may return only to protected admin pages. Admin sign-in itself
 * is intentionally converted to /admin to prevent redirect loops.
 */
export function getSafeAuthDestination(
  rawNext: string | null | undefined,
  portal: AuthPortal
): string {
  const fallback = DEFAULT_DESTINATIONS[portal];

  if (typeof rawNext !== 'string') return fallback;

  const trimmed = rawNext.trim();
  if (!trimmed || trimmed.length > MAX_REDIRECT_LENGTH) return fallback;
  if (CONTROL_CHARACTERS.test(trimmed) || trimmed.includes('\\')) return fallback;

  const decoded = decodeRedirectValue(trimmed);
  if (!decoded) return fallback;
  if (decoded.length > MAX_REDIRECT_LENGTH) return fallback;
  if (CONTROL_CHARACTERS.test(decoded) || decoded.includes('\\')) return fallback;
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;

  let destination: URL;
  try {
    destination = new URL(decoded, BASE_ORIGIN);
  } catch {
    return fallback;
  }

  if (destination.origin !== BASE_ORIGIN) return fallback;

  const { pathname, search, hash } = destination;

  if (portal === 'customer') {
    const isCustomerPath =
      matchesPath(pathname, '/dashboard') || pathname.startsWith('/activate/');

    if (!isCustomerPath || matchesPath(pathname, '/admin')) return fallback;
  } else {
    if (!matchesPath(pathname, '/admin')) return fallback;

    // The login page must never redirect back to itself.
    if (matchesPath(pathname, '/admin/sign-in')) return fallback;
  }

  return `${pathname}${search}${hash}`;
}
