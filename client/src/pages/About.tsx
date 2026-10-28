import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Eye,
  MapPin,
  CheckCircle2,
  Sparkles,
  Building2,
  Users,
  ArrowRight,
  HeartHandshake,
  Layers,
  Zap,
  Clock,
  Globe2,
  FileText,
  Camera,
  Activity,
  AlertTriangle,
  Compass
} from 'lucide-react';

export const About: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'Automated Computer Vision Detection',
      icon: Eye,
      accent: 'from-blue-600 to-indigo-600',
      tag: 'Edge & Cloud CV',
      desc: 'Trained on multi-dataset civic corpora, our vision pipeline locates potholes, open manholes, structural cracks, garbage piles, broken signage, and roadway hazards in sub-4ms with normalized spatial coordinates.'
    },
    {
      num: '02',
      title: 'Deep Multimodal Hazard Investigation',
      icon: Sparkles,
      accent: 'from-purple-600 to-indigo-600',
      tag: 'AI Multimodal Vision',
      desc: 'Evaluates visible infrastructure degradation in engineering detail, estimating depth, road surface deterioration, hazard ratings, and vehicular safety risks while filtering clean surfaces as negative controls.'
    },
    {
      num: '03',
      title: 'Structured Complaint Dossiers & SLAs',
      icon: FileText,
      accent: 'from-emerald-600 to-teal-600',
      tag: 'Official Petitions',
      desc: 'Synthesizes formal, legally structured complaint petitions pre-addressed to the exact municipal authority (PWD, Jal Sansthan, Solid Waste, or Traffic Police) complete with estimated repair materials and statutory SLAs.'
    },
    {
      num: '04',
      title: 'Spatial Deduplication & Prioritization',
      icon: MapPin,
      accent: 'from-amber-500 to-orange-600',
      tag: '100m Proximity Clustering',
      desc: 'Consolidates multi-citizen reports within a 100-meter radius into unified master cases, preventing administrative ticket duplication while dynamically boosting urgency based on report density.'
    },
    {
      num: '05',
      title: 'Dual Before/After Resolution Audit',
      icon: CheckCircle2,
      accent: 'from-rose-500 to-pink-600',
      tag: 'Accountability Guardrails',
      desc: 'Guarantees municipal accountability by requiring post-repair photographic evidence compared against the original incident, ensuring repairs are authentic before cases can be officially marked resolved.'
    }
  ];

  const values = [
    {
      icon: Users,
      title: 'Citizen-Centric Empowerment',
      desc: 'Turning every smartphone into a civic sensor. We make filing an actionable, municipal-grade grievance effortless in under 30 seconds.'
    },
    {
      icon: Building2,
      title: 'Pan-India Municipal Compatibility',
      desc: 'Engineered for seamless integration with Urban Local Bodies (ULBs), Municipal Corporations, and Smart City Integrated Command Centers across India.'
    },
    {
      icon: Shield,
      title: 'Privacy & EXIF Protection',
      desc: 'All uploaded imagery is sanitized of sensitive camera metadata and facial identifiers, safeguarding citizen privacy and whistleblower safety.'
    },
    {
      icon: Zap,
      title: 'Transparent Public Accountability',
      desc: 'Real-time public case tracking and open resolution timelines ensure no civic complaint is buried under municipal bureaucracy.'
    }
  ];

  const stats = [
    { label: 'Inference Latency', value: '< 4ms', desc: 'Accelerated GPU Vision Scan' },
    { label: 'Classification Accuracy', value: '88%+', desc: 'Across 8 Civic Defect Classes' },
    { label: 'Spatial Radius', value: '100m', desc: 'Precision Geo-Deduplication' },
    { label: 'Municipal Coverage', value: 'Pan-India', desc: 'National City & Urban Scope' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 pt-2">
      {/* ═══════ HERO BANNER ═══════ */}
      <div
        className="relative overflow-hidden p-8 sm:p-12 lg:p-14 rounded-3xl border border-white/90 space-y-6 shadow-xl transition-all duration-500"
        style={{
          backgroundImage: "url('/about-hero-banner.png?v=1')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <span>CivicLens AI — Pan-India Urban Infrastructure Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            Bridging the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700">Citizen Evidence</span> and Municipal Action.
          </h1>
          <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-semibold max-w-2xl drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            CivicLens AI transforms raw citizen photos into actionable, department-routed municipal cases. 
            By combining accelerated computer vision defect detection, deep multimodal safety investigation, 
            spatial deduplication, and verified repair audits, we empower communities to build safer, cleaner, 
            and more resilient Indian cities.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/report"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Report a Civic Issue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs sm:text-sm border border-slate-300 shadow-md hover:shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-600" />
              <span>Explore Live Incidents</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════ KEY METRICS STRIP ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-1 hover-lift"
          >
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {item.value}
            </p>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {item.label}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════ 5-PILLAR ARCHITECTURE ═══════ */}
      <div className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
            <Layers className="w-4 h-4" />
            <span>The CivicLens System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The 5 Pillars of Civic Resolution
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            From initial photo capture to verifiable repair closure, CivicLens enforces a complete, end-to-end civic accountability loop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-4 hover-lift flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-black flex items-center justify-center">
                      {pillar.num}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-full border border-slate-200/60">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Human-in-the-Loop Safeguard */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-white/20 text-white text-xs font-black flex items-center justify-center">
                  06
                </span>
                <span className="text-[10px] font-bold text-blue-100 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                  Ethical Governance
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
              </div>

              <h3 className="text-base font-black text-white leading-snug">
                Human-in-the-Loop Review
              </h3>

              <p className="text-xs text-blue-100 leading-relaxed font-normal">
                AI never files blindly. Citizens review, edit, and approve every generated complaint dossier before submission, ensuring full democratic transparency and municipal trust.
              </p>
            </div>

            <Link
              to="/report"
              className="mt-2 py-2.5 px-4 rounded-xl bg-white text-blue-700 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors"
            >
              <span>Test the Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════ OUR CORE VALUES ═══════ */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
            <Compass className="w-4 h-4" />
            <span>Guiding Principles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built for National Impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every feature in CivicLens is designed with municipal scalability, citizen ease, and institutional transparency in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-2xs border border-slate-200/60 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">{v.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════ PAN-INDIA CALLOUT BANNER ═══════ */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl space-y-4 text-center flex flex-col items-center">
        <div className="p-3 rounded-2xl bg-white/10 text-blue-400 border border-white/10 mb-1">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white max-w-xl">
          Empowering Communities in Every Indian Municipality
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Whether resolving a critical open drain in Pune, road potholes in Bengaluru, broken streetlights in Mumbai, or flooded water lines in Delhi, CivicLens AI brings real-time speed and undeniable evidence to public problem-solving.
        </p>
        <div className="pt-3">
          <Link
            to="/report"
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>File a Grievance Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
