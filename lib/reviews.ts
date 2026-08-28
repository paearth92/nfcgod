import type { ReviewSummary, ComparisonRow, Product } from './types';
import { products, getStartingPrice, formatPrice } from './products';

/**
 * SAMPLE STOREFRONT REVIEW CONTENT
 *
 * These are typed local seed reviews for layout and structured-data demonstration only.
 * They are NOT imported from any external reviews platform and must be replaced
 * with a real reviews database in a later phase.
 */
const sampleReviews: Record<string, ReviewSummary> = {
  'google-review-stand': {
    average: 4.8,
    count: 47,
    distribution: [
      { rating: 5, count: 38 },
      { rating: 4, count: 7 },
      { rating: 3, count: 2 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-001',
        productName: 'Google Review Stand',
        author: 'Marcus T.',
        rating: 5,
        date: '2024-08-15',
        title: 'Customers actually use it',
        body: 'Placed this on our checkout counter and customers tap it without being asked. The QR backup handles the few older phones we see. Solid build quality.',
        verifiedPurchase: true,
      },
      {
        id: 'r-002',
        productName: 'Google Review Stand',
        author: 'Diana R.',
        rating: 5,
        date: '2024-07-28',
        title: 'Simple and effective',
        body: 'Set it up in under five minutes. The stand stays put and looks premium on the counter. Exactly what our small business needed.',
        verifiedPurchase: true,
      },
      {
        id: 'r-003',
        productName: 'Google Review Stand',
        author: 'James K.',
        rating: 4,
        date: '2024-06-12',
        title: 'Great product, wish it came in more colors',
        body: 'Works perfectly and the NFC is fast. The blue looks good but I would love a graphite option for our darker aesthetic. Still a five-star product functionally.',
        verifiedPurchase: true,
      },
    ],
  },
  'compact-google-review-stand': {
    average: 4.7,
    count: 23,
    distribution: [
      { rating: 5, count: 17 },
      { rating: 4, count: 5 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-101',
        productName: 'Compact Google Review Stand',
        author: 'Priya S.',
        rating: 5,
        date: '2024-08-02',
        title: 'Perfect for our tiny counter',
        body: 'Our counter space is minimal and this fit perfectly. Same tap experience as the bigger stand, just a smaller footprint.',
        verifiedPurchase: true,
      },
      {
        id: 'r-102',
        productName: 'Compact Google Review Stand',
        author: 'Tom L.',
        rating: 4,
        date: '2024-07-10',
        title: 'Compact and clean',
        body: 'Does the job. A bit smaller than I expected but that is the point. NFC works every time.',
        verifiedPurchase: true,
      },
    ],
  },
  'google-review-card': {
    average: 4.9,
    count: 62,
    distribution: [
      { rating: 5, count: 55 },
      { rating: 4, count: 6 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-201',
        productName: 'Google Review Card',
        author: 'Elena M.',
        rating: 5,
        date: '2024-08-20',
        title: 'I hand these to every client',
        body: 'I keep a card in my apron and hand it to clients after their appointment. They tap and the review page opens instantly. Game changer for our salon.',
        verifiedPurchase: true,
      },
      {
        id: 'r-202',
        productName: 'Google Review Card',
        author: 'Robert H.',
        rating: 5,
        date: '2024-07-15',
        title: 'Durable and dependable',
        body: 'Been carrying this daily for two months. Still looks new and works every single time. The 5-pack was a great deal.',
        verifiedPurchase: true,
      },
    ],
  },
  'google-review-sticker': {
    average: 4.6,
    count: 18,
    distribution: [
      { rating: 5, count: 13 },
      { rating: 4, count: 4 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-301',
        productName: 'Google Review Sticker',
        author: 'Aisha B.',
        rating: 5,
        date: '2024-08-05',
        title: 'Covered every surface in our cafe',
        body: 'We put stickers on the tables, the register, and the to-go area. Customers scan from wherever they are sitting. The 5-pack covered everything.',
        verifiedPurchase: true,
      },
    ],
  },
  'google-review-plate': {
    average: 4.7,
    count: 12,
    distribution: [
      { rating: 5, count: 9 },
      { rating: 4, count: 3 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-401',
        productName: 'Google Review Plate',
        author: 'Greg W.',
        rating: 5,
        date: '2024-07-22',
        title: 'Mounted it at our front desk permanently',
        body: 'The metal plate feels substantial and professional. Mounted it at the reception desk and it has survived daily cleaning with no issues.',
        verifiedPurchase: true,
      },
    ],
  },
  'review-starter-bundle': {
    average: 4.9,
    count: 34,
    distribution: [
      { rating: 5, count: 30 },
      { rating: 4, count: 4 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-501',
        productName: 'Review Starter Bundle',
        author: 'Nina P.',
        rating: 5,
        date: '2024-08-18',
        title: 'The perfect starting point',
        body: 'Stand for the counter, card for my pocket. Both programmed to the same link in minutes. The bundle saved me money versus buying separately.',
        verifiedPurchase: true,
      },
    ],
  },
  'business-review-bundle': {
    average: 4.8,
    count: 21,
    distribution: [
      { rating: 5, count: 17 },
      { rating: 4, count: 3 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-601',
        productName: 'Business Review Bundle',
        author: 'Carlos D.',
        rating: 5,
        date: '2024-07-30',
        title: 'Equipped our whole shop',
        body: 'Two stands for the counter and service area, two cards for staff, and stickers on the windows. Everything points to the same review page. Best value for a multi-station business.',
        verifiedPurchase: true,
      },
    ],
  },
  'instagram-follow-stand': {
    average: 4.7,
    count: 15,
    distribution: [
      { rating: 5, count: 11 },
      { rating: 4, count: 4 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    reviews: [
      {
        id: 'r-701',
        productName: 'Instagram Follow Stand',
        author: 'Sophie L.',
        rating: 5,
        date: '2024-08-10',
        title: 'Followers went up noticeably',
        body: 'Put this on our counter and customers follow us right after their visit. Same tap experience as the review stand but pointed at our Instagram. Love it.',
        verifiedPurchase: true,
      },
    ],
  },
};

export function getReviewSummary(slug: string): ReviewSummary | undefined {
  return sampleReviews[slug];
}

export const comparisonRows: ComparisonRow[] = [
  { label: 'Format', values: ['Countertop stand', 'Compact stand', 'Pocket card', 'Sticker', 'Metal plate', 'Bundle', 'Social stand'] },
  { label: 'Best placement', values: ['Counter', 'Small counter', 'Pocket / check holder', 'Any surface', 'Fixed placement', 'Multi-station', 'Counter'] },
  { label: 'Portability', values: ['Stationary', 'Stationary', 'High', 'Fixed', 'Fixed', 'Mixed', 'Stationary'] },
  { label: 'NFC tap', values: ['Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'] },
  { label: 'QR scan', values: ['Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'] },
  { label: 'Best for', values: ['Counter reviews', 'Small spaces', 'On-the-go', 'Surfaces', 'Durable fixed use', 'Full coverage', 'Social growth'] },
];

export function getComparisonData(currentSlug: string): { rows: ComparisonRow[]; products: Product[]; currentIndex: number } {
  const currentIndex = products.findIndex((p) => p.slug === currentSlug);
  return { rows: comparisonRows, products, currentIndex };
}

export { formatPrice, getStartingPrice };
