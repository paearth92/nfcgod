/**
 * NFCPlate Authoritative Product Catalog
 *
 * This is the server-readable authority for product IDs, slugs, variants,
 * SKUs, names, image mapping, prices, availability, and bundle composition.
 * All checkout, order, and display logic must reference this catalog.
 * Prices are in integer minor currency units (cents).
 */

export type CatalogPlatform =
  | 'google'
  | 'facebook'
  | 'instagram'
  | 'tripadvisor'
  | 'trustpilot'
  | 'yelp'
  | 'tiktok'
  | 'multi-link';

export type CatalogFulfillmentType = 'physical' | 'bundle';

export interface CatalogVariant {
  id: string;
  name: string;
  sku: string;
  /** Price in cents (minor currency units) */
  priceCents: number;
  compareAtPriceCents?: number;
  color?: string;
  inStock: boolean;
  /** Image variant key matching the media manifest */
  imageVariant?: string;
}

export interface BundleComponent {
  productSlug: string;
  productName: string;
  quantity: number;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  platform: CatalogPlatform;
  fulfillmentType: CatalogFulfillmentType;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  variants: CatalogVariant[];
  relatedProductSlugs: string[];
  bestSeller: boolean;
  featured: boolean;
  inStock: boolean;
  badge?: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  /** For bundles: exact list of included stands */
  bundleComponents?: BundleComponent[];
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
export const STANDARD_SHIPPING_CENTS = 599;
export const CURRENCY = 'usd';

export const catalogProducts: CatalogProduct[] = [
  {
    id: 'NFP-GRS-BLK',
    slug: 'google-review-stand',
    name: 'Google Review Stand',
    platform: 'google',
    fulfillmentType: 'physical',
    shortDescription: 'Google Review Stand — Black',
    description:
      'A freestanding NFC + QR countertop stand that opens your Google review page the moment a customer taps. Premium black finish with a weighted base, NFCPlate branding, and a printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Google review page',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium black finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your review link' },
    ],
    variants: [
      {
        id: 'NFP-GRS-BLK',
        name: 'Black',
        sku: 'NFP-GRS-BLK',
        priceCents: 2900,
        color: 'black',
        inStock: true,
        imageVariant: 'black',
      },
      {
        id: 'NFP-GRS-WHT',
        name: 'White',
        sku: 'NFP-GRS-WHT',
        priceCents: 2900,
        color: 'white',
        inStock: true,
        imageVariant: 'white',
      },
    ],
    relatedProductSlugs: ['reputation-review-stand-bundle', 'yelp-review-stand', 'tripadvisor-review-stand'],
    bestSeller: true,
    featured: true,
    inStock: true,
    badge: 'Best Seller',
    createdAt: '2024-01-01',
    seoTitle: 'Google Review Stand — NFC Countertop Review Product',
    seoDescription:
      'A premium NFC + QR countertop stand that opens your Google review page with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-FBK-BLU',
    slug: 'facebook-nfc-stand',
    name: 'Facebook NFC Stand',
    platform: 'facebook',
    fulfillmentType: 'physical',
    shortDescription: 'Facebook NFC Stand — Blue',
    description:
      'A freestanding NFC + QR countertop stand that opens your Facebook page with one tap. Premium blue finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Facebook page',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium blue finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your Facebook link' },
    ],
    variants: [
      {
        id: 'NFP-FBK-BLU',
        name: 'Blue',
        sku: 'NFP-FBK-BLU',
        priceCents: 2900,
        color: 'blue',
        inStock: true,
        imageVariant: 'blue',
      },
    ],
    relatedProductSlugs: ['social-growth-stand-bundle', 'instagram-nfc-stand', 'tiktok-follow-stand'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-06-15',
    seoTitle: 'Facebook NFC Stand — NFC Countertop Social Product',
    seoDescription:
      'A premium NFC + QR countertop stand that opens your Facebook page with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-IGS-GRD',
    slug: 'instagram-nfc-stand',
    name: 'Instagram NFC Stand',
    platform: 'instagram',
    fulfillmentType: 'physical',
    shortDescription: 'Instagram NFC Stand — Gradient',
    description:
      'A freestanding NFC + QR countertop stand that opens your Instagram profile with one tap. Premium gradient finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Instagram profile',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium gradient finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your Instagram link' },
    ],
    variants: [
      {
        id: 'NFP-IGS-GRD',
        name: 'Gradient',
        sku: 'NFP-IGS-GRD',
        priceCents: 2900,
        color: 'gradient',
        inStock: true,
        imageVariant: 'gradient',
      },
    ],
    relatedProductSlugs: ['social-growth-stand-bundle', 'facebook-nfc-stand', 'tiktok-follow-stand'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-07-01',
    seoTitle: 'Instagram NFC Stand — NFC Social Stand',
    seoDescription:
      'A freestanding NFC + QR countertop stand that opens your Instagram profile with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-TRS-GRN',
    slug: 'tripadvisor-review-stand',
    name: 'Tripadvisor Review Stand',
    platform: 'tripadvisor',
    fulfillmentType: 'physical',
    shortDescription: 'Tripadvisor Review Stand — Green',
    description:
      'A freestanding NFC + QR countertop stand that opens your Tripadvisor review page with one tap. Premium green finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Tripadvisor review page',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium green finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your review link' },
    ],
    variants: [
      {
        id: 'NFP-TRS-GRN',
        name: 'Green',
        sku: 'NFP-TRS-GRN',
        priceCents: 2900,
        color: 'green',
        inStock: true,
        imageVariant: 'green',
      },
    ],
    relatedProductSlugs: ['reputation-review-stand-bundle', 'google-review-stand', 'yelp-review-stand'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-08-01',
    seoTitle: 'Tripadvisor Review Stand — NFC Countertop Review Product',
    seoDescription:
      'A premium NFC + QR countertop stand that opens your Tripadvisor review page with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-TPS-BLG',
    slug: 'trustpilot-review-stand',
    name: 'Trustpilot Review Stand',
    platform: 'trustpilot',
    fulfillmentType: 'physical',
    shortDescription: 'Trustpilot Review Stand — Black/Green',
    description:
      'A freestanding NFC + QR countertop stand that opens your Trustpilot review page with one tap. Premium black and green finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Trustpilot review page',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium black/green finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your review link' },
    ],
    variants: [
      {
        id: 'NFP-TPS-BLG',
        name: 'Black/Green',
        sku: 'NFP-TPS-BLG',
        priceCents: 2900,
        color: 'black-green',
        inStock: true,
        imageVariant: 'black-green',
      },
    ],
    relatedProductSlugs: ['google-review-stand', 'reputation-review-stand-bundle', 'trustpilot-review-stand'],
    bestSeller: false,
    featured: false,
    inStock: true,
    createdAt: '2024-09-01',
    seoTitle: 'Trustpilot Review Stand — NFC Countertop Review Product',
    seoDescription:
      'A premium NFC + QR countertop stand that opens your Trustpilot review page with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-YRS-RED',
    slug: 'yelp-review-stand',
    name: 'Yelp Review Stand',
    platform: 'yelp',
    fulfillmentType: 'physical',
    shortDescription: 'Yelp Review Stand — Red',
    description:
      'A freestanding NFC + QR countertop stand that opens your Yelp review page with one tap. Premium red finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your Yelp review page',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium red finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your review link' },
    ],
    variants: [
      {
        id: 'NFP-YRS-RED',
        name: 'Red',
        sku: 'NFP-YRS-RED',
        priceCents: 2900,
        color: 'red',
        inStock: true,
        imageVariant: 'red',
      },
    ],
    relatedProductSlugs: ['reputation-review-stand-bundle', 'google-review-stand', 'tripadvisor-review-stand'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-08-15',
    seoTitle: 'Yelp Review Stand — NFC Countertop Review Product',
    seoDescription:
      'A premium NFC + QR countertop stand that opens your Yelp review page with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-TTS-BLK',
    slug: 'tiktok-follow-stand',
    name: 'TikTok Follow Stand',
    platform: 'tiktok',
    fulfillmentType: 'physical',
    shortDescription: 'TikTok Follow Stand — Black',
    description:
      'A freestanding NFC + QR countertop stand that opens your TikTok profile with one tap. Premium black finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap to open your TikTok profile',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium black finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your TikTok link' },
    ],
    variants: [
      {
        id: 'NFP-TTS-BLK',
        name: 'Black',
        sku: 'NFP-TTS-BLK',
        priceCents: 2900,
        color: 'black',
        inStock: true,
        imageVariant: 'black',
      },
    ],
    relatedProductSlugs: ['social-growth-stand-bundle', 'instagram-nfc-stand', 'facebook-nfc-stand'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-10-01',
    seoTitle: 'TikTok Follow Stand — NFC Social Stand',
    seoDescription:
      'A freestanding NFC + QR countertop stand that opens your TikTok profile with one tap. Works with iPhone and Android. No app required.',
  },
  {
    id: 'NFP-MLS-BLK',
    slug: 'multi-link-nfc-stand',
    name: 'Multi-Link NFC Stand',
    platform: 'multi-link',
    fulfillmentType: 'physical',
    shortDescription: 'Multi-Link NFC Stand — Black',
    description:
      'A freestanding NFC + QR countertop stand that opens a single link page with all your destinations. One tap, many options. Premium black finish with a weighted base and printed QR backup for non-NFC phones.',
    features: [
      'NFC tap opens all your links',
      'Printed QR code backup for non-NFC phones',
      'Weighted base stays put on the counter',
      'Premium black finish with NFCPlate branding',
      'Works with iPhone and Android',
      'No app required for customers',
    ],
    specifications: [
      { label: 'Material', value: 'Acrylic + NFC inlay' },
      { label: 'Dimensions', value: '3.5 × 2.2 × 0.4 in' },
      { label: 'Weight', value: '3.2 oz' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set your link page URL' },
    ],
    variants: [
      {
        id: 'NFP-MLS-BLK',
        name: 'Black',
        sku: 'NFP-MLS-BLK',
        priceCents: 2900,
        color: 'black',
        inStock: true,
        imageVariant: 'black',
      },
    ],
    relatedProductSlugs: ['google-review-stand', 'social-growth-stand-bundle', 'reputation-review-stand-bundle'],
    bestSeller: false,
    featured: true,
    inStock: true,
    createdAt: '2024-11-01',
    seoTitle: 'Multi-Link NFC Stand — One Tap, Many Destinations',
    seoDescription:
      'A freestanding NFC + QR countertop stand that opens a single link page with all your destinations. One tap, many options.',
  },
  {
    id: 'NFP-SGB-SET',
    slug: 'social-growth-stand-bundle',
    name: 'Social Growth Stand Bundle',
    platform: 'multi-link',
    fulfillmentType: 'bundle',
    shortDescription: 'Facebook + Instagram + TikTok Stands',
    description:
      'Three NFC stands to grow your social presence across every platform. Includes one Facebook NFC Stand (Blue), one Instagram NFC Stand (Gradient), and one TikTok Follow Stand (Black) — all programmable to their respective social links.',
    features: [
      '1 × Facebook NFC Stand (Blue)',
      '1 × Instagram NFC Stand (Gradient)',
      '1 × TikTok Follow Stand (Black)',
      'All programmable to their respective social links',
      'NFC tap + QR backup on every stand',
      'Works with iPhone and Android',
    ],
    specifications: [
      { label: 'Includes', value: '3 Social NFC Stands' },
      { label: 'Platforms', value: 'Facebook, Instagram, TikTok' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set each stand to its platform link' },
    ],
    variants: [
      {
        id: 'NFP-SGB-SET',
        name: 'Social Growth Set',
        sku: 'NFP-SGB-SET',
        priceCents: 7900,
        compareAtPriceCents: 8700,
        inStock: true,
        imageVariant: 'bundle',
      },
    ],
    relatedProductSlugs: ['facebook-nfc-stand', 'instagram-nfc-stand', 'tiktok-follow-stand'],
    bestSeller: true,
    featured: true,
    inStock: true,
    badge: 'Save 9%',
    createdAt: '2024-12-01',
    seoTitle: 'Social Growth Stand Bundle — Facebook + Instagram + TikTok',
    seoDescription:
      'Three NFC stands for Facebook, Instagram, and TikTok. Save on the bundle. Works with iPhone and Android. No app required.',
    bundleComponents: [
      { productSlug: 'facebook-nfc-stand', productName: 'Facebook NFC Stand', quantity: 1 },
      { productSlug: 'instagram-nfc-stand', productName: 'Instagram NFC Stand', quantity: 1 },
      { productSlug: 'tiktok-follow-stand', productName: 'TikTok Follow Stand', quantity: 1 },
    ],
  },
  {
    id: 'NFP-RRB-SET',
    slug: 'reputation-review-stand-bundle',
    name: 'Reputation Review Stand Bundle',
    platform: 'multi-link',
    fulfillmentType: 'bundle',
    shortDescription: 'Google + Tripadvisor + Yelp Review Stands',
    description:
      'Three NFC review stands to cover the top review platforms. Includes one Google Review Stand (Black), one Tripadvisor Review Stand (Green), and one Yelp Review Stand (Red) — all programmable to their respective review links.',
    features: [
      '1 × Google Review Stand (Black)',
      '1 × Tripadvisor Review Stand (Green)',
      '1 × Yelp Review Stand (Red)',
      'All programmable to their respective review links',
      'NFC tap + QR backup on every stand',
      'Works with iPhone and Android',
    ],
    specifications: [
      { label: 'Includes', value: '3 Review NFC Stands' },
      { label: 'Platforms', value: 'Google, Tripadvisor, Yelp' },
      { label: 'Compatibility', value: 'iPhone 7+, most Android' },
      { label: 'Programmable', value: 'Yes — set each stand to its review link' },
    ],
    variants: [
      {
        id: 'NFP-RRB-SET',
        name: 'Reputation Review Set',
        sku: 'NFP-RRB-SET',
        priceCents: 7900,
        compareAtPriceCents: 8700,
        inStock: true,
        imageVariant: 'bundle',
      },
    ],
    relatedProductSlugs: ['google-review-stand', 'tripadvisor-review-stand', 'yelp-review-stand'],
    bestSeller: true,
    featured: true,
    inStock: true,
    badge: 'Save 9%',
    createdAt: '2024-12-15',
    seoTitle: 'Reputation Review Stand Bundle — Google + Tripadvisor + Yelp',
    seoDescription:
      'Three NFC review stands for Google, Tripadvisor, and Yelp. Save on the bundle. Works with iPhone and Android. No app required.',
    bundleComponents: [
      { productSlug: 'google-review-stand', productName: 'Google Review Stand', quantity: 1 },
      { productSlug: 'tripadvisor-review-stand', productName: 'Tripadvisor Review Stand', quantity: 1 },
      { productSlug: 'yelp-review-stand', productName: 'Yelp Review Stand', quantity: 1 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Lookup helpers                                                            */
/* -------------------------------------------------------------------------- */

export function getCatalogProduct(slug: string): CatalogProduct | undefined {
  return catalogProducts.find((p) => p.slug === slug);
}

export function getCatalogVariant(
  slug: string,
  variantId: string
): { product: CatalogProduct; variant: CatalogVariant } | undefined {
  const product = getCatalogProduct(slug);
  if (!product) return undefined;
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return undefined;
  return { product, variant };
}

export function getCatalogProductById(id: string): CatalogProduct | undefined {
  return catalogProducts.find((p) => p.id === id || p.variants.some((v) => v.id === id));
}

export function getCatalogVariantBySku(sku: string): { product: CatalogProduct; variant: CatalogVariant } | undefined {
  for (const product of catalogProducts) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getStartingPriceCents(product: CatalogProduct): number {
  return Math.min(...product.variants.map((v) => v.priceCents));
}

export function getFeaturedCatalogProducts(): CatalogProduct[] {
  return catalogProducts.filter((p) => p.featured);
}

export function getBestSellerCatalogProducts(): CatalogProduct[] {
  return catalogProducts.filter((p) => p.bestSeller);
}

export function getRelatedCatalogProducts(slug: string): CatalogProduct[] {
  const product = getCatalogProduct(slug);
  if (!product) return [];
  return product.relatedProductSlugs
    .map((s) => getCatalogProduct(s))
    .filter((p): p is CatalogProduct => p !== undefined);
}

export function formatPriceFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function calculateShipping(subtotalCents: number): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return STANDARD_SHIPPING_CENTS;
}

export function getAllCatalogPlatforms(): { value: string; label: string }[] {
  const platformLabels: Record<string, string> = {
    google: 'Google',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tripadvisor: 'Tripadvisor',
    trustpilot: 'Trustpilot',
    yelp: 'Yelp',
    tiktok: 'TikTok',
    'multi-link': 'Multi-Link',
  };
  const seen = new Set<string>();
  catalogProducts.forEach((p) => seen.add(p.platform));
  return Array.from(seen).map((p) => ({ value: p, label: platformLabels[p] ?? p }));
}

export function sortCatalogProducts(
  items: CatalogProduct[],
  sort: 'featured' | 'best-selling' | 'price-asc' | 'price-desc' | 'newest'
): CatalogProduct[] {
  const sorted = [...items];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => getStartingPriceCents(a) - getStartingPriceCents(b));
    case 'price-desc':
      return sorted.sort((a, b) => getStartingPriceCents(b) - getStartingPriceCents(a));
    case 'best-selling':
      return sorted.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}
