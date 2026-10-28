import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Map,
  FilePlus,
  ShieldCheck,
  CheckCircle2,
  Network,
  Info,
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Plus,
  ArrowUp,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { UserProfileDropdown } from './UserProfileDropdown';
import { LocationPermissionModal } from './LocationPermissionModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('civiclens_theme') as 'light' | 'dark') || 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signin');
  const isFixedViewport = isDashboard || isAdmin;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('civiclens_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isFixedViewport) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFixedViewport]);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 20);
    setShowScrollTop(y > 400);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Overview', to: '/', icon: Home, exact: true },
    { label: 'CivicMap', to: '/dashboard', icon: Map },
    { label: 'Report Issue', to: '/report', icon: FilePlus },
    { label: 'Resolution Hub', to: '/admin', icon: CheckCircle2 },
    { label: 'About Us', to: '/about', icon: Info },
  ];

  return (
    <div
      className={`font-sans selection:bg-blue-500/20 selection:text-blue-900 bg-transparent relative ${
        isFixedViewport ? 'h-screen w-screen overflow-hidden flex flex-col' : 'min-h-screen flex flex-col'
      }`}
      style={{ color: 'var(--text-primary)' }}
    >

      {/* ═══════ GLOBAL FIXED SMART CITY BACKGROUND ═══════ */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-no-repeat bg-top"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center top',
        }}
        aria-hidden="true"
      >
        {/* Soft atmospheric gradient wash ensuring perfect contrast, depth & text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5DC]/35 via-[#F5F5DC]/55 to-[#F5F5DC]/80 backdrop-blur-[0.5px]" />
      </div>

      {/* ═══════ FLOATING PILL ISLAND NAVBAR (Matching Reference) ═══════ */}
      {!isLoginPage && (
        <div className={`z-50 px-3 sm:px-6 w-full mx-auto transition-all duration-300 flex-shrink-0 ${
          isDashboard ? 'fixed top-0 left-0 right-0 pt-2 sm:pt-2.5 max-w-[1800px] pointer-events-none' : isAdmin ? 'pt-2 px-3 sm:px-6 max-w-[1720px]' : 'sticky top-3 sm:top-4 lg:px-8 max-w-[1560px]'
        }`}>
        <header className={`relative pointer-events-auto rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-xl border border-white/90 shadow-[0_10px_35px_-5px_rgba(90,80,50,0.08),0_0_0_1px_rgba(230,226,195,0.8)] px-4 sm:px-6 flex items-center justify-between gap-4 ${
          isAdmin ? 'h-[50px] sm:h-[52px]' : 'h-[58px] sm:h-[62px]'
        }`}>
          {/* Subtle light-blue wave glow on the right side */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-100/50 via-cyan-50/25 to-transparent" />
          </div>

          {/* Left: Brand Logo + Divider */}
          <div className="flex items-center gap-4 flex-shrink-0 relative z-10">
            <Link to="/" className="flex items-center group select-none" title="CivicLens AI — Home">
              <img
                src="/logo.png"
                alt="CivicLens AI — See it. Report it. Fix it."
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300 drop-shadow-2xs"
              />
            </Link>
            <div className="h-6 w-px bg-slate-200/80 hidden lg:block" />
          </div>

          {/* Center: Navigation Links with Icons & Active Underline */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 whitespace-nowrap relative z-10">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold select-none transition-all ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-600 font-bold shadow-2xs border border-blue-100/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-2 left-3 right-3 h-[2px] bg-blue-600 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions: Divider + Search + Theme + Bell + CTA */}
          <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
            <div className="h-6 w-px bg-slate-200/80 hidden xl:block" />

            {/* Pill Search Bar with ⌘ K */}
            <form onSubmit={handleSearch} className="relative hidden xl:block w-48 2xl:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Case ID, location, or keyword..."
                className="w-full pl-8 pr-12 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 text-xs font-medium transition-all outline-none shadow-2xs"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⌘ K
              </span>
            </form>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Toggle dark/light theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Interactive Civic Notification Center */}
            <NotificationCenter />

            {/* User Profile with Interactive Dropdown (Matching Reference Image) */}
            <UserProfileDropdown
              currentTheme={theme}
              onToggleTheme={toggleTheme}
            />

            {/* Primary CTA */}
            <Link
              to="/report"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Issue</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 lg:hidden relative z-10">
            <Link
              to="/report"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              Report
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases or addresses..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none"
              />
            </form>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end text-xs text-slate-500">
              <button type="button" onClick={toggleTheme} className="p-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className={`w-full ${
        isLoginPage
          ? 'flex-1 min-h-screen flex items-center justify-center p-0 m-0'
          : isDashboard
          ? 'absolute inset-0 overflow-hidden z-10'
          : isAdmin
          ? 'flex-1 min-h-0 w-full overflow-hidden flex flex-col pt-1 px-3 sm:px-6 max-w-[1720px] mx-auto'
          : 'flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-16 relative'
      }`}>
        {children}
      </main>

      {/* ═══════ FROSTED GLASS FOOTER ═══════ */}
      {!isFixedViewport && !isLoginPage && (
        <footer className="py-6 px-6 border-t border-slate-200/50 bg-white/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="CivicLens AI"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </footer>
      )}

      {/* ═══════ SCROLL TO TOP FAB ═══════ */}
      {!isFixedViewport && !isLoginPage && (
        <button
          type="button"
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-xl premium-card flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all duration-300 shadow-md ${
            showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ═══════ LOCATION PERMISSION PROMPT MODAL ═══════ */}
      <LocationPermissionModal />
    </div>
  );
};

export default AppShell;
