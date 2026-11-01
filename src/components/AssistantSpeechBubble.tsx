import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Sparkles,
  Sliders,
  History,
  Zap,
} from 'lucide-react';
import { assistantVoice } from '../lib/assistantVoiceService';
import { CHARACTERS_VOICE, VoiceLine, CharacterExpression } from '../data/charactersVoice';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { AssistantHistoryModal } from './AssistantHistoryModal';

const EXPRESSION_EMOJIS: Record<CharacterExpression, string> = {
  happy: '✨',
  proud: '🔥',
  serious: '⚡',
  angry: '💢',
  surprised: '💥',
};

export const AssistantSpeechBubble: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [characterId, setCharacterId] = useState('goku');
  const [currentLine, setCurrentLine] = useState<VoiceLine | null>(null);
  const [fullText, setFullText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [isMuted, setIsMuted] = useState(() => !assistantVoice.getSettings().voiceEnabled);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = assistantVoice.subscribe((event) => {
      if (event.isSpeaking && event.renderedText) {
        setCharacterId(event.characterId);
        setCurrentLine(event.line);
        setFullText(event.renderedText);
        setIsAttackMode(event.isAttackAnimation);
        setIsVisible(true);
        startTypewriter(event.renderedText);
      } else {
        // Speech ended
        if (!event.isSpeaking) {
          // Keep visible briefly for user to finish reading, then hide unless interacted
          const timer = setTimeout(() => {
            setIsVisible(false);
            setIsAttackMode(false);
          }, 3500);
          return () => clearTimeout(timer);
        }
      }
    });

    return () => {
      unsubscribe();
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  const startTypewriter = (text: string) => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    setDisplayedText('');

    let index = 0;
    const speed = Math.max(15, Math.min(35, Math.floor(1800 / (text.length || 1))));

    typeIntervalRef.current = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
    }, speed);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    assistantVoice.updateSettings({ voiceEnabled: !next });
    if (next) {
      assistantVoice.stop();
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentLine) return;
    assistantVoice.stop();
    assistantVoice.speak(characterId, 'idle_motivation', {}, currentLine);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    assistantVoice.stop();
    setIsVisible(false);
    setIsAttackMode(false);
  };

  const char = CHARACTERS_VOICE[characterId] || CHARACTERS_VOICE.goku;
  const rarity = currentLine?.rarity || 'normal';
  const expression = currentLine?.expression || 'proud';

  return (
    <>
      {/* 1. Signature Attack Animation Aura & Particles Overlay */}
      <AnimatePresence>
        {isAttackMode && isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden animate-screenShake flex items-center justify-center"
          >
            {/* Pulsing Aura Vignette */}
            <div
              className="absolute inset-0 animate-auraPulseFast"
              style={{
                background: `radial-gradient(circle at center, transparent 30%, ${char.themeColor}35 70%, ${char.themeColor}60 100%)`,
              }}
            />

            {/* Glowing Signature Banner */}
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 14 }}
              className={`px-6 py-3 rounded-3xl border text-center shadow-2xl backdrop-blur-md ${
                characterId === 'madara' ? 'animate-tomoeGlow' : ''
              }`}
              style={{
                backgroundColor: 'rgba(10, 15, 30, 0.9)',
                borderColor: char.themeColor,
                boxShadow: `0 0 50px ${char.themeColor}80, inset 0 0 25px ${char.themeColor}40`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-xs font-black tracking-widest uppercase text-amber-300">
                  SIGNATURE ATTACK AWAKENED!
                </span>
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <h2
                className="text-xl sm:text-2xl font-black text-white tracking-wide"
                style={{ textShadow: `0 0 20px ${char.themeColor}` }}
              >
                {char.displayName.toUpperCase()} UNLEASHED!
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Animated Speech Bubble */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-40 max-w-[340px] sm:max-w-[400px] w-[calc(100vw-2rem)] select-none pointer-events-auto ${
              isAttackMode ? 'animate-screenShake' : ''
            }`}
          >
            <div
              className="p-4 rounded-3xl border shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: 'rgba(10, 15, 30, 0.94)',
                borderColor:
                  rarity === 'legendary'
                    ? '#F59E0B'
                    : rarity === 'hype'
                    ? char.themeColor
                    : 'rgba(56, 189, 248, 0.35)',
                boxShadow:
                  rarity === 'legendary'
                    ? '0 12px 40px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.3)'
                    : `0 12px 35px rgba(0, 0, 0, 0.7), 0 0 20px ${char.themeColor}35`,
              }}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    rarity === 'legendary'
                      ? 'linear-gradient(90deg, #F59E0B, #EF4444, #F59E0B)'
                      : `linear-gradient(90deg, ${char.themeColor}, #F97316)`,
                }}
              />

              {/* Header: Avatar, Name, Expression & Actions */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Avatar with Expression Badge */}
                  <div className="relative">
                    <img
                      src={char.avatarImage}
                      alt={char.displayName}
                      className="w-10 h-10 rounded-2xl object-cover border shadow-md"
                      style={{ borderColor: char.themeColor }}
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border text-[11px] flex items-center justify-center shadow-xs"
                      style={{ borderColor: char.themeColor }}
                      title={`Expression: ${expression}`}
                    >
                      {EXPRESSION_EMOJIS[expression]}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-white">{char.displayName}</h4>
                      {rarity === 'legendary' && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          LEGENDARY 🌟
                        </span>
                      )}
                      {rarity === 'hype' && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">
                          HYPE ⚡
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      AI Voice Assistant
                    </span>
                  </div>
                </div>

                {/* Bubble Action Controls */}
                <div className="flex items-center gap-1">
                  {/* Mute/Unmute */}
                  <button
                    onClick={handleToggleMute}
                    title={isMuted ? 'Unmute voice' : 'Mute voice'}
                    className={`p-1.5 rounded-lg transition active:scale-90 ${
                      isMuted
                        ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>

                  {/* Replay */}
                  <button
                    onClick={handleReplay}
                    title="Replay line"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90"
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* History */}
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    title="Message history"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90"
                  >
                    <History size={14} />
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    title="Voice settings"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90"
                  >
                    <Sliders size={14} />
                  </button>

                  {/* Dismiss */}
                  <button
                    onClick={handleDismiss}
                    title="Dismiss"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Typewriter Spoken Speech Bubble Text */}
              <div className="pl-1 pr-1 py-1">
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
                  "{displayedText}"
                  {displayedText.length < fullText.length && (
                    <span
                      className="inline-block w-1.5 h-3.5 ml-1 animate-pulse rounded-xs"
                      style={{ backgroundColor: char.themeColor }}
                    />
                  )}
                </p>
              </div>

              {/* Footer Indicator */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles size={10} style={{ color: char.themeColor }} />
                  <span>Synthesized voice</span>
                </span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="hover:underline text-slate-400 hover:text-white"
                >
                  Adjust Voice & Speed
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Modals */}
      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AssistantHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
};
