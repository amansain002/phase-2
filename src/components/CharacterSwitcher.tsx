import React, { useEffect } from 'react';
import { CHARACTERS } from '../data/characters';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, Volume2, VolumeX, Bell } from 'lucide-react';
import { assistantVoice } from '../lib/assistantVoiceService';

export const CharacterSwitcher: React.FC = () => {
  const {
    character,
    setCharacter,
    isSwitcherOpen,
    setIsSwitcherOpen,
    soundEnabled,
    setSoundEnabled,
    sendNotification,
  } = useTheme();

  const characterList = Object.values(CHARACTERS);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSwitcherOpen) {
        setIsSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSwitcherOpen, setIsSwitcherOpen]);

  const handleSelectCharacter = (charId: string) => {
    setCharacter(charId);
    assistantVoice.playCoachAudio(charId);
  };

  const handlePreviewVoice = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation();
    assistantVoice.playCoachAudio(charId);
  };

  return (
    <AnimatePresence>
      {isSwitcherOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsSwitcherOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-in Panel from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative w-full max-w-md h-full bg-slate-900/95 border-l border-slate-800 text-white shadow-2xl flex flex-col z-10 backdrop-blur-xl"
            style={{
              borderColor: character.theme.border,
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${character.theme.primary}25` }}
                >
                  <RefreshCw className="w-4 h-4" style={{ color: character.theme.primary }} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Switch Assistant</h3>
                  <p className="text-xs text-slate-400">Themes & voice assistant sync instantly</p>
                </div>
              </div>

              <button
                onClick={() => setIsSwitcherOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close switcher"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Character List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {characterList.map((char) => {
                const isActive = char.id === character.id;

                return (
                  <motion.div
                    key={char.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectCharacter(char.id)}
                    className={`relative p-3.5 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center gap-3.5 overflow-hidden ${
                      isActive
                        ? 'bg-slate-800/90 shadow-lg'
                        : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800/80'
                    }`}
                    style={{
                      borderColor: isActive ? char.theme.primary : undefined,
                      boxShadow: isActive ? `0 0 20px ${char.theme.primary}25` : undefined,
                    }}
                  >
                    {/* Active Ribbon / Gradient indicator */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: char.theme.primary }}
                      />
                    )}

                    {/* 56px Avatar as specified */}
                    <div className="shrink-0">
                      <CharacterAvatar character={char} size="md" showGlow={isActive} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-sm text-white truncate">{char.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handlePreviewVoice(e, char.id)}
                            title={`Preview ${char.name}'s voice`}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-700/80 hover:bg-slate-700 text-sky-400 border border-slate-600 flex items-center gap-1 active:scale-95"
                          >
                            <Volume2 size={11} />
                            <span>Voice</span>
                          </button>
                          {isActive && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${char.theme.primary}20`,
                                color: char.theme.primary,
                              }}
                            >
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-400 truncate mb-1">
                        {char.anime} • <span style={{ color: char.theme.primary }}>{char.title}</span>
                      </p>

                      <p className="text-[11px] text-slate-400/90 line-clamp-1 italic">
                        "{char.tagline}"
                      </p>

                      {/* Theme Colors Palette Indicator */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 font-mono">Palette:</span>
                        <div
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: char.theme.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: char.theme.secondary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: char.theme.accent }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer with App Controls */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Sound FX On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span>Muted</span>
                  </>
                )}
              </button>

              {/* Test Notification Trigger */}
              <button
                onClick={() => {
                  const notif = character.notifications[Math.floor(Math.random() * character.notifications.length)];
                  sendNotification(notif.title, notif.message);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition"
              >
                <Bell className="w-3.5 h-3.5" style={{ color: character.theme.primary }} />
                <span>Test Alert</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
