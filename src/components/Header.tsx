import React from 'react';
import { Menu, Plus, Sparkles, RotateCcw, ShieldCheck, Search } from 'lucide-react';
import { ActiveTab } from '../types/issue';
import { getGeminiApiKey } from '../services/geminiService';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onResetDemo,
  onOpenMobileMenu,
  searchQuery,
  setSearchQuery
}) => {
  const hasApiKey = Boolean(getGeminiApiKey());

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Municipal Command Dashboard',
      subtitle: 'Real-time hazard triage, spatial density, and response telemetry'
    },
    report: {
      title: 'Report a Community Hazard',
      subtitle: 'Multimodal AI vision inspection, duplicate verification, and rapid intake'
    },
    map: {
      title: 'Geospatial Hazard Explorer',
      subtitle: 'Live OpenStreetMap cluster markers, critical heat signatures, and dispatch tracking'
    },
    manage: {
      title: 'Issue Management & Dispatch',
      subtitle: 'Filterable triage grid, priority escalation, and resolution workflow'
    },
    analytics: {
      title: 'Civic Infrastructure Analytics',
      subtitle: 'Categorical distribution, resolution cycle times, and hotspot intelligence'
    }
  };

  const currentInfo = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Screen Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {currentInfo.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports or streets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Gemini AI Status Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition hover:shadow-sm bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Configure Google Gemini API"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">AI Engine:</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                hasApiKey ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {hasApiKey ? 'Gemini 1.5' : 'Simulated'}
            </span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            title="Reset to default hackathon dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Primary CTA: Report an Issue */}
          {activeTab !== 'report' && (
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
