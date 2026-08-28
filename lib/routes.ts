export interface RouteEntry {
  path: string;
  label: string;
  priority?: number;
  changeFrequency?: 'always' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const staticRoutes: RouteEntry[] = [
  { path: '/', label: 'Home', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/shop', label: 'Shop', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/how-it-works', label: 'How It Works', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/industries', label: 'Industries', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/guides', label: 'Guides', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/faq', label: 'FAQ', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/setup', label: 'Product Setup', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/nfc-compatibility', label: 'NFC Compatibility', priority: 0.5, changeFrequency: 'monthly' },
  {
    path: '/tools/google-review-link-generator',
    label: 'Google Review Link Generator',
    priority: 0.5,
    changeFrequency: 'monthly',
  },
  { path: '/collections/review-stands', label: 'Review Stands', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/collections/review-cards', label: 'Review Cards', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/collections/review-stickers', label: 'Review Stickers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/collections/review-plates', label: 'Review Plates', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/collections/bundles', label: 'Bundles', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/collections/social-products', label: 'Social Products', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/platforms/google', label: 'Google Reviews', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/platforms/instagram', label: 'Instagram', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/platforms/facebook', label: 'Facebook', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/platforms/yelp', label: 'Yelp', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/account', label: 'Account', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/contact', label: 'Contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/track-order', label: 'Track Order', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy-policy', label: 'Privacy Policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', label: 'Terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/shipping-and-returns', label: 'Shipping & Returns', priority: 0.3, changeFrequency: 'yearly' },
];

export const collectionRoutes = [
  '/collections/review-stands',
  '/collections/review-cards',
  '/collections/review-stickers',
  '/collections/review-plates',
  '/collections/bundles',
  '/collections/social-products',
];

export const platformRoutes = [
  '/platforms/google',
  '/platforms/instagram',
  '/platforms/facebook',
  '/platforms/yelp',
];
