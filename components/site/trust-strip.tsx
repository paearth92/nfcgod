import { Nfc, QrCode, Smartphone, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Nfc, label: 'NFC tap' },
  { icon: QrCode, label: 'QR scan' },
  { icon: Smartphone, label: 'iPhone & Android' },
  { icon: ShieldCheck, label: 'No customer app' },
];

export function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 rounded-xl border border-border bg-accent/30 p-4 sm:grid-cols-4 ${className ?? ''}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-center gap-2 text-xs font-medium text-foreground sm:text-sm">
          <item.icon className="h-4 w-4 text-primary" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
