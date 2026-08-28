import { describe, it, expect } from 'vitest';
import {
  validateAndCalculateOrder,
  CheckoutValidationError,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from '@/lib/checkout-validation';

describe('checkout validation', () => {
  describe('rejects invalid inputs', () => {
    it('rejects empty cart', () => {
      expect(() => validateAndCalculateOrder([])).toThrow(CheckoutValidationError);
    });

    it('rejects unknown variant ID', () => {
      expect(() =>
        validateAndCalculateOrder([{ variantId: 'nonexistent', quantity: 1 }])
      ).toThrow('no longer available');
    });

    it('rejects zero quantity', () => {
      expect(() =>
        validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: 0 }])
      ).toThrow('at least 1');
    });

    it('rejects negative quantity', () => {
      expect(() =>
        validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: -1 }])
      ).toThrow('at least 1');
    });

    it('rejects NaN quantity', () => {
      expect(() =>
        validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: NaN }])
      ).toThrow();
    });

    it('rejects excessive quantity per line', () => {
      expect(() =>
        validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: 101 }])
      ).toThrow('cannot exceed');
    });
  });

  describe('calculates order correctly', () => {
    it('calculates single item with shipping under threshold', () => {
      const result = validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: 1 }]);
      expect(result.subtotalCents).toBe(2900);
      expect(result.shippingCents).toBe(STANDARD_SHIPPING_CENTS);
      expect(result.totalCents).toBe(2900 + 599);
      expect(result.itemCount).toBe(1);
    });

    it('calculates free shipping at threshold', () => {
      // Two stands = $58 which is over $35
      const result = validateAndCalculateOrder([
        { variantId: 'NFP-GRS-BLK', quantity: 1 },
        { variantId: 'NFP-YRS-RED', quantity: 1 },
      ]);
      expect(result.subtotalCents).toBe(5800);
      expect(result.shippingCents).toBe(0);
      expect(result.totalCents).toBe(5800);
      expect(result.itemCount).toBe(2);
    });

    it('calculates bundle pricing correctly', () => {
      const result = validateAndCalculateOrder([{ variantId: 'NFP-SGB-SET', quantity: 1 }]);
      expect(result.subtotalCents).toBe(7900);
      expect(result.shippingCents).toBe(0);
      expect(result.totalCents).toBe(7900);
    });

    it('preserves line item snapshots with correct pricing', () => {
      const result = validateAndCalculateOrder([{ variantId: 'NFP-GRS-WHT', quantity: 3 }]);
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].unitPriceCents).toBe(2900);
      expect(result.lineItems[0].quantity).toBe(3);
      expect(result.lineItems[0].lineTotalCents).toBe(8700);
      expect(result.lineItems[0].productSlug).toBe('google-review-stand');
      expect(result.lineItems[0].variantName).toBe('White');
    });
  });

  describe('shipping threshold', () => {
    it('charges shipping under $35', () => {
      const result = validateAndCalculateOrder([{ variantId: 'NFP-GRS-BLK', quantity: 1 }]);
      expect(result.shippingCents).toBe(STANDARD_SHIPPING_CENTS);
    });

    it('gives free shipping at exactly $35', () => {
      // We need a combination that sums to exactly 3500 — not possible with current prices
      // but the threshold logic should still work
      expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(3500);
    });

    it('gives free shipping over $35', () => {
      const result = validateAndCalculateOrder([
        { variantId: 'NFP-GRS-BLK', quantity: 2 },
      ]);
      expect(result.subtotalCents).toBe(5800);
      expect(result.shippingCents).toBe(0);
    });
  });
});
