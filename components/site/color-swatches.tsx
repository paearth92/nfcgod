import { cn } from '@/lib/utils';
import type { ProductColor } from '@/lib/types';

const swatchStyles: Record<ProductColor, string> = {
  black: 'bg-[#1b1d22]',
  white: 'bg-white border border-border',
  blue: 'bg-[#2b5bd7]',
  gradient: 'bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf]',
  green: 'bg-[#00af87]',
  red: 'bg-[#d32323]',
  'black-green': 'bg-gradient-to-r from-[#1b1d22] to-[#00af87]',
};

const colorLabels: Record<ProductColor, string> = {
  black: 'Black',
  white: 'White',
  blue: 'Blue',
  gradient: 'Gradient',
  green: 'Green',
  red: 'Red',
  'black-green': 'Black/Green',
};

interface ColorSwatchesProps {
  colors: ProductColor[];
  selected?: ProductColor;
  onSelect?: (color: ProductColor) => void;
  size?: 'sm' | 'md';
}

export function ColorSwatches({ colors, selected, onSelect, size = 'md' }: ColorSwatchesProps) {
  const swatchSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Color options">
      {colors.map((color) => {
        const isActive = selected === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onSelect?.(color)}
            aria-pressed={isActive}
            aria-label={colorLabels[color]}
            title={colorLabels[color]}
            className={cn(
              'relative rounded-full ring-2 ring-offset-1 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              swatchSize,
              isActive ? 'ring-primary' : 'ring-transparent hover:ring-border',
              swatchStyles[color]
            )}
          />
        );
      })}
    </div>
  );
}

export { colorLabels, swatchStyles };
