'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, ChevronRight, LayoutDashboard, LogOut, Menu, QrCode, ShoppingBag, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalBrand } from '@/components/site/portal-brand';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/batches', label: 'Batches', icon: Boxes },
  { href: '/admin/codes', label: 'Codes', icon: QrCode },
  { href: '/admin/customers', label: 'Customers', icon: Users },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const navigation = (
    <>
      <div className="px-5 pb-6 pt-5"><PortalBrand inverse label="Operations portal" /></div>
      <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[0.055] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Workspace</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#f4b942] shadow-[0_0_0_4px_rgba(244,185,66,0.12)]" />
          <span className="text-sm font-semibold text-white">NFCPlate live</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Manage</p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, 'exact' in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all', active ? 'bg-[#f4b942] text-[#171512] shadow-[0_8px_30px_-12px_rgba(244,185,66,0.75)]' : 'text-white/58 hover:bg-white/[0.07] hover:text-white')}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span>{item.label}</span>
              <ChevronRight className={cn('ml-auto h-4 w-4 transition-transform', active ? 'opacity-70' : 'opacity-0 group-hover:translate-x-0.5 group-hover:opacity-50')} />
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
        <div className="mb-3 flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-[#f4b942]">A</span>
          <span className="min-w-0"><span className="block text-xs font-bold text-white">Administrator</span><span className="block truncate text-[11px] text-white/40">{email || 'Secure admin session'}</span></span>
        </div>
        <form action="/auth/sign-out" method="POST">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
        </form>
      </div>
    </>
  );

  return (
    <div className="portal-canvas min-h-screen">
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#171512] focus:px-4 focus:py-2 focus:text-sm focus:text-white">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[268px] flex-col overflow-hidden bg-[#171512] lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_0%,rgba(244,185,66,0.17),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="relative flex h-full flex-col">{navigation}</div>
      </aside>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/10 bg-[#171512] px-4 text-white lg:hidden">
        <PortalBrand inverse label="Admin" />
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05]" aria-expanded={mobileOpen} aria-controls="admin-mobile-navigation" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </header>
      {mobileOpen ? <aside id="admin-mobile-navigation" className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-[#171512] lg:hidden">{navigation}</aside> : null}
      <div className="lg:pl-[268px]"><main id="admin-content" className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-9"><div className="mx-auto w-full max-w-[1280px]">{children}</div></main></div>
    </div>
  );
}
