import type { Metadata } from 'next';
import { TrackOrderForm } from '@/components/site/track-order-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Track Your Order',
  description: 'Track your NFCPlate order status and shipping progress.',
  path: '/track-order',
  noIndex: true,
});

export default function TrackOrderPage() {
  return <TrackOrderForm />;
}
