import { Nfc, QrCode, Smartphone, ShieldCheck, Truck, Package } from 'lucide-react';

const items = [
  { icon: Nfc, label: 'NFC tap included' },
  { icon: QrCode, label: 'QR scan included' },
  { icon: Smartphone, label: 'iPhone & Android' },
  { icon: ShieldCheck, label: 'No customer app' },
  { icon: Package, label: 'Standard NFCPlate design' },
  { icon: Truck, label: 'Shipping confirmed at checkout' },
];

export function PurchaseReassurance({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 rounded-xl border border-border bg-accent/20 p-4 sm:grid-cols-3 ${className ?? ''}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-foreground/85">
          <item.icon className="h-4 w-4 shrink-0 text-primary" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
