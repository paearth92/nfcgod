import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ToastProvider } from '@/components/site/toast-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nfcplate.com'),
  title: {
    default: 'NFCPlate — More reviews. One simple tap.',
    template: '%s | NFCPlate',
  },
  description:
    'NFC-powered review products that help businesses collect genuine customer reviews and connect customers with their online presence. One simple tap.',
  applicationName: 'NFCPlate',
  keywords: [
    'NFC review stand',
    'Google review card',
    'NFC review products',
    'QR review stand',
    'business reviews',
    'customer feedback',
  ],
  authors: [{ name: 'NFCPlate' }],
  creator: 'NFCPlate',
  viewport: { width: 'device-width', initialScale: 1 },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nfcplate.com',
    siteName: 'NFCPlate',
    title: 'NFCPlate — More reviews. One simple tap.',
    description:
      'NFC-powered review products that help businesses collect genuine customer reviews. One simple tap.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NFCPlate — More reviews. One simple tap.',
    description:
      'NFC-powered review products that help businesses collect genuine customer reviews.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
