/**
 * Promo code service — currently no active promotions.
 * When a real server-side promotion system is needed, implement it here
 * with server-side validation. Do not add client-only demo discounts.
 */

export interface PromoRule {
  code: string;
  description: string;
  discountType: 'percentage';
  discountValue: number;
}

const PROMO_KEY = 'nfcplate-promo';

export const demoPromoRules: PromoRule[] = [];

export function findPromoRule(_code: string): PromoRule | undefined {
  return undefined;
}

export function calculatePromoDiscount(_subtotal: number, _rule: PromoRule | null): number {
  return 0;
}

export const promoService = {
  load(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(PROMO_KEY);
    } catch {
      return null;
    }
  },

  save(_code: string): void {
    // No active promotions — no-op
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(PROMO_KEY);
    } catch {
      // ignore
    }
  },
};
