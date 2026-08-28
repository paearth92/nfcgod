import { Nfc, QrCode, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

export function TapOrScanExplanation() {
  return (
    <section className="py-12 bg-accent/20">
      <div className="container-np">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-center">Two paths, one destination</p>
          <h2 className="mt-2 text-center font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Tap with NFC or scan the QR code
          </h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
            Every NFCPlate product offers two equal paths to the same destination. NFC gives the fastest
            experience for modern phones. The printed QR code ensures every customer can reach the same
            page — no app, no difference in what they see.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {/* NFC path */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Nfc className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">NFC tap</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The fastest path. Customers tap the NFC spot with their phone and your page opens instantly.
              Works on iPhone 7 and newer and most modern Android devices.
            </p>
          </div>
          {/* QR path */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <QrCode className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">QR scan</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The universal path. Customers scan the printed QR code with their phone camera. Works on
              any phone with a camera — no NFC required.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-primary" /> iPhone & Android</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> No customer app required</span>
          <span className="inline-flex items-center gap-1.5"><ArrowRight className="h-4 w-4 text-primary" /> Both open the same page</span>
        </div>
      </div>
    </section>
  );
}
