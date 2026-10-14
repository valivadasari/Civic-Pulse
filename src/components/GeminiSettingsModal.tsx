import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '../services/geminiService';
import { useToast } from './Toast';

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: OK' }] }]
        })
      });

      if (resp.ok) {
        setTestResult({
          success: true,
          message: 'Connection verified! Google Gemini Vision API is ready to analyze civic hazards.'
        });
      } else {
        const errorData = await resp.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: `Authentication failed (${resp.status}): ${errorData?.error?.message || 'Invalid API Key'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network connectivity error: ${err.message || 'Could not reach Google Gemini API'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveGeminiApiKey(apiKey);
    onKeyUpdated();
    showToast({
      title: apiKey.trim() ? 'Gemini API Key Saved' : 'Gemini Key Cleared',
      message: apiKey.trim()
        ? 'Multimodal Gemini Vision AI is now active for all issue analysis.'
        : 'App switched to transparent simulated demo mode.',
      type: 'success'
    });
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    saveGeminiApiKey('');
    setTestResult(null);
    onKeyUpdated();
    showToast({
      title: 'API Key Removed',
      message: 'Reverted to transparent simulated analysis mode.',
      type: 'info'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-modal overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-400">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gemini AI Configuration</h3>
              <p className="text-xs text-blue-200">Multimodal Vision & Hazard Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">Ethical AI Guarantee:</span> CivicPulse AI never fakes real AI responses.
              When a Gemini key is configured, live vision models analyze the actual photo pixels. If no key is set, the system transparently indicates <span className="font-semibold">Simulated Demo Mode</span>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Key is stored in your browser session/localStorage.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Environment Variable tip for Vercel */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-700">Production / Vercel Setup:</span>
            <p>
              Set <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">VITE_GEMINI_API_KEY</code> in your <code className="font-mono text-[11px]">.env</code> file or host environment settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 transition"
            >
              Clear Key
            </button>
          ) : (
            <span className="text-xs text-slate-400">Simulation fallback active</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Testing...
                </>
              ) : (
                'Test Key'
              )}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
