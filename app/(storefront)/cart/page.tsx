import type { Metadata } from 'next';
import { CartContents } from '@/components/site/cart-contents';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Your Cart',
  description: 'Review the items in your NFCPlate cart and proceed to checkout.',
  path: '/cart',
  noIndex: true,
});

export default function CartPage() {
  return <CartContents />;
}
