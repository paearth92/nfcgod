import type { SortOption } from '@/lib/types';

const sortLabels: Record<SortOption, string> = {
  featured: 'Featured',
  'best-selling': 'Best selling',
  'price-asc': 'Price: Low to high',
  'price-desc': 'Price: High to low',
  newest: 'Newest',
};

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function sortLabel(value: SortOption): string {
  return sortLabels[value] ?? 'Featured';
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-medium text-muted-foreground">Sort</label>
      <select id="sort-select" value={value} onChange={(e) => onChange(e.target.value as SortOption)}
        className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {Object.entries(sortLabels).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}
