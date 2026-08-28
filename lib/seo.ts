import type { Metadata } from 'next';
import { staticRoutes } from './routes';
import { products, productFaqs } from './products';
import { industries, guides } from './content';
import type { Product } from './types';

export const siteConfig = {
  name: 'NFCPlate',
  url: 'https://nfcplate.com',
  tagline: 'One tap. One scan. Every review.',
  description:
    'NFC + QR products that help businesses collect genuine customer reviews. Tap with NFC or scan the QR code — no app required. Activate your code and update your link anytime.',
  twitter: '@nfcplate',
} as const;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
}: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle =
    title === siteConfig.tagline ? `${siteConfig.name} — ${title}` : title;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function productMetadata(slug: string): Metadata | undefined {
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  return pageMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/products/${product.slug}`,
  });
}

export function canonicalUrl(path: string): string {
  return `${siteConfig.url}${path.replace(/\/$/, '') || '/'}`;
}

export function allSitemapUrls() {
  const staticEntries = staticRoutes.map((r) => ({
    url: canonicalUrl(r.path),
    lastModified: new Date().toISOString(),
    changeFrequency: r.changeFrequency ?? 'monthly',
    priority: r.priority ?? 0.5,
  }));
  const productEntries = products.map((p) => ({
    url: canonicalUrl(`/products/${p.slug}`),
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const industryEntries = industries.map((i) => ({
    url: canonicalUrl(`/industries/${i.slug}`),
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const guideEntries = guides.map((g) => ({
    url: canonicalUrl(`/guides/${g.slug}`),
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
  return [...staticEntries, ...productEntries, ...industryEntries, ...guideEntries];
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [] as string[],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productSchema(slug: string, aggregateRating?: {
  average: number;
  count: number;
}) {
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  const firstVariant = product.variants[0];
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription,
    brand: { '@type': 'Brand', name: siteConfig.name },
    category: product.category,
    sku: firstVariant.sku,
    offers: {
      '@type': 'Offer',
      price: firstVariant.price,
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: canonicalUrl(`/products/${product.slug}`),
    },
  };
  if (aggregateRating && aggregateRating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.average,
      reviewCount: aggregateRating.count,
    };
  }
  return schema;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqPageSchema(product: Product): Record<string, unknown> | undefined {
  const faqs = productFaqs[product.platform] ?? [];
  if (faqs.length === 0) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
