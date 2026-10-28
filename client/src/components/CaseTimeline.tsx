import React from 'react';
import { Check, CircleDot } from 'lucide-react';
import { CaseEventRecord } from '../types';

interface CaseTimelineProps {
  events: CaseEventRecord[];
  currentStatus: string;
  className?: string;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({
  events = [],
  currentStatus,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Case Audit Timeline</h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => {
          const isLatest = idx === events.length - 1;
          const formattedTime = new Date(evt.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const formattedDate = new Date(evt.created_at).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                  isLatest
                    ? 'bg-blue-600 border-blue-400 text-white shadow-sm shadow-blue-500/40'
                    : 'bg-white border-slate-300 text-blue-600'
                }`}
              >
                {isLatest ? <CircleDot className="w-3 h-3" /> : <Check className="w-3 h-3 stroke-[2.5]" />}
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    {formattedDate} · {formattedTime}
                  </span>
                </div>

                {evt.note && <p className="text-xs text-slate-600 leading-relaxed font-normal">{evt.note}</p>}

                {evt.author && (
                  <span className="inline-block text-[10px] text-slate-500 uppercase font-semibold">
                    By {evt.author}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Future placeholder stage if not resolved */}
        {currentStatus !== 'RESOLVED' && (
          <div className="relative opacity-40">
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-medium text-slate-400">Resolution Verification</h4>
              <p className="text-[11px] text-slate-500">Pending departmental inspection and after-photo check</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseTimeline;
