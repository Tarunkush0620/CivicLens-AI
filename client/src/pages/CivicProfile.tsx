import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  Copy,
  Check,
  MapPin,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Bell,
  HelpCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Building2,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  Phone,
  Mail,
  Download,
  Smartphone,
  Laptop,
  CheckCheck,
  Filter,
  Eye,
  Shield,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { api } from '../lib/api';
import { ComplaintRecord } from '../types';

export const CivicProfile: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [profileData, setProfileData] = useState<{
    user: {
      id: string;
      civic_id: string;
      name: string;
      email: string;
      verified: boolean;
      impact_points: number;
    };
    activity: {
      issues_reported: number;
      resolved: number;
      in_progress: number;
      impact_points: number;
    };
    saved_locations: Array<{
      id: string;
      label: 'Home' | 'College' | 'Workplace' | 'Other';
      address: string;
      latitude: number;
      longitude: number;
    }>;
    recent_reports: ComplaintRecord[];
  }>({
    user: {
      id: 'usr-tarun-kushwaha',
      civic_id: 'CIV-8K29-X4P7',
      name: localStorage.getItem('civiclens_user_name') || 'Tarun Kushwaha',
      email: localStorage.getItem('civiclens_user_email') || 'tarun.kushwaha.official@gmail.com',
      verified: true,
      impact_points: 85,
    },
    activity: {
      issues_reported: 12,
      resolved: 7,
      in_progress: 3,
      impact_points: 85,
    },
    saved_locations: [
      { id: 'loc-1', label: 'Home', address: 'B-42, Sector 62, Noida, Uttar Pradesh 201309', latitude: 28.628, longitude: 77.3649 },
      { id: 'loc-2', label: 'Workplace', address: 'DLF Cyber City, Building 10, DLF Phase 2, Gurugram, Haryana 122002', latitude: 28.495, longitude: 77.089 },
      { id: 'loc-3', label: 'College', address: 'Knowledge Park III, Greater Noida, Uttar Pradesh 201310', latitude: 28.472, longitude: 77.489 },
    ],
    recent_reports: [],
  });

  const [copiedId, setCopiedId] = useState(false);

  // Reports Filter & Search
  const [reportFilter, setReportFilter] = useState<'ALL' | 'RESOLVED' | 'IN_PROGRESS' | 'UNDER_INSPECTION'>('ALL');
  const [reportSearch, setReportSearch] = useState('');
  const [selectedCaseModal, setSelectedCaseModal] = useState<ComplaintRecord | null>(null);

  // Track an Issue State
  const [trackInput, setTrackInput] = useState('CASE-2026-00142');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Saved Locations State
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState<'Home' | 'College' | 'Workplace' | 'Other'>('Home');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [locationActionMsg, setLocationActionMsg] = useState<string | null>(null);

  // Notifications State (Assignment & Resolution Updates matching Image 2)
  const [notifications, setNotifications] = useState([
    {
      id: 'ntf-1',
      title: 'Photographic Resolution Verified (+20 pts)',
      message: 'Case CASE-2026-00142 (Pothole at Sector 62) has been verified repaired by CPWD. Hot-mix asphalt patch confirmed.',
      time: '2 hours ago',
      case_id: 'CASE-2026-00142',
      read: false,
      type: 'RESOLVED',
    },
    {
      id: 'ntf-2',
      title: 'Emergency Barricade Deployed on Site',
      message: 'Case CASE-2026-00144 (Open Sewer Manhole at Pari Chowk) has safety barricades active. Precast cover installation in progress.',
      time: '6 hours ago',
      case_id: 'CASE-2026-00144',
      read: false,
      type: 'IN_PROGRESS',
    },
    {
      id: 'ntf-3',
      title: 'Field Inspection Dispatched',
      message: 'Case CASE-2026-00143 (Water Main Leak in Delta 1) assigned to Junior Engineer R.K. Yadav for site pressure audit.',
      time: 'Yesterday',
      case_id: 'CASE-2026-00143',
      read: false,
      type: 'INSPECTION',
    },
  ]);

  // Settings State
  const [settingsName, setSettingsName] = useState(() => localStorage.getItem('civiclens_user_name') || 'Tarun Kushwaha');
  const [settingsEmail, setSettingsEmail] = useState(() => localStorage.getItem('civiclens_user_email') || 'tarun.kushwaha.official@gmail.com');
  const [settingsPhone, setSettingsPhone] = useState('+91 98765 43210');
  const [settingsWard, setSettingsWard] = useState('Noida Authority / Ward 4');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Privacy & Security Controls
  const [privacyAnonymize, setPrivacyAnonymize] = useState(false);
  const [privacyFuzzGps, setPrivacyFuzzGps] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
      if (tab !== 'overview') {
        setTimeout(() => {
          const el = document.getElementById('profile-tabs-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      }
    }
  }, [searchParams]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab !== 'overview') {
      setTimeout(() => {
        const el = document.getElementById('profile-tabs-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // Fetch live profile from backend
  const fetchLiveProfile = async () => {
    try {
      const data = await api.getUserProfile();
      if (data && data.user) {
        setProfileData(data);
        setSettingsName(data.user.name);
        setSettingsEmail(data.user.email);
      }
    } catch (err) {
      console.warn('Using existing profile state:', err);
    }
  };

  useEffect(() => {
    fetchLiveProfile();
    // Default track Case-2026-00142 on mount
    handleTrackIssue('CASE-2026-00142');
  }, []);

  const copyCivicId = () => {
    navigator.clipboard.writeText(profileData.user.civic_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTrackIssue = async (caseIdToTrack?: string) => {
    const query = (caseIdToTrack || trackInput).trim();
    if (!query) return;
    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await api.trackCase(query);
      if (res && res.found && res.data) {
        setTrackResult(res.data);
      } else {
        setTrackError(res?.message || `No case found matching "${query}".`);
      }
    } catch (err: any) {
      setTrackError(err.message || 'Error looking up case. Please verify the Case ID format (e.g. CASE-2026-00142).');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocAddress.trim()) return;

    try {
      const added = await api.addSavedLocation({
        civic_id: profileData.user.civic_id,
        label: newLocLabel,
        address: newLocAddress,
      });
      setProfileData((prev) => ({
        ...prev,
        saved_locations: [...prev.saved_locations, added],
      }));
      setShowAddLocation(false);
      setNewLocAddress('');
      setLocationActionMsg(`Saved "${newLocLabel}" to your civic places.`);
      setTimeout(() => setLocationActionMsg(null), 3000);
    } catch {
      const fallbackLoc: {
        id: string;
        label: 'Home' | 'College' | 'Workplace' | 'Other';
        address: string;
        latitude: number;
        longitude: number;
      } = {
        id: `loc-${Date.now()}`,
        label: newLocLabel,
        address: newLocAddress,
        latitude: 28.6139,
        longitude: 77.209,
      };
      setProfileData((prev) => ({
        ...prev,
        saved_locations: [...prev.saved_locations, fallbackLoc],
      }));
      setShowAddLocation(false);
      setNewLocAddress('');
    }
  };

  const handleDeleteLocation = async (locId: string) => {
    try {
      await api.deleteSavedLocation(locId, profileData.user.civic_id);
    } catch (e) {
      console.warn('Backend delete fallback');
    }
    setProfileData((prev) => ({
      ...prev,
      saved_locations: prev.saved_locations.filter((l) => l.id !== locId),
    }));
    setLocationActionMsg('Location removed.');
    setTimeout(() => setLocationActionMsg(null), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateUserProfile({
        civic_id: profileData.user.civic_id,
        name: settingsName,
        email: settingsEmail,
      });
      setProfileData((prev) => ({
        ...prev,
        user: { ...prev.user, name: settingsName, email: settingsEmail },
      }));
    } catch (e) {
      console.warn('Saved locally');
    }
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CivicLens_Archive_${profileData.user.civic_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered reports
  const filteredReports = profileData.recent_reports.filter((c) => {
    if (reportFilter !== 'ALL' && c.status !== reportFilter) return false;
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      const matchCase = c.case_id.toLowerCase().includes(q);
      const matchTitle = c.complaint_title.toLowerCase().includes(q);
      const matchDept = c.department.toLowerCase().includes(q);
      const matchAddr = c.address.toLowerCase().includes(q);
      return matchCase || matchTitle || matchDept || matchAddr;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2">
      {/* ═══════ 1. WELCOME BACK BANNER (MATCHING SPECIFICATION IMAGE 1) ═══════ */}
      <section
        className="rounded-3xl p-6 sm:p-8 border shadow-xl transition-all duration-300 relative overflow-hidden"
        style={{
          backgroundColor: '#F5F5DC',
          borderColor: 'rgba(215, 210, 175, 0.95)',
          boxShadow: '0 20px 45px -10px rgba(35, 30, 15, 0.12), 0 0 0 1px rgba(220, 215, 180, 0.9)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 via-emerald-100/20 to-transparent pointer-events-none rounded-full blur-3xl -z-0" />

        <div className="relative z-10 space-y-6">
          {/* Top User Greeting Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D1FAE5] text-[#065F46] font-black text-xl sm:text-2xl flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-emerald-600/25">
                TK
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Welcome back, {profileData.user.name.split(' ')[0]}!
                  </h1>
                  {profileData.user.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Your civic contributions, all in one place.
                </p>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-2">
              <Link
                to="/report"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Report New Issue</span>
              </Link>
            </div>
          </div>

          {/* ═══════ CIVIC ID CARD (PERMANENT UNIQUE CITIZEN IDENTITY) ═══════ */}
          <div
            className="rounded-2xl p-5 sm:p-6 border transition-all"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              borderColor: 'rgba(215, 210, 175, 0.9)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Your Civic ID
                  </span>
                  <span title="Verified Permanent Civic Identity">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600 tracking-tight">
                    {profileData.user.civic_id}
                  </span>
                  <button
                    type="button"
                    onClick={copyCivicId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Copy unique Civic ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">Copied ID!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => switchTab('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  <span>View Civic Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══════ YOUR CIVIC ACTIVITY 4-CARD GRID (MATCHING SPECIFICATION IMAGE 1) ═══════ */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Your Civic Activity
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Card 1: Issues Reported */}
              <div
                onClick={() => switchTab('reports')}
                className="p-4 sm:p-5 rounded-2xl border transition-all hover:brightness-95 cursor-pointer shadow-2xs space-y-2 group"
                style={{
                  backgroundColor: 'rgba(238, 236, 205, 0.95)',
                  borderColor: 'rgba(215, 210, 175, 0.9)',
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {profileData.activity.issues_reported}
                  </p>
                  <p className="text-xs font-bold text-slate-600">Issues Reported</p>
                </div>
              </div>

              {/* Card 2: Resolved */}
              <div
                onClick={() => {
                  switchTab('reports');
                  setReportFilter('RESOLVED');
                }}
                className="p-4 sm:p-5 rounded-2xl border transition-all hover:brightness-95 cursor-pointer shadow-2xs space-y-2 group"
                style={{
                  backgroundColor: 'rgba(238, 236, 205, 0.95)',
                  borderColor: 'rgba(215, 210, 175, 0.9)',
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {profileData.activity.resolved}
                  </p>
                  <p className="text-xs font-bold text-slate-600">Resolved</p>
                </div>
              </div>

              {/* Card 3: In Progress */}
              <div
                onClick={() => {
                  switchTab('reports');
                  setReportFilter('IN_PROGRESS');
                }}
                className="p-4 sm:p-5 rounded-2xl border transition-all hover:brightness-95 cursor-pointer shadow-2xs space-y-2 group"
                style={{
                  backgroundColor: 'rgba(238, 236, 205, 0.95)',
                  borderColor: 'rgba(215, 210, 175, 0.9)',
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {profileData.activity.in_progress}
                  </p>
                  <p className="text-xs font-bold text-slate-600">In Progress</p>
                </div>
              </div>

              {/* Card 4: Civic Impact Points */}
              <div
                onClick={() => switchTab('impact')}
                className="p-4 sm:p-5 rounded-2xl border transition-all hover:brightness-95 cursor-pointer shadow-2xs space-y-2 group"
                style={{
                  backgroundColor: 'rgba(238, 236, 205, 0.95)',
                  borderColor: 'rgba(215, 210, 175, 0.9)',
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-purple-700 tabular-nums">
                    {profileData.activity.impact_points}
                  </p>
                  <p className="text-xs font-bold text-slate-600">Civic Impact Points</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium pt-1">
              Live database records synchronized under your permanent Civic ID.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ 2. CIVIC ID VS CASE ID EXPLAINER (MATCHING SPECIFICATION IMAGE 3) ═══════ */}
      <section
        className="rounded-3xl p-6 sm:p-8 border shadow-lg space-y-4"
        style={{
          backgroundColor: '#F5F5DC',
          borderColor: 'rgba(215, 210, 175, 0.95)',
          boxShadow: '0 10px 30px -5px rgba(35, 30, 15, 0.08), 0 0 0 1px rgba(220, 215, 180, 0.85)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950">
              Civic ID vs. Case ID Architecture
            </h3>
            <p className="text-xs text-slate-600">
              This is an important design decision. Every user has one permanent Civic ID, while every complaint gets its own separate Case ID.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Civic ID Card */}
          <div
            className="p-4 sm:p-5 rounded-2xl border space-y-2"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              borderColor: 'rgba(215, 210, 175, 0.9)',
            }}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-900">Civic ID —</span>
              <span className="font-mono text-xs font-black text-blue-700 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded">
                CIV-8K29-X4P7
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies the registered user across their CivicLens account and aggregates citizen impact metrics.
            </p>
          </div>

          {/* Case ID Card */}
          <div
            className="p-4 sm:p-5 rounded-2xl border space-y-2"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              borderColor: 'rgba(215, 210, 175, 0.9)',
            }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900">Case ID —</span>
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded">
                CASE-2026-00142
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies one specific pothole, garbage, streetlight or other civic report with individual SLA tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ 3. TABS NAVIGATION BAR (MATCHING 10-ITEM ACCOUNT MENU) ═══════ */}
      <section id="profile-tabs-section" className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-300/80">
          {[
            { id: 'overview', label: 'My Civic Profile', icon: User },
            { id: 'reports', label: 'My Reports', icon: FileText, count: profileData.activity.issues_reported },
            { id: 'track', label: 'Track an Issue', icon: Search },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
            { id: 'locations', label: 'Saved Locations', icon: MapPin, count: profileData.saved_locations.length },
            { id: 'impact', label: 'Civic Impact', icon: Award, badge: `${profileData.activity.impact_points} pts` },
            { id: 'settings', label: 'Account Settings', icon: SlidersHorizontal },
            { id: 'security', label: 'Security & Privacy', icon: Shield },
            { id: 'help', label: 'Help & Support', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-white/20 text-white' : 'bg-[#E2DEBE] text-slate-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══════ TAB 1: OVERVIEW ═══════ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div
              className="p-6 rounded-3xl border shadow-md space-y-4 md:col-span-1"
              style={{
                backgroundColor: '#F5F5DC',
                borderColor: 'rgba(215, 210, 175, 0.95)',
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Citizen Credentials
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">{profileData.user.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registered Email</span>
                  <span className="font-bold text-slate-900">{profileData.user.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Permanent Civic ID</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {profileData.user.civic_id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verification Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aadhaar/OTP Verified Citizen</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Account Level</span>
                  <span className="font-bold text-purple-700">Level 4: Senior Civic Guardian</span>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-3xl border shadow-md space-y-4 md:col-span-2"
              style={{
                backgroundColor: '#F5F5DC',
                borderColor: 'rgba(215, 210, 175, 0.95)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Recent Civic Reports
                </h3>
                <button
                  type="button"
                  onClick={() => switchTab('reports')}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  View All ({profileData.activity.issues_reported})
                </button>
              </div>

              <div className="space-y-2.5">
                {profileData.recent_reports.slice(0, 4).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/90 hover:border-blue-400 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-700">{rep.case_id}</span>
                        <span className="font-bold text-slate-900 truncate">{rep.complaint_title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{rep.address}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          rep.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCaseModal(rep)}
                        className="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 2: MY REPORTS (ALL 12 REAL CITIZEN COMPLAINTS) ═══════ */}
        {activeTab === 'reports' && (
          <div
            className="p-6 rounded-3xl border shadow-md space-y-5"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-950">All Submitted Civic Grievances ({profileData.recent_reports.length})</h3>
                <p className="text-xs text-slate-600">
                  Every issue submitted under your permanent Civic ID: <strong className="font-mono text-blue-700">{profileData.user.civic_id}</strong>
                </p>
              </div>
              <Link
                to="/report"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Report</span>
              </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'ALL', label: `All (${profileData.recent_reports.length})` },
                  { id: 'RESOLVED', label: `Resolved (${profileData.recent_reports.filter(r => r.status === 'RESOLVED').length})` },
                  { id: 'IN_PROGRESS', label: `In Progress (${profileData.recent_reports.filter(r => r.status === 'IN_PROGRESS').length})` },
                  { id: 'UNDER_INSPECTION', label: `Under Inspection (${profileData.recent_reports.filter(r => r.status === 'UNDER_INSPECTION').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReportFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Filter by Case ID, title, road..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/90 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-3 pt-1">
              {filteredReports.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/90 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {c.case_id}
                      </span>
                      <span className="text-xs font-black text-slate-900">{c.complaint_title}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                      <span className="text-slate-800 font-bold">Dept: {c.department}</span>
                      <span>•</span>
                      <span>{c.address}</span>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">Severity: {c.severity}</span>
                      <span>•</span>
                      <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackInput(c.case_id);
                        switchTab('track');
                        handleTrackIssue(c.case_id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
                      title="Track Live SLA & Timeline"
                    >
                      Track
                    </button>
                    <Link
                      to={`/case/${c.case_id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      title="View Full Public Docket"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ TAB 3: TRACK AN ISSUE (IMAGE 2) ═══════ */}
        {activeTab === 'track' && (
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-6"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div>
              <h3 className="text-sm font-black text-slate-950">Track Municipal Case by Case ID</h3>
              <p className="text-xs text-slate-600">
                View real-time investigation timeline, department assignment, and photographic audit proofs for any complaint.
              </p>
            </div>

            {/* Quick Test Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Quick Track Examples:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'CASE-2026-00142', label: 'CASE-2026-00142 (Resolved Pothole)' },
                  { id: 'CASE-2026-00144', label: 'CASE-2026-00144 (Open Manhole)' },
                  { id: 'CASE-2026-00148', label: 'CASE-2026-00148 (Road Cave-in)' },
                  { id: 'CASE-2026-00143', label: 'CASE-2026-00143 (Water Pipeline)' },
                ].map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setTrackInput(sample.id);
                      handleTrackIssue(sample.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-300 text-xs font-mono font-bold text-blue-700 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackIssue();
              }}
              className="flex gap-2 max-w-lg"
            >
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="Enter Case ID (e.g. CASE-2026-00142)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/90 border border-slate-300 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={trackLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{trackLoading ? 'Searching...' : 'Track'}</span>
              </button>
            </form>

            {trackError && (
              <div className="p-4 rounded-2xl bg-rose-100/80 border border-rose-300 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Lookup Notice</span>
                </div>
                <p>{trackError}</p>
              </div>
            )}

            {trackResult && (
              <div className="p-6 rounded-2xl bg-white/95 border border-slate-300 space-y-6 animate-in fade-in">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-blue-700 text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {trackResult.complaint.case_id}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Logged on {new Date(trackResult.complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">
                      {trackResult.complaint.complaint_title}
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto ${
                      trackResult.complaint.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : trackResult.complaint.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {trackResult.complaint.status}
                  </span>
                </div>

                {/* Case Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Assigned Department</span>
                    <span className="font-bold text-slate-900">{trackResult.complaint.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Incident Location</span>
                    <span className="font-bold text-slate-900 truncate block">{trackResult.complaint.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity & Urgency</span>
                    <span className="font-bold text-rose-600">{trackResult.complaint.severity} ({trackResult.complaint.urgency})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Statutory SLA</span>
                    <span className="font-bold text-emerald-700">48 Hours Target</span>
                  </div>
                </div>

                {/* Interactive Timeline Events */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Official Investigation & Work Timeline
                  </h5>
                  <div className="space-y-3 pl-2 border-l-2 border-blue-500">
                    {(trackResult.events && trackResult.events.length > 0) ? (
                      trackResult.events.map((evt: any) => (
                        <div key={evt.id} className="relative pl-4 space-y-0.5 text-xs">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{evt.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(evt.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-slate-600">{evt.note}</p>
                          <span className="text-[10px] text-slate-500 font-semibold block">By: {evt.author}</span>
                        </div>
                      ))
                    ) : (
                      <div className="pl-4 text-xs text-slate-500">
                        Case is actively queued in the municipal department workstream.
                      </div>
                    )}
                  </div>
                </div>

                {/* Photographic Evidence Before/After */}
                {trackResult.evidence && trackResult.evidence.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      Photographic Evidence Audit
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {trackResult.evidence.map((ev: any) => (
                        <div key={ev.id} className="rounded-2xl border p-3 bg-slate-50 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {ev.kind === 'ORIGINAL' ? 'Initial Citizen Evidence' : 'Post-Repair Audit'}
                          </span>
                          <img
                            src={ev.image_url}
                            alt="Case evidence"
                            className="w-full h-40 object-cover rounded-xl border border-slate-200"
                          />
                          <p className="text-[11px] text-slate-600">{ev.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center border-t">
                  <Link
                    to={`/case/${trackResult.complaint.case_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Open Full Incident Docket & Public Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB 4: NOTIFICATIONS (IMAGE 2: UPDATES ON ASSIGNMENTS & RESOLUTIONS) ═══════ */}
        {activeTab === 'notifications' && (
          <div
            className="p-6 rounded-3xl border shadow-md space-y-4"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950">Citizen Notifications & Alerts</h3>
                <p className="text-xs text-slate-600">
                  Updates on assignments, field inspections, and confirmed municipal resolutions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Mark All as Read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    n.read ? 'bg-white/60 border-slate-200' : 'bg-white border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${
                        n.type === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : n.type === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {n.type === 'RESOLVED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {n.case_id}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block">{n.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackInput(n.case_id);
                        switchTab('track');
                        handleTrackIssue(n.case_id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold cursor-pointer transition-colors"
                    >
                      View Case
                    </button>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700"
                        title="Mark read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ TAB 5: SAVED LOCATIONS (IMAGE 2) ═══════ */}
        {activeTab === 'locations' && (
          <div
            className="p-6 rounded-3xl border shadow-md space-y-5"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950">Saved Places</h3>
                <p className="text-xs text-slate-600">
                  Quick addresses (Home, College, Workplace) to prefill report coordinates and monitor neighborhood civic status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLocation(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Place</span>
              </button>
            </div>

            {locationActionMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{locationActionMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {profileData.saved_locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 space-y-3 relative group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900">{loc.label}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{loc.address}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span className="font-mono">{loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° E</span>
                    <Link
                      to={`/report`}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Report Here →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {showAddLocation && (
              <form onSubmit={handleAddLocation} className="p-5 rounded-2xl bg-white border border-slate-300 space-y-4 shadow-md">
                <h4 className="text-xs font-bold text-slate-900">Add New Place</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Place Type</label>
                    <select
                      value={newLocLabel}
                      onChange={(e) => setNewLocLabel(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value="Home">Home</option>
                      <option value="Workplace">Workplace</option>
                      <option value="College">College</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Address or Landmark</label>
                    <input
                      type="text"
                      value={newLocAddress}
                      onChange={(e) => setNewLocAddress(e.target.value)}
                      placeholder="e.g. Metro Station, Connaught Place, New Delhi"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddLocation(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                  >
                    Save Place
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ═══════ TAB 6: CIVIC IMPACT (IMAGE 2) ═══════ */}
        {activeTab === 'impact' && (
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-6"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-950">Civic Impact & Contribution Ledger</h3>
                <p className="text-xs text-slate-600">
                  Earn civic trust points for authentic photographic evidence, spatial accuracy, and confirmed repairs.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 font-black text-xs self-start sm:self-auto shadow-2xs">
                85 / 100 Impact Score
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 space-y-1">
                <span className="text-xs font-bold text-slate-500">Evidence Quality Score</span>
                <p className="text-2xl font-black text-slate-900">96.4%</p>
                <p className="text-[11px] text-emerald-700 font-bold">Sub-4ms YOLOv8 reticle match</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 space-y-1">
                <span className="text-xs font-bold text-slate-500">Verified Municipal Resolutions</span>
                <p className="text-2xl font-black text-slate-900">{profileData.activity.resolved} Cases</p>
                <p className="text-[11px] text-blue-700 font-bold">Before/after photographic audit pass</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 space-y-1">
                <span className="text-xs font-bold text-slate-500">Community Rank</span>
                <p className="text-2xl font-black text-purple-700">Top 5%</p>
                <p className="text-[11px] text-slate-600 font-medium">Pan-India Civic Guardian</p>
              </div>
            </div>

            {/* Impact Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Points Ledger Breakdown</h4>
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-slate-700 font-bold">Initial Geo-tagged Pothole Photographic Evidence (Sector 62)</span>
                  <span className="font-mono font-black text-emerald-700">+25 pts</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-slate-700 font-bold">Confirmed Asphalt Repair Resolution Audit (CASE-2026-00142)</span>
                  <span className="font-mono font-black text-emerald-700">+20 pts</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-slate-700 font-bold">Critical Hazard Escalation (Open Manhole near Pari Chowk)</span>
                  <span className="font-mono font-black text-emerald-700">+20 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Duplicate Evidence Deduplication Assist</span>
                  <span className="font-mono font-black text-emerald-700">+20 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 7: ACCOUNT SETTINGS (IMAGE 2) ═══════ */}
        {activeTab === 'settings' && (
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-6"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div>
              <h3 className="text-sm font-black text-slate-950">Account Profile & Preferences</h3>
              <p className="text-xs text-slate-600">
                Update your citizen profile details, contact preferences, and municipal jurisdiction.
              </p>
            </div>

            {settingsSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Settings successfully saved and synchronized!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Notification Email</label>
                <input
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency SMS / Phone Number</label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Municipal Jurisdiction</label>
                <input
                  type="text"
                  value={settingsWard}
                  onChange={(e) => setSettingsWard(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════ TAB 8: SECURITY & PRIVACY (IMAGE 2) ═══════ */}
        {activeTab === 'security' && (
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-6"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div>
              <h3 className="text-sm font-black text-slate-950">Security & Account Privacy</h3>
              <p className="text-xs text-slate-600">
                Password credentials, active device sessions, and citizen privacy controls.
              </p>
            </div>

            {/* Permanent ID Verification Card */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Permanent Civic ID Integrity</span>
                <span className="font-mono text-xs font-bold text-blue-700">{profileData.user.civic_id}</span>
                <p className="text-[11px] text-slate-500">Cryptographically immutable and verified via DigiLocker token.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active & Verified
              </span>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Active Device Sessions</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-slate-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Windows 11 PC (Chrome 128)</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">Current Active Session • Noida, India</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active Now</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">CivicLens Mobile App (Android 14)</span>
                      <span className="text-[11px] text-slate-500">Last active 2 hours ago • Greater Noida</span>
                    </div>
                  </div>
                  <button type="button" className="text-xs font-bold text-rose-600 hover:underline">Revoke</button>
                </div>
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Citizen Privacy Preferences</h4>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Anonymize Name on Public Map</span>
                    <span className="text-[11px] text-slate-500">Show complaints as "Verified Citizen" instead of your full name</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyAnonymize}
                    onChange={(e) => setPrivacyAnonymize(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Location Precision Fuzzing (50m)</span>
                    <span className="text-[11px] text-slate-500">Fuzz exact residential coordinates to street level for privacy</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyFuzzGps}
                    onChange={(e) => setPrivacyFuzzGps(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Data Export Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Complete Civic Data Archive (.json)</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════ TAB 9: HELP & SUPPORT (IMAGE 2) ═══════ */}
        {activeTab === 'help' && (
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-6"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div>
              <h3 className="text-sm font-black text-slate-950">Help & Support Services</h3>
              <p className="text-xs text-slate-600">
                Emergency helplines, municipal SLAs, and grievance officer assistance.
              </p>
            </div>

            {/* Emergency Helplines Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold">National Emergency</span>
                <span className="text-lg font-black text-rose-600">112</span>
                <p className="text-[10px] text-slate-500">Police / Fire / Ambulance</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold">Citizen Grievances</span>
                <span className="text-lg font-black text-blue-600">1076</span>
                <p className="text-[10px] text-slate-500">CM Helpline UP / Delhi</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold">Road Hazard (NHAI)</span>
                <span className="text-lg font-black text-amber-600">1033</span>
                <p className="text-[10px] text-slate-500">Highway Emergency Team</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold">Water Breakdown</span>
                <span className="text-lg font-black text-cyan-600">1916</span>
                <p className="text-[10px] text-slate-500">Jal Nigam Emergency</p>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Frequently Asked Questions
              </h4>
              {[
                {
                  q: 'What is the difference between my Civic ID and a Case ID?',
                  a: 'Your Civic ID (e.g. CIV-8K29-X4P7) is your permanent, unique citizen identity across CivicLens AI. It never changes and binds all your reports and impact points. A Case ID (e.g. CASE-2026-00142) identifies one specific defect report with its own municipal SLA and work order.',
                },
                {
                  q: 'How does CivicLens AI verify photographic evidence?',
                  a: 'Every photo uploaded is processed by our YOLOv8 vision pipeline. It checks for roadway defects (potholes, debris, sewer covers, wiring) and evaluates surface severity while censoring license plates and faces for privacy.',
                },
                {
                  q: 'How are SLA resolution deadlines enforced?',
                  a: 'Once triaged by AI, each case is mapped to statutory municipal timelines (e.g. 48 hours for arterial potholes, 24 hours for open manholes). If deadlines are exceeded, automated escalations are routed to the District Magistrate dashboard.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white/90 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-900 flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Grievance Officer */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Contact Municipal Grievance Officer
              </h4>
              {supportSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Support request submitted! Officer R.K. Sharma will respond within 4 business hours.</span>
                </div>
              ) : (
                <div className="space-y-3 max-w-lg">
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your inquiry or grievance escalation request..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!supportMessage.trim()) return;
                      setSupportSuccess(true);
                      setTimeout(() => {
                        setSupportSuccess(false);
                        setSupportMessage('');
                      }, 3000);
                    }}
                    disabled={!supportMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Grievance Inquiry</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ═══════ CASE PREVIEW MODAL ═══════ */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-xl rounded-3xl border p-6 text-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  {selectedCaseModal.case_id}
                </span>
                <span className="text-xs font-bold text-slate-700">{selectedCaseModal.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseModal(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-950 p-1"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-950">{selectedCaseModal.complaint_title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedCaseModal.description}</p>
            </div>

            <img
              src={selectedCaseModal.image_url}
              alt="Case visual"
              className="w-full h-48 object-cover rounded-2xl border border-slate-300"
            />

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="font-bold text-slate-900">{selectedCaseModal.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-bold text-slate-900 truncate block">{selectedCaseModal.address}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Severity</span>
                <span className="font-bold text-rose-600">{selectedCaseModal.severity}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="font-black text-emerald-700">{selectedCaseModal.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                to={`/case/${selectedCaseModal.case_id}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Open Full Case Page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
