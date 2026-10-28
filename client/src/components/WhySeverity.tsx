import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CivicSeverity } from '../types';

interface WhySeverityProps {
  severity: CivicSeverity | string;
  reasons: string[];
  className?: string;
}

export const WhySeverity: React.FC<WhySeverityProps> = ({
  severity,
  reasons = [],
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Why was this classified as <span className="text-slate-900 font-extrabold">{severity}</span>?
        </h4>
      </div>

      <ul className="space-y-2">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-normal">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{reason}</span>
          </li>
        ))}
        {reasons.length === 0 && (
          <li className="text-xs text-slate-400 italic">
            Physical obstruction and public infrastructure risk evaluated from visible evidence.
          </li>
        )}
      </ul>
    </div>
  );
};

export default WhySeverity;
