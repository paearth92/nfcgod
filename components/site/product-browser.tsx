'use client';

import { useMemo, useState, useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product, FilterState, SortOption } from '@/lib/types';
import { filterProducts, sortProducts, getMaxPrice } from '@/lib/products';
import { ProductCard } from './product-card';
import { SortSelect } from './sort-select';
import { FilterSidebar } from './filter-sidebar';
import { MobileFilterDrawer } from './mobile-filter-drawer';
import { EmptyProductState } from './empty-product-state';

interface ProductBrowserProps {
  products: Product[];
  initialFilters?: Partial<FilterState>;
  lockedCategories?: string[];
}

const defaultFilters: FilterState = {
  categories: [],
  platforms: [],
  colors: [],
  maxPrice: null,
  inStockOnly: false,
  sort: 'featured',
};

export function ProductBrowser({ products, initialFilters, lockedCategories }: ProductBrowserProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
    categories: lockedCategories ?? initialFilters?.categories ?? [],
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const maxPriceBound = useMemo(() => getMaxPrice(), []);

  const filtered = useMemo(() => {
    const filteredItems = filterProducts(products, filters);
    return sortProducts(filteredItems, filters.sort);
  }, [products, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!lockedCategories) count += filters.categories.length;
    count += filters.platforms.length;
    count += filters.colors.length;
    if (filters.maxPrice !== null && filters.maxPrice < maxPriceBound) count += 1;
    if (filters.inStockOnly) count += 1;
    return count;
  }, [filters, lockedCategories, maxPriceBound]);

  const handleFiltersChange = useCallback((next: FilterState) => {
    if (lockedCategories) setFilters({ ...next, categories: lockedCategories });
    else setFilters(next);
  }, [lockedCategories]);

  function clearFilters() {
    setFilters({ ...defaultFilters, categories: lockedCategories ?? [], sort: filters.sort });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-foreground">{filtered.length} product{filtered.length === 1 ? '' : 's'}</p>
          {activeFilterCount > 0 ? (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <X className="h-3 w-3" /> Clear filters ({activeFilterCount})
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMobileFilterOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground lg:hidden" aria-label="Open filters">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{activeFilterCount}</span> : null}
          </button>
          <SortSelect value={filters.sort} onChange={(sort: SortOption) => setFilters((prev) => ({ ...prev, sort }))} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onChange={handleFiltersChange} maxPriceBound={maxPriceBound} />
          </div>
        </aside>
        <div>
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyProductState />
          )}
        </div>
      </div>

      <MobileFilterDrawer filters={filters} onChange={handleFiltersChange} open={mobileFilterOpen} onOpenChange={setMobileFilterOpen} maxPriceBound={maxPriceBound} />
    </div>
  );
}
