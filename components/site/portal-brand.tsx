import { cn } from '@/lib/utils';

export function PortalBrand({ inverse = false, compact = false, label }: { inverse?: boolean; compact?: boolean; label?: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className={cn('relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm', inverse ? 'border-white/15 bg-white text-[#171512]' : 'border-black/10 bg-[#171512] text-[#f4b942]')}>
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          <path d="M8.5 5.5h13a2 2 0 0 1 2 2v13.25a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
          <path d="M11 27h10M13 22.75l-1.5 4.25M19 22.75l1.5 4.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14.5h2.5M17 12.25c1.7 1.45 1.7 3.95 0 5.4M20 10c3 2.5 3 6.5 0 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      {!compact ? (
        <span className="min-w-0 leading-none">
          <span className={cn('block font-display text-[19px] font-black tracking-[-0.035em]', inverse ? 'text-white' : 'text-foreground')}>NFCPlate</span>
          {label ? <span className={cn('mt-1 block truncate text-[9px] font-bold uppercase tracking-[0.24em]', inverse ? 'text-white/45' : 'text-muted-foreground')}>{label}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
