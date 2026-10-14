import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  MapPin,
  Layers,
  Sparkles
} from 'lucide-react';
import { CivicIssue } from '../types/issue';
import { exportIssuesAsJSON } from '../services/storageService';
import { useToast } from './Toast';

interface AnalyticsProps {
  issues: CivicIssue[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ issues }) => {
  const { showToast } = useToast();

  const totalReports = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved');
  const openIssues = issues.filter((i) => i.status === 'Open');
  const inProgressIssues = issues.filter((i) => i.status === 'In Progress');

  // Resolution Rate
  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedIssues.length / totalReports) * 100) : 0;

  // Genuine Average Resolution Time calculation from real timestamps
  const resolutionTimes = resolvedIssues
    .map((issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : 0;
      return resolved > created ? (resolved - created) / (1000 * 3600) : null;
    })
    .filter((time): time is number => time !== null);

  const avgResolutionHours =
    resolutionTimes.length > 0
      ? (resolutionTimes.reduce((acc, t) => acc + t, 0) / resolutionTimes.length).toFixed(1)
      : null;

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

  // Priority Data
  const priorityData = [
    { name: 'High', value: issues.filter((i) => i.priority === 'High').length, color: '#EF4444' },
    { name: 'Medium', value: issues.filter((i) => i.priority === 'Medium').length, color: '#F59E0B' },
    { name: 'Low', value: issues.filter((i) => i.priority === 'Low').length, color: '#10B981' }
  ].filter((p) => p.value > 0);

  // Status Data
  const statusData = [
    { name: 'Open', value: openIssues.length, color: '#3B82F6' },
    { name: 'In Progress', value: inProgressIssues.length, color: '#F59E0B' },
    { name: 'Resolved', value: resolvedIssues.length, color: '#10B981' }
  ].filter((s) => s.value > 0);

  // Neighborhood Hotspot Clustering (aggregates by location.neighborhood or street)
  const neighborhoodClusters = issues.reduce((acc, issue) => {
    const area =
      issue.location.neighborhood ||
      issue.location.address.split(',')[1]?.trim() ||
      'Metropolitan Core';
    if (!acc[area]) {
      acc[area] = { total: 0, open: 0, high: 0, categories: {} as Record<string, number> };
    }
    acc[area].total += 1;
    if (issue.status !== 'Resolved') acc[area].open += 1;
    if (issue.priority === 'High') acc[area].high += 1;
    acc[area].categories[issue.category] = (acc[area].categories[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, { total: number; open: number; high: number; categories: Record<string, number> }>);

  const hotspotRanking = Object.entries(neighborhoodClusters)
    .map(([area, stats]) => {
      // Find top category
      const topCat = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
      return { area, ...stats, topCat };
    })
    .sort((a, b) => b.total - a.total);

  const handleExport = () => {
    exportIssuesAsJSON();
    showToast({
      title: 'Database Exported',
      message: 'All issues downloaded in standard JSON format.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Municipal Hazard Analytics & Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Real data calculations derived from active community submissions and resolution timestamps.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (JSON)</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Resolution Efficiency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">
              {resolutionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {resolvedIssues.length} of {totalReports} reports cleared
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Cycle Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 tracking-tight">
              {avgResolutionHours ? `${avgResolutionHours}h` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {avgResolutionHours ? 'Calculated from resolved reports' : 'Awaiting resolved timestamps'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Urgent Hazard Density
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 tracking-tight">
              {issues.filter((i) => i.priority === 'High').length}
            </span>
            <span className="text-[11px] font-semibold text-rose-600">High Risk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Potholes, bursts, floodings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Identified Hotspot Clusters
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 tracking-tight">
              {hotspotRanking.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Sectors</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Geospatial report groupings</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issues by Category Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incident Volume by Category</h3>
              <p className="text-xs text-slate-500">Distribution across infrastructure categories</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
              Live Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
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
                      key={`bar-${index}`}
                      fill={categoryColors[entry.name] || '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Priority Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority Distribution</h3>
            <p className="text-xs text-slate-500">Proportion of High, Medium, and Low incidents</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hotspot & Area Ranking Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            High-Frequency Geographic Hotspots
          </h3>
          <p className="text-xs text-slate-500">
            Ranked sectors by community report concentration to inform preventive municipal maintenance routes
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Neighborhood Sector</th>
                <th className="py-3 px-3">Total Incidents</th>
                <th className="py-3 px-3">Active Open</th>
                <th className="py-3 px-3">Urgent Hazards</th>
                <th className="py-3 px-3">Dominant Category</th>
                <th className="py-3 px-4 text-right">Triage Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hotspotRanking.map((hotspot, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{hotspot.area}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{hotspot.total}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                      {hotspot.open} Open
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {hotspot.high > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                        {hotspot.high} Critical
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">{hotspot.topCat}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      Monitored
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
