import { CartProvider } from '@/components/site/cart-context';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <main id="main-content">{children}</main>
    </CartProvider>
  );
}
