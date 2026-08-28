'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  QrCode,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalBrand } from '@/components/site/portal-brand';
import type { Database } from '@/lib/supabase/database.types';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'business_name' | 'role'
>;

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Activate Product',
    href: '/dashboard/activate',
    icon: PlusCircle,
  },
  {
    label: 'My Codes',
    href: '/dashboard/codes',
    icon: QrCode,
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: Settings,
  },
] as const;

export function DashboardShell({
  email,
  profile,
  children,
}: {
  email: string;
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    React.useState(false);

  const displayName =
    profile.full_name?.trim() ||
    email.split('@')[0] ||
    'Customer';

  const businessName =
    profile.business_name?.trim() ||
    'My NFCPlate account';

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function active(
    href: string,
    exact?: boolean
  ) {
    return exact
      ? pathname === href
      : pathname === href ||
          pathname.startsWith(`${href}/`);
  }

  const navigation = (
    <>
      <div className="border-b border-black/[0.07] px-5 py-5">
        <PortalBrand label="Customer dashboard" />
      </div>

      <nav
        className="flex-1 space-y-1 p-3"
        aria-label="Customer dashboard navigation"
      >
        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Your account
        </p>

        {NAV_ITEMS.map((item) => {
          const selected = active(
            item.href,
            'exact' in item
              ? item.exact
              : false
          );

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                selected ? 'page' : undefined
              }
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                selected
                  ? 'bg-[#171512] text-white shadow-[0_12px_30px_-18px_rgba(23,21,18,0.85)]'
                  : 'text-muted-foreground hover:bg-[#eee9df] hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  selected
                    ? 'bg-[#f4b942] text-[#171512]'
                    : 'bg-white text-muted-foreground shadow-sm ring-1 ring-black/[0.06]'
                )}
              >
                <Icon
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-2xl border border-[#d9d0c2] bg-[#f7f2e9] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4b942]/25 text-[#8a5b00]">
            <CircleHelp className="h-4 w-4" />
          </span>

          <span>
            <span className="block text-xs font-bold text-foreground">
              Need help?
            </span>

            <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
              We’ll help connect or update your
              plate.
            </span>
          </span>
        </div>

        <Link
          href="/contact"
          className="mt-3 inline-flex text-xs font-bold text-foreground hover:text-[#9b6600]"
        >
          Contact support →
        </Link>
      </div>

      <div className="border-t border-black/[0.07] p-4">
        <div className="mb-3 flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#171512] text-sm font-black text-[#f4b942]">
            {displayName.charAt(0).toUpperCase()}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">
              {displayName}
            </span>

            <span className="block truncate text-[11px] text-muted-foreground">
              {businessName}
            </span>
          </span>
        </div>

        <form
          action="/auth/sign-out"
          method="POST"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-black/20 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="portal-canvas min-h-screen">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#171512] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[252px] flex-col border-r border-black/[0.08] bg-[#fbf8f2] lg:flex">
        {navigation}
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/[0.08] bg-[#fbf8f2]/95 px-4 backdrop-blur lg:hidden">
        <PortalBrand label="Dashboard" />

        <button
          type="button"
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-foreground shadow-sm"
          aria-expanded={menuOpen}
          aria-controls="customer-mobile-navigation"
          aria-label={
            menuOpen
              ? 'Close menu'
              : 'Open menu'
          }
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {menuOpen ? (
        <aside
          id="customer-mobile-navigation"
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-[#fbf8f2] lg:hidden"
        >
          {navigation}
        </aside>
      ) : null}

      <div className="lg:pl-[252px]">
        <main
          id="dashboard-content"
          className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-9"
        >
          <div className="mx-auto max-w-[1160px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}