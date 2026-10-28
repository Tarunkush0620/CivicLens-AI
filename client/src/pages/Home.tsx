import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Layers,
  Activity,
  Zap,
  Eye,
  Clock,
  Globe2,
  Shield,
  BarChart3,
  Bell,
  AlertCircle,
  BarChart2,
  Image as ImageIcon,
  FileCheck,
  Send,
  Wrench,
  Building2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import { CivicStats, ComplaintRecord } from '../types';
import { CivicMap } from '../components/CivicMap';
import { useScrollReveal, useAnimatedCounter } from '../lib/useScrollReveal';

/* ─── Animated Counter Card with Sparkline & Trend (Matching Image 1) ─── */
const StatCard: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trendText: string;
  trendColor: string;
  trendPositive?: boolean;
  neutralTrend?: boolean;
  waveColor: string;
  waveId: string;
  wavePath?: string;
  delay: number;
}> = ({
  label,
  value,
  suffix,
  icon: Icon,
  iconBg,
  iconColor,
  trendText,
  trendColor,
  trendPositive,
  neutralTrend,
  waveColor,
  waveId,
  wavePath = 'M 0 28 Q 22 26, 42 16 T 80 8',
  delay,
}) => {
  const { ref, isVisible } = useScrollReveal();
  const animatedValue = useAnimatedCounter(value, 1400, isVisible);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(30,58,138,0.06)] flex items-center justify-between gap-3 hover-lift group transition-all duration-500 overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-1'
      }`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Left Icon Square */}
        <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Center: Label, Value, Trend */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
            {label}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {animatedValue}{suffix || ''}
          </p>
          <div className={`flex items-center gap-1 text-[11px] font-bold ${trendColor}`}>
            {!neutralTrend && trendPositive && <span className="text-[9px]">▲</span>}
            {!neutralTrend && !trendPositive && <span className="text-[9px]">▲</span>}
            <span>{trendText}</span>
          </div>
        </div>
      </div>

      {/* Right: Smooth Gradient Sparkline Wave */}
      <div className="w-16 sm:w-20 h-10 flex-shrink-0 flex items-center justify-end pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 80 36" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${waveId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={waveColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`${wavePath} L 80 36 L 0 36 Z`}
            fill={`url(#grad-${waveId})`}
          />
          <path
            d={wavePath}
            fill="none"
            stroke={waveColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

/* ─── Marquee Ticker Item ─── */
const TickerItem: React.FC<{ icon: React.ElementType; text: string; color: string }> = ({
  icon: Icon,
  text,
  color,
}) => (
  <div className="flex items-center gap-2 px-5 py-2.5 whitespace-nowrap select-none">
    <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
    <span className="text-xs font-semibold text-slate-700">{text}</span>
    <span className="w-1 h-1 rounded-full bg-slate-300" />
  </div>
);

export const Home: React.FC = () => {
  const [stats, setStats] = useState<CivicStats | null>(null);
  const [recentCases, setRecentCases] = useState<ComplaintRecord[]>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => { });
    api.getCases({ fields: 'map' }).then((res) => setRecentCases(res.items.slice(0, 8))).catch(() => { });
  }, []);

  const heroRef = useScrollReveal();
  const stepsRef = useScrollReveal();
  const mapRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const tickerItems = [
    { icon: Sparkles, text: 'Civic Vision AI — Deep Infrastructure Intelligence', color: 'text-blue-600' },
    { icon: Activity, text: '< 1.2s Average Analysis Speed', color: 'text-emerald-600' },
    { icon: Shield, text: '88% Classification Accuracy', color: 'text-indigo-600' },
    { icon: MapPin, text: '100m Spatial Deduplication Radius', color: 'text-amber-600' },
    { icon: Eye, text: 'Before/After Visual Resolution Audit', color: 'text-rose-600' },
    { icon: Globe2, text: 'Pan-India Municipal Coverage', color: 'text-cyan-600' },
    { icon: Clock, text: '91% Severity Agreement ±1 Level', color: 'text-purple-600' },
    { icon: Bell, text: 'Real-Time Live Case Streaming', color: 'text-blue-600' },
    { icon: BarChart3, text: 'Automated Department Routing & SLAs', color: 'text-emerald-600' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Evidence',
      desc: 'Capture or upload a photo of the issue with location details. Supports images from any device.',
      icon: Camera,
      iconBg: 'bg-blue-100/70',
      iconColor: 'text-blue-600',
      barColor: 'bg-blue-600',
    },
    {
      step: '02',
      title: 'Vision AI Analysis',
      desc: 'Automatically detects and classifies the issue with severity, category and relevant details.',
      icon: ImageIcon,
      iconBg: 'bg-purple-100/70',
      iconColor: 'text-purple-600',
      barColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    },
    {
      step: '03',
      title: 'Spatial Deduplication',
      desc: 'Matches with nearby reports to prevent duplicates and groups similar issues across the city.',
      icon: MapPin,
      iconBg: 'bg-amber-100/70',
      iconColor: 'text-amber-600',
      barColor: 'bg-gradient-to-r from-amber-500 to-orange-400',
    },
    {
      step: '04',
      title: 'Track & Verify',
      desc: 'Monitor the status in real time until the issue is resolved, with before/after verification.',
      icon: FileCheck,
      iconBg: 'bg-emerald-100/70',
      iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* ═══════ HERO SECTION (Matching User Reference) ═══════ */}
      <section
        ref={heroRef.ref}
        className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 min-h-[500px] sm:min-h-[540px] flex items-center transition-all duration-700 border border-white/90 shadow-2xl ${
          heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-1'
        }`}
        style={{
          backgroundImage: "url('/hero-banner.png?v=3')",
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Pure text directly on the banner with enhanced contrast colors (no white card background) */}
        <div className="relative z-10 max-w-[400px] sm:max-w-[450px] lg:max-w-[480px] space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            See it. Report it.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700">
              Fix it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-900 leading-relaxed font-semibold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            Turn a single smartphone photo of a pothole, open manhole, or broken streetlight into a verified, trackable municipal ticket with automated severity scoring, spatial deduplication, and photographic resolution audits in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ring-1 ring-white/20 whitespace-nowrap cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue Now</span>
            </Link>

            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer"
            >
              <span>Explore Civic Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ INFINITE MARQUEE TICKER ═══════ */}
      <section className="rounded-2xl border border-white/80 premium-card py-1 marquee-container">
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <TickerItem key={idx} icon={item.icon} text={item.text} color={item.color} />
          ))}
        </div>
      </section>

      {/* ═══════ 4 LIVE STATS (Matching Image 1) ═══════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Grievances"
          value={stats?.total || 5}
          icon={Layers}
          iconBg="bg-blue-100/70"
          iconColor="text-blue-600"
          trendText="+2 this week"
          trendColor="text-emerald-600"
          trendPositive={true}
          waveColor="#3b82f6"
          waveId="blue"
          wavePath="M 0 30 C 20 30, 32 30, 46 22 C 56 16, 68 20, 80 12"
          delay={0}
        />
        <StatCard
          label="Resolved Cases"
          value={stats?.resolved || 0}
          icon={CheckCircle2}
          iconBg="bg-emerald-100/70"
          iconColor="text-emerald-600"
          trendText="No change"
          trendColor="text-slate-400"
          neutralTrend={true}
          waveColor="#10b981"
          waveId="green"
          wavePath="M 0 32 C 28 32, 38 32, 50 18 C 58 10, 68 22, 80 14"
          delay={100}
        />
        <StatCard
          label="High Priority"
          value={3}
          icon={AlertCircle}
          iconBg="bg-rose-100/70"
          iconColor="text-rose-600"
          trendText="+1 this week"
          trendColor="text-rose-600"
          trendPositive={false}
          waveColor="#f43f5e"
          waveId="red"
          wavePath="M 0 32 C 22 32, 36 29, 48 27 C 58 25, 68 14, 80 16"
          delay={200}
        />
        <StatCard
          label="Resolution Rate"
          value={stats?.resolution_rate || 88}
          suffix="%"
          icon={BarChart2}
          iconBg="bg-purple-100/70"
          iconColor="text-purple-600"
          trendText="+12% vs last month"
          trendColor="text-emerald-600"
          trendPositive={true}
          waveColor="#8b5cf6"
          waveId="purple"
          wavePath="M 0 30 C 18 30, 32 20, 48 22 C 60 24, 70 12, 80 14"
          delay={300}
        />
      </section>

      {/* ═══════ 4-STEP PROCESS (Matching Image 1) ═══════ */}
      <section
        ref={stepsRef.ref}
        className={`space-y-6 transition-all duration-700 ${stepsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-1'}`}
      >
        <div className="flex items-center justify-between px-1">
          <div className="border-l-4 border-blue-600 pl-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Multimodal Civic Intelligence Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              From citizen smartphone photos to closed municipal workflows in a few simple steps.
            </p>
          </div>
          <Link
            to="/report"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer hover:underline"
          >
            <span>Try demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 relative">
          {steps.map((st, idx) => (
            <div key={st.step} className="relative flex flex-col">
              <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(30,58,138,0.06)] flex-1 flex flex-col justify-between space-y-4 hover-lift group relative overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    {st.step}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl ${st.iconBg} ${st.iconColor} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300`}>
                    <st.icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>

                {/* Bottom colored progress accent line */}
                <div className={`w-16 h-1 rounded-full ${st.barColor} mt-2`} />
              </div>

              {/* Dotted Arrow Connector between cards (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-6 pointer-events-none">
                  <div className="absolute w-full border-t-2 border-dotted border-blue-200" />
                  <div className="relative w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-500 flex items-center justify-center text-[11px] font-bold shadow-xs">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ MAP PREVIEW SECTION ═══════ */}
      <section
        ref={mapRef.ref}
        className={`space-y-4 transition-all duration-700 ${mapRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-1'}`}
      >
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Active Infrastructure Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Live reported civic issues across Indian cities.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View full dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-3xl overflow-hidden border border-white/80 premium-card-elevated">
          <CivicMap
            cases={recentCases}
            className="h-[420px] rounded-none border-none"
          />
        </div>
      </section>

      {/* ═══════ BOTTOM CTA BANNER (With User Custom Background) ═══════ */}
      <section
        ref={ctaRef.ref}
        className={`rounded-[2.5rem] p-6 sm:p-10 lg:p-12 overflow-hidden border border-white/90 shadow-[0_25px_60px_-15px_rgba(20,50,120,0.08)] relative transition-all duration-700 ${
          ctaRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-1'
        }`}
      >
        {/* Full Image Background (Image 1 provided by user) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/cta-banner-bg.png"
            alt="CTA Banner Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* 3-Column Interactive Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center relative z-10">
          
          {/* ──── LEFT: Tilted Polaroid Photo with AI Reticle ──── */}
          <div className="col-span-12 lg:col-span-3 flex justify-center lg:justify-start items-center relative">
            {/* Background street grid lines */}
            <svg className="absolute -left-4 -bottom-6 w-48 h-48 text-blue-200/40 pointer-events-none" viewBox="0 0 120 120" fill="none">
              <line x1="10" y1="24" x2="110" y2="24" stroke="currentColor" strokeWidth="2.5" />
              <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="3.5" />
              <line x1="10" y1="96" x2="110" y2="96" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="5" x2="30" y2="115" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="5" x2="75" y2="115" stroke="currentColor" strokeWidth="3.5" />
            </svg>

            {/* Flight trail dotted line + paper airplane */}
            <svg className="absolute -right-2 -top-6 w-28 h-28 text-blue-400 pointer-events-none overflow-visible hidden sm:block" viewBox="0 0 100 100" fill="none">
              <path d="M 10 90 C 25 40, 55 15, 90 20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            <div className="absolute right-1 -top-1 text-blue-500 -rotate-12 pointer-events-none hidden sm:block">
              <Send className="w-4 h-4 fill-blue-400 text-blue-500" />
            </div>

            {/* The Tilted Photo Card */}
            <div className="relative -rotate-3 hover:rotate-0 transition-transform duration-500 ease-out p-3.5 bg-white rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100/90 max-w-[240px] w-full">
              {/* Photo container */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                <img
                  src="/pothole-sample.jpg"
                  alt="Pothole Detection"
                  className="w-full h-full object-cover"
                />
                {/* AI Detection Reticle */}
                <div className="absolute inset-x-4 inset-y-3.5 border-2 border-cyan-400 bg-cyan-400/15 rounded-md flex items-center justify-center">
                  {/* Corner reticle marks */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                </div>
              </div>

              {/* Floating Detection Badge */}
              <div className="absolute -top-3.5 -right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Pothole Detected</p>
                  <p className="text-[9px] font-semibold text-slate-400">Confidence 98%</p>
                </div>
              </div>

              {/* Floating Camera Circle Badge at bottom right */}
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-white hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ──── CENTER: Headline, Subtitle, & CTA Action Buttons ──── */}
          <div className="col-span-12 lg:col-span-6 text-center space-y-4">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/70 text-slate-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI-Powered Civic Action Platform</span>
            </div>

            {/* Heading with styled "Your Ward?" and teal brush stroke */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Spot an Infrastructure<br />
              Issue in{' '}
              <span className="relative inline-block">
                <span className="text-[#06b6d4]">Your</span>{' '}
                <span className="text-[#2563eb]">Ward?</span>
                {/* Curved mint brush underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#2dd4bf] overflow-visible"
                  viewBox="0 0 160 12"
                  fill="none"
                >
                  <path
                    d="M 4 8 C 40 2, 100 2, 156 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed pt-1 font-normal">
              Report it with a single photo. Our AI analyzes, verifies, and routes the issue to the right municipal department in seconds.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/report"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>File an Issue Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-blue-600" />
                <span>About CivicLens AI</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              </Link>
            </div>
          </div>

          {/* ──── RIGHT: Floating Map & Municipal Ticket Cards ──── */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-3.5 justify-center items-center lg:items-end relative">
            {/* Dotted curved connector on left of cards */}
            <svg className="hidden lg:block absolute -left-6 top-8 bottom-8 w-8 text-blue-300 pointer-events-none" viewBox="0 0 32 160" fill="none">
              <path d="M 28 10 C 4 40, 4 120, 28 150" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Card 1: Map Tile & Department Routing Status */}
            <div className="w-full max-w-[270px] p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border border-slate-100 flex items-center gap-3 hover:shadow-lg transition-shadow">
              {/* Map thumbnail with radar beacon */}
              <div className="w-20 h-20 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200/60">
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:14px_14px]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-white border-x border-slate-200/80 -translate-x-1/2" />
                <div className="absolute top-1/2 left-0 right-0 h-3 bg-white border-y border-slate-200/80 -translate-y-1/2" />
                {/* Radar ripples */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-400/20 animate-ping" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500/25" />
                {/* Pin marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-3 h-3 fill-white" />
                </div>
              </div>

              {/* 4 Department Status Indicators */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                    <Bell className="w-2.5 h-2.5" />
                  </div>
                  <div className="h-1.5 rounded-full bg-rose-200 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </div>
                  <div className="h-1.5 rounded-full bg-amber-200 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                    <Wrench className="w-2.5 h-2.5" />
                  </div>
                  <div className="h-1.5 rounded-full bg-blue-200 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                    <Building2 className="w-2.5 h-2.5" />
                  </div>
                  <div className="h-1.5 rounded-full bg-emerald-200 flex-1" />
                </div>
              </div>
            </div>

            {/* Card 2: Issue Assigned & Progress Stepper */}
            <div className="w-full max-w-[270px] p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border border-slate-100 flex items-center gap-3 hover:shadow-lg transition-shadow">
              {/* Resolved street photo */}
              <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/60">
                <img
                  src="/clean-road.jpg"
                  alt="Resolved Road"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status text & progress stepper */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">Issue Assigned</p>
                    <p className="text-[9px] text-slate-500 font-medium">To Municipal Team</p>
                  </div>
                </div>

                {/* 3-Step Progress Stepper */}
                <div className="flex items-center gap-1.5 pl-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="h-0.5 flex-1 bg-emerald-500" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <div className="h-0.5 flex-1 bg-slate-200" />
                  <div className="w-2 h-2 rounded-full border border-slate-300 bg-white" />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ──── BOTTOM STATS BAR: 4 Pillars with Vertical Dividers ──── */}
        <div className="pt-6 mt-8 border-t border-slate-200/70 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {/* Pillar 1: 100% EXIF Metadata Stripping */}
          <div className="flex items-center gap-3 lg:pr-6">
            <div className="w-11 h-11 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">100% EXIF</p>
              <p className="text-[11px] text-slate-500">Metadata Stripping</p>
            </div>
          </div>

          {/* Pillar 2: Sub-Second AI Analysis */}
          <div className="flex items-center gap-3 lg:border-l lg:border-slate-200/80 lg:pl-6 lg:pr-6">
            <div className="w-11 h-11 rounded-full bg-amber-100/70 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Sub-Second</p>
              <p className="text-[11px] text-slate-500">AI Analysis</p>
            </div>
          </div>

          {/* Pillar 3: 100m Spatial Duplicate Filtering */}
          <div className="flex items-center gap-3 lg:border-l lg:border-slate-200/80 lg:pl-6 lg:pr-6">
            <div className="w-11 h-11 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">100m Spatial</p>
              <p className="text-[11px] text-slate-500">Duplicate Filtering</p>
            </div>
          </div>

          {/* Pillar 4: Auditable Before/After Proof */}
          <div className="flex items-center gap-3 lg:border-l lg:border-slate-200/80 lg:pl-6">
            <div className="w-11 h-11 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Auditable</p>
              <p className="text-[11px] text-slate-500">Before/After Proof</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
