import { describe, it, expect } from 'vitest';
import {
  catalogProducts,
  getCatalogProduct,
  getCatalogVariant,
  getStartingPriceCents,
  calculateShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from '@/lib/catalog';
import {
  getPrimaryImage,
  getVariantImage,
  getImagePathForSlug,
} from '@/lib/product-media';

describe('catalog', () => {
  it('has 10 approved products covering 11 catalog entries (Google has 2 variants)', () => {
    expect(catalogProducts).toHaveLength(10);
    const totalVariants = catalogProducts.reduce((sum, p) => sum + p.variants.length, 0);
    expect(totalVariants).toBe(11);
  });

  it('all products have NFP SKU prefixes', () => {
    for (const product of catalogProducts) {
      for (const variant of product.variants) {
        expect(variant.sku.startsWith('NFP-')).toBe(true);
        expect(variant.id.startsWith('NFP-')).toBe(true);
      }
    }
  });

  it('no products use legacy BIZ SKU prefixes', () => {
    for (const product of catalogProducts) {
      for (const variant of product.variants) {
        expect(variant.sku.startsWith('BIZ-')).toBe(false);
      }
    }
  });

  it('all products have positive prices', () => {
    for (const product of catalogProducts) {
      for (const variant of product.variants) {
        expect(variant.priceCents).toBeGreaterThan(0);
      }
    }
  });

  it('all product slugs are unique', () => {
    const slugs = catalogProducts.map((p) => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('all variant IDs are unique across the catalog', () => {
    const ids = catalogProducts.flatMap((p) => p.variants.map((v) => v.id));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('bundles have bundle components defined', () => {
    const bundles = catalogProducts.filter((p) => p.fulfillmentType === 'bundle');
    expect(bundles).toHaveLength(2);
    for (const bundle of bundles) {
      expect(bundle.bundleComponents).toBeDefined();
      expect(bundle.bundleComponents!.length).toBe(3);
    }
  });

  it('social growth bundle contains Facebook, Instagram, TikTok', () => {
    const bundle = getCatalogProduct('social-growth-stand-bundle');
    expect(bundle).toBeDefined();
    const slugs = bundle!.bundleComponents!.map((c) => c.productSlug);
    expect(slugs).toContain('facebook-nfc-stand');
    expect(slugs).toContain('instagram-nfc-stand');
    expect(slugs).toContain('tiktok-follow-stand');
  });

  it('reputation bundle contains Google, Tripadvisor, Yelp', () => {
    const bundle = getCatalogProduct('reputation-review-stand-bundle');
    expect(bundle).toBeDefined();
    const slugs = bundle!.bundleComponents!.map((c) => c.productSlug);
    expect(slugs).toContain('google-review-stand');
    expect(slugs).toContain('tripadvisor-review-stand');
    expect(slugs).toContain('yelp-review-stand');
  });
});

describe('shipping calculation', () => {
  it('charges $5.99 below threshold', () => {
    expect(calculateShipping(2900)).toBe(STANDARD_SHIPPING_CENTS);
    expect(STANDARD_SHIPPING_CENTS).toBe(599);
  });

  it('gives free shipping at $35 threshold', () => {
    expect(calculateShipping(3500)).toBe(0);
    expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(3500);
  });

  it('gives free shipping above threshold', () => {
    expect(calculateShipping(7900)).toBe(0);
  });
});

describe('product media mapping', () => {
  it('every product has a primary image', () => {
    for (const product of catalogProducts) {
      const image = getPrimaryImage(product.slug);
      expect(image).not.toBeNull();
    }
  });

  it('google review stand has black and white variant images', () => {
    const black = getVariantImage('google-review-stand', 'black');
    const white = getVariantImage('google-review-stand', 'white');
    expect(black).not.toBeNull();
    expect(black!.variant).toBe('black');
    expect(white).not.toBeNull();
    expect(white!.variant).toBe('white');
  });

  it('returns correct image path for slug', () => {
    const path = getImagePathForSlug('google-review-stand', 'black');
    expect(path).toBe('/images/products/nfcplate-google-review-stand-black-front.png');
  });

  it('returns white image when white variant is requested', () => {
    const path = getImagePathForSlug('google-review-stand', 'white');
    expect(path).toBe('/images/products/nfcplate-google-review-stand-white-front.png');
  });

  it('falls back to primary image for unknown variant', () => {
    const path = getImagePathForSlug('yelp-review-stand', 'nonexistent');
    expect(path).toBe('/images/products/nfcplate-yelp-review-stand-red-front.png');
  });
});
