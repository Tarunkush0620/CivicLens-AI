import React, { useState, useEffect } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { DetectionOverlay } from './DetectionOverlay';

interface EvidenceItem {
  image_url: string;
  kind?: string;
  note?: string;
}

interface EvidenceViewerProps {
  images: EvidenceItem[] | string[];
  category: string;
  box2d?: number[] | null;
  confidence?: number;
  className?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  images,
  category,
  box2d,
  confidence,
  className = '',
}) => {
  const normalizedImages: EvidenceItem[] = (images || []).map((img) =>
    typeof img === 'string' ? { image_url: img } : img
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = normalizedImages[activeIndex] || {
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  };

  const isPrimaryImage = activeIndex === 0;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomed) return;
      if (e.key === 'Escape') setIsZoomed(false);
      if (e.key === 'ArrowRight' && normalizedImages.length > 1) {
        setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
      }
      if (e.key === 'ArrowLeft' && normalizedImages.length > 1) {
        setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, normalizedImages.length]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Primary Evidence Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 aspect-[4/3] sm:aspect-[16/10] group shadow-xs">
        <img
          src={currentImage.image_url}
          alt={`Civic problem evidence: ${category}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* AI Detection Box and Badge only for primary evidence image */}
        {isPrimaryImage && (
          <DetectionOverlay box2d={box2d} category={category} confidence={confidence} />
        )}

        {/* Quick Zoom Trigger */}
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-xs"
          title="Zoom evidence"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Multiple Images Carousel Controls */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 hover:bg-white shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % normalizedImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 hover:bg-white shadow-xs transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-mono text-white border border-white/20 shadow-xs">
              {activeIndex + 1} / {normalizedImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {normalizedImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative rounded-xl overflow-hidden w-16 h-16 flex-shrink-0 border-2 transition-all ${
                activeIndex === idx
                  ? 'border-blue-600 shadow-sm scale-105'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt="Evidence thumbnail"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80';
                }}
                className="w-full h-full object-cover"
              />
              {img.kind && (
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] uppercase tracking-wider text-center text-white py-0.5">
                  {img.kind}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 border border-slate-200 text-slate-800 hover:bg-white z-50 shadow-lg transition-transform hover:scale-105"
            title="Close zoom"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={currentImage.image_url}
              alt={category}
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
            {isPrimaryImage && (
              <DetectionOverlay box2d={box2d} category={category} confidence={confidence} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

