import React from 'react';
import {
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Construction,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react';
import { CivicCategory } from '../types';

interface CategoryChipProps {
  category: CivicCategory | string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function getCategoryIcon(cat: string) {
  const norm = (cat || '').toLowerCase();
  if (norm === 'all') return LayoutGrid;
  if (norm.includes('pothole') || norm.includes('road')) return AlertTriangle;
  if (norm.includes('street') || norm.includes('light') || norm.includes('electric')) return Lightbulb;
  if (norm.includes('garbage') || norm.includes('dump') || norm.includes('waste')) return Trash2;
  if (norm.includes('water') || norm.includes('drain') || norm.includes('manhole')) return Droplets;
  if (norm.includes('footpath') || norm.includes('structure')) return Construction;
  return HelpCircle;
}

export function getCategoryColor(cat: string): string {
  const norm = (cat || '').toLowerCase();
  if (norm.includes('pothole') || norm.includes('road')) return '#E11D48'; // Rose-600
  if (norm.includes('street') || norm.includes('light') || norm.includes('electric')) return '#F59E0B'; // Amber-500
  if (norm.includes('garbage') || norm.includes('dump') || norm.includes('waste')) return '#2563EB'; // Blue-600
  if (norm.includes('water') || norm.includes('drain')) return '#0284C7'; // Sky-600
  if (norm.includes('manhole')) return '#DC2626'; // Red-600
  if (norm.includes('footpath') || norm.includes('structure')) return '#7C3AED'; // Purple-600
  return '#64748B';
}

const VERIFIED_CATEGORY_IMAGES: Record<string, string> = {
  pothole: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  street: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
  garbage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
  water: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
  manhole: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
};

export function getCategoryImage(cat: string, existingUrl?: string): string {
  if (
    existingUrl &&
    (existingUrl.startsWith('http') || existingUrl.startsWith('data:')) &&
    !existingUrl.includes('photo-1541888946425') &&
    !existingUrl.includes('photo-1611288875685')
  ) {
    return existingUrl;
  }
  const norm = (cat || '').toLowerCase();
  if (norm.includes('pothole') || norm.includes('road')) {
    return VERIFIED_CATEGORY_IMAGES.pothole;
  }
  if (norm.includes('street') || norm.includes('light') || norm.includes('electric')) {
    return VERIFIED_CATEGORY_IMAGES.street;
  }
  if (norm.includes('garbage') || norm.includes('dump') || norm.includes('waste')) {
    return VERIFIED_CATEGORY_IMAGES.garbage;
  }
  if (norm.includes('water') || norm.includes('drain')) {
    return VERIFIED_CATEGORY_IMAGES.water;
  }
  if (norm.includes('manhole')) {
    return VERIFIED_CATEGORY_IMAGES.manhole;
  }
  return VERIFIED_CATEGORY_IMAGES.pothole;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  count,
  active = false,
  onClick,
  className = '',
}) => {
  const Icon = getCategoryIcon(category);
  const color = getCategoryColor(category);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border cursor-pointer select-none ${
        active
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
          : 'bg-white/80 backdrop-blur-md border-slate-200/90 text-slate-700 hover:bg-white hover:border-slate-300 shadow-2xs'
      } ${className}`}
    >
      <Icon
        className="w-3.5 h-3.5 flex-shrink-0"
        style={{ color: active ? '#FFFFFF' : color }}
      />
      <span>{category}</span>
      {typeof count === 'number' && (
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            active
              ? 'bg-white/25 text-white'
              : 'bg-slate-100 text-slate-600 border border-slate-200/60'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default CategoryChip;
