import type { Metadata } from 'next';
import { CheckoutReadiness } from '@/components/site/checkout-readiness';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Checkout',
  description: 'Review your order information before payment.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutReadiness />;
}
