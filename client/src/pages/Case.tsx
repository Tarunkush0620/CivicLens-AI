import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Copy,
  CheckCheck,
  Share2,
  MapPin,
  Clock,
  Building2,
  Users,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../lib/api';
import { ComplaintRecord, CaseEventRecord, ResolutionCheckRecord } from '../types';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusChip } from '../components/StatusChip';
import { WhySeverity } from '../components/WhySeverity';
import { CaseTimeline } from '../components/CaseTimeline';
import { BeforeAfter } from '../components/BeforeAfter';

export const Case: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<ComplaintRecord | null>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [events, setEvents] = useState<CaseEventRecord[]>([]);
  const [resolutionChecks, setResolutionChecks] = useState<ResolutionCheckRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCase = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const res = await api.getCase(caseId);
      setComplaint(res.complaint);
      setEvidenceList(res.evidence || []);
      setEvents(res.events || []);
      setResolutionChecks(res.resolutionChecks || []);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Case not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleCopy = () => {
    if (!caseId) return;
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `CivicLens Case ${caseId}`,
        text: `Track civic problem: ${complaint?.complaint_title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-500">
        Loading case details...
      </div>
    );
  }

  if (errorMsg || !complaint) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Case Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate any civic record with Case ID "{caseId}".
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const latestResolutionCheck =
    resolutionChecks.length > 0 ? resolutionChecks[resolutionChecks.length - 1] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Case Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-mono font-black text-blue-600 tracking-tight">
                {complaint.case_id}
              </span>
              <SeverityBadge severity={complaint.severity} />
              <StatusChip status={complaint.status} />

              {complaint.report_count > 1 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <Users className="w-3.5 h-3.5" />
                  <span>{complaint.report_count} citizen reports merged</span>
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {complaint.complaint_title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              title="Copy Case ID"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              title="Share Case"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="truncate font-medium">{complaint.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="truncate font-medium">{complaint.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">Reported {new Date(complaint.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Visual Evidence & Body */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Evidence & Defect Reticle</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AI Vision Verified
              </span>
            </div>

            <EvidenceViewer
              images={evidenceList.length > 0 ? evidenceList : [complaint.image_url]}
              category={complaint.category}
              box2d={complaint.box_2d}
              confidence={complaint.confidence}
            />

            <WhySeverity
              severity={complaint.severity}
              reasons={complaint.severity_reasons || []}
              className="pt-3 border-t border-slate-100"
            />
          </div>

          {/* Before / After Verification Panel (if after image exists) */}
          {latestResolutionCheck && (
            <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md">
              <BeforeAfter
                beforeImageUrl={complaint.image_url}
                afterImageUrl={latestResolutionCheck.after_image_url}
                resolutionCheck={latestResolutionCheck}
              />
            </div>
          )}

          {/* Formal Complaint Body */}
          <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Official Grievance Text
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Standard Form C-104
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-l-blue-600 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {complaint.complaint_text_final || complaint.complaint_text_ai}
            </div>

            {complaint.recommended_action && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
                <strong className="font-bold block text-blue-950">Recommended Municipal Action:</strong>
                <p className="leading-relaxed">{complaint.recommended_action}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audit Timeline & Lifecycle */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md">
            <CaseTimeline events={events} currentStatus={complaint.status} />
          </div>

          {/* Municipal Routing Box */}
          <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 block">Municipal Dispatch Routing</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-normal">
              Assigned directly to <strong className="text-slate-800 font-semibold">{complaint.department}</strong>. In live city operation, this record bridges directly to the state civic portal (CPGRAMS / CM Helpline) via webhook dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Case;
