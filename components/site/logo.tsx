import { cn } from '@/lib/utils';

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* Compact plate/tap symbol */}
      <span
        aria-hidden="true"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md',
          dark ? 'bg-white text-[hsl(var(--navy))]' : 'bg-foreground text-background'
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M8 12h8" />
          <path d="M12 8c1.5 1.5 1.5 5 0 6.5" opacity="0.7" />
          <path d="M14.5 8c1.5 1.5 1.5 5 0 6.5" opacity="0.4" />
        </svg>
      </span>
      <span
        className={cn(
          'font-display text-lg font-extrabold tracking-tight',
          dark ? 'text-white' : 'text-foreground'
        )}
      >
        NFCPlate
      </span>
    </span>
  );
}
