import React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';

interface AnalysisProgressProps {
  currentStep: number; // 0 to 4
  className?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStep,
  className = '',
}) => {
  const steps = [
    { title: 'Evidence received and stripped of EXIF metadata', subtitle: 'Processed via Sharp' },
    { title: 'Identifying civic defect and spatial bounding region', subtitle: 'AI Multimodal Vision' },
    { title: 'Assessing severity, urgency, and municipal department', subtitle: 'Standardized civic rubric' },
    { title: 'Generating formal complaint and duplicate check', subtitle: 'Structured text synthesis' },
  ];

  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 space-y-6 shadow-xs ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Analyzing Civic Evidence</h3>
          <p className="text-xs text-slate-500">AI multimodal intelligence in progress...</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;
          const isPending = currentStep < idx;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 transition-opacity ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border text-xs font-bold ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : isActive
                    ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="space-y-0.5">
                <p className={`text-xs font-bold ${isActive ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 font-normal">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

