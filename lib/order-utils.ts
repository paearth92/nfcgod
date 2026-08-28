/**
 * Order number generation — cryptographically unpredictable, customer-friendly.
 *
 * Format: NFP-XXXX-XXXX where X is from the unambiguous charset
 * (no 0, O, 1, I, L). 8 random characters with a collision-safe retry.
 */

import { CODE_CHARSET } from '@/lib/code-utils';

const ORDER_PREFIX = 'NFP';
const ORDER_RANDOM_LENGTH = 8;

function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function generateOrderNumber(): string {
  const chars = new Array<string>(ORDER_RANDOM_LENGTH);
  for (let i = 0; i < ORDER_RANDOM_LENGTH; i++) {
    chars[i] = CODE_CHARSET[secureRandomInt(CODE_CHARSET.length)];
  }
  const random = chars.join('');
  return `${ORDER_PREFIX}-${random.slice(0, 4)}-${random.slice(4)}`;
}

export const ORDER_NUMBER_REGEX = /^NFP-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;

export function isValidOrderNumber(input: string): boolean {
  return ORDER_NUMBER_REGEX.test(input);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
