import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const storage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  }),
};

// Mock window
vi.stubGlobal('window', {
  localStorage: localStorageMock,
});

vi.stubGlobal('document', {
  referrer: '',
});

import { cartService, recentService } from '@/lib/cart-service';

describe('cart-service localStorage key migration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('uses the nfcplate-cart key', () => {
    cartService.save([
      {
        productId: 'p1',
        productSlug: 'test-product',
        productName: 'Test Product',
        variantId: 'v1',
        variantName: 'Default',
        sku: 'NFC-001',
        price: 29.99,
        quantity: 1,
      },
    ]);
    expect(storage['nfcplate-cart']).toBeDefined();
    const saved = JSON.parse(storage['nfcplate-cart']);
    expect(saved).toHaveLength(1);
    expect(saved[0].productName).toBe('Test Product');
  });

  it('migrates data from legacy biz365-cart key', () => {
    // Set old data
    storage['biz365-cart'] = JSON.stringify([
      {
        productId: 'p1',
        productSlug: 'legacy-product',
        productName: 'Legacy Product',
        variantId: 'v1',
        variantName: 'Default',
        sku: 'NFC-001',
        price: 19.99,
        quantity: 2,
      },
    ]);

    // Loading should migrate
    const loaded = cartService.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].productName).toBe('Legacy Product');
    expect(storage['nfcplate-cart']).toBeDefined();
    // Old key should be removed after migration
    expect(storage['biz365-cart']).toBeUndefined();
  });

  it('does not overwrite nfcplate-cart if it already exists', () => {
    // Set new data
    storage['nfcplate-cart'] = JSON.stringify([
      {
        productId: 'p2',
        productSlug: 'new-product',
        productName: 'New Product',
        variantId: 'v2',
        variantName: 'Default',
        sku: 'NFC-002',
        price: 39.99,
        quantity: 1,
      },
    ]);

    // Also set old data
    storage['biz365-cart'] = JSON.stringify([
      {
        productId: 'p1',
        productSlug: 'legacy-product',
        productName: 'Legacy Product',
        variantId: 'v1',
        variantName: 'Default',
        sku: 'NFC-001',
        price: 19.99,
        quantity: 2,
      },
    ]);

    const loaded = cartService.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].productName).toBe('New Product');
  });

  it('returns empty array when no data in either key', () => {
    const loaded = cartService.load();
    expect(loaded).toEqual([]);
  });

  it('uses the nfcplate-recent key for recently viewed', () => {
    recentService.save(['product-1', 'product-2']);
    expect(storage['nfcplate-recent']).toBeDefined();
    const saved = JSON.parse(storage['nfcplate-recent']);
    expect(saved).toEqual(['product-1', 'product-2']);
  });

  it('migrates recently viewed from legacy biz365-recent key', () => {
    storage['biz365-recent'] = JSON.stringify(['legacy-1', 'legacy-2']);

    const loaded = recentService.load();
    expect(loaded).toEqual(['legacy-1', 'legacy-2']);
    expect(storage['nfcplate-recent']).toBeDefined();
    expect(storage['biz365-recent']).toBeUndefined();
  });

  it('handles corrupted data gracefully', () => {
    storage['nfcplate-cart'] = 'not valid json';
    const loaded = cartService.load();
    expect(loaded).toEqual([]);
  });

  it('handles non-array data gracefully', () => {
    storage['nfcplate-cart'] = JSON.stringify({ not: 'an array' });
    const loaded = cartService.load();
    expect(loaded).toEqual([]);
  });

  it('clear removes the nfcplate-cart key', () => {
    storage['nfcplate-cart'] = JSON.stringify([]);
    cartService.clear();
    expect(storage['nfcplate-cart']).toBeUndefined();
  });
});
