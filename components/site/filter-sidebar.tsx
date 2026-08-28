'use client';

import { Check } from 'lucide-react';
import type { FilterState } from '@/lib/types';
import { categories, getAllColors, getAllPlatforms, getMinPrice, getMaxPrice } from '@/lib/products';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
  maxPriceBound?: number;
}

export function FilterSidebar({ filters, onChange, className, maxPriceBound }: FilterSidebarProps) {
  const colors = getAllColors();
  const platforms = getAllPlatforms();
  const minPrice = getMinPrice();
  const maxPrice = maxPriceBound ?? getMaxPrice();

  function toggleArray(key: 'categories' | 'platforms' | 'colors', value: string) {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  }

  return (
    <div className={cn('space-y-6', className)}>
      <FilterGroup title="Product type">
        {categories.map((cat) => (
          <FilterCheckbox key={cat.slug} label={cat.name} checked={filters.categories.includes(cat.slug)} onChange={() => toggleArray('categories', cat.slug)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Platform">
        {platforms.map((p) => (
          <FilterCheckbox key={p.value} label={p.label} checked={filters.platforms.includes(p.value)} onChange={() => toggleArray('platforms', p.value)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = filters.colors.includes(c.value);
            const swatchBg: Record<string, string> = { cobalt: 'bg-[#2b5bd7]', graphite: 'bg-[#3a3f4a]', white: 'bg-white border border-border', black: 'bg-[#1b1d22]', clear: 'bg-white/60 border border-border' };
            return (
              <button key={c.value} type="button" onClick={() => toggleArray('colors', c.value)} aria-pressed={active} title={c.label} aria-label={c.label}
                className={cn('relative h-7 w-7 rounded-full ring-2 ring-offset-1 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  active ? 'ring-primary' : 'ring-transparent hover:ring-border', swatchBg[c.value])}>
                {active ? <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" /> : null}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup title="Price range">
        <input type="range" min={minPrice} max={maxPrice} value={filters.maxPrice ?? maxPrice} onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[hsl(var(--primary))]" aria-label="Maximum price" />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>${minPrice}</span>
          <span className="font-medium text-foreground">Up to ${filters.maxPrice ?? maxPrice}</span>
        </div>
      </FilterGroup>
      <FilterGroup title="Availability">
        <FilterCheckbox label="In stock only" checked={filters.inStockOnly} onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })} />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-5 last:border-0 last:pb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-foreground">
      <button type="button" role="checkbox" aria-checked={checked} onClick={onChange}
        className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40')}>
        {checked ? <Check className="h-3 w-3" /> : null}
      </button>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}
