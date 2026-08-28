import { describe, it, expect } from 'vitest';
import { generateOrderNumber, isValidOrderNumber, normalizeEmail } from '@/lib/order-utils';

describe('order number generation', () => {
  it('generates a valid order number', () => {
    const num = generateOrderNumber();
    expect(isValidOrderNumber(num)).toBe(true);
  });

  it('uses the NFP prefix', () => {
    const num = generateOrderNumber();
    expect(num.startsWith('NFP-')).toBe(true);
  });

  it('has the correct format NFP-XXXX-XXXX', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^NFP-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
  });

  it('generates unique numbers (probabilistic)', () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      numbers.add(generateOrderNumber());
    }
    // With 8 random chars from 32-char alphabet, collisions in 1000 are extremely unlikely
    expect(numbers.size).toBeGreaterThan(990);
  });

  it('rejects invalid order numbers', () => {
    expect(isValidOrderNumber('NFP-ABCD-EFGH')).toBe(true);
    expect(isValidOrderNumber('nfp-abcd-efgh')).toBe(false);
    expect(isValidOrderNumber('ORDER-1234')).toBe(false);
    expect(isValidOrderNumber('NFP-ABCD')).toBe(false);
    expect(isValidOrderNumber('')).toBe(false);
  });
});

describe('email normalization', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
  });
});
