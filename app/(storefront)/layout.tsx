import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { CartProvider } from '@/components/site/cart-context';
import { CartDrawer } from '@/components/site/cart-drawer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
