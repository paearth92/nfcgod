import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/page-header';
import { GoogleReviewLinkGenerator } from '@/components/site/google-review-link-generator';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Google Review Link Generator — Free Tool',
  description:
    'Generate a direct link to your Google review page from your Place ID. Free tool from NFCPlate.',
  path: '/tools/google-review-link-generator',
});

export default function GoogleReviewLinkGeneratorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/guides' },
          { name: 'Google Review Link Generator', path: '/tools/google-review-link-generator' },
        ])}
      />
      <PageHeader
        eyebrow="Free tool"
        title="Google Review Link Generator"
        description="Turn your Google Place ID into a direct review link you can program into any NFCPlate product."
      />
      <div className="container-np py-12">
        <GoogleReviewLinkGenerator />
      </div>
    </>
  );
}
