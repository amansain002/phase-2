import React, { useState } from 'react';
import { Key, Check, AlertCircle, ExternalLink, X, Trash2, Loader2, Sparkles } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey, testGeminiApiKey } from '../lib/gemini';
import { useTheme } from '../context/ThemeProvider';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const { character } = useTheme();
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'Please paste a Gemini API key before testing.' });
      return;
    }

    setIsTesting(true);
    setStatus({ type: 'idle', message: '' });

    const result = await testGeminiApiKey(apiKey.trim());
    setIsTesting(false);

    if (result.success) {
      saveStoredApiKey(apiKey.trim());
      setStatus({ type: 'success', message: result.message });
      if (onKeyUpdated) onKeyUpdated();
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  };

  const handleClear = () => {
    saveStoredApiKey('');
    setApiKey('');
    setStatus({ type: 'idle', message: 'Custom API key removed. Using intelligent in-character local engine.' });
    if (onKeyUpdated) onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="w-full max-w-md rounded-3xl bg-slate-900 border shadow-2xl overflow-hidden text-left"
        style={{ borderColor: `${character.theme.primary}50` }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${character.theme.primary}20`, color: character.theme.primary }}
            >
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Connect Gemini API Key</h3>
              <p className="text-[11px] text-slate-400">Enable real-time dynamic AI answers for {character.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Guide Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Sparkles size={14} />
              <span>How to get a 100% Free Gemini API Key:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Open Google AI Studio at the link below.</li>
              <li>Sign in with your Google account.</li>
              <li>Click <strong>"Create API key"</strong> and copy it (starts with <code className="text-amber-300 font-mono">AIzaSy...</code>).</li>
            </ol>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 underline pt-1"
            >
              <span>Open Google AI Studio</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AIzaSy... here"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              status.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : status.type === 'error'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              {status.type === 'success' && <Check size={14} className="shrink-0 mt-0.5" />}
              {status.type === 'error' && <AlertCircle size={14} className="shrink-0 mt-0.5" />}
              <span className="leading-snug">{status.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition px-2 py-1"
            >
              <Trash2 size={13} />
              <span>Remove Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-lg transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: character.theme.primary }}
            >
              {isTesting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Save & Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
