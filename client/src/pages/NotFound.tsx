import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim().toUpperCase();
    if (q.startsWith('CV-')) {
      navigate(`/case/${q}`);
    } else {
      navigate(`/dashboard?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs text-slate-500 font-normal">
          The requested civic page or case could not be found. Check your URL or search for a Case ID.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-sm mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Case ID (e.g. CV-2026-XXXXX)..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-xs outline-none"
        />
      </form>

      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Overview</span>
        </Link>
      </div>
    </div>
  );
};

