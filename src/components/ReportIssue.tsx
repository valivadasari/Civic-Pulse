import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload,
  Camera,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
  ThumbsUp,
  HelpCircle
} from 'lucide-react';
import {
  CivicIssue,
  IssueCategory,
  IssuePriority,
  AIAnalysisResult,
  LocationCoords
} from '../types/issue';
import { SAMPLE_PRESETS } from '../data/demoData';
import { analyzeIssueWithGemini } from '../services/geminiService';
import { findPotentialDuplicates, DuplicateMatch } from '../utils/duplicateDetector';
import { addIssue, upvoteIssue } from '../services/storageService';
import { useToast } from './Toast';
import { MapView } from './MapView';

interface ReportIssueProps {
  existingIssues: CivicIssue[];
  onReportCreated: (newIssue: CivicIssue) => void;
  onNavigateToDashboard: () => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({
  existingIssues,
  onReportCreated,
  onNavigateToDashboard
}) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Pothole');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [reporterName, setReporterName] = useState('');

  // Location state
  const [location, setLocation] = useState<LocationCoords>({
    lat: 37.7833,
    lng: -122.4089,
    address: '845 Market St, Downtown',
    neighborhood: 'Downtown Core'
  });
  const [showMapPicker, setShowMapPicker] = useState(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Duplicate Detection state
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [dismissDuplicateWarning, setDismissDuplicateWarning] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const categories: { label: IssueCategory; icon: string; desc: string }[] = [
    { label: 'Pothole', icon: '🕳️', desc: 'Cavities, surface ruts, asphalt cracks' },
    { label: 'Garbage', icon: '🗑️', desc: 'Overflowing bins, illegal litter dump' },
    { label: 'Blocked Drain', icon: '🌊', desc: 'Flooded catch basin, leaf compaction' },
    { label: 'Water Leakage', icon: '💧', desc: 'Burst water mains, hydrant leaks' },
    { label: 'Other', icon: '⚠️', desc: 'Damaged signs, broken street bollards' }
  ];

  // Handle Photo File selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          title: 'File Too Large',
          message: 'Please upload an image smaller than 10MB.',
          type: 'warning'
        });
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setAiAnalysis(null);
    }
  };

  // Quick Preset Selector for instant Hackathon Testing
  const applyPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setPhotoPreview(preset.imageUrl);
    setPhotoFile(null);
    setLocation({
      lat: preset.lat,
      lng: preset.lng,
      address: preset.address,
      neighborhood: preset.address.split(',')[1]?.trim()
    });
    setAiAnalysis(null);
    setDismissDuplicateWarning(false);

    // Check duplicates with new preset
    checkDuplicates(preset.title, preset.description, preset.category, preset.lat, preset.lng);

    showToast({
      title: `Preset Loaded: ${preset.category}`,
      message: 'Photo, coordinates, and description applied. Click "Analyze with AI" to test.',
      type: 'info'
    });
  };

  // Run Duplicate Detection
  const checkDuplicates = (
    currentTitle: string,
    currentDesc: string,
    currentCat: IssueCategory,
    lat: number,
    lng: number
  ) => {
    if (!currentTitle && !currentDesc) {
      setDuplicates([]);
      return;
    }
    const matches = findPotentialDuplicates(
      {
        title: currentTitle,
        description: currentDesc,
        category: currentCat,
        lat,
        lng
      },
      existingIssues
    );
    setDuplicates(matches);
  };

  // Trigger Gemini AI Analysis
  const handleRunAiAnalysis = async () => {
    if (!photoPreview && !description.trim()) {
      showToast({
        title: 'Input Needed',
        message: 'Please provide at least a photo or an issue description for AI vision analysis.',
        type: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Ingesting visual tensor & description...');

    try {
      setTimeout(() => setAnalysisStep('Evaluating road surface geometry & hazards...'), 600);
      setTimeout(() => setAnalysisStep('Running Gemini multimodal hazard classification...'), 1200);

      const result = await analyzeIssueWithGemini(
        photoFile || photoPreview,
        description,
        category
      );

      setAiAnalysis(result);

      showToast({
        title: result.isSimulated ? 'AI Analysis Complete (Demo Mode)' : 'Gemini Vision AI Analysis Ready',
        message: `Likely Category: ${result.likelyCategory} • Recommended: ${result.recommendedPriority} Priority`,
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Analysis Error',
        message: err.message || 'Failed to complete AI analysis.',
        type: 'error'
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // 1-Click apply AI Recommendation
  const handleApplyAiRecommendation = () => {
    if (!aiAnalysis) return;
    setCategory(aiAnalysis.likelyCategory);
    setPriority(aiAnalysis.recommendedPriority);
    showToast({
      title: 'Recommendation Applied',
      message: `Form set to ${aiAnalysis.likelyCategory} with ${aiAnalysis.recommendedPriority} Priority.`,
      type: 'success'
    });
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Please provide an issue description.';
    if (!location.address) newErrors.location = 'Incident location address is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({
        title: 'Incomplete Submission',
        message: 'Please correct the highlighted fields before submitting.',
        type: 'warning'
      });
      return;
    }

    // If active duplicate exists and user has not confirmed bypass
    if (duplicates.length > 0 && !dismissDuplicateWarning) {
      showToast({
        title: 'Potential Duplicate Warning',
        message: 'A similar report was detected nearby. Please review the warning below.',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fallbackImage =
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';

      const newRecord = addIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'Open',
        location,
        imageUrl: photoPreview || fallbackImage,
        isDemo: false, // Genuine submission!
        reporterName: reporterName.trim() || 'Civic Volunteer',
        aiAnalysis: aiAnalysis || undefined
      });

      // Confetti celebratory burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      showToast({
        title: 'Report Submitted Successfully!',
        message: `Incident #${newRecord.id} has been logged and queued for municipal triage.`,
        type: 'success'
      });

      onReportCreated(newRecord);
    } catch (err: any) {
      showToast({
        title: 'Submission Error',
        message: err.message || 'Could not save report.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1-Click Quick Presets for Hackathon Judges */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-850 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-400/20 text-teal-400 border border-teal-400/30">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Hackathon Quick Presets</h3>
              <p className="text-xs text-slate-300">
                1-click test scenarios with realistic photos and coordinates for judges
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800/80 self-start sm:self-auto">
            Speed Demo
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-2.5 bg-navy-800/90 hover:bg-navy-700/90 border border-slate-700/80 hover:border-teal-400/50 rounded-xl text-left transition duration-200 group flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-100 group-hover:text-teal-300 leading-tight block mb-1">
                {preset.name}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                <span>{preset.category}</span>
                <span className="text-teal-400 opacity-0 group-hover:opacity-100 transition">
                  Apply →
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Photo & AI Inspection (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Photo Upload Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Hazard Photo
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setPhotoFile(null);
                      setAiAnalysis(null);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 group">
                  <img
                    src={photoPreview}
                    alt="Hazard preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to upload or drag & drop photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* AI Trigger Button */}
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing || (!photoPreview && !description.trim())}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{analysisStep || 'Analyzing with Gemini Vision...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <span>Analyze with Gemini AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Analysis Result Card */}
            {aiAnalysis && (
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-teal-50/40 rounded-2xl border border-blue-200/90 p-5 shadow-card space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Gemini AI Intelligence
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Confidence: {Math.round(aiAnalysis.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  {aiAnalysis.isSimulated ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Simulated Demo
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Gemini Live
                    </span>
                  )}
                </div>

                {/* AI Summary */}
                <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-800">
                  <span className="font-bold text-blue-950">AI Summary: </span>
                  {aiAnalysis.summary}
                </div>

                {/* Suggested Category & Priority Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Likely Category
                    </span>
                    <span className="font-bold text-slate-800">{aiAnalysis.likelyCategory}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Recommended Priority
                    </span>
                    <span
                      className={`font-bold ${
                        aiAnalysis.recommendedPriority === 'High'
                          ? 'text-rose-600'
                          : aiAnalysis.recommendedPriority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {aiAnalysis.recommendedPriority}
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/80">
                  <strong className="text-slate-800">Physical Evidence: </strong>
                  {aiAnalysis.reasoning}
                </p>

                {/* Dispatch recommendation */}
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Next Action: </span>
                    {aiAnalysis.nextAction}
                  </div>
                </div>

                {/* 1-Click Apply AI Recommendation button */}
                <button
                  type="button"
                  onClick={handleApplyAiRecommendation}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Accept AI Category & Priority</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Issue Details & Location (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = category === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => {
                          setCategory(cat.label);
                          checkDuplicates(title, description, cat.label, location.lat, location.lng);
                        }}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{cat.icon}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Report Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deep pothole causing flat tires on 5th Ave"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                    checkDuplicates(e.target.value, description, category, location.lat, location.lng);
                  }}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${
                    errors.title ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe severity, road impact, duration, and any immediate hazards..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                    checkDuplicates(title, e.target.value, category, location.lat, location.lng);
                  }}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${
                    errors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Priority Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Initial Priority Level
                  </label>
                  <span className="text-[11px] text-slate-500">
                    (AI can recommend, or set manually)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as IssuePriority[]).map((p) => {
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? p === 'High'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : p === 'Medium'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p === 'High' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Picker Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Incident Location
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showMapPicker ? 'Hide Map Picker' : 'Pick Pin on Map'}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Street address or cross streets..."
                  value={location.address}
                  onChange={(e) => {
                    const newAddr = e.target.value;
                    setLocation((prev) => ({ ...prev, address: newAddr }));
                    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          const { latitude, longitude } = pos.coords;
                          setLocation({
                            lat: latitude,
                            lng: longitude,
                            address: `My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                          });
                          showToast({
                            title: 'GPS Coordinates Captured',
                            message: 'Pin set to your current device location.',
                            type: 'info'
                          });
                        });
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Use Device GPS
                  </button>
                </div>

                {/* Inline Map Picker */}
                {showMapPicker && (
                  <div className="h-60 rounded-xl overflow-hidden border border-slate-300 mt-2">
                    <MapView
                      issues={[]}
                      onSelectIssue={() => {}}
                      pickerMode={true}
                      initialCenter={[location.lat, location.lng]}
                      initialZoom={14}
                      onPickLocation={(coords) => {
                        setLocation({
                          lat: coords.lat,
                          lng: coords.lng,
                          address: coords.address
                        });
                        checkDuplicates(title, description, category, coords.lat, coords.lng);
                        showToast({
                          title: 'Pin Placed',
                          message: coords.address,
                          type: 'info'
                        });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Reporter Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Citizen / Reporter Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan or Leave blank for Anonymous"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duplicate Detection Alert Banner */}
            {duplicates.length > 0 && !dismissDuplicateWarning && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-amber-950">
                      Potential Duplicate Report Detected!
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      We identified {duplicates.length} active issue nearby matching this category or description.
                    </p>
                  </div>
                </div>

                {/* Top duplicate card */}
                {duplicates.slice(0, 1).map((dup, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={dup.issue.imageUrl}
                        alt="Existing issue"
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold mr-1.5">
                          {dup.issue.id}
                        </span>
                        <span className="font-bold text-slate-900 truncate block">
                          {dup.issue.title}
                        </span>
                        <p className="text-[11px] text-amber-900 mt-0.5">
                          ⚠️ {dup.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        upvoteIssue(dup.issue.id);
                        showToast({
                          title: 'Upvoted Existing Report',
                          message: `Supported #${dup.issue.id} instead of duplicating.`,
                          type: 'success'
                        });
                        onNavigateToDashboard();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Upvote Existing</span>
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/80 text-xs">
                  <span className="text-[11px] text-amber-800">
                    Is this distinct from the existing incident?
                  </span>
                  <button
                    type="button"
                    onClick={() => setDismissDuplicateWarning(true)}
                    className="font-bold text-amber-900 hover:text-amber-950 underline text-xs"
                  >
                    Confirm & Submit Anyway →
                  </button>
                </div>
              </div>
            )}

            {/* Submission Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Municipal Feed...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Community Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
