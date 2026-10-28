import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Copy, CheckCheck, ArrowRight, Camera } from 'lucide-react';
import { api } from '../lib/api';
import { ComplaintRecord } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusChip } from '../components/StatusChip';

export const Submitted: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const [caseData, setCaseData] = useState<ComplaintRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (caseId) {
      api.getCase(caseId).then((res) => setCaseData(res.complaint)).catch(() => {});
    }
  }, [caseId]);

  const handleCopy = () => {
    if (!caseId) return;
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-10 sm:py-16 space-y-8 text-center pb-20">
      {/* Success Green Ring Check */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Civic Case Submitted Successfully
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal">
          Your report has been logged and formally routed to the municipal department for inspection.
        </p>
      </div>

      {/* Case ID Box */}
      <div className="p-6 rounded-2xl premium-card space-y-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Official Civic Case Identifier
        </span>

        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-blue-600">
            {caseId}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Copy Case ID"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {copied && (
          <span className="text-[11px] text-emerald-600 font-bold animate-in fade-in block">
            Copied to clipboard!
          </span>
        )}
      </div>

      {/* 5-Row Summary */}
      {caseData && (
        <div className="p-5 rounded-2xl premium-card text-left space-y-3 text-xs divide-y divide-slate-200/80">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 font-medium">Category</span>
            <span className="font-bold text-slate-900">{caseData.category}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 pt-2.5">
            <span className="text-slate-500 font-medium">Severity Rating</span>
            <div>
              <SeverityBadge severity={caseData.severity} />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 pt-2.5">
            <span className="text-slate-500 font-medium">Assigned Department</span>
            <span className="font-semibold text-slate-900 truncate max-w-[240px]">
              {caseData.department}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 pt-2.5">
            <span className="text-slate-500 font-medium">Initial Status</span>
            <div>
              <StatusChip status={caseData.status} />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 pt-2.5">
            <span className="text-slate-500 font-medium">Incident Location</span>
            <span className="font-semibold text-slate-900 truncate max-w-[240px]">
              {caseData.address}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          to={`/case/${caseId}`}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Track Case Timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/report"
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white/90 border border-slate-200 hover:bg-white text-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Camera className="w-4 h-4 text-blue-600" />
          <span>Report Another Issue</span>
        </Link>
      </div>
    </div>
  );
};

export default Submitted;
