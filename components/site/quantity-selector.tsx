'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'Quantity',
  className,
}: QuantitySelectorProps) {
  function decrease() { onChange(Math.max(min, value - 1)); }
  function increase() { onChange(Math.min(max, value + 1)); }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="sr-only" id="qty-label">{label}</span>
      <button type="button" onClick={decrease} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm font-bold text-foreground" aria-live="polite">{value}</span>
      <button type="button" onClick={increase} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
