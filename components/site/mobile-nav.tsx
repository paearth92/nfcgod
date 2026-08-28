'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { navItems } from '@/lib/navigation';
import { Logo } from './logo';
import { useCart } from './cart-context';
import { ShoppingCart } from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    if (open) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <span className="hidden" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[88%] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle asChild>
            <Link href="/" onClick={() => onOpenChange(false)}>
              <Logo />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="p-4" aria-label="Mobile">
          <Accordion type="multiple" className="w-full">
            {navItems.map((item) =>
              item.groups ? (
                <AccordionItem key={item.label} value={item.label} className="border-border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-3">
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-0.5">
                      {item.groups.flatMap((g) => g.links).map((link) => (
                        <li key={`${link.href}-${link.label}`}>
                          <Link
                            href={link.href}
                            onClick={() => onOpenChange(false)}
                            className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <AccordionItem key={item.label} value={item.label} className="border-border">
                  <Link
                    href={item.href!}
                    onClick={() => onOpenChange(false)}
                    className="flex w-full items-center justify-between py-3 text-sm font-semibold text-foreground"
                  >
                    {item.label}
                  </Link>
                </AccordionItem>
              )
            )}
          </Accordion>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Link
              href="/cart"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Cart
              </span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            </Link>
            <Link
              href="/shop"
              onClick={() => onOpenChange(false)}
              className="btn-primary-np h-11 w-full"
            >
              Shop Now
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
