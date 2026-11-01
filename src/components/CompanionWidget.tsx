import React, { useState } from 'react';
import { Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';
import { assistantVoice } from '../lib/assistantVoiceService';

export const CompanionWidget: React.FC = () => {
  const { openCompanionHub, isFocusChamberOpen, isCompanionHubOpen } = useApp();
  const { character } = useTheme();
  const [bubbleOpen, setBubbleOpen] = useState(false);

  // Hide while in full-screen Zen mode or when hub is already open
  if (isFocusChamberOpen || isCompanionHubOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Quick In-Character Speech Bubble */}
      {bubbleOpen && (
        <div 
          className="animate-slideUp max-w-[240px] p-3.5 rounded-2xl border shadow-2xl text-left backdrop-blur-xl"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: character.theme.border,
            boxShadow: `0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px ${character.theme.primary}30`,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: character.theme.primary }}>
              {character.name}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-800">
              {character.anime}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-snug italic line-clamp-3">
            "{character.tagline}"
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                assistantVoice.playCoachAudio(character.id);
              }}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 transition active:scale-95"
              title="Play Coach Motivational Voice"
            >
              <Volume2 size={12} /> Coach Voice
            </button>
            <button
              onClick={() => {
                setBubbleOpen(false);
                openCompanionHub();
              }}
              className="text-xs font-bold flex items-center gap-1 hover:underline"
              style={{ color: character.theme.primary }}
            >
              Chat <Sparkles size={12} />
            </button>
            <button
              onClick={() => setBubbleOpen(false)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        onClick={() => {
          if (bubbleOpen) {
            setBubbleOpen(false);
            openCompanionHub();
          } else {
            setBubbleOpen(true);
          }
        }}
        title={`Chat with ${character.name}`}
        className="relative rounded-full transition-transform active:scale-95 group shadow-2xl"
      >
        <span
          className="absolute inset-0 rounded-full animate-auraPulse"
          style={{
            boxShadow: `0 0 20px ${character.theme.primary}80`,
            background: `${character.theme.primary}20`,
          }}
        />
        <CharacterAvatar
          character={character}
          size="md"
          showGlow={true}
        />
      </button>
    </div>
  );
};
