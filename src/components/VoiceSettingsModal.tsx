import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Moon,
  Zap,
  Check,
  Play,
  RotateCcw,
  Heart,
} from 'lucide-react';
import { assistantVoice, VoiceAssistantSettings } from '../lib/assistantVoiceService';
import { useTheme } from '../context/ThemeProvider';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { character } = useTheme();
  const [settings, setSettings] = useState<VoiceAssistantSettings>(assistantVoice.getSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isStruggling, setIsStruggling] = useState(() => assistantVoice.isStrugglingMode());

  useEffect(() => {
    if (isOpen) {
      setSettings(assistantVoice.getSettings());

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const updateVoices = () => {
          const list = window.speechSynthesis.getVoices();
          setAvailableVoices(list);
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, [isOpen]);

  const handleChange = <K extends keyof VoiceAssistantSettings>(
    key: K,
    value: VoiceAssistantSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    assistantVoice.updateSettings({ [key]: value });
  };

  const handleTestVoice = () => {
    setIsPlayingTest(true);
    assistantVoice.stop();
    assistantVoice.speak(
      character.id,
      'idle_motivation',
      { name: 'Warrior' },
      undefined
    );
    setTimeout(() => setIsPlayingTest(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: Partial<VoiceAssistantSettings> = {
      voiceEnabled: true,
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
      onlyBigMoments: false,
      onlyTextNoVoice: false,
      quietHoursEnabled: false,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      preferredVoiceURI: undefined,
    };
    setSettings((prev) => ({ ...prev, ...defaults }));
    assistantVoice.updateSettings(defaults);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg max-h-[90vh] rounded-3xl border bg-slate-900 text-white shadow-2xl flex flex-col overflow-hidden"
          style={{ borderColor: character.theme.border }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${character.theme.primary}20` }}
              >
                <Sliders className="w-5 h-5" style={{ color: character.theme.primary }} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Voice Assistant Settings</h3>
                <p className="text-[11px] text-slate-400">Configure text-to-speech, speeds & quiet hours</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Settings Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Primary Voice Enable Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    settings.voiceEnabled
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {settings.voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Voice Speech Synthesis</h4>
                  <p className="text-[11px] text-slate-400">
                    Spoken aloud in {character.name}'s personality
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleChange('voiceEnabled', !settings.voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.voiceEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Only on Big Moments */}
              <button
                type="button"
                onClick={() => handleChange('onlyBigMoments', !settings.onlyBigMoments)}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  settings.onlyBigMoments
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Only on Big Moments
                  </span>
                  {settings.onlyBigMoments && <Check size={14} className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Speaks only on level up, rank up, boss tasks & streaks.
                </p>
              </button>

              {/* Only Text, No Voice */}
              <button
                type="button"
                onClick={() => handleChange('onlyTextNoVoice', !settings.onlyTextNoVoice)}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  settings.onlyTextNoVoice
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-sky-400" /> Only Text, No Voice
                  </span>
                  {settings.onlyTextNoVoice && <Check size={14} className="text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Shows typewriter speech bubbles silently without audio.
                </p>
              </button>
            </div>

            {/* Volume & Speech Rate Sliders */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Volume</span>
                  <span className="text-emerald-400 font-mono">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Speech Speed / Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Speech Speed</span>
                  <span className="text-sky-400 font-mono">{settings.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.75"
                  step="0.05"
                  value={settings.rate}
                  onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5x Slow</span>
                  <span>1.0x Normal</span>
                  <span>1.75x Fast</span>
                </div>
              </div>
            </div>

            {/* System Voice Picker */}
            {availableVoices.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  System Voice (Device Synthesis)
                </label>
                <select
                  value={settings.preferredVoiceURI || ''}
                  onChange={(e) =>
                    handleChange('preferredVoiceURI', e.target.value || undefined)
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">Default (Auto-matched per character)</option>
                  {availableVoices
                    .filter((v) => v.lang.startsWith('en'))
                    .map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  {character.name} defaults to dynamic pitch & rate calibrated to their personality.
                </p>
              </div>
            )}

            {/* Wellbeing Safeguards: I'm struggling (24h gentle mode) */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">Gentle Mode ("I'm struggling")</span>
                </div>
                <button
                  onClick={() => {
                    const next = !isStruggling;
                    setIsStruggling(next);
                    assistantVoice.setStrugglingMode(next);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isStruggling ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isStruggling ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Switches {character.name} to a warm, deeply supportive tone for 24 hours. Zero stern or demanding lines.
              </p>
            </div>

            {/* Quiet Hours */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Quiet Hours (Auto-Mute)</span>
                </div>
                <button
                  onClick={() =>
                    handleChange('quietHoursEnabled', !settings.quietHoursEnabled)
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.quietHoursEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.quietHoursEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Mute After</label>
                    <select
                      value={settings.quietHoursStart}
                      onChange={(e) =>
                        handleChange('quietHoursStart', parseInt(e.target.value))
                      }
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? '12:00 AM (Midnight)' : i <= 12 ? `${i}:00 AM` : `${i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Unmute At</label>
                    <select
                      value={settings.quietHoursEnd}
                      onChange={(e) =>
                        handleChange('quietHoursEnd', parseInt(e.target.value))
                      }
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? '12:00 AM (Midnight)' : i <= 12 ? `${i}:00 AM` : `${i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Test Button & Reset */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Defaults</span>
            </button>

            <button
              onClick={handleTestVoice}
              disabled={isPlayingTest}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white shadow-lg transition active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Play size={13} fill="currentColor" />
              <span>{isPlayingTest ? 'Testing...' : 'Test Voice Line'}</span>
            </button>
          </div>

          {/* Legal Note */}
          <div className="px-4 py-2 bg-black/40 text-center border-t border-slate-800/60">
            <p className="text-[10px] text-slate-400">
              Characters are fan-inspired. Voice is synthesized.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
