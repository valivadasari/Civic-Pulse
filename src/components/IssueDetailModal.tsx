import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ThumbsUp,
  ShieldCheck,
  ChevronRight,
  Send,
  AlertOctagon,
  ArrowUpRight
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssuePriority } from '../types/issue';
import { updateIssueStatus, updateIssuePriority, upvoteIssue } from '../services/storageService';
import { useToast } from './Toast';

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpdate: () => void;
  onSelectOnMap?: (issue: CivicIssue) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpdate,
  onSelectOnMap
}) => {
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [priorityOverride, setPriorityOverride] = useState<IssuePriority>(issue?.priority || 'Medium');
  const [overrideReason, setOverrideReason] = useState('');
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [statusNote, setStatusNote] = useState('');
  const { showToast } = useToast();

  if (!issue) return null;

  const handleStatusChange = (newStatus: IssueStatus) => {
    updateIssueStatus(issue.id, newStatus, statusNote || `Status changed to ${newStatus}`);
    showToast({
      title: `Status Updated to ${newStatus}`,
      message: `Issue ${issue.id} has been transitioned.`,
      type: 'success'
    });
    setStatusNote('');
    onUpdate();
  };

  const handleSavePriority = () => {
    if (!overrideReason.trim()) {
      showToast({
        title: 'Reason Required',
        message: 'Administrative priority changes require a transparent justification.',
        type: 'warning'
      });
      return;
    }

    updateIssuePriority(issue.id, priorityOverride, overrideReason.trim());
    showToast({
      title: 'Priority Adjusted',
      message: `Priority updated to ${priorityOverride}. Reason logged to audit trail.`,
      type: 'success'
    });
    setIsEditingPriority(false);
    onUpdate();
  };

  const handleUpvote = () => {
    const newCount = upvoteIssue(issue.id);
    setUpvotes(newCount);
    showToast({
      title: 'Citizen Upvote Recorded',
      message: 'Higher community upvotes increase municipal dispatch prioritization.',
      type: 'info'
    });
    onUpdate();
  };

  const categoryColors = {
    Pothole: 'bg-amber-100 text-amber-800 border-amber-200',
    Garbage: 'bg-purple-100 text-purple-800 border-purple-200',
    'Blocked Drain': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Water Leakage': 'bg-blue-100 text-blue-800 border-blue-200',
    Other: 'bg-slate-100 text-slate-800 border-slate-200'
  }[issue.category];

  const priorityColors = {
    High: 'bg-rose-100 text-rose-800 border-rose-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }[issue.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-modal overflow-hidden border border-slate-200 my-auto">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {issue.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryColors}`}>
                {issue.category}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${priorityColors}`}>
                {issue.priority} Priority
              </span>
              {issue.isDemo && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Demo Sample
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">{issue.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Grid: Photo & Core Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Image with zoom badge */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video md:aspect-auto h-56 md:h-64 group">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 p-2 bg-navy-950/80 backdrop-blur-sm rounded-lg text-white text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{issue.location.address}</span>
                </span>
                {onSelectOnMap && (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectOnMap(issue);
                    }}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5 ml-2 flex-shrink-0"
                  >
                    View Map <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Status Switcher & Location Details */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Dispatch Lifecycle Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Open', 'In Progress', 'Resolved'] as IssueStatus[]).map((st) => {
                    const isCurrent = issue.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1 ${
                          isCurrent
                            ? st === 'Resolved'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : st === 'In Progress'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {st === 'In Progress' && <Clock className="w-3.5 h-3.5" />}
                        {st === 'Open' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Reported Date */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Coordinates:
                  </span>
                  <span className="font-mono text-slate-800">
                    {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Reported:
                  </span>
                  <span className="text-slate-800">
                    {new Date(issue.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {issue.reporterName && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Reporter:</span>
                    <span className="text-slate-800">{issue.reporterName}</span>
                  </div>
                )}
              </div>

              {/* Citizen Upvote Section */}
              <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="text-xs text-blue-950">
                  <p className="font-semibold">{upvotes} Citizen Endorsements</p>
                  <p className="text-[11px] text-blue-700">Community verified incident</p>
                </div>
                <button
                  onClick={handleUpvote}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote</span>
                </button>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Citizen Description
            </h4>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Gemini AI Multi-Modal Inspection Report */}
          {issue.aiAnalysis && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-teal-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Gemini Vision AI Analysis
                      {issue.aiAnalysis.isSimulated ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          Demo Simulation
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Genuine Gemini 1.5 Flash
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Evaluated on {new Date(issue.aiAnalysis.analyzedAt).toLocaleTimeString()} • Confidence: {Math.round(issue.aiAnalysis.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Hazard Index</span>
                  <span
                    className={`text-lg font-black ${
                      issue.aiAnalysis.hazardScore >= 7
                        ? 'text-rose-600'
                        : issue.aiAnalysis.hazardScore >= 5
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {issue.aiAnalysis.hazardScore} / 10
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs font-medium text-slate-800">
                <span className="font-bold text-blue-900">Summary: </span>
                {issue.aiAnalysis.summary}
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Physical Assessment & Safety Reasoning:</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80">
                  {issue.aiAnalysis.reasoning}
                </p>
              </div>

              {/* Municipal Action */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-900">Recommended Dispatch Action: </span>
                  <span className="text-teal-800">{issue.aiAnalysis.nextAction}</span>
                </div>
              </div>

              {/* Detected Visual Features */}
              {issue.aiAnalysis.detectedFeatures && issue.aiAnalysis.detectedFeatures.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Visual Signatures:</span>
                  {issue.aiAnalysis.detectedFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Priority Adjustment Tool */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Administrative Priority Override</h4>
                <p className="text-[11px] text-slate-500">
                  Transparent human-in-the-loop audit controls
                </p>
              </div>
              {!isEditingPriority ? (
                <button
                  onClick={() => setIsEditingPriority(true)}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
                >
                  Adjust Priority
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingPriority(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditingPriority && (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  {(['Low', 'Medium', 'High'] as IssuePriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityOverride(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        priorityOverride === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Justification for priority modification (required)..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleSavePriority}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Save & Log Justification
                </button>
              </div>
            )}

            {issue.priorityOverrideReason && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-bold">Prior override reason: </span>
                {issue.priorityOverrideReason}
              </div>
            )}
          </div>

          {/* Audit Trail & Status History */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Audit Timeline & Dispatch History
              </h4>
              <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4">
                {issue.statusHistory.map((hist, i) => (
                  <div key={i} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{hist.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {hist.note && <p className="text-slate-600 mt-0.5">{hist.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
