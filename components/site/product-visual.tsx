import { cn } from '@/lib/utils';
import type { ProductColor, VisualType } from '@/lib/types';

interface ProductVisualProps {
  type: VisualType;
  className?: string;
  finish?: ProductColor;
}

const finishMap: Record<string, { base: string; surface: string; edge: string; text: string }> = {
  blue: {
    base: 'from-[#2b5bd7] to-[#1641a3]',
    surface: 'from-[#3a6ee0] to-[#1f4ab2]',
    edge: 'from-[#0f3a9e] to-[#0a2a78]',
    text: 'text-white',
  },
  gradient: {
    base: 'from-[#3a3f4a] to-[#1f232b]',
    surface: 'from-[#4a5060] to-[#2a2f38]',
    edge: 'from-[#191d24] to-[#101319]',
    text: 'text-white',
  },
  white: {
    base: 'from-[#ffffff] to-[#eef1f6]',
    surface: 'from-[#ffffff] to-[#e7ecf3]',
    edge: 'from-[#d6dde6] to-[#bcc7d4]',
    text: 'text-[#1b2740]',
  },
  black: {
    base: 'from-[#23262d] to-[#0b0d10]',
    surface: 'from-[#2a2e36] to-[#11141a]',
    edge: 'from-[#0a0c10] to-[#000000]',
    text: 'text-white',
  },
  green: {
    base: 'from-[#1a8a42] to-[#0d5c2a]',
    surface: 'from-[#22a350] to-[#137034]',
    edge: 'from-[#0a4a1e] to-[#053812]',
    text: 'text-white',
  },
  red: {
    base: 'from-[#c92a2a] to-[#8b1818]',
    surface: 'from-[#e03838] to-[#a31f1f]',
    edge: 'from-[#7a1414] to-[#5c0e0e]',
    text: 'text-white',
  },
  'black-green': {
    base: 'from-[#1a2e22] to-[#0a1810]',
    surface: 'from-[#243a2c] to-[#122018]',
    edge: 'from-[#081410] to-[#040c08]',
    text: 'text-white',
  },
};

function Stars({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3 w-3 fill-amber-400">
          <path d="M12 2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.9l1.5-6.7L2.3 9.6l6.8-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function NfcTap() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-white/70" />
        <span className="absolute inset-1 rounded-full border border-white/60" />
        <span className="h-1 w-1 rounded-full bg-white" />
      </span>
      NFC
    </span>
  );
}

function QRPlaceholder({ size = 6 }: { size?: number }) {
  return (
    <div className={cn('grid gap-px rounded bg-white/95 p-1.5 shadow-inner')} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array.from({ length: size * size }).map((_, i) => {
        const seed = (i * 7 + 13) % 5;
        const filled = seed < 2;
        return (
          <div
            key={i}
            className={cn('aspect-square rounded-[1px]', filled ? 'bg-[#1b2740]' : 'bg-white')}
          />
        );
      })}
    </div>
  );
}

export function ProductVisual({ type, className, finish = 'blue' }: ProductVisualProps) {
  const f = finishMap[finish] ?? finishMap.blue;

  if (type === 'bundle') {
    return (
      <div className={cn('flex items-center justify-center gap-4', className)}>
        <div className="relative w-[150px] [perspective:900px]">
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br shadow-[0_20px_40px_-18px_rgba(15,23,42,0.5)] [transform:rotateY(-18deg)]">
            <div className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br', f.surface)} />
            <div className="relative flex h-full flex-col items-center justify-center gap-1 p-3 text-center">
              <span className={cn('text-[11px] font-bold', f.text)}>NFCPlate</span>
              <NfcTap />
              <Stars />
              <span className={cn('text-[8px] font-semibold uppercase opacity-70', f.text)}>Stand</span>
            </div>
          </div>
        </div>
        <div className="relative w-[120px] [perspective:900px]">
          <div className="relative aspect-[1.6/1] rounded-xl bg-gradient-to-br shadow-[0_18px_35px_-15px_rgba(15,23,42,0.5)] [transform:rotateY(14deg)]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#23262d] to-[#0b0d10]" />
            <div className="relative flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-white">
              <span className="text-[10px] font-bold">NFCPlate</span>
              <NfcTap />
              <span className="text-[7px] font-semibold uppercase opacity-70">Card</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // stand
  return (
    <div className={cn('flex items-end justify-center', className)}>
      <div className="relative w-[280px] [perspective:1100px]">
        {/* shadow */}
        <div className="absolute -bottom-6 left-1/2 h-5 w-[230px] -translate-x-1/2 rounded-[50%] bg-black/30 blur-xl" />
        <div className="relative [transform:rotateX(22deg)_rotateY(-10deg)]">
          {/* base */}
          <div className={cn('mx-auto h-3 w-[210px] rounded-full bg-gradient-to-b', f.edge)} />
          <div className={cn('mx-auto h-2 w-[190px] rounded-b-2xl bg-gradient-to-b', f.base)} />
          {/* face */}
          <div className={cn('relative mx-auto -mt-1 w-[200px] rounded-2xl bg-gradient-to-br p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.6)]', f.surface)}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
            <div className={cn('relative flex flex-col gap-2', f.text)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold tracking-tight">NFCPlate</span>
                <NfcTap />
              </div>
              <div>
                <p className="text-[15px] font-bold leading-tight">Happy with us?</p>
                <p className="text-[11px] opacity-85">Leave us a Google review</p>
              </div>
              <Stars className="py-0.5" />
              <div className="flex items-end justify-between pt-1">
                <div className="w-14">
                  <QRPlaceholder />
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider opacity-75">
                  Tap your phone here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
