import React from 'react';
import { Sparkles, RotateCw, Edit3 } from 'lucide-react';

interface ComplaintCardProps {
  title: string;
  complaintText: string;
  recommendedAction?: string;
  onTitleChange: (newTitle: string) => void;
  onComplaintChange: (newText: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  title,
  complaintText,
  recommendedAction,
  onTitleChange,
  onComplaintChange,
  onRegenerate,
  isRegenerating = false,
  className = '',
}) => {
  const wordCount = complaintText.trim() ? complaintText.trim().split(/\s+/).length : 0;

  return (
    <div className={`premium-card rounded-2xl p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Generated Civic Complaint</h3>
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors font-bold disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-600 font-normal">
        Review and edit the formal complaint drafted from your evidence before submission.
      </p>

      {/* Title Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Complaint Subject / Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all outline-none shadow-xs"
          placeholder="Issue title"
        />
      </div>

      {/* Body Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Formal Complaint Description</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500">{wordCount} words</span>
        </div>
        <textarea
          rows={5}
          value={complaintText}
          onChange={(e) => onComplaintChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm leading-relaxed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all resize-y outline-none shadow-xs"
          placeholder="Detailed formal complaint..."
        />
      </div>

      {recommendedAction && (
        <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs space-y-1">
          <span className="font-bold text-blue-900">Recommended Municipal Action:</span>
          <p className="text-blue-800 leading-relaxed font-normal">{recommendedAction}</p>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;
