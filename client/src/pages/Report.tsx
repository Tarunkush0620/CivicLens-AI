import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Camera,
  Upload,
  UploadCloud,
  FileText,
  CheckCircle2,
  Check,
  ShieldCheck,
  Car,
  Lightbulb,
  Trash2,
  AlertTriangle,
  Target,
  Droplets,
  Footprints,
  Building2,
  MoreHorizontal,
  RefreshCw,
  X,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Navigation,
  Database,
  Layers,
  Award,
} from 'lucide-react';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { api } from '../lib/api';

/* ─── Sample Images Matching Reference Image 1 ─── */
const SAMPLE_CARDS = [
  {
    id: 'pothole',
    label: 'Road Pothole',
    category: 'Pothole',
    icon: Car,
    iconColor: 'text-blue-600',
    image: '/pothole-sample.jpg',
    url: '/pothole-sample.jpg',
    filename: 'sample_pothole.jpg',
  },
  {
    id: 'manhole',
    label: 'Open Manhole',
    category: 'Open Manhole',
    icon: Target,
    iconColor: 'text-rose-600',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_manhole.jpg',
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    category: 'Garbage',
    icon: Trash2,
    iconColor: 'text-purple-600',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_garbage.jpg',
  },
  {
    id: 'streetlight',
    label: 'Broken Streetlight',
    category: 'Streetlight',
    icon: Lightbulb,
    iconColor: 'text-amber-500',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_streetlight.jpg',
  },
  {
    id: 'water',
    label: 'Water Pipe Leak',
    category: 'Water Leak',
    icon: Droplets,
    iconColor: 'text-cyan-600',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_water_leak.jpg',
  },
];

/* ─── Supported Categories Grid Matching Reference ─── */
const CATEGORIES = [
  { label: 'Potholes', icon: Car, bg: 'bg-blue-50/70', border: 'border-blue-200/80', text: 'text-blue-700' },
  { label: 'Road Damage', icon: AlertTriangle, bg: 'bg-rose-50/70', border: 'border-rose-200/80', text: 'text-rose-700' },
  { label: 'Garbage Dumps', icon: Trash2, bg: 'bg-purple-50/70', border: 'border-purple-200/80', text: 'text-purple-700' },
  { label: 'Broken Streetlights', icon: Lightbulb, bg: 'bg-amber-50/70', border: 'border-amber-200/80', text: 'text-amber-700' },
  { label: 'Open Manholes', icon: Target, bg: 'bg-pink-50/70', border: 'border-pink-200/80', text: 'text-pink-700' },
  { label: 'Water Pipe Leaks', icon: Droplets, bg: 'bg-cyan-50/70', border: 'border-cyan-200/80', text: 'text-cyan-700' },
  { label: 'Damaged Footpaths', icon: Footprints, bg: 'bg-emerald-50/70', border: 'border-emerald-200/80', text: 'text-emerald-700' },
  { label: 'Illegal Construction', icon: Building2, bg: 'bg-indigo-50/70', border: 'border-indigo-200/80', text: 'text-indigo-700' },
  { label: 'Others', icon: MoreHorizontal, bg: 'bg-slate-50/70', border: 'border-slate-200/80', text: 'text-slate-700' },
];

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, New Delhi',
  });
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert("Please upload a valid image file (JPG, PNG, or WEBP under 8 MB).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8 MB. Please choose a smaller photo.');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMsg(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleLoadSample = async (sample: typeof SAMPLE_CARDS[0]) => {
    try {
      setLoadingSample(sample.id);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
    } catch {
      // Fallback: create mock file with sample name
      try {
        const dummyBlob = new Blob(['sample-evidence'], { type: 'image/jpeg' });
        const file = new File([dummyBlob], sample.filename, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(sample.image);
        setErrorMsg(null);
      } catch (err) {
        alert('Could not load sample image. Please choose a photo from your device.');
      }
    } finally {
      setLoadingSample(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLocation({
          latitude: lat,
          longitude: lng,
          address: `Current location (${lat}, ${lng})`,
        });
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not fetch location: ${err.message}. Using default.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(0);

    const startTime = Date.now();

    const t1 = setTimeout(() => setAnalysisStep(1), 500);
    const t2 = setTimeout(() => setAnalysisStep(2), 1200);
    const t3 = setTimeout(() => setAnalysisStep(3), 2000);

    try {
      const analysisRes = await api.analyzeImage(selectedFile, location);
      setAnalysisStep(3);

      const complaintRes = await api.generateComplaint(analysisRes.analysis, location);
      setAnalysisStep(4);

      const dupRes = await api.checkDuplicates(
        analysisRes.analysis.category,
        location.latitude,
        location.longitude,
        analysisRes.analysis.description
      );

      const sessionData = {
        analysis: analysisRes.analysis,
        imageUrl: analysisRes.image_url,
        complaint: complaintRes,
        duplicates: dupRes,
        location,
        startTime,
      };
      sessionStorage.setItem('civiclens_current_analysis', JSON.stringify(sessionData));

      navigate('/report/analysis');
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
      setErrorMsg(
        err.message || 'Analysis timed out or failed. Please check your image and try again.'
      );
    }
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 select-none">
      
      {/* ═══════ HEADER ROW + 4-STEP PROGRESS TRACKER (Matching Image 1) ═══════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        
        {/* Left: Badge, Title & Subtitle */}
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Report Issue</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Report a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Civic Issue
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Upload a clear photo of the civic problem. Our AI will analyze the issue, detect the category,
            assess severity, and help draft a formal municipal complaint in seconds.
          </p>
        </div>

        {/* Right: 4-Step Horizontal Stepper (Matching Image 1) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 bg-white/70 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-white/90 shadow-[0_10px_25px_-5px_rgba(30,58,138,0.08)] self-start lg:self-center">
          {/* Step 1: Upload Photo (Active) */}
          <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">Upload Photo</span>
          </div>

          {/* Dotted Connector 1 */}
          <div className="w-8 sm:w-12 border-t-2 border-dotted border-blue-400 -mt-5" />

          {/* Step 2: AI Analysis */}
          <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600">AI Analysis</span>
          </div>

          {/* Dotted Connector 2 */}
          <div className="w-8 sm:w-12 border-t-2 border-dotted border-slate-300 -mt-5" />

          {/* Step 3: Review & Edit */}
          <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600">Review & Edit</span>
          </div>

          {/* Dotted Connector 3 */}
          <div className="w-8 sm:w-12 border-t-2 border-dotted border-slate-300 -mt-5" />

          {/* Step 4: Submit */}
          <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600">Submit</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/95 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong className="font-bold block text-rose-900">Analysis Failed</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Analysis Progress Screen if running */}
      {isAnalyzing ? (
        <AnalysisProgress currentStep={analysisStep} />
      ) : (
        /* ═══════ 2-COLUMN MAIN WORKSPACE (Matching Image 1) ═══════ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ────── LEFT COLUMN: Upload Card + Samples + Privacy (7 cols) ────── */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Main Upload & Samples Container Card */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.08)] p-5 sm:p-7 space-y-6">
              
              {/* Drag & Drop Area with Floating Polaroids */}
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px] group ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/90 shadow-xl ring-4 ring-blue-500/20'
                      : 'border-blue-200/80 bg-gradient-to-b from-blue-50/40 via-sky-50/20 to-white hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  {/* ── Decorative Floating Polaroid 1: Road Damage (Top-Left) ── */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 hidden sm:block pointer-events-none">
                    <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100 -rotate-6 group-hover:-rotate-3 transition-transform duration-300">
                      <img
                        src="/pothole-sample.jpg"
                        alt="Road damage sample"
                        className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl object-cover"
                        onError={(e) => { e.currentTarget.src = '/clean-road.jpg'; }}
                      />
                      <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center gap-1 text-[9.5px] font-bold text-blue-600">
                        <Car className="w-3 h-3 text-blue-600" />
                        <span>Road Damage</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Decorative Floating Polaroid 2: Streetlight Issue (Bottom-Left) ── */}
                  <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-10 z-10 hidden md:block pointer-events-none">
                    <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100 rotate-4 group-hover:rotate-1 transition-transform duration-300">
                      <img
                        src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80"
                        alt="Streetlight sample"
                        className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl object-cover"
                        onError={(e) => { e.currentTarget.src = '/pothole-demo.jpg'; }}
                      />
                      <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center gap-1 text-[9.5px] font-bold text-amber-600">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>Streetlight Issue</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Decorative Floating Polaroid 3: Garbage Dump (Right) ── */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 z-10 hidden sm:block pointer-events-none">
                    <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100 rotate-6 group-hover:rotate-2 transition-transform duration-300">
                      <img
                        src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=80"
                        alt="Garbage dump sample"
                        className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl object-cover"
                        onError={(e) => { e.currentTarget.src = '/pothole-demo.jpg'; }}
                      />
                      <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center gap-1 text-[9.5px] font-bold text-purple-600">
                        <Trash2 className="w-3 h-3 text-purple-600" />
                        <span>Garbage Dump</span>
                      </div>
                    </div>
                  </div>

                  {/* Dotted Curved Arrows (SVG Overlay) */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block opacity-60"
                    viewBox="0 0 600 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 170 120 C 200 130, 230 110, 260 135"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 330 180 C 370 200, 410 190, 440 180"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {/* Center Upload Squircle & Text */}
                  <div className="relative z-20 flex flex-col items-center my-auto">
                    {/* Cloud Upload Circle with Glowing Gradient */}
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-sky-400/20 to-blue-600/10 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/15 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8 text-blue-600" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                      Drag & drop a <span className="text-blue-600 font-extrabold">photo here</span>
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      or{' '}
                      <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                        click to browse from your device
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG or WEBP up to 8 MB
                    </p>

                    {/* Gradient Pill Button */}
                    <button
                      type="button"
                      className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Choose from device</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Mode */
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl aspect-[16/10] group">
                  <img
                    src={previewUrl}
                    alt="Uploaded evidence preview"
                    className="w-full h-full object-cover"
                  />

                  {/* AI Detection Reticle Overlay */}
                  <div className="absolute inset-8 border-2 border-cyan-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
                  </div>

                  {/* Top-Right Control Buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-900 flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Replace photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-rose-400 hover:bg-slate-900 shadow-md transition-all hover:scale-105 cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  {selectedFile && (
                    <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-slate-200 border border-slate-700/80 shadow-md">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Privacy Protection Card (Matching Image 1) */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_10px_25px_-5px_rgba(20,50,120,0.06)] p-4 sm:p-5 flex items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900">Privacy protection</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed truncate sm:whitespace-normal">
                    All EXIF and GPS device metadata is automatically stripped. Please avoid capturing human
                    faces or vehicle registration plates in your photo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => alert("CivicLens AI strictly sanitizes all user uploads, stripping EXIF, device metadata, and personal identifiable information (PII) before analysis.")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Decorative subtle green leaf accent */}
              <div
                className="absolute right-0 bottom-0 top-0 w-24 pointer-events-none bg-gradient-to-l from-emerald-100/30 to-transparent"
                aria-hidden="true"
              />
            </div>

            {/* Compact Incident Location Drawer */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/90 p-3 shadow-xs">
              <div
                onClick={() => setShowLocationSettings(!showLocationSettings)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Incident Location:</span>
                  <span className="font-semibold text-slate-500 truncate max-w-[280px]">
                    {location.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseCurrentLocation();
                    }}
                    disabled={isLocating}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'GPS Detect'}</span>
                  </button>
                  {showLocationSettings ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>

              {showLocationSettings && (
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    placeholder="Enter locality or landmark..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationSettings(false)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ────── RIGHT COLUMN: How it works + Categories + Analyze CTA (5 cols) ────── */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Card 1: How it works (Matching Image 1) */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.08)] p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">How it works</h3>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Powered by Civic Vision AI</span>
                </span>
              </div>

              {/* 4 Process Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-1">
                    1
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-slate-900">Upload Photo</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Capture or upload a clear photo of the civic issue.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-1">
                    2
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-slate-900">AI Analysis</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our AI detects the issue category, location context, and hazard severity.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-1">
                    3
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-slate-900">Auto Draft Complaint</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      A formal municipal complaint draft is generated with recommended actions.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-1">
                    4
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-slate-900">Review & Submit</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      You can edit details and submit it to the concerned municipal department.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Supported Issue Categories (Matching Image 1) */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.08)] p-6 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">
                Supported Issue Categories
              </h4>

              {/* 3x3 Colorful Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.label}
                      className={`px-3 py-2 rounded-xl ${cat.bg} ${cat.border} border flex items-center gap-1.5 transition-transform hover:scale-[1.02] cursor-default shadow-2xs`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cat.text} flex-shrink-0`} />
                      <span className={`text-[11px] font-bold ${cat.text} truncate`}>
                        {cat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action CTA Button: Analyze with Civic Vision */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Analyze Civic Evidence</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default Report;
