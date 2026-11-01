import React from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  ChevronDown,
  Bot,
  Trophy,
  User,
  Monitor,
  Smartphone,
  FileDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeProvider';
import { getXpRequiredForLevel, getRankDetails } from '../lib/rankEngine';
import { CharacterAvatar } from './CharacterAvatar';
import { TabId } from './BottomNav';

export interface HeaderProps {
  onNavigateTab?: (tab: TabId) => void;
  viewMode?: 'phone' | 'desktop';
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateTab,
  viewMode,
  onToggleViewMode,
}) => {
  const {
    progress,
    soundEnabled,
    toggleSound,
    openCompanionHub,
  } = useApp();

  const { character, setIsSwitcherOpen } = useTheme();

  const xpNeeded = getXpRequiredForLevel(progress.level);
  const xpPct = Math.min(100, Math.round((progress.currentXp / xpNeeded) * 100));
  const rank = getRankDetails(progress.level);

  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-surface/90 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* AnimeBuddy Mini Avatar with Click-to-Switch Drawer */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              title={`Switch assistant (Current: ${character.name})`}
              className="relative p-0.5 rounded-full border transition-all duration-300 group hover:scale-105"
              style={{
                borderColor: character.theme.primary,
                boxShadow: `0 0 10px ${character.theme.primary}40`,
              }}
            >
              <CharacterAvatar
                character={character}
                size="xs"
                showGlow={false}
              />
              <span 
                className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-surface border border-edge text-coffee-muted group-hover:text-saddle"
                style={{ borderColor: character.theme.primary }}
              >
                <ChevronDown size={9} />
              </span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-coffee font-display">
                UpLevel
              </h1>
              <span 
                className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border uppercase"
                style={{
                  backgroundColor: `${character.theme.primary}15`,
                  borderColor: `${character.theme.primary}40`,
                  color: character.theme.primary,
                }}
              >
                {character.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-coffee-muted mt-0.5">
              <span className="font-extrabold text-coffee text-[11px]">Lvl {progress.level}</span>
              <span>•</span>
              <span className="font-bold text-[11px] text-saddle">
                {rank.tier}
              </span>
              <span>•</span>
              <span className="tabular-nums text-[10px] text-coffee-muted">
                {progress.currentXp}/{xpNeeded} XP
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Desktop/Phone View Mode Switcher */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-edge bg-surface2 hover:bg-sand/30 text-xs font-bold text-coffee transition"
              title={viewMode === 'phone' ? 'Switch to Desktop Layout' : 'Switch to Phone Layout'}
            >
              {viewMode === 'phone' ? (
                <>
                  <Monitor size={13} style={{ color: character.theme.primary }} />
                  <span className="hidden lg:inline text-[11px]">Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone size={13} style={{ color: character.theme.primary }} />
                  <span className="hidden lg:inline text-[11px]">Phone</span>
                </>
              )}
            </button>
          )}

          {/* Pitch PDF Download Button */}
          <a
            href="/UpLevel_Ideathon_Proposal.pdf"
            download="UpLevel_Ideathon_Proposal.pdf"
            target="_blank"
            rel="noreferrer"
            title="Download Ideathon Pitch PDF Document (6 Pages)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-extrabold transition shadow-sm active:scale-95"
          >
            <FileDown size={13} className="text-indigo-400" />
            <span className="hidden sm:inline">Pitch PDF</span>
          </a>

          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-edge2 bg-sand/40 text-saddle text-xs font-extrabold">
            <Flame size={13} className="text-saddle animate-bounce" />
            <span>{progress.streak}d</span>
          </div>

          {/* Friends / Leaderboard Trigger */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('friends')}
            title="Campus Leaderboard & Friends"
            className="p-1.5 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-saddle transition"
          >
            <Trophy size={14} />
          </button>

          {/* AI Companion Quick Trigger */}
          <button
            onClick={openCompanionHub}
            title={`Chat with ${character.name}`}
            className="p-1.5 rounded-xl border transition"
            style={{
              borderColor: `${character.theme.primary}50`,
              backgroundColor: `${character.theme.primary}15`,
              color: character.theme.primary,
            }}
          >
            <Bot size={14} />
          </button>

          {/* Profile Quick Button */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('profile')}
            title="Open Profile"
            className="p-1.5 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-saddle transition"
          >
            <User size={14} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-1.5 rounded-xl border border-edge bg-surface text-coffee-muted hover:text-coffee transition"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-500" />}
          </button>
        </div>
      </div>

      {/* Mini XP Bar directly under header */}
      <div className="mt-2.5 h-1.5 w-full bg-olive/20 rounded-full overflow-hidden border border-edge">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${xpPct}%`,
            backgroundColor: character.theme.primary,
          }}
        />
      </div>
    </header>
  );
};
