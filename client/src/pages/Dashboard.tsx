import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  Zap,
  Calendar,
  Layers,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Wrench,
  Trash2,
  Lightbulb,
  Droplets,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  X,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { CivicMap } from '../components/CivicMap';
import { api } from '../lib/api';
import { CivicStats } from '../types';

/* ─── Distance Calculation Helper (Haversine) ─── */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/* ─── Top Stat Card with Sparkline Curve ─── */
interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  deltaText: string;
  deltaColor: string;
  waveColor: string;
  waveId: string;
  wavePath: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  deltaText,
  deltaColor,
  waveColor,
  waveId,
  wavePath,
}) => {
  return (
    <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_6px_20px_-4px_rgba(30,58,138,0.08)] flex items-center justify-between gap-2 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Left Icon Squircle */}
        <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Center: Label, Value, Trend */}
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block whitespace-nowrap">
            {label}
          </span>
          <p className="text-lg font-black text-slate-900 tabular-nums leading-tight">
            {value}
          </p>
          <p className={`text-[10px] font-bold ${deltaColor} whitespace-nowrap`}>
            {deltaText}
          </p>
        </div>
      </div>

      {/* Right: Smooth Gradient Sparkline Wave */}
      <div className="w-10 h-6 flex-shrink-0 flex items-center justify-end pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 80 36" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${waveId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waveColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={waveColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={`${wavePath} L 80 36 L 0 36 Z`} fill={`url(#grad-${waveId})`} />
          <path d={wavePath} fill="none" stroke={waveColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Selected filter tabs & UI state
  const [activeTab, setActiveTab] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All Issues');
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState<number>(0);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [showCallout, setShowCallout] = useState<boolean>(true);
  const [isLeftMinimized, setIsLeftMinimized] = useState<boolean>(false);
  const [isRightMinimized, setIsRightMinimized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real Database Cases & Stats
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState<CivicStats | null>(null);

  // Live User Location
  const [userLocationName, setUserLocationName] = useState<string>(() => {
    return localStorage.getItem('civiclens_user_location_name') || '';
  });

  const [userCoords, setUserCoords] = useState<[number, number] | null>(() => {
    try {
      const saved = localStorage.getItem('civiclens_user_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) return [Number(parsed.lat), Number(parsed.lng)];
      }
    } catch {}
    return null;
  });

  // Fetch real data from server API
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [casesRes, statsRes] = await Promise.all([
        api.getCases(),
        api.getStats().catch(() => null),
      ]);
      if (statsRes) setStats(statsRes);
      if (casesRes && casesRes.items && casesRes.items.length > 0) {
        setCases(casesRes.items);
      }
    } catch (err) {
      console.error('Failed to load real dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listen to live GPS location updates
  useEffect(() => {
    const handleLocUpdate = (e: any) => {
      if (e.detail?.address) {
        setUserLocationName(e.detail.address);
      }
      if (e.detail?.lat && e.detail?.lng) {
        setUserCoords([Number(e.detail.lat), Number(e.detail.lng)]);
      }
    };
    window.addEventListener('civiclens_location_updated', handleLocUpdate);
    return () => window.removeEventListener('civiclens_location_updated', handleLocUpdate);
  }, []);

  // Normalize real database cases with distance calculation
  const normalizedReports = useMemo(() => {
    if (!cases || cases.length === 0) return [];

    const list = cases.map((c) => {
      const lat = Number(c.latitude ?? 28.4744);
      const lng = Number(c.longitude ?? 77.504);
      const distKm = userCoords ? calculateDistanceKm(userCoords[0], userCoords[1], lat, lng) : null;

      const rawSev = (c.severity || 'HIGH').toUpperCase();
      const sevDisplay =
        rawSev === 'CRITICAL'
          ? 'Critical'
          : rawSev === 'HIGH'
          ? 'High'
          : rawSev === 'MEDIUM'
          ? 'Medium'
          : 'Low';
      const sevBadge = `▲ ${sevDisplay}`;

      const rawConf = Number(c.confidence ?? 0.95);
      const confidencePct = Math.round(rawConf <= 1 ? rawConf * 100 : rawConf);

      const dateStr = c.created_at
        ? new Date(c.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent';

      return {
        ...c,
        case_id: c.case_id,
        id: c.id || c.case_id,
        title: c.complaint_title || c.category,
        fullTitle: c.complaint_title || c.category,
        location: c.address || 'Greater Noida, Uttar Pradesh',
        fullAddress: c.address || 'Greater Noida, Uttar Pradesh',
        address: c.address,
        severity: sevDisplay,
        severityBadge: sevBadge,
        severityType: rawSev.toLowerCase(),
        date: dateStr,
        image: c.image_url || '/pothole-sample.jpg',
        category: c.category || 'Pothole',
        confidence: confidencePct,
        department: c.department || 'Municipal Authority',
        recommendedAction:
          c.recommended_action ||
          'Deploy rapid inspection and repair team. Ensure safety barricades are erected.',
        latitude: lat,
        longitude: lng,
        lat,
        lng,
        status: c.status || 'IN_PROGRESS',
        distanceKm: distKm,
      };
    });

    // If user coordinates exist, sort by nearest distance first so local issues in user's area appear at the top
    if (userCoords) {
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return list;
  }, [cases, userCoords]);

  // Tab counts dynamically calculated from real cases
  const tabCounts = useMemo(() => {
    const all = normalizedReports.length;
    const high = normalizedReports.filter(
      (c) => c.severity === 'High' || c.severity === 'Critical'
    ).length;
    const med = normalizedReports.filter((c) => c.severity === 'Medium').length;
    const low = normalizedReports.filter((c) => c.severity === 'Low').length;
    return { all, high, med, low };
  }, [normalizedReports]);

  // Filtered reports for the left panel
  const filteredReports = useMemo(() => {
    return normalizedReports.filter((r) => {
      if (activeCategory !== 'All Issues') {
        const catFilter = activeCategory.toLowerCase();
        const reportCat = (r.category || '').toLowerCase();
        if (!reportCat.includes(catFilter) && !catFilter.includes(reportCat)) {
          return false;
        }
      }
      if (
        locationSearch.trim() &&
        !r.location.toLowerCase().includes(locationSearch.toLowerCase()) &&
        !r.title.toLowerCase().includes(locationSearch.toLowerCase())
      ) {
        return false;
      }
      if (activeTab === 'High' && r.severity !== 'High' && r.severity !== 'Critical') return false;
      if (activeTab === 'Medium' && r.severity !== 'Medium') return false;
      if (activeTab === 'Low' && r.severity !== 'Low') return false;
      return true;
    });
  }, [normalizedReports, activeCategory, locationSearch, activeTab]);

  // Selected report
  const selectedReport =
    normalizedReports[activeEvidenceIndex] ||
    normalizedReports[0] || {
      case_id: 'CASE-2026-00144',
      title: 'Municipal Civic Issue',
      fullTitle: 'Critical Hazard: Open Uncovered Sewer Manhole',
      location: userLocationName || 'Pari Chowk, Greater Noida',
      fullAddress: userLocationName || 'Pari Chowk Junction Concourse, Greater Noida, UP',
      severity: 'Critical',
      severityBadge: '▲ Critical',
      severityType: 'critical',
      date: 'Oct 26, 2026',
      image: '/pothole-sample.jpg',
      category: 'Open Drain / Manhole',
      confidence: 98,
      department: 'Greater Noida Industrial Development Authority (GNIDA)',
      recommendedAction: 'Immediate barricading and placement of SFRC heavy-duty manhole cover.',
      latitude: userCoords ? userCoords[0] : 28.4682,
      longitude: userCoords ? userCoords[1] : 77.5098,
      status: 'IN_PROGRESS',
      distanceKm: 0.8,
    };

  // Carousel thumbnail images based on actual reports
  const carouselThumbnails = useMemo(() => {
    return normalizedReports.slice(0, 6).map((r, idx) => ({
      id: idx,
      case_id: r.case_id,
      src: r.image,
      alt: r.title,
    }));
  }, [normalizedReports]);

  const handleSelectCaseItem = (caseId: string) => {
    const idx = normalizedReports.findIndex((r) => r.case_id === caseId);
    if (idx !== -1) {
      setActiveEvidenceIndex(idx);
      setShowCallout(true);
      setIsRightMinimized(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      
      {/* ═══════ FULL-PAGE LIVE MAP CANVAS (Edge-to-Edge) ═══════ */}
      <div className="absolute inset-0 z-0">
        <CivicMap
          cases={normalizedReports as any}
          selectedCaseId={selectedReport.case_id}
          onSelectCase={(item: any) => {
            handleSelectCaseItem(item.case_id);
          }}
          disablePopups={true}
          className="w-full h-full border-none rounded-none"
        />
      </div>

      {/* ═══════ FLEX COLUMN OVERLAY CONTAINER (Guarantees zero overlap between rows) ═══════ */}
      <div className="relative z-10 w-full h-full pt-[76px] sm:pt-[80px] px-3 sm:px-5 pb-2.5 flex flex-col gap-2 pointer-events-none">
        
        {/* ROW 1: 6 Live Stat Cards */}
        <div className="w-full pointer-events-auto flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5 max-w-[1800px] mx-auto">
            <DashboardStatCard
              label="Total Reports"
              value={stats?.total ?? tabCounts.all}
              icon={FileText}
              iconBg="bg-blue-100/80"
              iconColor="text-blue-600"
              deltaText="▲ Active civic feed"
              deltaColor="text-emerald-600"
              waveColor="#3b82f6"
              waveId="stat-total"
              wavePath="M 0 28 C 20 28, 30 20, 45 24 C 60 28, 68 12, 80 14"
            />
            <DashboardStatCard
              label="Resolved Cases"
              value={stats?.resolved ?? normalizedReports.filter(c => c.status === 'RESOLVED').length}
              icon={CheckCircle2}
              iconBg="bg-emerald-100/80"
              iconColor="text-emerald-600"
              deltaText="▲ Verified resolution"
              deltaColor="text-emerald-600"
              waveColor="#10b981"
              waveId="stat-resolved"
              wavePath="M 0 32 C 25 32, 38 28, 50 18 C 60 10, 68 22, 80 14"
            />
            <DashboardStatCard
              label="In Progress"
              value={stats?.in_progress ?? normalizedReports.filter(c => c.status === 'IN_PROGRESS' || c.status === 'UNDER_INSPECTION').length}
              icon={Clock}
              iconBg="bg-amber-100/80"
              iconColor="text-amber-600"
              deltaText="Field crews deployed"
              deltaColor="text-amber-600"
              waveColor="#f59e0b"
              waveId="stat-progress"
              wavePath="M 0 30 C 22 30, 36 28, 48 24 C 58 20, 68 14, 80 16"
            />
            <DashboardStatCard
              label="High Priority"
              value={stats?.high_priority ?? tabCounts.high}
              icon={AlertCircle}
              iconBg="bg-rose-100/80"
              iconColor="text-rose-600"
              deltaText="Urgent SLA response"
              deltaColor="text-rose-600"
              waveColor="#f43f5e"
              waveId="stat-prio"
              wavePath="M 0 32 C 22 32, 36 29, 48 26 C 58 24, 68 12, 80 16"
            />
            <DashboardStatCard
              label="Resolution Rate"
              value={stats ? `${Math.round(stats.resolution_rate)}%` : `${Math.round((7 / (tabCounts.all || 12)) * 100)}%`}
              icon={BarChart2}
              iconBg="bg-emerald-100/80"
              iconColor="text-emerald-600"
              deltaText="▲ 48h SLA benchmark"
              deltaColor="text-emerald-600"
              waveColor="#10b981"
              waveId="stat-rate"
              wavePath="M 0 28 C 18 28, 30 18, 45 22 C 60 26, 70 12, 80 14"
            />
            <DashboardStatCard
              label="Avg. Resolution Time"
              value={stats ? `${stats.avg_resolution_hours.toFixed(1)}h` : '40.1h'}
              icon={Zap}
              iconBg="bg-blue-100/80"
              iconColor="text-blue-600"
              deltaText="Municipal turnaround"
              deltaColor="text-blue-600"
              waveColor="#3b82f6"
              waveId="stat-time"
              wavePath="M 0 30 C 20 30, 35 22, 50 24 C 62 26, 70 12, 80 14"
            />
          </div>
        </div>

        {/* ROW 2: Main Workspace (Left Panel + Center Map Area + Right Panel) */}
        <div className="flex-1 w-full min-h-0 relative flex justify-between items-stretch pointer-events-none pb-1 sm:pb-2">
          
          {/* Left Floating Panel: Recent Reports */}
          {isLeftMinimized ? (
            <button
              type="button"
              onClick={() => setIsLeftMinimized(false)}
              className="pointer-events-auto h-11 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_8px_25px_-5px_rgba(20,50,120,0.15)] flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer group flex-shrink-0"
              title="Expand Recent Reports"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recent Reports</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">{tabCounts.all}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          ) : (
            <aside className="w-[310px] lg:w-[330px] h-full pointer-events-auto flex flex-col flex-shrink-0 transition-all duration-300">
              <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl border border-white/90 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.12)] p-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Reports</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {tabCounts.all} live
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View all</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLeftMinimized(true)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Minimize panel"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs with real dynamic counts */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 mb-3 flex-shrink-0">
                  {[
                    { id: 'All', label: 'All', count: tabCounts.all },
                    { id: 'High', label: 'High', count: tabCounts.high },
                    { id: 'Medium', label: 'Med', count: tabCounts.med },
                    { id: 'Low', label: 'Low', count: tabCounts.low },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1 rounded-full ${activeTab === tab.id ? 'bg-blue-500/40 text-white' : 'text-slate-400'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Scrollable Reports List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredReports.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No reports found matching this criteria.
                    </div>
                  ) : (
                    filteredReports.map((report) => {
                      const isSelected = selectedReport.case_id === report.case_id;
                      return (
                        <div
                          key={report.case_id}
                          onClick={() => handleSelectCaseItem(report.case_id)}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-200 shadow-sm'
                              : 'bg-white hover:bg-slate-50/80 border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <img
                            src={report.image}
                            alt={report.title}
                            onError={(e) => { e.currentTarget.src = '/pothole-sample.jpg'; }}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-mono font-bold text-blue-600">{report.case_id}</span>
                              <div className="flex items-center gap-1">
                                {report.distanceKm !== null && report.distanceKm !== undefined && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {report.distanceKm < 1 ? `${Math.round(report.distanceKm * 1000)}m` : `${report.distanceKm}km`}
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                  report.severity === 'Critical' || report.severity === 'High'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {report.severityBadge}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {report.title}
                            </h4>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                              <span className="truncate max-w-[130px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{report.location}</span>
                              </span>
                              <span className="text-slate-400 font-medium">{report.date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Center Open Map Area: Controls & Callout */}
          <div className="flex-1 relative pointer-events-none mx-3 flex flex-col justify-between">
            {/* Top Map Controls: Cleanly floating beside the left panel */}
            <div className="pointer-events-auto self-start flex items-center gap-2">
              {/* Actual Live Location Indicator Pill */}
              <button
                type="button"
                onClick={() => {
                  if (userLocationName) {
                    window.dispatchEvent(new CustomEvent('civiclens_recenter_user_location'));
                  } else {
                    window.dispatchEvent(new CustomEvent('civiclens_open_location_modal'));
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-white hover:text-blue-600 transition-colors"
                title="Click to center map on your actual location"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="truncate max-w-[160px] sm:max-w-[200px]">
                  {userLocationName ? userLocationName : 'Locate Me'}
                </span>
              </button>

              <div className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-md text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Intelligence Feed</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-md text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Active Layers</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                }}
                className="p-2 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-md text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Pin Callout Card */}
            {showCallout && selectedReport && (
              <div className="hidden lg:flex flex-col items-center absolute top-[44%] left-[50%] -translate-x-1/2 -translate-y-full z-15 pointer-events-auto transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-100 flex flex-col gap-2 min-w-[280px] max-w-[320px] relative">
                  {/* Header row with ID, badge, distance, and close button */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{selectedReport.case_id}</span>
                    <div className="flex items-center gap-1.5">
                      {selectedReport.distanceKm !== null && selectedReport.distanceKm !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-200">
                          {selectedReport.distanceKm < 1 ? `${Math.round(selectedReport.distanceKm * 1000)}m away` : `${selectedReport.distanceKm} km away`}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold border border-rose-200">
                        {selectedReport.severityBadge}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCallout(false)}
                        className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                        title="Close callout"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content row */}
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedReport.image}
                      alt={selectedReport.title}
                      onError={(e) => { e.currentTarget.src = '/pothole-sample.jpg'; }}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">{selectedReport.title}</p>
                      <p className="text-[10.5px] text-slate-500 flex items-center gap-1 truncate pt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{selectedReport.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    onClick={() => navigate(`/case/${selectedReport.case_id}`)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Track Case Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {/* Pointer Arrow */}
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm -mt-0.5" />
              </div>
            )}

            {/* Bottom-Center Floating Filter Bar: Cleanly bounded inside the Center Open Map Area */}
            <div className="pointer-events-auto self-center mb-1 max-w-[calc(100%-16px)] flex items-center gap-1.5 bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/90 shadow-[0_10px_35px_-5px_rgba(20,50,120,0.18)] overflow-x-auto custom-scrollbar flex-nowrap">
              {/* Location Search Input */}
              <div className="flex items-center gap-1.5 pl-1 pr-1.5 flex-shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search location..."
                  className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none w-24 sm:w-28 font-medium"
                />
              </div>

              <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

              {/* Category Filter Pills - whitespace-nowrap guaranteed */}
              <button
                type="button"
                onClick={() => setActiveCategory('All Issues')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'All Issues'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>All Issues</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === 'Pothole' ? 'All Issues' : 'Pothole')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'Pothole'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Pothole</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === 'Water' ? 'All Issues' : 'Water')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'Water'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Droplets className="w-3 h-3 text-cyan-500" />
                <span>Water Leakage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === 'Manhole' ? 'All Issues' : 'Manhole')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'Manhole'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>Manhole</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === 'Streetlight' ? 'All Issues' : 'Streetlight')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'Streetlight'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Streetlight</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === 'Garbage' ? 'All Issues' : 'Garbage')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === 'Garbage'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Trash2 className="w-3 h-3 text-purple-600" />
                <span>Garbage</span>
              </button>
            </div>
          </div>

          {/* Right Floating Panel: AI Evidence Review */}
          {isRightMinimized ? (
            <button
              type="button"
              onClick={() => setIsRightMinimized(false)}
              className="pointer-events-auto h-11 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_8px_25px_-5px_rgba(20,50,120,0.15)] flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer group flex-shrink-0"
              title="Expand AI Evidence Review"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Evidence</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                {selectedReport.confidence}%
              </span>
            </button>
          ) : (
            <aside className="w-[360px] xl:w-[380px] h-full pointer-events-auto flex flex-col flex-shrink-0 transition-all duration-300">
              <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_15px_35px_-5px_rgba(20,50,120,0.12)] p-3.5 sm:p-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0 pb-2.5">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">AI Evidence Review</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>{activeEvidenceIndex + 1} of {normalizedReports.length || 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const len = normalizedReports.length;
                          if (len > 0) {
                            handleSelectCaseItem(normalizedReports[(activeEvidenceIndex > 0 ? activeEvidenceIndex - 1 : len - 1)].case_id);
                          }
                        }}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Previous Case"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const len = normalizedReports.length;
                          if (len > 0) {
                            handleSelectCaseItem(normalizedReports[(activeEvidenceIndex < len - 1 ? activeEvidenceIndex + 1 : 0)].case_id);
                          }
                        }}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Next Case"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => setIsRightMinimized(true)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                        title="Minimize panel"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar min-h-0">
                  {/* Main Photo with Signature Cyan AI Bounding Box */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] max-h-[145px] bg-slate-900 shadow-md flex-shrink-0">
                    <img
                      src={selectedReport.image}
                      alt={selectedReport.fullTitle}
                      onError={(e) => { e.currentTarget.src = '/pothole-sample.jpg'; }}
                      className="w-full h-full object-cover"
                    />
                    {/* AI Bounding Box Reticle */}
                    <div className="absolute inset-x-6 inset-y-4 border-2 border-cyan-400 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                    </div>

                    {/* Top-Left Category Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-md">
                      {selectedReport.category}
                    </div>

                    {/* Top-Right AI Confidence Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold shadow-md flex items-center gap-1 border border-emerald-500/30">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      <span>AI Confidence {selectedReport.confidence}%</span>
                    </div>
                  </div>

                  {/* Carousel Thumbnail Row from real cases */}
                  <div className="flex items-center gap-1.5 justify-between flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const len = normalizedReports.length;
                        if (len > 0) {
                          handleSelectCaseItem(normalizedReports[(activeEvidenceIndex > 0 ? activeEvidenceIndex - 1 : len - 1)].case_id);
                        }
                      }}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <div className="grid grid-cols-4 gap-1.5 flex-1">
                      {carouselThumbnails.slice(0, 4).map((thumb) => (
                        <div
                          key={thumb.id}
                          onClick={() => handleSelectCaseItem(thumb.case_id)}
                          className={`relative rounded-xl overflow-hidden aspect-[4/3] h-9 cursor-pointer transition-all ${
                            selectedReport.case_id === thumb.case_id
                              ? 'ring-2 ring-blue-600 shadow-sm'
                              : 'opacity-70 hover:opacity-100 border border-slate-200'
                          }`}
                        >
                          <img
                            src={thumb.src}
                            alt={thumb.alt}
                            onError={(e) => { e.currentTarget.src = '/pothole-sample.jpg'; }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const len = normalizedReports.length;
                        if (len > 0) {
                          handleSelectCaseItem(normalizedReports[(activeEvidenceIndex < len - 1 ? activeEvidenceIndex + 1 : 0)].case_id);
                        }
                      }}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Case Identification & Title */}
                  <div className="space-y-0.5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Case ID</span>
                      <span className="text-xs font-mono font-black text-blue-600">{selectedReport.case_id}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold border border-rose-200">
                        {selectedReport.severityBadge} Priority
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                      {selectedReport.fullTitle}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{selectedReport.fullAddress}</span>
                    </p>
                  </div>

                  {/* 3 Metric Pills Row */}
                  <div className="grid grid-cols-3 gap-1.5 flex-shrink-0">
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Severity</span>
                      <span className="text-xs font-black text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                        <span>{selectedReport.severity}</span>
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Confidence</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                        <BarChart2 className="w-2.5 h-2.5 text-emerald-500" />
                        <span>{selectedReport.confidence}%</span>
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                      <span className="text-[10px] font-black text-slate-800 truncate block">
                        {selectedReport.department}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Action Card */}
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Wrench className="w-3 h-3" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="text-[11px] font-bold text-slate-900">Recommended Action</h5>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-normal line-clamp-2">
                        {selectedReport.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky CTA Track Case Details Button at Bottom */}
                <div className="pt-2 flex-shrink-0 border-t border-slate-100/80">
                  <button
                    type="button"
                    onClick={() => navigate(`/case/${selectedReport.case_id}`)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-100"
                  >
                    <span>Track Case Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
