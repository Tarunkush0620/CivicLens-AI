import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  SlidersHorizontal,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronsUpDown,
  Check,
  X,
  FileText,
  Search,
  MapPin,
  Award,
} from 'lucide-react';
import { api } from '../lib/api';

interface UserProfileDropdownProps {
  onToggleTheme?: () => void;
  currentTheme?: 'light' | 'dark';
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  onToggleTheme,
  currentTheme = 'light',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [copiedCivicId, setCopiedCivicId] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('civiclens_user_email') || 'tarunkushwaha@gmail.com';
  const userName = localStorage.getItem('civiclens_user_name') || 'Tarun Kushwaha';
  const userInitials = userName.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'TK';

  // Close on outside click or Escape key
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

  const handleAction = (action: string) => {
    setIsOpen(false);
    switch (action) {
      case 'profile':
        navigate('/profile?tab=overview');
        break;
      case 'reports':
        navigate('/profile?tab=reports');
        break;
      case 'track':
        navigate('/profile?tab=track');
        break;
      case 'notifications':
        navigate('/profile?tab=notifications');
        break;
      case 'locations':
        navigate('/profile?tab=locations');
        break;
      case 'impact':
        navigate('/profile?tab=impact');
        break;
      case 'settings':
        navigate('/profile?tab=settings');
        break;
      case 'security':
        navigate('/profile?tab=security');
        break;
      case 'appearance':
        if (onToggleTheme) onToggleTheme();
        break;
      case 'help':
        navigate('/profile?tab=help');
        break;
      case 'feedback':
        setShowFeedbackModal(true);
        break;
      case 'signout':
        setShowSignOutModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ─── Trigger Button in Navbar ─── */}
      <button
        id="user-profile-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-90 transition-opacity cursor-pointer select-none text-left"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        {/* Soft mint green avatar circle matching reference */}
        <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#065F46] font-extrabold text-xs flex items-center justify-center shadow-xs ring-1 ring-emerald-500/20">
          {userInitials}
        </div>

        {/* Name only (no Admin text) */}
        <div className="text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight block">
            {userName}
          </span>
        </div>

        {/* Down chevron */}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
      </button>

      {/* ─── Profile Dropdown Menu (Styled with Web App Beige Theme #F5F5DC) ─── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 w-[290px] sm:w-[310px] rounded-2xl border z-[100] p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xl"
          style={{
            backgroundColor: '#F5F5DC',
            borderColor: 'rgba(215, 210, 175, 0.95)',
            boxShadow: '0 25px 60px -15px rgba(35, 30, 15, 0.35), 0 0 0 1px rgba(220, 215, 180, 0.9)',
          }}
          role="menu"
        >
          {/* Top User Header Card with Unique Civic ID */}
          <div
            onClick={() => handleAction('profile')}
            className="p-2.5 rounded-xl transition-all cursor-pointer group"
            style={{
              backgroundColor: 'rgba(238, 236, 205, 0.95)',
              border: '1px solid rgba(220, 215, 180, 0.7)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#D1FAE5] text-[#065F46] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs ring-1 ring-emerald-600/20">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {userName}
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified Citizen" />
                  </div>
                  <p className="text-[11px] text-slate-600 truncate leading-normal">
                    {userEmail}
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 flex-shrink-0 ml-1" />
            </div>

            {/* Prominent Civic ID pill badge */}
            <div className="mt-2 pt-2 border-t border-slate-300/60 flex items-center justify-between text-[11px]">
              <span className="font-extrabold uppercase text-[10px] text-slate-500 tracking-wider">
                Civic ID
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText('CIV-8K29-X4P7');
                  setCopiedCivicId(true);
                  setTimeout(() => setCopiedCivicId(false), 2000);
                }}
                className="font-mono font-black text-blue-700 bg-blue-100/90 hover:bg-blue-200/90 px-2 py-0.5 rounded border border-blue-200/80 text-[11px] cursor-pointer transition-all active:scale-95"
                title="Click to copy unique Civic ID"
              >
                {copiedCivicId ? '✓ Copied!' : 'CIV-8K29-X4P7'}
              </button>
            </div>
          </div>

          <div
            className="h-px my-1.5 mx-1"
            style={{ backgroundColor: 'rgba(220, 215, 180, 0.8)' }}
          />

          {/* Section 1: Core Navigation Options (Matching Specification Table) */}
          <div className="space-y-0.5">
            {/* 1. My Civic Profile */}
            <button
              type="button"
              onClick={() => handleAction('profile')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-500" />
                <span>My Civic Profile</span>
              </div>
            </button>

            {/* 2. My Reports */}
            <button
              type="button"
              onClick={() => handleAction('reports')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>My Reports</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E2DEBE] text-slate-800 border border-[#D5D0B0] text-[10px] font-bold">
                12
              </span>
            </button>

            {/* 3. Track an Issue */}
            <button
              type="button"
              onClick={() => handleAction('track')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track an Issue</span>
            </button>

            {/* 4. Notifications */}
            <button
              type="button"
              onClick={() => handleAction('notifications')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-500" />
                <span>Notifications</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E2DEBE] text-slate-800 border border-[#D5D0B0] text-[10px] font-bold">
                3
              </span>
            </button>

            {/* 5. Saved Locations */}
            <button
              type="button"
              onClick={() => handleAction('locations')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Saved Locations</span>
            </button>

            {/* 6. Civic Impact */}
            <button
              type="button"
              onClick={() => handleAction('impact')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Civic Impact</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black">
                85 pts
              </span>
            </button>
          </div>

          <div
            className="h-px my-1.5 mx-1"
            style={{ backgroundColor: 'rgba(220, 215, 180, 0.8)' }}
          />

          {/* Section 2: Preferences & Security */}
          <div className="space-y-0.5">
            {/* 7. Account Settings */}
            <button
              type="button"
              onClick={() => handleAction('settings')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Account Settings</span>
            </button>

            {/* 8. Security & Privacy */}
            <button
              type="button"
              onClick={() => handleAction('security')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Security & Privacy</span>
            </button>

            {/* Appearance Toggle */}
            <button
              type="button"
              onClick={() => handleAction('appearance')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-slate-500" />
                <span>Appearance</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-600 bg-[#E2DEBE]/70 px-1.5 py-0.5 rounded border border-[#D5D0B0]/60">
                {currentTheme}
              </span>
            </button>

            {/* 9. Help & Support */}
            <button
              type="button"
              onClick={() => handleAction('help')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help & Support</span>
            </button>

            {/* Send Feedback */}
            <button
              type="button"
              onClick={() => handleAction('feedback')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#EBE7C5] transition-colors text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Send Feedback</span>
            </button>
          </div>

          <div
            className="h-px my-1.5 mx-1"
            style={{ backgroundColor: 'rgba(220, 215, 180, 0.8)' }}
          />

          {/* 10. Sign Out in Red */}
          <button
            type="button"
            onClick={() => handleAction('signout')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/70 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ─── Feedback Modal ─── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl border p-6 text-slate-800 shadow-2xl space-y-4"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
              boxShadow: '0 25px 60px -15px rgba(35, 30, 15, 0.4), 0 0 0 1px rgba(220, 215, 180, 0.9)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Send CivicLens Feedback</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">Thank you, Tarun!</p>
                <p className="text-xs text-slate-600">Your feedback has been logged to the engineering backlog.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  Share suggestions or issues regarding AI defect detection, grievance routing, or city resolution audits.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think or report a bug..."
                  rows={4}
                  className="w-full rounded-xl bg-white/90 border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-black/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!feedbackText.trim()) return;
                      try {
                        await api.submitFeedback({
                          civic_id: 'CIV-8K29-X4P7',
                          rating: 5,
                          category: 'App Experience',
                          message: feedbackText.trim(),
                        });
                      } catch (e) {
                        console.warn('Feedback submit fallback:', e);
                      }
                      setFeedbackSuccess(true);
                      setTimeout(() => {
                        setShowFeedbackModal(false);
                        setFeedbackSuccess(false);
                        setFeedbackText('');
                      }, 1600);
                    }}
                    disabled={!feedbackText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Submit Feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Sign Out Confirmation Modal ─── */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl border p-6 text-slate-800 shadow-2xl space-y-4 text-center"
            style={{
              backgroundColor: '#F5F5DC',
              borderColor: 'rgba(215, 210, 175, 0.95)',
              boxShadow: '0 25px 60px -15px rgba(35, 30, 15, 0.4), 0 0 0 1px rgba(220, 215, 180, 0.9)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to end your current session for <strong className="text-slate-900">Tarun Kushwaha</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
