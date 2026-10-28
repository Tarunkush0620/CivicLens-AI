import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import {
  Search,
  Calendar,
  X,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Play,
  Bell,
  HelpCircle,
  Settings,
  Shield,
  FileText,
  Wrench,
  Activity,
  BatteryCharging,
  GraduationCap,
  BarChart2,
  Bookmark,
  Target,
  Bug,
  MessageSquare,
  Fingerprint,
} from 'lucide-react';
import { api } from '../lib/api';
import { NotificationCenter } from '../components/NotificationCenter';
import { UserProfileDropdown } from '../components/UserProfileDropdown';

interface IntelItem {
  id: string;
  case_id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  observations_count: number;
  date_str: string;
  severity: 'High' | 'Critical';
  images: {
    url: string;
    label: string;
    date: string;
    telemetry: string;
  }[];
}

const DEFAULT_INTEL_ITEMS: IntelItem[] = [
  {
    id: 'intel-1',
    case_id: 'CV-DEN-7430',
    title: 'Hot Patches / Uneven Roads',
    category: 'Road Damage',
    latitude: 39.743,
    longitude: -105.0159,
    observations_count: 19,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.85G',
      },
    ],
  },
  {
    id: 'intel-2',
    case_id: 'CV-DEN-7085',
    title: 'Patched Pothole',
    category: 'Pothole',
    latitude: 39.7085,
    longitude: -105.0251,
    observations_count: 12,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.40G',
      },
    ],
  },
  {
    id: 'intel-3',
    case_id: 'CV-DEN-7401',
    title: 'Hot Patches / Uneven Roads',
    category: 'Road Damage',
    latitude: 39.7401,
    longitude: -105.0063,
    observations_count: 15,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.90G',
      },
    ],
  },
  {
    id: 'intel-4',
    case_id: 'CV-DEN-7094',
    title: 'Patched Pothole',
    category: 'Pothole',
    latitude: 39.7094,
    longitude: -105.0251,
    observations_count: 14,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '3.01G',
      },
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.63G',
      },
      {
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.15G',
      },
    ],
  },
  {
    id: 'intel-5',
    case_id: 'CV-DEN-7402',
    title: 'Bridge Joint',
    category: 'Infrastructure',
    latitude: 39.7401,
    longitude: -105.0062,
    observations_count: 13,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.10G',
      },
    ],
  },
  {
    id: 'intel-6',
    case_id: 'CV-DEN-7817',
    title: 'Hot Patches / Uneven Roads',
    category: 'Road Damage',
    latitude: 39.7817,
    longitude: -104.9891,
    observations_count: 11,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.45G',
      },
    ],
  },
  {
    id: 'intel-7',
    case_id: 'CV-DEN-7403',
    title: 'Patched Pothole',
    category: 'Pothole',
    latitude: 39.7402,
    longitude: -104.9406,
    observations_count: 11,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '2.30G',
      },
    ],
  },
  {
    id: 'intel-8',
    case_id: 'CV-DEN-7758',
    title: 'Patched Pothole',
    category: 'Pothole',
    latitude: 39.7758,
    longitude: -105.0252,
    observations_count: 8,
    date_str: 'Apr 22',
    severity: 'High',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',
        label: 'Samsara video',
        date: 'Apr 22, 2026',
        telemetry: '1.95G',
      },
    ],
  },
];

export const GroundIntelligence: React.FC = () => {
  const navigate = useNavigate();

  const [intelList, setIntelList] = useState<IntelItem[]>(DEFAULT_INTEL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<IntelItem>(DEFAULT_INTEL_ITEMS[3]); // Default to Patched Pothole (39.7094, -105.0251)
  const [searchAddress, setSearchAddress] = useState('');
  const [potholesOnly, setPotholesOnly] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('4');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Sync with live database complaints
  useEffect(() => {
    api.getCases().then((res) => {
      if (res.items && res.items.length > 0) {
        const liveItems: IntelItem[] = res.items.map((c) => ({
          id: c.id,
          case_id: c.case_id,
          title: c.complaint_title || (c.category === 'Pothole' ? 'Patched Pothole' : c.category),
          category: c.category,
          latitude: c.latitude,
          longitude: c.longitude,
          observations_count: c.report_count * 3,
          date_str: new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          severity: c.severity === 'CRITICAL' ? 'Critical' : 'High',
          images: [
            {
              url: c.image_url,
              label: 'Citizen dashcam feed',
              date: new Date(c.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              telemetry: '2.80G',
            },
          ],
        }));

        setIntelList([...DEFAULT_INTEL_ITEMS, ...liveItems]);
      }
    });
  }, []);

  // Filter items
  const filteredList = useMemo(() => {
    return intelList.filter((item) => {
      if (
        potholesOnly &&
        !item.category.toLowerCase().includes('pothole') &&
        !item.title.toLowerCase().includes('pothole')
      ) {
        return false;
      }
      if (searchAddress.trim()) {
        const q = searchAddress.toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.case_id.toLowerCase().includes(q) &&
          !item.category.toLowerCase().includes(q) &&
          !`${item.latitude}, ${item.longitude}`.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [intelList, potholesOnly, searchAddress]);

  // Leaflet Map Initialization centered at W Alameda Ave Denver / Lakewood
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([39.7094, -105.0251], 15);

      // Clean OpenStreetMap tiles (free, reliable street map matching screenshot)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Map zoom control bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Diamond Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredList.forEach((item) => {
      const isSelected = selectedItem?.id === item.id;

      // Diamond marker with 45deg rotation
      const diamondHtml = `
        <div style="
          width: ${isSelected ? '20px' : '13px'};
          height: ${isSelected ? '20px' : '13px'};
          background-color: ${isSelected ? '#1D6FE5' : '#0F172A'};
          transform: rotate(45deg);
          border: 2px solid #FFFFFF;
          box-shadow: 0 ${isSelected ? '3px 10px rgba(29,111,229,0.7)' : '1px 4px rgba(0,0,0,0.4)'};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        "></div>
      `;

      const customIcon = L.divIcon({
        className: 'intel-diamond-pin',
        html: diamondHtml,
        iconSize: isSelected ? [20, 20] : [13, 13],
        iconAnchor: isSelected ? [10, 10] : [6.5, 6.5],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedItem(item);
        setIsDrawerOpen(true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([item.latitude, item.longitude], { animate: true });
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredList, selectedItem]);

  const handleSelectItem = (item: IntelItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.latitude, item.longitude], 15, {
        duration: 0.8,
      });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans select-none">
      {/* 1. Thin Left Navigation Rail (Matches Screenshot) */}
      <aside className="w-14 bg-white border-r border-slate-200 flex flex-col items-center justify-between py-3.5 flex-shrink-0 z-40">
        <div className="flex flex-col items-center gap-3">
          {/* Top Logo Badge: Stylized "V" inside Circle */}
          <Link
            to="/"
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition-transform"
            title="CivicLens Home"
          >
            <span className="font-mono tracking-tighter">V</span>
          </Link>

          {/* Rail Navigation Icons Stack */}
          <nav className="flex flex-col items-center gap-2.5 text-slate-500 pt-2">
            <button
              type="button"
              className="p-2 rounded-md text-blue-600 bg-blue-50/80 hover:bg-blue-100 transition-colors"
              title="Ground Intelligence"
            >
              <MapPin className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Resolution Hub"
            >
              <Shield className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Cases / Complaints"
            >
              <FileText className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Maintenance Crews"
            >
              <Wrench className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Telemetry Sensors"
            >
              <Activity className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="EV Fleet"
            >
              <BatteryCharging className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="About CivicLens"
            >
              <GraduationCap className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Civic Dashboard"
            >
              <BarChart2 className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Bookmarks / Flags"
            >
              <Bookmark className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Target Area"
            >
              <Target className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Anomaly Detector"
            >
              <Bug className="w-4 h-4 stroke-[1.8]" />
            </button>
          </nav>
        </div>

        {/* Bottom Rail Controls */}
        <div className="flex flex-col items-center gap-2.5 text-slate-400">
          <Link
            to="/dashboard"
            className="p-2 hover:text-slate-700 rounded-md hover:bg-slate-100"
            title="Help & Questions"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>
          <button
            type="button"
            className="p-2 hover:text-slate-700 rounded-md hover:bg-slate-100"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <Link
            to="/dashboard"
            className="p-2 hover:text-slate-700 rounded-md hover:bg-slate-100 text-slate-400"
            title="Back to Dashboard"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between z-[1100] flex-shrink-0">
          {/* Pill Search Bar with ⌘K */}
          <div className="relative w-72 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search or ask questions"
              className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-slate-100 text-xs font-normal text-slate-700 placeholder:text-slate-400 border border-slate-200/60 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Identity / Biometric Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full text-purple-600 hover:bg-purple-50 transition-colors"
              title="Identity verification"
            >
              <Fingerprint className="w-4 h-4" />
            </button>

            {/* Chat message bubble */}
            <button
              type="button"
              className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Notification Bell with Dropdown */}
            <NotificationCenter />

            {/* User Profile Avatar with Dropdown */}
            <UserProfileDropdown />
          </div>
        </header>

        {/* 3-Column Working Canvas: List (left) + Floating Drawer (center) + Map (right) */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Column: Ground Intelligence List */}
          <section className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col h-full z-[1050] flex-shrink-0 shadow-sm">
            {/* Panel Header */}
            <div className="p-4 space-y-3 border-b border-slate-100">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Ground Intelligence</h1>

              {/* Search address input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Search address"
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#F1F5F9] text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-400 transition-all"
                />
              </div>

              {/* Filter Pills: Last 90 Days | Severity (4) | Potholes only */}
              <div className="flex items-center gap-1.5 text-xs select-none">
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Last 90 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSeverityFilter((prev) => (prev === '4' ? 'All' : '4'))
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <span>Severity</span>
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
                    4
                  </span>
                </button>

                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={potholesOnly}
                    onChange={(e) => setPotholesOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Potholes only</span>
                </label>
              </div>
            </div>

            {/* List of Incidents */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredList.map((item) => {
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-2 text-left ${
                      isSelected
                        ? 'bg-[#EBF3FE] border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)} ·{' '}
                        {item.observations_count} observations · {item.date_str}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200/60">
                        {item.severity}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}

              {filteredList.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No records match your filters.
                </div>
              )}
            </div>
          </section>

          {/* Center Floating Detail Drawer (Matches Screenshot) */}
          {isDrawerOpen && selectedItem && (
            <div className="absolute top-4 left-[336px] sm:left-[400px] w-[340px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 space-y-3.5 z-[1200] max-h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in slide-in-from-left-3 duration-200">
              {/* Drawer Header: ◆ Title & ✕ */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 flex-shrink-0" />
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {selectedItem.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata Rows: Severity, Location, Impact Trend */}
              <div className="space-y-2 text-xs">
                {/* Severity */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="text-[10px]">▲</span>
                    <span>Severity</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200/80">
                    {selectedItem.severity}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location</span>
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${selectedItem.latitude},${selectedItem.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 hover:text-blue-600 underline font-mono text-[11px]"
                  >
                    {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
                  </a>
                </div>

                {/* Impact Trend with Sparkline curve */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Impact trend</span>
                  </span>

                  {/* SVG Sparkline Graph matching wavy line from screenshot */}
                  <svg className="w-24 h-5 stroke-slate-500 fill-none" viewBox="0 0 100 20">
                    <path
                      d="M 0,14 L 18,15 L 36,5 L 52,10 L 68,14 L 84,15 L 100,8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Observations Section with Dashcam / Video Cards */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    Observations ({selectedItem.observations_count})
                  </h3>
                  <Link
                    to={`/case/${selectedItem.case_id}`}
                    className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Full case</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Observation Cards Stack */}
                <div className="space-y-2.5">
                  {selectedItem.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative group shadow-2xs"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <img
                          src={img.url}
                          alt={`Observation ${idx + 1}`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>

                      {/* Video Footer Bar with Play Icon */}
                      <div className="p-2 bg-white/95 backdrop-blur-xs border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-700">
                        <span className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Play className="w-2.5 h-2.5 fill-slate-900 text-slate-900" />
                          <span>{img.label}</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {img.date} {img.telemetry}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deep Link to Complaint Case Details */}
                <button
                  type="button"
                  onClick={() => navigate(`/case/${selectedItem.case_id}`)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>View Case Evidence & Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Right Map Canvas with Street Grid & Diamond Markers */}
          <div className="flex-1 h-full w-full relative">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundIntelligence;
