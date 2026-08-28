import type { MetadataRoute } from 'next';
import { allSitemapUrls } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return allSitemapUrls().map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
