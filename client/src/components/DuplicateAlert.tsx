import React from 'react';
import { AlertTriangle, MapPin, Users, ArrowRight } from 'lucide-react';
import { DuplicateCandidate } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface DuplicateAlertProps {
  candidates: DuplicateCandidate[];
  onAddToExisting: (candidate: DuplicateCandidate) => void;
  onDifferentIssue: () => void;
  className?: string;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  candidates,
  onAddToExisting,
  onDifferentIssue,
  className = '',
}) => {
  if (!candidates || candidates.length === 0) return null;

  const top = candidates[0];

  return (
    <div
      className={`p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-4 shadow-md backdrop-blur-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 shadow-2xs border border-amber-200">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-950">Possible Duplicate Detected Nearby</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-300">
              {Math.round(top.score * 100)}% Match
            </span>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed font-normal">
            An active report for this same civic issue was already filed within {top.distance_m} meters.
            Merging your photo corroborates evidence, increases municipal priority, and prevents duplicate work orders.
          </p>
        </div>
      </div>

      {/* Existing Case Preview */}
      <div className="p-4 rounded-xl bg-white/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src={top.image_url}
            alt="Candidate duplicate"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80';
            }}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600">{top.case_id}</span>
              <SeverityBadge severity={top.severity} />
            </div>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">{top.complaint_title || top.description}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{top.distance_m}m away</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{top.report_count} citizen reports</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
          <button
            type="button"
            onClick={() => onAddToExisting(top)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Add my evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDifferentIssue}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs"
          >
            Different issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateAlert;
