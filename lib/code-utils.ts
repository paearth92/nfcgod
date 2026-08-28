import { z } from 'zod';

export const CODE_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE_LENGTH = 8;

/**
 * Normalize a code: trim, uppercase, remove hyphens.
 * Accepts typed codes with or without hyphens (e.g. "ABCD-EFGH" → "ABCDEFGH").
 */
export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/-/g, '');
}

/**
 * Format a normalized code with a hyphen: "ABCDEFGH" → "ABCD-EFGH".
 */
export function formatCode(normalized: string): string {
  const clean = normalizeCode(normalized);
  if (clean.length !== CODE_LENGTH) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

/**
 * Validate that a code contains only allowed characters and is the correct length.
 * Allowed charset: 23456789ABCDEFGHJKMNPQRSTUVWXYZ (no 0, O, 1, I, L).
 */
export function isValidCode(input: string): boolean {
  const normalized = normalizeCode(input);
  if (normalized.length !== CODE_LENGTH) return false;
  for (const char of normalized) {
    if (!CODE_CHARSET.includes(char)) return false;
  }
  return true;
}

/**
 * Generate a single random code using cryptographically secure randomness.
 * Returns a formatted code with hyphen (e.g. "ABCD-EFGH").
 */
export function generateCode(): string {
  const chars = new Array<string>(CODE_LENGTH);
  const max = CODE_CHARSET.length;
  for (let i = 0; i < CODE_LENGTH; i++) {
    chars[i] = CODE_CHARSET[cryptoSecureRandomInt(max)];
  }
  return formatCode(chars.join(''));
}

/**
 * Generate multiple unique codes using cryptographically secure randomness.
 * Returns formatted codes with hyphens. Guaranteed unique within the returned set.
 */
export function generateCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateCode());
  }
  return Array.from(codes);
}

function cryptoSecureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
    return array[0] % max;
  }
  // Fallback for environments without crypto.getRandomValues
  return Math.floor(Math.random() * max);
}

/**
 * Zod schema for code validation.
 */
export const codeSchema = z
  .string()
  .min(1, 'Code is required')
  .refine((val) => isValidCode(val), {
    message: 'Code must be 8 characters from the allowed set (no 0, O, 1, I, L)',
  });

/**
 * Zod schema for destination URL validation.
 * Only http and https protocols are allowed.
 * Rejects javascript:, data:, file:, and other protocols.
 */
export const destinationUrlSchema = z
  .string()
  .min(1, 'Destination URL is required')
  .url('Enter a valid URL')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'URL must start with http:// or https://')
  .refine((url) => {
    const lower = url.toLowerCase();
    return (
      !lower.startsWith('javascript:') &&
      !lower.startsWith('data:') &&
      !lower.startsWith('file:') &&
      !lower.startsWith('vbscript:')
    );
  }, 'This protocol is not allowed');

/**
 * Server-side URL validation. Returns true if the URL is safe (http/https only).
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract hostname from a URL for display purposes.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Build the permanent NFCPlate URL for a code.
 */
export function permanentCodeUrl(code: string, siteUrl?: string): string {
  const base = siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nfcplate.com';
  const formatted = formatCode(code);
  return `${base}/c/${formatted}`;
}
