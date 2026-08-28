'use client';

import { useState, useCallback, useEffect } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductVisual } from './product-visual';
import type { Product, ProductColor, VisualType } from '@/lib/types';

interface ProductGalleryProps {
  product: Product;
  selectedColor?: ProductColor;
  onColorChange?: (color: ProductColor) => void;
}

const galleryViews = [
  { id: 'front', label: 'Front product view' },
  { id: 'angle', label: 'Alternate angle view' },
  { id: 'inuse', label: 'In-use context view' },
  { id: 'dimensions', label: 'Dimensions view' },
] as const;

export function ProductGallery({ product, selectedColor }: ProductGalleryProps) {
  const [activeView, setActiveView] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const finish = (selectedColor ?? product.variants[0]?.color ?? 'blue') as ProductColor | undefined;

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setActiveView((v) => (v === 0 ? galleryViews.length - 1 : v - 1));
      if (e.key === 'ArrowRight') setActiveView((v) => (v === galleryViews.length - 1 ? 0 : v + 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox]);

  const altLabel = `${product.name} — ${galleryViews[activeView].label}`;

  return (
    <>
      <div className="space-y-3">
        {/* Main view */}
        <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-blue-50/80 via-white/60 to-indigo-50/40 p-8 backdrop-blur-xl shadow-[0_12px_40px_-20px_rgba(37,99,235,0.18)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/50 to-transparent opacity-60" />
          {product.badge ? (
            <span className="absolute left-5 top-5 badge-np bg-primary/10 text-primary z-10">
              {product.badge}
            </span>
          ) : null}
          <button
            type="button"
            onClick={openLightbox}
            aria-label={`Zoom in: ${altLabel}`}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/70 text-slate-500 backdrop-blur-md transition-all hover:scale-110 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="flex h-full w-full items-center justify-center" role="img" aria-label={altLabel}>
            <ProductVisual type={product.visualType} finish={finish} />
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Product views">
          {galleryViews.map((view, index) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={activeView === index}
              aria-label={view.label}
              onClick={() => setActiveView(index)}
              className={cn(
                'relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 bg-gradient-to-br from-blue-50/60 to-white/40 backdrop-blur-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                activeView === index ? 'border-blue-400 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.3)]' : 'border-white/50 hover:border-blue-200'
              )}
            >
              <div className="scale-[0.3] opacity-90">
                <ProductVisual type={product.visualType as VisualType} finish={finish} />
              </div>
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[8px] font-medium text-white text-center">
                {view.id === 'dimensions' ? 'Size' : view.id === 'inuse' ? 'In use' : view.id === 'angle' ? 'Angle' : 'Front'}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Product images are renderings. Real product photos will replace these without changing the layout.
        </p>
      </div>

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveView((v) => (v === 0 ? galleryViews.length - 1 : v - 1)); }}
            aria-label="Previous image"
            className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveView((v) => (v === galleryViews.length - 1 ? 0 : v + 1)); }}
            aria-label="Next image"
            className="absolute right-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex max-h-[80vh] max-w-3xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-3xl border border-white/30 bg-gradient-to-b from-blue-50/60 to-white/30 p-12 backdrop-blur-xl" role="img" aria-label={altLabel}>
              <ProductVisual type={product.visualType} finish={finish} />
            </div>
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
            {galleryViews[activeView].label} · {activeView + 1} of {galleryViews.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
