import { JsonLd } from '@/components/site/json-ld';
import { PremiumHome } from '@/components/site/premium-home';
import { organizationSchema, websiteSchema } from '@/lib/seo';

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <PremiumHome />
    </>
  );
}