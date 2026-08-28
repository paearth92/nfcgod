import Link from 'next/link';
import { Nfc, QrCode, ShieldCheck } from 'lucide-react';
import { Logo } from './logo';
import {
  footerShopLinks,
  footerDiscoverLinks,
  footerHelpLinks,
  footerLegalLinks,
} from '@/lib/navigation';

export function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-[#0b3b92] via-[#164fb8] to-[#2563eb] text-white/80">
      <div className="container-np py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Smart, simple tools that help businesses build trust and grow every day.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-white/70">
              <li className="inline-flex items-center gap-2">
                <Nfc className="h-4 w-4 text-white/90" /> NFC tap products
              </li>
              <li className="inline-flex items-center gap-2">
                <QrCode className="h-4 w-4 text-white/90" /> QR code backup on every product
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/90" /> Secure checkout
              </li>
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-5">
            <FooterColumn title="Shop" links={footerShopLinks} />
            <FooterColumn title="Discover" links={footerDiscoverLinks} />
            <FooterColumn title="Help" links={footerHelpLinks} />
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white">Newsletter</h3>
            <p className="mt-2 text-sm text-white/70">Growth tips, minus the noise.</p>
            <form className="mt-4 flex flex-col gap-2" action="/contact" method="post">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="you@business.com"
                className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} NFCPlate. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[11px] text-white/40">
          Not affiliated with or endorsed by Google.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}