import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, RotateCcw, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { assistantVoice, AssistantHistoryItem } from '../lib/assistantVoiceService';
import { CHARACTERS_VOICE } from '../data/charactersVoice';
import { useTheme } from '../context/ThemeProvider';

interface AssistantHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantHistoryModal: React.FC<AssistantHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { character } = useTheme();
  const [history, setHistory] = useState<AssistantHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(assistantVoice.getHistory());
    }
  }, [isOpen]);

  const handleClear = () => {
    assistantVoice.clearHistory();
    setHistory([]);
  };

  const handleReplay = (item: AssistantHistoryItem) => {
    assistantVoice.stop();
    assistantVoice.speak(
      item.characterId,
      item.trigger,
      {},
      {
        text: item.text,
        rarity: item.rarity,
        expression: 'proud',
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg max-h-[85vh] rounded-3xl border bg-slate-900 text-white shadow-2xl flex flex-col overflow-hidden"
          style={{ borderColor: character.theme.border }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${character.theme.primary}20` }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: character.theme.primary }} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Assistant Message Log</h3>
                <p className="text-[11px] text-slate-400">History of your anime companion's voice lines</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Clear history"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition text-xs flex items-center gap-1"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="p-10 text-center space-y-2 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs font-semibold">No assistant messages logged yet</p>
                <p className="text-[11px] text-slate-500">
                  Complete tasks, level up, or select a character to hear them speak!
                </p>
              </div>
            ) : (
              history.map((item) => {
                const char = CHARACTERS_VOICE[item.characterId] || CHARACTERS_VOICE.goku;
                const isLegendary = item.rarity === 'legendary';
                const isHype = item.rarity === 'hype';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 transition space-y-2"
                    style={{
                      borderColor: isLegendary
                        ? '#F59E0B'
                        : isHype
                        ? `${char.themeColor}70`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={char.avatarImage}
                          alt={char.displayName}
                          className="w-7 h-7 rounded-full object-cover border"
                          style={{ borderColor: char.themeColor }}
                        />
                        <span className="font-bold text-xs text-white">{char.displayName}</span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md border"
                          style={{
                            borderColor: `${char.themeColor}40`,
                            backgroundColor: `${char.themeColor}15`,
                            color: char.themeColor,
                          }}
                        >
                          {item.trigger.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {isLegendary && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold flex items-center gap-0.5">
                            🌟 LEGENDARY
                          </span>
                        )}
                        {isHype && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold flex items-center gap-0.5">
                            ⚡ HYPE
                          </span>
                        )}
                        <span>{item.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed italic pl-1">
                      "{item.text}"
                    </p>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleReplay(item)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1 active:scale-95"
                      >
                        <Volume2 size={12} />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 border-t border-slate-800 text-center bg-slate-950/80">
            <p className="text-[10px] text-slate-400">
              Characters are fan-inspired. Voice is synthesized.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
