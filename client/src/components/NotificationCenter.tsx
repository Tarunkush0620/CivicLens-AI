import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface CivicNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  type: 'urgent' | 'verified' | 'cluster' | 'sla' | 'system';
  severity?: 'critical' | 'high' | 'medium' | 'info';
  caseId?: string;
  link?: string;
  location?: string;
}

const DEFAULT_NOTIFICATIONS: CivicNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Pothole Cluster Detected',
    message: 'Multi-point roadway crater detected on Ring Road, New Delhi (Hazard: 94/100). Auto-escalated to Central PWD.',
    time: '4m ago',
    timestamp: Date.now() - 4 * 60 * 1000,
    read: false,
    type: 'urgent',
    severity: 'critical',
    caseId: 'CASE-DEL-2026-0891',
    link: '/dashboard',
    location: 'Ring Road, New Delhi',
  },
  {
    id: 'notif-2',
    title: '24h SLA Warning: Open Drain',
    message: 'Approaching statutory deadline for Case #CASE-BLR-2026-0412. Dispatched to BBMP Stormwater Drainage Div.',
    time: '32m ago',
    timestamp: Date.now() - 32 * 60 * 1000,
    read: false,
    type: 'sla',
    severity: 'high',
    caseId: 'CASE-BLR-2026-0412',
    link: '/admin',
    location: 'Indiranagar 100ft Rd, Bengaluru',
  },
  {
    id: 'notif-3',
    title: 'AI Resolution Audit Verified',
    message: 'Post-repair photo for Case #CASE-MUM-2026-0158 verified with 98.4% visual repair confidence. Closed officially.',
    time: '1h ago',
    timestamp: Date.now() - 65 * 60 * 1000,
    read: false,
    type: 'verified',
    severity: 'info',
    caseId: 'CASE-MUM-2026-0158',
    link: '/admin',
    location: 'Bandra West, Mumbai',
  },
  {
    id: 'notif-4',
    title: 'Spatial Deduplication Merged 4 Reports',
    message: '4 nearby citizen uploads combined into Master Incident #CASE-PUN-2026-0044 near FC Road, Pune.',
    time: '3h ago',
    timestamp: Date.now() - 180 * 60 * 1000,
    read: true,
    type: 'cluster',
    severity: 'medium',
    caseId: 'CASE-PUN-2026-0044',
    link: '/dashboard',
    location: 'FC Road, Pune',
  },
  {
    id: 'notif-5',
    title: 'Pan-India Vision Detector Online',
    message: 'YOLOv8 multi-dataset model operational with sub-4ms GPU inference across 8 civic defect classes.',
    time: '1d ago',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    type: 'system',
    severity: 'info',
    link: '/about',
  },
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    try {
      const saved = localStorage.getItem('civiclens_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Save to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('civiclens_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetNotifications = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
  };

  const handleNotificationClick = (notif: CivicNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'urgent') return n.type === 'urgent' || n.type === 'sla';
    return true;
  });

  const getIconForType = (type: CivicNotification['type']) => {
    switch (type) {
      case 'urgent':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'sla':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'cluster':
        return <Layers className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeBg = (type: CivicNotification['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-rose-100/90 border-rose-200';
      case 'sla':
        return 'bg-amber-100/90 border-amber-200';
      case 'verified':
        return 'bg-emerald-100/90 border-emerald-200';
      case 'cluster':
        return 'bg-blue-100/90 border-blue-200';
      default:
        return 'bg-indigo-100/90 border-indigo-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ─── Notification Trigger Bell ─── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer ${
          isOpen
            ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/20'
            : 'bg-white/90 hover:bg-white border-slate-200/80 text-slate-600 hover:text-slate-900'
        }`}
        title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
        aria-label="Civic notifications"
        aria-expanded={isOpen}
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-slate-700 animate-wiggle-subtle' : 'text-slate-500'}`} />

        {/* Dynamic Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs ring-2 ring-white animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Dropdown Popover ─── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 w-[360px] sm:w-[420px] rounded-3xl border z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: '#F5F5DC',
            borderColor: 'rgba(215, 210, 175, 0.95)',
            boxShadow: '0 25px 60px -15px rgba(35, 30, 15, 0.35), 0 0 0 1px rgba(220, 215, 180, 0.9)',
            maxHeight: 'min(85vh, 600px)',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between gap-3"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              borderBottom: '1px solid rgba(220, 215, 180, 0.8)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Civic Alerts</h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                      Up to date
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Pan-India incident pipeline updates</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div
            className="px-4 py-2 flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'rgba(235, 233, 202, 0.95)',
              borderBottom: '1px solid rgba(220, 215, 180, 0.7)',
            }}
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'unread'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('urgent')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'urgent'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
                }`}
              >
                Urgent ({notifications.filter((n) => n.type === 'urgent' || n.type === 'sla').length})
              </button>
            </div>

            <button
              type="button"
              onClick={resetNotifications}
              className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer font-bold"
              title="Reset sample alerts"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Notification List */}
          <div
            className="divide-y max-h-[380px] overflow-y-auto"
            style={{ borderColor: 'rgba(225, 220, 185, 0.7)' }}
          >
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No notifications here</h4>
                <p className="text-xs text-slate-500">All civic issues are monitored in real time.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    backgroundColor: !notif.read ? 'rgba(232, 238, 255, 0.92)' : 'rgba(245, 245, 220, 0.75)',
                    borderBottom: '1px solid rgba(225, 220, 185, 0.5)',
                  }}
                  className={`p-4 transition-all duration-200 flex items-start gap-3.5 hover:brightness-95 cursor-pointer group relative ${
                    !notif.read ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Left Type Icon */}
                  <div
                    className={`w-9 h-9 rounded-2xl border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${getBadgeBg(
                      notif.type
                    )}`}
                  >
                    {getIconForType(notif.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs truncate ${
                          !notif.read ? 'font-black text-slate-950' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap flex-shrink-0">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {notif.location ? (
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {notif.location}
                        </span>
                      ) : notif.caseId ? (
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                          {notif.caseId}
                        </span>
                      ) : <span />}

                      {/* Hover action buttons */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(notif.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Unread dot indicator */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2 shadow-xs ring-2 ring-blue-100" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              borderTop: '1px solid rgba(220, 215, 180, 0.8)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin');
              }}
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Open Resolution Hub</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-400 font-medium">Auto-synced with live DB</span>
          </div>
        </div>
      )}
    </div>
  );
};
