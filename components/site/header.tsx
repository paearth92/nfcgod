'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { navItems } from '@/lib/navigation';
import { useCart } from './cart-context';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';

export function Header() {
  const { count, openCart, hydrated } = useCart();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {!isHome ? (
        <div className="border-b border-[#e8e2d8] bg-[#f7f5ef] text-[#171717]">
          <div className="container-np flex h-8 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em] sm:h-9 sm:text-xs">
            Free U.S. shipping on orders $35+
          </div>
        </div>
      ) : null}

      <header className={cn(
        'z-40 w-full',
        isHome
          ? 'absolute left-0 top-0 border-b border-white/15 bg-transparent text-white'
          : 'sticky top-0 border-b border-[#e8e2d8] bg-[#fbfaf7]/95 text-[#171717] backdrop-blur supports-[backdrop-filter]:bg-[#fbfaf7]/85'
      )}>
        <div className="container-np flex h-16 items-center justify-between gap-4">
          {/* Left: logo */}
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="NFCPlate home" className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Logo dark={isHome} />
            </Link>
          </div>

          {/* Center nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            {navItems.map((item) =>
              item.groups ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button
                    type="button"
                    className={cn('nav-link nav-link-editorial', isHome && 'text-white/90 hover:bg-white/10 hover:text-white')}
                    aria-expanded={activeMenu === item.label}
                    aria-haspopup="true"
                    onClick={() =>
                      setActiveMenu((prev) => (prev === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform',
                        activeMenu === item.label && 'rotate-180'
                      )}
                    />
                  </button>
                  {activeMenu === item.label ? (
                    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
                      <MegaMenu groups={item.groups} label={item.label} />
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link key={item.label} href={item.href!} className={cn('nav-link nav-link-editorial', isHome && 'text-white/90 hover:bg-white/10 hover:text-white')}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/shop"
              aria-label="Search products"
              className={cn('inline-flex h-9 w-9 items-center justify-center rounded-md text-[#30302d] transition hover:bg-[#eee9df] hover:text-[#927b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', isHome && 'text-white hover:bg-white/10 hover:text-white')}
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className={cn('hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md text-[#30302d] transition hover:bg-[#eee9df] hover:text-[#927b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', isHome && 'text-white hover:bg-white/10 hover:text-white')}
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart with ${count} item${count === 1 ? '' : 's'}`}
              className={cn('relative inline-flex h-9 w-9 items-center justify-center rounded-md text-[#30302d] transition hover:bg-[#eee9df] hover:text-[#927b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', isHome && 'text-white hover:bg-white/10 hover:text-white')}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {hydrated && count > 0 ? (
                <span className={cn('absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white', isHome ? 'bg-[#cda15a] text-[#1d2430]' : 'bg-[#2563eb]')}>
                  {count}
                </span>
              ) : null}
            </button>
            <Link href="/shop" className={cn('hidden h-9 items-center justify-center rounded-lg px-4 text-[13px] font-bold text-white shadow-sm transition sm:inline-flex', isHome ? 'bg-[#cda15a] text-[#1d2430] hover:bg-[#e2bb78]' : 'bg-[#171717] hover:bg-[#927b59]')}>
              Shop Now
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
              className={cn('inline-flex h-9 w-9 items-center justify-center rounded-md text-[#30302d] transition hover:bg-[#eee9df] hover:text-[#927b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden', isHome && 'text-white hover:bg-white/10 hover:text-white')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}

function MegaMenu({
  groups,
  label,
}: {
  groups: { heading: string; links: { label: string; href: string; description?: string }[] }[];
  label: string;
}) {
  return (
    <div
      role="menu"
      aria-label={`${label} menu`}
      className="w-[560px] rounded-xl border border-border bg-popover p-3 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)]"
    >
      <div className="grid grid-cols-2 gap-2">
        {groups.map((group) => (
          <div key={group.heading} className="p-2">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground/85 hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    role="menuitem"
                  >
                    <span className="font-medium">{link.label}</span>
                    {link.description ? (
                      <span className="block text-xs text-muted-foreground">{link.description}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}