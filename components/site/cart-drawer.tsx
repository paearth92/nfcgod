'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, Nfc, QrCode } from 'lucide-react';
import { useCart } from './cart-context';
import { formatPrice } from '@/lib/products';
import { ProductVisual } from './product-visual';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export function CartDrawer() {
  const { lines, subtotal, count, setQuantity, remove, cartOpen, closeCart, hydrated } = useCart();

  const freeShippingThreshold = 35;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Your cart
            {hydrated && count > 0 ? (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {count}
              </span>
            ) : null}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your cart items and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {hydrated && lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground">Add a product to get started.</p>
            <Link href="/shop" onClick={closeCart} className="btn-primary-np mt-2 inline-flex text-[13px]">
              Shop products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-border bg-accent/20 p-4">
              <p className="text-xs font-medium text-foreground">
                {remaining > 0 ? (
                  <>Add <span className="font-bold text-primary">{formatPrice(remaining)}</span> for free U.S. shipping</>
                ) : (
                  <span className="font-semibold text-emerald-700">Free U.S. shipping unlocked</span>
                )}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Line items */}
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.variantId} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${line.productSlug}`}
                      onClick={closeCart}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-accent/50 to-accent/20 p-1"
                      aria-label={`View ${line.productName}`}
                    >
                      <div className="scale-[0.15]">
                        <ProductVisual type="stand" finish="black" />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${line.productSlug}`}
                        onClick={closeCart}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
                      >
                        {line.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{line.variantName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{formatPrice(line.price)}</p>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                          <Nfc className="h-2.5 w-2.5 text-primary" />
                          <QrCode className="h-2.5 w-2.5 text-primary" />
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.productName}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                          aria-label={`Increase quantity of ${line.productName}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(line.variantId)}
                          aria-label={`Remove ${line.productName} from cart`}
                          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Subtotal</span>
                <span className="text-lg font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Taxes and shipping calculated at checkout.
              </p>
              <Link href="/checkout" onClick={closeCart} className="btn-primary-np mt-3 w-full">
                Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block text-center text-sm font-medium text-primary hover:underline"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
