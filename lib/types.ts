export type ProductCategory =
  | 'review-stands'
  | 'social-products'
  | 'multi-link-products'
  | 'bundles';

export type Platform =
  | 'google'
  | 'instagram'
  | 'facebook'
  | 'yelp'
  | 'tripadvisor'
  | 'trustpilot'
  | 'tiktok'
  | 'multi-link';

export type ProductColor = 'black' | 'white' | 'blue' | 'gradient' | 'green' | 'red' | 'black-green';

export type VisualType = 'stand' | 'bundle';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  color?: ProductColor;
  size?: string;
  quantity?: number;
  inStock: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductStorytelling {
  bestPlacement: string;
  bestFor: string;
  primaryBenefit: string;
  benefits: string[];
  useCases: { title: string; body: string }[];
}

export interface ReviewEntry {
  id: string;
  productName: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verifiedPurchase: boolean;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: { rating: number; count: number }[];
  reviews: ReviewEntry[];
}

export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface ProductCareGuide {
  heading: string;
  body: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  platform: Platform;
  visualType: VisualType;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: ProductSpecification[];
  storytelling: ProductStorytelling;
  careGuide: ProductCareGuide;
  variants: ProductVariant[];
  relatedProductSlugs: string[];
  bestSeller: boolean;
  featured: boolean;
  inStock: boolean;
  badge?: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Category {
  slug: ProductCategory;
  name: string;
  shortName: string;
  description: string;
  href: string;
  seoTitle: string;
  seoDescription: string;
  benefits: string[];
  education: { heading: string; body: string };
  faqs: CollectionFaq[];
  relatedCollectionSlugs: string[];
}

export interface CollectionFaq {
  question: string;
  answer: string;
}

export interface Industry {
  slug: string;
  name: string;
  description: string;
  iconName: IndustryIcon;
}

export type IndustryIcon =
  | 'utensils'
  | 'scissors'
  | 'stethoscope'
  | 'wrench'
  | 'dumbbell'
  | 'shopping-bag'
  | 'hammer'
  | 'heart-pulse';

export interface PlatformEntry {
  slug: Platform;
  name: string;
  description: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  groups?: NavGroup[];
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface GuideEntry {
  slug: string;
  title: string;
  description: string;
  category: 'Getting started' | 'NFC' | 'Setup' | 'Platforms';
  readTime: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: 'Products' | 'NFC & Compatibility' | 'Setup' | 'Orders';
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export type SortOption = 'featured' | 'best-selling' | 'price-asc' | 'price-desc' | 'newest';

export interface FilterState {
  categories: string[];
  platforms: string[];
  colors: string[];
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortOption;
}
