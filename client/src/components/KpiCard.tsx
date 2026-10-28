import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tintColor: string;
  delta?: {
    value: string;
    isGood?: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  tintColor,
  delta,
  subtitle,
  loading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 premium-card hover-lift group select-none">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-2xs"
          style={{
            backgroundColor: `${tintColor}15`,
            color: tintColor,
            border: `1px solid ${tintColor}30`,
          }}
        >
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {loading ? (
          <div className="h-8 w-20 rounded bg-slate-200/60 animate-pulse" />
        ) : (
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums count-animate">
            {value}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs pt-0.5">
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-md ${
                delta.isGood
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                  : 'text-rose-700 bg-rose-50 border border-rose-200/60'
              }`}
            >
              {delta.isGood ? (
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>{delta.value}</span>
            </span>
          )}

          {subtitle && (
            <span className="text-slate-500 text-[11px] font-medium truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
