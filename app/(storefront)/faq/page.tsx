import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/site/page-header';
import { faqs } from '@/lib/content';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'FAQs — NFCPlate Help',
  description:
    'Answers to common questions about NFCPlate NFC review products, compatibility, setup, and orders.',
  path: '/faq',
});

const categories = ['Products', 'NFC & Compatibility', 'Setup', 'Orders'];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'FAQs', path: '/faq' },
        ])}
      />
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        description="Everything you need to know about NFCPlate NFC review products, compatibility, setup, and orders."
      />
      <div className="container-np py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {categories.map((cat) => {
            const items = faqs.filter((f) => f.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-base font-semibold text-foreground">{cat}</h2>
                <Accordion type="single" collapsible className="mt-3">
                  {items.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
