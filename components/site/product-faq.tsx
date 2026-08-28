'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Product, ProductFaq } from '@/lib/types';
import { productFaqs } from '@/lib/products';

interface ProductFAQProps {
  product: Product;
}

export function ProductFAQ({ product }: ProductFAQProps) {
  const faqs: ProductFaq[] = productFaqs[product.platform] ?? [];
  if (faqs.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-lg font-semibold text-foreground">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="mt-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
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
}
