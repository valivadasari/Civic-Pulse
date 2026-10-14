import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { CivicIssue, ActiveTab } from '../types/issue';
import { MapView } from './MapView';

interface DashboardProps {
  issues: CivicIssue[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  issues,
  setActiveTab,
  onSelectIssue
}) => {
  // Dynamic Stats
  const totalReports = issues.length;
  const openIssues = issues.filter((i) => i.status === 'Open').length;
  const inProgressIssues = issues.filter((i) => i.status === 'In Progress').length;
  const highPriorityIssues = issues.filter(
    (i) => i.priority === 'High' && i.status !== 'Resolved'
  ).length;
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved').length;

  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedIssues / totalReports) * 100) : 0;

  // Category counts
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));

  const categoryColors: Record<string, string> = {
    Pothole: '#F59E0B',
    Garbage: '#8B5CF6',
    'Blocked Drain': '#06B6D4',
    'Water Leakage': '#2563EB',
    Other: '#64748B'
  };

  // Priority data for Pie
  const priorityChartData = [
    { name: 'High', value: issues.filter((i) => i.priority === 'High').length, color: '#EF4444' },
    { name: 'Medium', value: issues.filter((i) => i.priority === 'Medium').length, color: '#F59E0B' },
    { name: 'Low', value: issues.filter((i) => i.priority === 'Low').length, color: '#10B981' }
  ].filter((p) => p.value > 0);

  // Recent 6 reports
  const recentReports = [...issues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-2xl p-6 sm:p-7 text-white shadow-card border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Civic Issue Intelligence Hub • PromptWars 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Smarter Communities. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Safer Tomorrow.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Multi-modal AI vision inspection and spatial telemetry for rapid municipal triage across potholes, waste overflows, stormwater drains, and water line ruptures.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('report')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Issue</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Explore Map</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalReports}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">Dynamic</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total citizen & sensor reports logged</p>
        </div>

        {/* Open Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Open</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {openIssues}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              +{inProgressIssues} In Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending municipal inspection</p>
        </div>

        {/* High Priority Critical */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-card hover:shadow-card-hover transition duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              High Priority
            </span>
            <div className="relative">
              <span className="animate-ping absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 opacity-75" />
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center relative">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {highPriorityIssues}
            </span>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Urgent Triage
            </span>
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">Immediate public safety hazards</p>
        </div>

        {/* Resolved Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {resolvedIssues}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {resolutionRate}% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully remediated</p>
        </div>
      </div>

      {/* Mid Section: Interactive Mini-Map Preview & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mini Map Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Live Incident Spatial Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Pulsing pins indicate high-priority road, water, or drainage hazards
              </p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Expand Full Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 relative">
            <MapView issues={issues} onSelectIssue={onSelectIssue} />
          </div>
        </div>

        {/* Right: Charts Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Breakdown by Category</h3>
              <p className="text-xs text-slate-500">Live distribution across civic report types</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Full Analytics →
            </button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.name] || '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Donut preview */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Priority Mix:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                High: {issues.filter((i) => i.priority === 'High').length}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Med: {issues.filter((i) => i.priority === 'Medium').length}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Low: {issues.filter((i) => i.priority === 'Low').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Community Reports Stream */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Hazard Reports & AI Triage
            </h3>
            <p className="text-xs text-slate-500">
              Latest citizen submissions verified with Gemini Vision AI recommendations
            </p>
          </div>
          <button
            onClick={() => setActiveTab('manage')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All Issues ({issues.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReports.map((issue) => {
            const isHigh = issue.priority === 'High' && issue.status !== 'Resolved';
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="group cursor-pointer bg-slate-50/70 hover:bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-4 transition duration-200 shadow-sm hover:shadow-card-hover flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-200 mb-3">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-navy-950/85 text-white px-2 py-0.5 rounded">
                        {issue.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          issue.priority === 'High'
                            ? 'bg-rose-500 text-white'
                            : issue.priority === 'Medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                          issue.status === 'Resolved'
                            ? 'bg-emerald-600/90 text-white'
                            : issue.status === 'In Progress'
                            ? 'bg-amber-600/90 text-white'
                            : 'bg-blue-600/90 text-white'
                        }`}
                      >
                        ● {issue.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug mb-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </p>

                  {/* AI Snippet */}
                  {issue.aiAnalysis && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-950 line-clamp-2 mb-2">
                      <span className="font-bold text-blue-900">AI Insight: </span>
                      {issue.aiAnalysis.summary}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
