import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Checkout Cancelled',
  description: 'Your checkout was cancelled.',
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="container-np py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-xl font-extrabold tracking-tight text-foreground">
          Checkout Cancelled
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment was not processed and your cart has been preserved. You can try again whenever you are ready.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/cart" className="btn-primary-np flex-1 inline-flex items-center justify-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            Back to cart
          </Link>
          <Link href="/shop" className="btn-secondary-np flex-1 text-center text-sm">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
