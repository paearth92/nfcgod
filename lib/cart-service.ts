export interface CartLineShape {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = 'nfcplate-cart';
const LEGACY_CART_KEY = 'biz365-cart';

/**
 * Migrates cart data from the legacy `biz365-cart` localStorage key to the
 * current `nfcplate-cart` key. Runs once: if the new key already exists, the
 * migration is skipped. Otherwise the legacy value is copied over and the old
 * key is removed.
 */
function migrateCartStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing !== null) return;
    const legacy = window.localStorage.getItem(LEGACY_CART_KEY);
    if (legacy === null) return;
    window.localStorage.setItem(STORAGE_KEY, legacy);
    window.localStorage.removeItem(LEGACY_CART_KEY);
  } catch {
    // ignore migration errors
  }
}

export const cartService = {
  load(): CartLineShape[] {
    if (typeof window === 'undefined') return [];
    migrateCartStorage();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as CartLineShape[];
    } catch {
      return [];
    }
  },

  save(lines: CartLineShape[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota / serialization errors
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

const RECENT_KEY = 'nfcplate-recent';
const LEGACY_RECENT_KEY = 'biz365-recent';

/**
 * Migrates recently-viewed product slugs from the legacy `biz365-recent`
 * localStorage key to the current `nfcplate-recent` key. Runs once: if the new
 * key already exists, the migration is skipped. Otherwise the legacy value is
 * copied over and the old key is removed.
 */
function migrateRecentStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.localStorage.getItem(RECENT_KEY);
    if (existing !== null) return;
    const legacy = window.localStorage.getItem(LEGACY_RECENT_KEY);
    if (legacy === null) return;
    window.localStorage.setItem(RECENT_KEY, legacy);
    window.localStorage.removeItem(LEGACY_RECENT_KEY);
  } catch {
    // ignore migration errors
  }
}

export const recentService = {
  load(): string[] {
    if (typeof window === 'undefined') return [];
    migrateRecentStorage();
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  },

  save(slugs: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(slugs.slice(0, 6)));
    } catch {
      // ignore
    }
  },
};
