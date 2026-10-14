import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  MapPin,
  ClipboardList,
  BarChart3,
  Shield,
  Sparkles,
  RotateCcw,
  Activity,
  Layers,
  X
} from 'lucide-react';
import { ActiveTab, CivicIssue } from '../types/issue';
import { getGeminiApiKey } from '../services/geminiService';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  issues: CivicIssue[];
  onResetDemo: () => void;
  onOpenSettings: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  issues,
  onResetDemo,
  onOpenSettings,
  mobileOpen,
  setMobileOpen
}) => {
  const hasApiKey = Boolean(getGeminiApiKey());
  const highPriorityCount = issues.filter(
    (i) => i.priority === 'High' && i.status !== 'Resolved'
  ).length;
  const openCount = issues.filter((i) => i.status === 'Open').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'report' as ActiveTab,
      label: 'Report an Issue',
      icon: PlusCircle,
      badge: 'AI Powered',
      highlight: true
    },
    {
      id: 'map' as ActiveTab,
      label: 'Explore Map',
      icon: MapPin,
      badge: `${issues.length}`
    },
    {
      id: 'manage' as ActiveTab,
      label: 'Manage Issues',
      icon: ClipboardList,
      badge: highPriorityCount > 0 ? `${highPriorityCount} Urgent` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white text-lg tracking-tight">CivicPulse</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smarter Communities. Safer Tomorrow.</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Status Banner */}
        <div className="px-5 py-3 bg-navy-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px]">Active Incidents:</span>
          </div>
          <span className="font-semibold text-white text-[11px]">
            {openCount} Open / {highPriorityCount} Urgent
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Gemini API Status & Quick Trigger */}
        <div className="px-4 py-3 mx-4 mb-3 bg-navy-850/80 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Vision Engine</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Config
            </button>
          </div>

          <div
            onClick={onOpenSettings}
            className="cursor-pointer flex items-center justify-between bg-navy-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] text-slate-300">
                {hasApiKey ? 'Gemini 1.5 Flash' : 'Simulated Fallback'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {hasApiKey ? 'Live' : 'Demo'}
            </span>
          </div>
        </div>

        {/* Demo Mode Actions & Reset */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Demo Data Hub
            </span>
            <button
              onClick={onResetDemo}
              className="text-[11px] text-slate-300 hover:text-teal-400 flex items-center gap-1 font-medium transition"
              title="Reset sample data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-800/60 flex items-center justify-between">
            <span>PromptWars 2026 Hackathon</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Activity className="w-2.5 h-2.5 text-emerald-400" /> v1.0 Production
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
