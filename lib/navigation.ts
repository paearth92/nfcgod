import type { NavItem } from './types';

export const navItems: NavItem[] = [
  { label: 'Shop', href: '/shop' },
  {
    label: 'Products',
    groups: [
      {
        heading: 'Review Products',
        links: [
          {
            label: 'Review Stands',
            href: '/collections/review-stands',
            description: 'Countertop NFC stands',
          },
          {
            label: 'Review Cards',
            href: '/collections/review-cards',
            description: 'Pocket-sized NFC cards',
          },
          {
            label: 'Review Stickers',
            href: '/collections/review-stickers',
            description: 'NFC stickers for any surface',
          },
          {
            label: 'Review Plates',
            href: '/collections/review-plates',
            description: 'Durable metal NFC plates',
          },
        ],
      },
      {
        heading: 'More',
        links: [
          {
            label: 'Product Bundles',
            href: '/collections/bundles',
            description: 'Save on curated sets',
          },
          {
            label: 'Social Products',
            href: '/collections/social-products',
            description: 'Connect to your social profiles',
          },
          {
            label: 'Multi-Link Products',
            href: '/collections/social-products',
            description: 'One tap, many destinations',
          },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    groups: [
      {
        heading: 'By Platform',
        links: [
          {
            label: 'Get Google Reviews',
            href: '/platforms/google',
            description: 'Collect genuine Google reviews',
          },
          {
            label: 'Grow on Instagram',
            href: '/platforms/instagram',
            description: 'Help customers find and follow you',
          },
          {
            label: 'Connect on Facebook',
            href: '/platforms/facebook',
            description: 'Bring customers to your page',
          },
          {
            label: 'Yelp Review Products',
            href: '/platforms/yelp',
            description: 'Yelp reviews from the counter',
          },
          {
            label: 'Multi-Link Products',
            href: '/collections/social-products',
            description: 'All your links, one tap',
          },
        ],
      },
    ],
  },
  {
    label: 'Industries',
    groups: [
      {
        heading: 'Find Your Industry',
        links: [
          { label: 'Restaurants', href: '/industries/restaurants' },
          { label: 'Salons & Barbers', href: '/industries/salons-barbers' },
          { label: 'Dental Offices', href: '/industries/dental-offices' },
          { label: 'Auto Services', href: '/industries/auto-services' },
          { label: 'Fitness Studios', href: '/industries/fitness-studios' },
          { label: 'Retail Stores', href: '/industries/retail-stores' },
          { label: 'Contractors', href: '/industries/contractors' },
          { label: 'Medical Offices', href: '/industries/medical-offices' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    groups: [
      {
        heading: 'Learn',
        links: [
          { label: 'How NFC Works', href: '/guides/how-nfc-works' },
          {
            label: 'Google Review Link Generator',
            href: '/tools/google-review-link-generator',
          },
          { label: 'NFC Compatibility', href: '/nfc-compatibility' },
          { label: 'Product Setup', href: '/setup' },
          { label: 'Guides', href: '/guides' },
          { label: 'FAQs', href: '/faq' },
        ],
      },
    ],
  },
  { label: 'How It Works', href: '/how-it-works' },
];

export const footerShopLinks = [
  { label: 'Review Stands', href: '/collections/review-stands' },
  { label: 'Review Cards', href: '/collections/review-cards' },
  { label: 'Stickers & Plates', href: '/collections/review-stickers' },
  { label: 'Bundles', href: '/collections/bundles' },
];

export const footerDiscoverLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Industries', href: '/industries' },
  { label: 'Guides', href: '/guides' },
  { label: 'Compatibility', href: '/nfc-compatibility' },
];

export const footerHelpLinks = [
  { label: 'FAQs', href: '/faq' },
  { label: 'Product Setup', href: '/setup' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Contact Us', href: '/contact' },
];

export const footerLegalLinks = [
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Shipping & Returns', href: '/shipping-and-returns' },
];
