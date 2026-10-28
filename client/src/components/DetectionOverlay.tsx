import React from 'react';
import { Sparkles } from 'lucide-react';
import { getCategoryColor } from './CategoryChip';

interface DetectionOverlayProps {
  box2d?: number[] | null;
  category: string;
  confidence?: number;
  className?: string;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  box2d,
  category,
  confidence,
  className = '',
}) => {
  // box2d format is [ymin, xmin, ymax, xmax] normalized to 0-1000
  const hasValidBox =
    box2d &&
    box2d.length === 4 &&
    box2d[0] < box2d[2] &&
    box2d[1] < box2d[3];

  const color = getCategoryColor(category);

  return (
    <div className={`absolute inset-0 pointer-events-none select-none ${className}`}>
      {/* Top right "AI detected" badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>AI detected</span>
        {confidence !== undefined && (
          <span className="text-white font-mono ml-0.5">{(confidence * 100).toFixed(0)}%</span>
        )}
      </div>

      {/* Signature Bounding Box with Corner Accents */}
      {hasValidBox && (
        <div
          className="absolute rounded-lg border-2 transition-all duration-500 ease-out"
          style={{
            top: `${(box2d![0] / 1000) * 100}%`,
            left: `${(box2d![1] / 1000) * 100}%`,
            height: `${((box2d![2] - box2d![0]) / 1000) * 100}%`,
            width: `${((box2d![3] - box2d![1]) / 1000) * 100}%`,
            borderColor: color,
            boxShadow: `0 0 16px ${color}40`,
          }}
        >
          {/* Top category label badge */}
          <span
            className="absolute -top-6 left-0 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase text-white shadow-md flex items-center gap-1"
            style={{ backgroundColor: color }}
          >
            <span>{category}</span>
          </span>

          {/* Corner target reticles */}
          <div
            className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2"
            style={{ borderColor: color }}
          />
          <div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2"
            style={{ borderColor: color }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2"
            style={{ borderColor: color }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2"
            style={{ borderColor: color }}
          />
        </div>
      )}
    </div>
  );
};

export default DetectionOverlay;
