import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { ResolutionCheckRecord } from '../types';

interface BeforeAfterProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  resolutionCheck?: ResolutionCheckRecord | null;
  className?: string;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeImageUrl,
  afterImageUrl,
  resolutionCheck,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  };

  const statusConfig: Record<
    string,
    { label: string; icon: any; bg: string; text: string; border: string }
  > = {
    LIKELY_RESOLVED: {
      label: 'Likely Resolved',
      icon: CheckCircle2,
      bg: 'rgba(22, 163, 74, 0.10)',
      text: '#15803D',
      border: 'rgba(22, 163, 74, 0.35)',
    },
    PARTIALLY_RESOLVED: {
      label: 'Partially Resolved',
      icon: AlertTriangle,
      bg: 'rgba(217, 119, 6, 0.10)',
      text: '#B45309',
      border: 'rgba(217, 119, 6, 0.35)',
    },
    NOT_RESOLVED: {
      label: 'Not Resolved',
      icon: XCircle,
      bg: 'rgba(225, 29, 72, 0.10)',
      text: '#BE123C',
      border: 'rgba(225, 29, 72, 0.35)',
    },
    CANNOT_DETERMINE: {
      label: 'Cannot Determine',
      icon: HelpCircle,
      bg: 'rgba(100, 116, 139, 0.10)',
      text: '#475569',
      border: 'rgba(100, 116, 139, 0.35)',
    },
  };

  const status = resolutionCheck?.resolution_status || 'LIKELY_RESOLVED';
  const currentStatus = statusConfig[status] || statusConfig.LIKELY_RESOLVED;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Before / After Photographic Verification</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Drag divider to compare</span>
      </div>

      {/* Interactive Split Slider Container */}
      <div
        className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-[16/10] select-none cursor-ew-resize shadow-lg"
        onMouseMove={(e) => {
          if (isDragging) {
            handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
          }
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            handleSliderMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
          }
        }}
      >
        {/* Underneath: After Image (Full background) */}
        <img
          src={afterImageUrl}
          alt="After remediation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 z-10 shadow-xs">
          After
        </div>

        {/* Clipped: Before Image (Left portion) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImageUrl}
            alt="Before remediation"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 z-10 shadow-xs">
            Before
          </div>
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.7)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white text-xs shadow-xl font-bold">
            ⇄
          </div>
        </div>
      </div>

      {/* AI Resolution Evaluation Summary */}
      {resolutionCheck && (
        <div className="p-4 rounded-xl premium-card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">AI Resolution Verification Intelligence</span>
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: currentStatus.bg,
                color: currentStatus.text,
                borderColor: currentStatus.border,
              }}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{currentStatus.label}</span>
              <span className="font-mono">({Math.round(resolutionCheck.confidence * 100)}%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Initial Defect State</span>
              <p className="text-slate-800 leading-relaxed font-normal">{resolutionCheck.before_summary}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remediated State</span>
              <p className="text-slate-800 leading-relaxed font-normal">{resolutionCheck.after_summary}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
            <span>
              Location Match Likelihood:{' '}
              <strong className="text-slate-900 font-semibold">{resolutionCheck.same_location_likelihood}</strong>
            </span>
            <span className="text-slate-500">AI advisory • Admin confirms final status</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfter;
