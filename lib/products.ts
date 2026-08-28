/**
 * Display-layer product data — derives from the authoritative catalog in lib/catalog.ts.
 * Keeps category, platform, and FAQ content that only exists here, but all product IDs,
 * slugs, variants, SKUs, prices, and availability come from catalogProducts.
 */
import {
  catalogProducts,
  getCatalogProduct,
  getStartingPriceCents,
  getFeaturedCatalogProducts,
  getBestSellerCatalogProducts,
  getRelatedCatalogProducts,
  getAllCatalogPlatforms,
  sortCatalogProducts,
  formatPriceFromCents,
  type CatalogProduct,
  type CatalogPlatform,
} from './catalog';
import type {
  Category,
  PlatformEntry,
  Product,
  ProductFaq,
  ProductVariant,
  SortOption,
  VisualType,
  ProductCategory,
  Platform,
} from './types';

const platformToCategory: Record<string, ProductCategory> = {
  google: 'review-stands',
  facebook: 'social-products',
  instagram: 'social-products',
  tripadvisor: 'review-stands',
  trustpilot: 'review-stands',
  yelp: 'review-stands',
  tiktok: 'social-products',
  'multi-link': 'multi-link-products',
};

function catalogPlatformToPlatform(p: CatalogPlatform): Platform {
  return p as Platform;
}

function deriveVisualType(cp: CatalogProduct): VisualType {
  if (cp.fulfillmentType === 'bundle') return 'bundle';
  return 'stand';
}

function mapVariant(cv: CatalogProduct['variants'][number]): ProductVariant {
  return {
    id: cv.id,
    name: cv.name,
    sku: cv.sku,
    price: cv.priceCents / 100,
    compareAtPrice: cv.compareAtPriceCents ? cv.compareAtPriceCents / 100 : undefined,
    color: cv.color as ProductVariant['color'],
    inStock: cv.inStock,
  };
}

function mapCatalogProduct(cp: CatalogProduct): Product {
  return {
    id: cp.id,
    slug: cp.slug,
    name: cp.name,
    category: platformToCategory[cp.platform] ?? 'review-stands',
    platform: catalogPlatformToPlatform(cp.platform),
    visualType: deriveVisualType(cp),
    shortDescription: cp.shortDescription,
    description: cp.description,
    features: cp.features,
    specifications: cp.specifications,
    storytelling: {
      bestPlacement: 'Checkout counter or reception desk',
      bestFor: 'Businesses with a counter where customers complete their visit',
      primaryBenefit: 'Puts your page one tap away at the moment customers are happiest',
      benefits: cp.features.slice(0, 4),
      useCases: [
        { title: 'Restaurants', body: 'Place at the host stand or beside the check presenter.' },
        { title: 'Salons and barbers', body: 'Set at the styling station.' },
        { title: 'Retail stores', body: 'Keep at the register.' },
      ],
    },
    careGuide: {
      heading: 'Care guidance',
      body: 'Wipe with a soft, dry cloth. Avoid abrasive cleaners or solvents. The NFC inlay and QR code require no maintenance.',
    },
    variants: cp.variants.map(mapVariant),
    relatedProductSlugs: cp.relatedProductSlugs,
    bestSeller: cp.bestSeller,
    featured: cp.featured,
    inStock: cp.inStock,
    badge: cp.badge,
    createdAt: cp.createdAt,
    seoTitle: cp.seoTitle,
    seoDescription: cp.seoDescription,
  };
}

export const products: Product[] = catalogProducts.map(mapCatalogProduct);

export const categories: Category[] = [
  {
    slug: 'review-stands',
    name: 'Review Stands',
    shortName: 'Stands',
    description: 'Countertop NFC stands that put your review page one tap away.',
    href: '/collections/review-stands',
    seoTitle: 'Review Stands — NFC Countertop Review Products',
    seoDescription:
      'Freestanding NFC + QR countertop stands that open your review page with one tap. Premium finish, weighted base, works with iPhone and Android.',
    benefits: [
      'Freestanding and weighted for the counter',
      'NFC tap plus printed QR backup on every stand',
      'Premium finish with NFCPlate branding',
      'Works with iPhone and Android — no app required',
    ],
    education: {
      heading: 'Why a stand belongs on your counter',
      body: 'A freestanding stand stays exactly where customers finish their visit — the checkout counter, reception desk, or service window. NFC gives the fastest path for modern phones, and the printed QR code ensures every customer can reach your review page, even without NFC. No app, no searching, no friction.',
    },
    faqs: [
      {
        question: 'Will the stand stay put on a busy counter?',
        answer: 'Yes. Every NFCPlate stand has a weighted base designed to stay in place during daily use.',
      },
      {
        question: 'Does the stand work without NFC?',
        answer: 'Yes. Each stand includes a printed QR code so customers with non-NFC phones can scan to open the same review page.',
      },
      {
        question: 'Can I change where the stand points later?',
        answer: 'Yes. Stands are programmable — you can update the link at any time to point to a different review page or profile.',
      },
    ],
    relatedCollectionSlugs: ['bundles', 'social-products'],
  },
  {
    slug: 'social-products',
    name: 'Social Products',
    shortName: 'Social',
    description: 'NFC products that connect customers to your social profiles.',
    href: '/collections/social-products',
    seoTitle: 'Social Products — NFC Products for Instagram, Facebook & More',
    seoDescription:
      'NFC + QR products that connect customers to your social profiles. One tap to follow, like, or connect.',
    benefits: [
      'One tap to your social profile',
      'NFC tap plus printed QR backup',
      'Programmable to any social link',
      'Works with iPhone and Android — no app required',
    ],
    education: {
      heading: 'Beyond reviews — social connections',
      body: 'The same NFC technology that opens your review page can also connect customers to your social profiles. A social stand on the counter lets customers follow you on Instagram, like your Facebook page, or connect wherever you are online — one tap or scan, no app required.',
    },
    faqs: [
      {
        question: 'Which social platforms are supported?',
        answer: 'Social products are programmable to any social URL — Instagram, Facebook, TikTok, and more.',
      },
      {
        question: 'Do social products have a QR code too?',
        answer: 'Yes. Every social product includes a printed QR code alongside the NFC inlay.',
      },
      {
        question: 'Can I switch from a social link to a review link later?',
        answer: 'Yes. All NFCPlate products are programmable, so you can update the link at any time.',
      },
    ],
    relatedCollectionSlugs: ['review-stands', 'multi-link-products'],
  },
  {
    slug: 'multi-link-products',
    name: 'Multi-Link Products',
    shortName: 'Multi-Link',
    description: 'One tap, many destinations — link pages and more.',
    href: '/collections/multi-link-products',
    seoTitle: 'Multi-Link Products — One Tap, Many Destinations',
    seoDescription:
      'NFC + QR products that open a single link page with all your destinations. One tap, many options.',
    benefits: [
      'One tap opens all your links',
      'NFC tap plus printed QR backup',
      'Programmable to any link page',
      'Works with iPhone and Android — no app required',
    ],
    education: {
      heading: 'One tap, many destinations',
      body: 'Multi-link products open a single link page that lists all your destinations — reviews, social, website, and more. Customers tap or scan once and choose where to go.',
    },
    faqs: [
      {
        question: 'What is a multi-link product?',
        answer: 'A multi-link product opens a single link page with multiple destinations rather than one specific page.',
      },
      {
        question: 'Do I need a separate link page service?',
        answer: 'Multi-link products point to any URL you choose, including a link-in-bio or custom link page you already use.',
      },
    ],
    relatedCollectionSlugs: ['social-products', 'review-stands'],
  },
  {
    slug: 'bundles',
    name: 'Product Bundles',
    shortName: 'Bundles',
    description: 'Curated sets that cover the counter and save you money.',
    href: '/collections/bundles',
    seoTitle: 'Review Product Bundles — Save on Stand Sets',
    seoDescription:
      'Curated bundles that combine multiple NFC stands at a saving. Cover every platform in one purchase.',
    benefits: [
      'Cover multiple platforms at once',
      'Save versus buying products individually',
      'All items programmable to their respective links',
      'NFC tap plus QR backup on every item',
    ],
    education: {
      heading: 'Why a bundle makes sense',
      body: 'A bundle covers more than one platform at once — Google, Tripadvisor, Yelp, or Facebook, Instagram, and TikTok. Every item is programmable to its respective link, so your customers get the same one-step experience wherever they encounter your business.',
    },
    faqs: [
      {
        question: 'Can I choose colors in a bundle?',
        answer: 'Bundles come with a curated color combination. Each bundle lists exactly what is included.',
      },
      {
        question: 'Are all items in a bundle programmable?',
        answer: 'Yes. Every item in a bundle is programmable to its respective platform link.',
      },
      {
        question: 'Do I save money versus buying items separately?',
        answer: 'Yes. Bundles are priced below the combined cost of their individual items.',
      },
    ],
    relatedCollectionSlugs: ['review-stands', 'social-products'],
  },
];

export const platforms: PlatformEntry[] = [
  { slug: 'google', name: 'Google', description: 'Products built to collect genuine Google reviews.', href: '/platforms/google' },
  { slug: 'instagram', name: 'Instagram', description: 'Help customers find and follow you on Instagram.', href: '/platforms/instagram' },
  { slug: 'facebook', name: 'Facebook', description: 'Connect customers to your Facebook presence.', href: '/platforms/facebook' },
  { slug: 'yelp', name: 'Yelp', description: 'Yelp review products for your front counter.', href: '/platforms/yelp' },
  { slug: 'tripadvisor', name: 'Tripadvisor', description: 'Tripadvisor review products for your counter.', href: '/platforms/tripadvisor' },
  { slug: 'trustpilot', name: 'Trustpilot', description: 'Trustpilot review stands for your counter.', href: '/platforms/trustpilot' },
  { slug: 'tiktok', name: 'TikTok', description: 'TikTok follow stands for your counter.', href: '/platforms/tiktok' },
  { slug: 'multi-link', name: 'Multi-Link', description: 'All your links, one tap away.', href: '/collections/multi-link-products' },
];

const googleProductFaqs: ProductFaq[] = [
  {
    question: 'Do customers need an app to leave a review?',
    answer: 'No. When a customer taps or scans your NFCPlate product, your review page opens directly in their phone browser. No app download is required for iPhone or Android.',
  },
  {
    question: 'What if a phone does not support NFC?',
    answer: 'Every NFCPlate product includes a printed QR code backup. If a phone does not support NFC taps, the customer scans the QR code with their camera to open the same review page.',
  },
  {
    question: 'Is NFCPlate affiliated with Google?',
    answer: 'No. NFCPlate is not affiliated with or endorsed by Google. NFCPlate products simply open the review page you program them with.',
  },
  {
    question: 'How do I set my review link?',
    answer: 'Each NFCPlate product is programmable. You set your review link once and the product opens that page on every tap or scan. See the Product Setup page for step-by-step instructions.',
  },
];

const socialProductFaqs: ProductFaq[] = [
  {
    question: 'Which social platforms can I link to?',
    answer: 'Any platform with a public URL — Instagram, Facebook, TikTok, and more. You program the product once and it opens that profile on every tap or scan.',
  },
  {
    question: 'Do customers need an app?',
    answer: 'No. The link opens directly in the phone browser. No app download is required.',
  },
  {
    question: 'What if a phone does not support NFC?',
    answer: 'Every NFCPlate product includes a printed QR code backup. Customers scan the QR code to open the same destination.',
  },
];

export const productFaqs: Record<string, ProductFaq[]> = {
  google: googleProductFaqs,
  instagram: socialProductFaqs,
  facebook: socialProductFaqs,
  yelp: googleProductFaqs,
  tripadvisor: googleProductFaqs,
  trustpilot: googleProductFaqs,
  tiktok: socialProductFaqs,
  'multi-link': socialProductFaqs,
};

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.bestSeller);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getStartingPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getMinPrice(): number {
  return Math.min(...products.flatMap((p) => p.variants.map((v) => v.price)));
}

export function getMaxPrice(): number {
  return Math.max(...products.flatMap((p) => p.variants.map((v) => v.price)));
}

export function getAllColors(): { value: string; label: string }[] {
  const colorLabels: Record<string, string> = {
    black: 'Black',
    white: 'White',
    blue: 'Blue',
    gradient: 'Gradient',
    green: 'Green',
    red: 'Red',
    'black-green': 'Black/Green',
  };
  const seen = new Set<string>();
  products.forEach((p) =>
    p.variants.forEach((v) => {
      if (v.color) seen.add(v.color);
    })
  );
  return Array.from(seen).map((c) => ({ value: c, label: colorLabels[c] ?? c }));
}

export function getAllPlatforms(): { value: string; label: string }[] {
  return getAllCatalogPlatforms();
}

export function sortProducts(items: Product[], sort: SortOption): Product[] {
  return sortCatalogProducts(
    items.map((p) => getCatalogProduct(p.slug)!).filter(Boolean),
    sort
  ).map(mapCatalogProduct);
}

export function filterProducts(items: Product[], filters: {
  categories: string[];
  platforms: string[];
  colors: string[];
  maxPrice: number | null;
  inStockOnly: boolean;
}): Product[] {
  return items.filter((p) => {
    if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
    if (filters.platforms.length > 0 && !filters.platforms.includes(p.platform)) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.maxPrice !== null && getStartingPrice(p) > filters.maxPrice) return false;
    if (filters.colors.length > 0) {
      const productColors = p.variants.map((v) => v.color).filter(Boolean) as string[];
      const hasColor = productColors.some((c) => filters.colors.includes(c));
      if (!hasColor) return false;
    }
    return true;
  });
}

export function formatPrice(value: number): string {
  return formatPriceFromCents(Math.round(value * 100));
}
