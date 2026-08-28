import type { Metadata } from 'next';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'NFC Compatibility — Which Phones Tap?',
  description:
    'A guide to NFC and QR compatibility across iPhone and Android devices for NFCPlate products.',
  path: '/nfc-compatibility',
});

const nfcDevices = [
  { brand: 'iPhone', models: 'iPhone 7 and newer', nfc: true },
  { brand: 'Google Pixel', models: 'Pixel 2 and newer', nfc: true },
  { brand: 'Samsung Galaxy', models: 'Galaxy S8 and newer', nfc: true },
  { brand: 'OnePlus', models: 'Most models from 2018+', nfc: true },
  { brand: 'Older Android', models: 'Pre-2018 devices', nfc: false },
  { brand: 'Basic phones', models: 'Non-smartphones', nfc: false },
];

export default function NfcCompatibilityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'NFC Compatibility', path: '/nfc-compatibility' },
        ])}
      />
      <PageHeader
        eyebrow="Resources"
        title="NFC Compatibility"
        description="Most modern phones support NFC taps. Every NFCPlate product also includes a printed QR code so no customer is left out."
      />
      <div className="container-np py-12">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Models</th>
                  <th className="px-4 py-3 font-semibold">NFC tap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {nfcDevices.map((d) => (
                  <tr key={d.brand}>
                    <td className="px-4 py-3 font-medium text-foreground">{d.brand}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.models}</td>
                    <td className="px-4 py-3">
                      {d.nfc ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Supported
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                          <XCircle className="h-4 w-4" /> Use QR code
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-accent/30 p-5">
            <h2 className="text-base font-semibold text-foreground">The QR backup</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every NFCPlate product includes a printed QR code that opens the same review page. If a
              phone does not support NFC, the customer simply scans the QR code with their camera. No
              app, no friction.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
