'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FilterSidebar } from './filter-sidebar';
import type { FilterState } from '@/lib/types';

interface MobileFilterDrawerProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxPriceBound?: number;
}

export function MobileFilterDrawer({ filters, onChange, open, onOpenChange, maxPriceBound }: MobileFilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <FilterSidebar filters={filters} onChange={onChange} maxPriceBound={maxPriceBound} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
