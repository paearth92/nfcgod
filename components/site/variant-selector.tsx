'use client';

import type { Product, ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ColorSwatches, colorLabels } from './color-swatches';

function getSwatchBg(color?: string): string {
  const map: Record<string, string> = {
    cobalt: 'bg-[#2b5bd7]',
    graphite: 'bg-[#3a3f4a]',
    white: 'bg-white border border-border',
    black: 'bg-[#1b1d22]',
    clear: 'bg-white/60 border border-border',
  };
  return color ? (map[color] ?? 'bg-muted') : 'bg-muted';
}

interface VariantSelectorProps {
  product: Product;
  selectedVariant: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  variantLayout?: 'compact' | 'full';
}

export function VariantSelector({ product, selectedVariant, onSelect, variantLayout = 'full' }: VariantSelectorProps) {
  const variants = product.variants.filter((v) => v.inStock);
  const hasColors = variants.some((v) => v.color);
  const hasPacks = variants.some((v) => v.quantity && v.quantity > 1);

  if (!hasColors && !hasPacks && variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      {hasColors && !hasPacks ? (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</p>
            <span className="text-sm font-medium text-foreground">
              {selectedVariant.color ? colorLabels[selectedVariant.color] : selectedVariant.name}
            </span>
          </div>
          <div className="mt-2">
            <ColorSwatches
              colors={variants.map((v) => v.color!).filter(Boolean) as any}
              selected={selectedVariant.color}
              onSelect={(color) => {
                const match = variants.find((v) => v.color === color);
                if (match) onSelect(match);
              }}
            />
          </div>
        </div>
      ) : null}

      {hasPacks ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pack size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = v.id === selectedVariant.id;
              const label = v.quantity ? `${v.quantity}-Pack` : v.name;
              return (
                <button key={v.id} type="button" onClick={() => onSelect(v)} aria-pressed={active}
                  className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground/80 hover:border-foreground/30')}>
                  {v.color && !v.quantity ? <span className={cn('h-3 w-3 rounded-full', getSwatchBg(v.color))} /> : null}
                  {label}
                  {v.compareAtPrice ? <span className="text-xs text-muted-foreground line-through">${v.compareAtPrice}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {hasColors && variantLayout === 'full' && !hasPacks && variants.length > 3 ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const active = v.id === selectedVariant.id;
            return (
              <button key={v.id} type="button" onClick={() => onSelect(v)} aria-pressed={active}
                className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  active ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground/80 hover:border-foreground/30')}>
                {v.color && <span className={cn('h-3 w-3 rounded-full', getSwatchBg(v.color))} />}
                {v.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
