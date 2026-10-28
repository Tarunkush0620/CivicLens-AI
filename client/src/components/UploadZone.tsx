import React, { useRef, useState } from 'react';
import { Camera, Upload, ShieldCheck, RefreshCw, X, Sparkles, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onClear: () => void;
  className?: string;
}

const SAMPLE_IMAGES = [
  {
    label: 'Road Pothole',
    category: 'Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_pothole.jpg',
  },
  {
    label: 'Open Manhole',
    category: 'Open Manhole',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_manhole.jpg',
  },
  {
    label: 'Garbage Dump',
    category: 'Garbage',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    filename: 'sample_garbage.jpg',
  },
];

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  selectedFile,
  previewUrl,
  onClear,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert("That file isn't a photo we can read. Use a JPG, PNG, or WEBP under 8 MB.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8 MB. Please choose a smaller photo.');
      return;
    }
    onFileSelected(file);
  };

  const handleLoadSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    try {
      setLoadingSample(sample.label);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/jpeg' });
      onFileSelected(file);
    } catch {
      alert('Could not download sample photo. Try uploading your own.');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {!previewUrl ? (
        <div className="space-y-3">
          {/* Main Drop Area */}
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
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 space-y-3 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/80 shadow-lg ring-4 ring-blue-500/20'
                : 'border-slate-300/80 bg-white/75 hover:border-blue-400 hover:bg-white/90 premium-card'
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

            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-md shadow-blue-500/10">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-bold text-slate-900">
                Drop a photo of the civic problem here, or click to browse
              </p>
              <p className="text-xs text-slate-500">Supports JPG, PNG or WEBP up to 8 MB</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Choose from device</span>
              </button>
            </div>
          </div>

          {/* Quick Preset / Demo Sample Buttons */}
          <div className="p-3.5 rounded-xl premium-card space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Or test instantly with a demo photo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  disabled={loadingSample !== null}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {loadingSample === sample.label ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg aspect-[4/3] sm:aspect-[16/10] group">
          <img
            src={previewUrl}
            alt="Uploaded evidence preview"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Replace photo</span>
            </button>

            <button
              type="button"
              onClick={onClear}
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
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-slate-200 border border-slate-700/80 shadow-md">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl premium-card text-xs text-slate-600 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Privacy protection:</strong> All EXIF and GPS device
          metadata is automatically stripped. Please avoid capturing human faces or vehicle registration
          plates in your photo.
        </p>
      </div>
    </div>
  );
};

export default UploadZone;
