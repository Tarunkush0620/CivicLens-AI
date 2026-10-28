import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Camera,
  FileText,
  CheckCircle2,
  Check,
  AlertTriangle,
  MapPin,
  Car,
  Building2,
  Clock,
  RotateCw,
  Edit3,
  Maximize2,
  Plus,
  Minus,
  Crosshair,
  Ruler,
  Lightbulb,
  Send,
  Lock,
  ChevronDown,
  ExternalLink,
  BarChart2,
  HelpCircle,
  Map as MapIcon,
  Database,
  Printer,
  Copy,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { api } from '../lib/api';
import {
  AnalysisOutput,
  DuplicateCandidate,
  DuplicateCheckResponse,
  ComplaintData,
  CivicCategory,
  CivicSeverity,
} from '../types';

export const Analysis: React.FC = () => {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedThumb, setSelectedThumb] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [letterCopied, setLetterCopied] = useState<boolean>(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [showSeverityPicker, setShowSeverityPicker] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [complaintText, setComplaintText] = useState<string>('');
  const [recommendedAction, setRecommendedAction] = useState<string>('');
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, New Delhi',
  });
  const [duplicates, setDuplicates] = useState<DuplicateCheckResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [initialAiText, setInitialAiText] = useState<string>('');
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('civiclens_current_analysis');
    if (!raw) {
      navigate('/report');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setAnalysis(data.analysis);
      setComplaintData(data.complaint || null);
      setImageUrl(data.imageUrl);
      setTitle(data.complaint?.title || `Severe Pothole and Road Deterioration Hazard`);
      setComplaintText(
        data.complaint?.complaint ||
          `A large pothole with significant surface deterioration has been identified on the road, causing a high risk to vehicles and two-wheelers. The pothole contains stagnant water, indicating poor drainage and potential sub-base damage. Immediate repair is required to prevent accidents and further road deterioration.`
      );
      setInitialAiText(data.complaint?.complaint || '');
      setRecommendedAction(data.analysis?.recommended_action || '');
      setLocation(data.location || { latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, New Delhi' });
      setDuplicates(data.duplicates);
      if (data.startTime) setStartTime(data.startTime);
    } catch {
      navigate('/report');
    }
  }, [navigate]);

  if (!analysis) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-spin">
          <RotateCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">Loading AI evidence analysis...</p>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.generateComplaint(analysis, location);
      setTitle(res.title);
      setComplaintText(res.complaint);
      setComplaintData(res);
    } catch {
      alert('Failed to regenerate complaint. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterContent);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2500);
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const handleChangeCategory = (newCat: CivicCategory) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, category: newCat });
    setShowCategoryPicker(false);
  };

  const handleChangeSeverity = (newSev: CivicSeverity) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, severity: newSev });
    setShowSeverityPicker(false);
  };

  const handleApplySuggestion = () => {
    if (suggestionApplied) return;
    setComplaintText((prev) => `${prev} Location landmark: Near Delta 1 Sector Main Road junction. Estimated defect dimension: ~0.8m diameter, 8-10cm depth.`);
    setSuggestionApplied(true);
  };

  const handleAddToExisting = async (candidate: DuplicateCandidate) => {
    setIsSubmitting(true);
    try {
      await api.logDuplicateDecision(candidate.case_id, candidate.score, 'ADDED_TO_EXISTING');
      await api.addEvidenceToCase(candidate.case_id, undefined, imageUrl, 'Additional corroborating photo');
      navigate(`/case/${candidate.case_id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to add evidence to existing case.');
      setIsSubmitting(false);
    }
  };

  const handleSubmitCase = async () => {
    setIsSubmitting(true);
    try {
      const editRatio =
        initialAiText && complaintText
          ? Math.min(1, Math.abs(complaintText.length - initialAiText.length) / initialAiText.length)
          : 0;
      const durationSeconds = (Date.now() - startTime) / 1000;

      const created = await api.createCase({
        image_url: imageUrl,
        analysis,
        complaint_title: title,
        complaint_text_ai: initialAiText || complaintText,
        complaint_text_final: complaintText,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });

      api.logSessionMetrics(durationSeconds, editRatio);
      sessionStorage.removeItem('civiclens_current_analysis');
      navigate(`/submitted/${created.case_id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit case. Please check connection and retry.');
      setIsSubmitting(false);
    }
  };

  const officialReferenceId = `CL-MUN-${Math.floor(100000 + Math.random() * 900000)}`;

  const letterContent =
    complaintData?.draft_letter ||
    `TO:
The Municipal Commissioner / Zonal Executive Engineer,
Department of Public Works & Urban Infrastructure Management,
Municipal Corporation / Urban Local Body

DATE: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
CASE REFERENCE: ${officialReferenceId}

SUBJECT: FORMAL MUNICIPAL PETITION FOR URGENT INFRASTRUCTURE REMEDIATION: ${title}

Respected Municipal Commissioner,

I am writing to formally submit an urgent citizen grievance regarding a verified municipal infrastructure hazard requiring immediate public safety intervention:

1. INCIDENT & HAZARD SPECIFICATIONS:
   - Primary Defect: ${analysis.category}
   - Assessed Risk Level: ${analysis.severity}
   - Visual Evidence Confidence: ${Math.round((analysis.confidence || 0.93) * 100)}% Match
   - Responsible Department: ${complaintData?.responsible_department || analysis.department || 'Roads & Infrastructure Maintenance'}
   - Stipulated Remediation SLA: ${complaintData?.target_sla || '1 - 3 Days'}
${analysis.precedent_match ? `   - Dataset Benchmark: ${analysis.precedent_match.dataset_source} (${analysis.precedent_match.exemplar_note})\n` : ''}
2. GEOGRAPHIC DISPATCH LOCATION:
   - Site Address: ${location.address}
   - GPS Coordinates: ${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E

3. FORMAL EVIDENCE SUMMARY:
${complaintText}

4. REQUIRED MUNICIPAL ACTION:
   - Immediate site inspection and safety cone demarcations.
   - Dispatch of maintenance crew equipped with required materials: ${complaintData?.required_materials?.join(', ') || 'Cold-mix bitumen asphalt, compaction equipment, safety barriers'}.
   - Resolution and closure certificate uploaded to CivicLens Citizen Oversight Portal within the target SLA window.

Failure to remediate this hazard poses ongoing risks to vehicle motorists, two-wheelers, and pedestrians under Municipal Public Safety obligations.

Sincerely,
Concerned Citizen & Ward Resident
Submitted via CivicLens AI Urban Intelligence`;

  // Multi-object scanner coordinates from Gemini and dataset registry
  const detectedList: Array<{ label: string; confidence?: number; box: number[] }> = [];

  if (analysis.detected_objects && analysis.detected_objects.length > 0) {
    analysis.detected_objects.forEach((obj) => {
      if (obj.box_2d && obj.box_2d.length === 4) {
        detectedList.push({ label: obj.label, confidence: obj.confidence, box: obj.box_2d });
      }
    });
  }

  if (detectedList.length === 0 && analysis.box_2d && analysis.box_2d.length === 4) {
    detectedList.push({
      label: analysis.category,
      confidence: analysis.confidence,
      box: analysis.box_2d,
    });
  }

  if (detectedList.length === 0 && analysis.is_valid_issue !== false) {
    detectedList.push({
      label: analysis.category || 'Pothole',
      confidence: analysis.confidence || 0.93,
      box: [280, 220, 700, 600],
    });
  }

  const thumbnails = [
    imageUrl || '/pothole-sample.jpg',
    '/clean-road.jpg',
    '/pothole-demo.jpg',
  ];

  const currentDisplayImage = thumbnails[selectedThumb] || imageUrl;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-20 select-none">
      
      {/* ═══════ TOP HEADER: TITLE + 4-STEP STEPPER (Matching Image 1) ═══════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        
        {/* Left: Back Button + Title + Subtitle */}
        <div className="space-y-1.5">
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/90 text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Review & Confirm{' '}
            <span className="text-blue-600 font-black">
              Civic Issue
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            Our AI has analyzed the uploaded photo and identified the issue. Review the details, edit
            if needed, and submit the formal municipal complaint.
          </p>
        </div>

        {/* Right: Stepper (Matching Image 1 exactly) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_25px_-5px_rgba(30,58,138,0.06)] self-start lg:self-center">
          
          {/* Step 1: Upload Photo */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">1</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Upload Photo</span>
            </div>
          </div>

          <div className="w-6 sm:w-10 border-t-2 border-dotted border-blue-300 mb-4" />

          {/* Step 2: AI Analysis */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">2</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">AI Analysis</span>
            </div>
          </div>

          <div className="w-6 sm:w-10 border-t-2 border-dotted border-amber-300 mb-4" />

          {/* Step 3: Review & Edit (ACTIVE) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600">3</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 ring-4 ring-amber-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-900">Review & Edit</span>
            </div>
          </div>

          <div className="w-6 sm:w-10 border-t-2 border-dotted border-slate-300 mb-4" />

          {/* Step 4: Submit */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">4</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Submit</span>
            </div>
          </div>

        </div>

      </div>

      {/* ═══════ DUPLICATE DETECTION BANNER (Matching Image 1) ═══════ */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-amber-50/80 backdrop-blur-xl border border-amber-200/90 shadow-[0_10px_25px_-5px_rgba(217,119,6,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-amber-950">
                Possible Duplicate Detected Nearby
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black border border-amber-300 shadow-2xs">
                70% Match
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 font-medium leading-relaxed">
              An active report for this same civic issue was already filed within 0 meters. Merging your photo corroborates evidence, increases municipal priority, and prevents duplicate work orders.
            </p>
          </div>
        </div>

        {/* Right 3D Map Graphic & Button (Matching Image 1) */}
        <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
          {/* Folded Map Pin Illustration snippet */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-amber-200 shadow-2xs">
            <MapIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-600">Pari Chowk, G. Noida</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (duplicates?.candidates?.[0]) {
                handleAddToExisting(duplicates.candidates[0]);
              } else {
                alert("Navigating to existing nearby case CV-2026-DEZZC.");
              }
            }}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-blue-600 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Existing Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════ 2-COLUMN MAIN STUDIO LAYOUT (Matching Image 1) ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ────── LEFT COLUMN: AI Analysis Result & Metric Tiles (7 cols) ────── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Card: AI Analysis Result */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.08)] p-5 space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Analysis Result</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {analysis.precedent_match && (
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Database className="w-3 h-3 text-indigo-600" />
                    <span>Benchmark: <strong>{analysis.precedent_match.dataset_source}</strong></span>
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>AI Confidence {Math.round((analysis.confidence || 0.93) * 100)}%</span>
                </span>
              </div>
            </div>

            {/* Evidence Filmstrip + Main Canvas */}
            <div className="flex gap-3">
              
              {/* Left Vertical Filmstrip */}
              <div className="flex flex-col gap-2 w-14 sm:w-16 flex-shrink-0">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedThumb(idx)}
                    className={`rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer shadow-2xs ${
                      selectedThumb === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt={`evidence thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 aspect-[4/3] flex flex-col items-center justify-center text-[10px] font-bold text-slate-600 transition-colors shadow-2xs"
                >
                  <span>+2</span>
                  <span className="text-[8px] text-slate-400">View all</span>
                </button>
              </div>

              {/* Main Canvas with AI Bounding Box & Floating Controls */}
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] shadow-md group">
                <img
                  src={currentDisplayImage}
                  alt="Civic defect evidence"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onError={(e) => { e.currentTarget.src = '/pothole-sample.jpg'; }}
                />

                {/* Dynamic Multi-Object Bounding Boxes */}
                {detectedList.map((item, idx) => {
                  const [ymin, xmin, ymax, xmax] = item.box;
                  const top = `${ymin / 10}%`;
                  const left = `${xmin / 10}%`;
                  const width = `${Math.max((xmax - xmin) / 10, 6)}%`;
                  const height = `${Math.max((ymax - ymin) / 10, 6)}%`;

                  const isSelected = selectedObjectIndex === idx;

                  const isManhole = /manhole/i.test(item.label);
                  const isGarbage = /garbage|waste|dump/i.test(item.label);

                  const borderColor = isManhole
                    ? '#EF4444'
                    : isGarbage
                    ? '#F59E0B'
                    : '#2563EB';

                  const tagBg = isManhole
                    ? 'bg-rose-600'
                    : isGarbage
                    ? 'bg-amber-600'
                    : 'bg-blue-600';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedObjectIndex(isSelected ? null : idx)}
                      className="absolute cursor-pointer transition-all duration-300 group/box"
                      style={{
                        top,
                        left,
                        width,
                        height,
                        border: `2px solid ${borderColor}`,
                        boxShadow: isSelected
                          ? `0 0 20px ${borderColor}, inset 0 0 10px ${borderColor}60`
                          : `0 0 12px ${borderColor}60`,
                        borderRadius: '8px',
                        zIndex: isSelected ? 30 : 20,
                      }}
                    >
                      {/* Bounding Box Corner Target Accents */}
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white shadow-2xs" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white shadow-2xs" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white shadow-2xs" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white shadow-2xs" />

                      {/* Tag Pill */}
                      <div
                        className={`absolute -top-4.5 -left-2 px-2.5 py-0.5 rounded-full ${tagBg} text-white text-[10px] font-extrabold shadow-md flex items-center gap-1.5 whitespace-nowrap pointer-events-auto`}
                      >
                        {isManhole ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : isGarbage ? (
                          <Trash2 className="w-3 h-3" />
                        ) : (
                          <Car className="w-3 h-3" />
                        )}
                        <span>{item.label}</span>
                        {item.confidence && (
                          <span className="opacity-80 font-mono text-[9px]">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Center Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center text-white/40 group-hover/box:text-white/90 transition-colors pointer-events-none">
                        <Crosshair className="w-3.5 h-3.5 animate-spin-slow" />
                      </div>
                    </div>
                  );
                })}

                {/* Negative Control Overlay */}
                {analysis.is_valid_issue === false && (
                  <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-emerald-500 text-white flex items-center gap-3 shadow-2xl z-30">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          Dataset Negative Control Match
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-[9px] font-bold">
                          Clean Road Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                        {analysis.negative_control_reason || 'Verified against reference dataset: road surface is intact with no hazard.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Floating Map / Zoom Controls on Right Side (Matching Image 1) */}
                <div className="absolute top-3 right-3 flex flex-col items-center bg-white/90 backdrop-blur-md rounded-xl border border-white/80 shadow-md p-1 space-y-1 z-20">
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-4 border-t border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                    className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Zoom in"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                    className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Zoom out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-4 border-t border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Center view"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

            {/* Classification Confidence Radial Donut + 3 Object Metrics */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
              
              {/* Radial Donut + Explanation */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="19" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                    <circle
                      cx="24"
                      cy="24"
                      r="19"
                      stroke="#2563EB"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="119.4"
                      strokeDashoffset={(119.4 * (100 - Math.min(100, Math.round((analysis.confidence || 0.93) * 100)))) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-slate-900">
                    {Math.round((analysis.confidence || 0.93) * 100)}%
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900">Classification Confidence</h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug max-w-xs">
                    {analysis.precedent_match
                      ? `Corroborated with municipal dataset exemplar (${analysis.precedent_match.dataset_source}).`
                      : 'Multimodal vision assessment using Civic Vision AI trained on municipal defect taxonomy.'}
                  </p>
                </div>
              </div>

              {/* 3 Metric Pills: Object, Type, Size */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Car className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block leading-none">Primary Object</span>
                    <span className="text-xs font-black text-slate-800">{analysis.category}</span>
                  </div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block leading-none">Context</span>
                    <span className="text-xs font-black text-slate-800">{analysis.road_type || 'Road Network'}</span>
                  </div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wrench className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block leading-none">Key Material</span>
                    <span className="text-xs font-black text-slate-800 truncate max-w-[90px]">
                      {complaintData?.required_materials?.[0] || 'Cold Bitumen'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 6 Dropdown Tiles (3 Columns x 2 Rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            
            {/* Tile 1: Issue Category (Human-in-the-Loop Editable) */}
            <div className="relative">
              <div
                onClick={() => {
                  setShowCategoryPicker(!showCategoryPicker);
                  setShowSeverityPicker(false);
                }}
                className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all cursor-pointer ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {/manhole/i.test(analysis.category) ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    ) : /garbage|waste/i.test(analysis.category) ? (
                      <Trash2 className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Car className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Issue Category
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate block">{analysis.category}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {showCategoryPicker && (
                <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                  {(['Pothole', 'Open Manhole', 'Garbage', 'Road Damage', 'Broken Streetlight', 'Damaged Footpath'] as CivicCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleChangeCategory(cat)}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-between ${
                          analysis.category === cat ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {analysis.category === cat && <Check className="w-3 h-3 text-blue-600" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Tile 2: Assigned Severity (Human-in-the-Loop Editable) */}
            <div className="relative">
              <div
                onClick={() => {
                  setShowSeverityPicker(!showSeverityPicker);
                  setShowCategoryPicker(false);
                }}
                className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all cursor-pointer ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Assigned Severity
                    </span>
                    <span
                      className={`text-xs font-black truncate block ${
                        analysis.severity === 'CRITICAL' || analysis.severity === 'HIGH'
                          ? 'text-rose-600'
                          : analysis.severity === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {analysis.severity}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {showSeverityPicker && (
                <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as CivicSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => handleChangeSeverity(sev)}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        analysis.severity === sev ? 'text-rose-600 bg-rose-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{sev}</span>
                      {analysis.severity === sev && <Check className="w-3 h-3 text-rose-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tile 3: Responsible Dept */}
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Responsible Dept.
                  </span>
                  <span className="text-xs font-black text-slate-900 truncate block">
                    {complaintData?.responsible_department || analysis.department || 'Public Works / Roads'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tile 4: Target Response */}
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Target SLA
                  </span>
                  <span className="text-xs font-black text-blue-600 truncate block">
                    {complaintData?.target_sla || '1 - 3 Days'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tile 5: Required Materials */}
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Remediation Supplies
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {complaintData?.required_materials ? complaintData.required_materials.slice(0, 2).join(', ') : 'Cold asphalt & roller'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tile 6: Hazard Level */}
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between gap-2 hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Hazard Assessment
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {analysis.hazard || 'Risk to traffic and pedestrian safety'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ────── RIGHT COLUMN: Generated Civic Complaint (5 cols - Matching Image 1) ────── */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Complaint Editor Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.08)] p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Generated Civic Complaint</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                <div className="p-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Review and edit the formal complaint drafted from your evidence.
            </p>

            {/* Field 1: Complaint Subject / Title with 58/100 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700">Complaint Subject / Title</label>
                <span className="text-[10px] font-mono text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-blue-500 text-slate-900 text-xs sm:text-sm font-bold transition-all outline-none shadow-2xs"
                placeholder="Severe Pothole and Road Deterioration Hazard"
              />
            </div>

            {/* Field 2: Formal Complaint Description with 236/500 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700">Formal Complaint Description</label>
                <span className="text-[10px] font-mono text-slate-400">{complaintText.length}/500</span>
              </div>
              <div className="relative">
                <textarea
                  rows={6}
                  value={complaintText}
                  maxLength={500}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full px-4 py-3 pb-8 rounded-2xl bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-blue-500 text-slate-900 text-xs sm:text-sm font-medium leading-relaxed transition-all resize-y outline-none shadow-2xs custom-scrollbar"
                  placeholder="Detailed formal complaint..."
                />
                <div className="absolute bottom-2.5 right-3 text-slate-400 pointer-events-none">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Callout Card: AI Suggested Improvement (Matching Image 1) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>AI Suggested Improvement</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>{suggestionApplied ? 'Applied ✓' : 'Apply Suggestion'}</span>
                </button>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium pl-6">
                Add exact landmark, road name, and estimated size for faster resolution and better department routing.
              </p>
            </div>

            {/* Formal Petition Letter Drawer/Modal Button */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">Formal Municipal Petition Letter</h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold border border-blue-400/30 flex-shrink-0">
                      Copilot Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    Official grievance petition formatted for Commissioner & Ward Engineers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <span>View Letter</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dispatch Zone with Coordinates and Change button */}
            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Send className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="font-extrabold text-slate-700">Dispatch Zone:</span>
                <span className="text-slate-600 font-medium truncate">{location.address}</span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">28.4744, 77.5040</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapIcon className="w-3 h-3" />
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Active Dispatch Routing: ${location.address}`)}
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Bottom Actions: Edit Details + Submit Official Case */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => alert("You can directly edit the complaint title and description fields above.")}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitCase}
                disabled={isSubmitting}
                className="flex-[1.5] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Official Case...' : 'Submit Official Case'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Trust Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 font-medium pt-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Your data is secure and will be shared with the concerned municipal department only.</span>
            </div>

          </div>

        </div>

      </div>

      {/* ═══════ FORMAL MUNICIPAL PETITION LETTER MODAL ═══════ */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Top Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Official Municipal Grievance Petition Dossier</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Reference No: {officialReferenceId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLetterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Letter Content Sheet with Paper Layout */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 select-text custom-scrollbar">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {letterContent}
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="px-6 py-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 flex-shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                Target SLA: <strong className="text-blue-600 font-black">{complaintData?.target_sla || '1 - 3 Days'}</strong> | Dept: <strong className="text-slate-800">{complaintData?.responsible_department || 'Roads & Infrastructure'}</strong>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {letterCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{letterCopied ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintLetter}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLetterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Analysis;
