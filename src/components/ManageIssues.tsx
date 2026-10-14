import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssuePriority, IssueCategory } from '../types/issue';
import { updateIssueStatus, deleteIssue } from '../services/storageService';
import { useToast } from './Toast';

interface ManageIssuesProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ManageIssues: React.FC<ManageIssuesProps> = ({
  issues,
  onSelectIssue,
  onRefresh,
  searchQuery,
  setSearchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [demoFilter, setDemoFilter] = useState<'All' | 'Demo' | 'Genuine'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'priority-desc'>('date-desc');

  const { showToast } = useToast();

  // Filtering
  const filteredIssues = issues.filter((issue) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchId = issue.id.toLowerCase().includes(q);
      const matchAddress = issue.location.address.toLowerCase().includes(q);
      const matchCategory = issue.category.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchAddress && !matchCategory) return false;
    }

    // Category
    if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;

    // Priority
    if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;

    // Status
    if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;

    // Demo filter
    if (demoFilter === 'Demo' && !issue.isDemo) return false;
    if (demoFilter === 'Genuine' && issue.isDemo) return false;

    return true;
  });

  // Sorting
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'priority-desc') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    return 0;
  });

  const handleStatusChange = (id: string, newStatus: IssueStatus) => {
    updateIssueStatus(id, newStatus);
    showToast({
      title: `Status set to ${newStatus}`,
      message: `Issue #${id} updated in municipal dispatch.`,
      type: 'success'
    });
    onRefresh();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete report ${id}?`)) {
      deleteIssue(id);
      showToast({
        title: 'Report Deleted',
        message: `Incident #${id} removed from database.`,
        type: 'info'
      });
      onRefresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, address, incident ID, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* View mode toggle & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="priority-desc">Highest Priority First</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500 uppercase flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Garbage">Garbage</option>
            <option value="Blocked Drain">Blocked Drains</option>
            <option value="Water Leakage">Water Leaks</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Demo vs Genuine Dropdown */}
          <select
            value={demoFilter}
            onChange={(e) => setDemoFilter(e.target.value as any)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Records</option>
            <option value="Genuine">Genuine Submissions</option>
            <option value="Demo">Demo Samples</option>
          </select>

          <span className="ml-auto text-slate-400 text-[11px]">
            Showing {sortedIssues.length} of {issues.length} reports
          </span>
        </div>
      </div>

      {/* Issues Display: Table or Grid */}
      {sortedIssues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No matching reports found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or reset the filter dropdowns.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Report & Thumbnail</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Reported</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={issue.imageUrl}
                          alt={issue.title}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {issue.id}
                            </span>
                            {issue.isDemo && (
                              <span className="text-[9px] font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                Demo
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 truncate">{issue.title}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="font-medium px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {issue.category}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <p className="truncate text-slate-700">{issue.location.address}</p>
                      {issue.location.neighborhood && (
                        <p className="text-[10px] text-slate-400">{issue.location.neighborhood}</p>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          issue.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : issue.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border focus:outline-none transition ${
                          issue.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : issue.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Inspect full details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(issue.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete issue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-card-hover p-4 cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 mb-3">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold bg-navy-950/80 text-white px-2 py-0.5 rounded">
                      {issue.id}
                    </span>
                    {issue.isDemo && (
                      <span className="text-[9px] font-bold uppercase bg-blue-600/90 text-white px-1.5 py-0.5 rounded">
                        Demo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-blue-600">{issue.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      issue.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : issue.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {issue.title}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{issue.location.address}</span>
                </p>
              </div>

              <div
                className="pt-3 border-t border-slate-100 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                  className="text-xs font-bold py-1 px-2 rounded-lg border bg-slate-50 border-slate-200"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectIssue(issue)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(issue.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
