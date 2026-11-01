import React from 'react';
import {
  Home,
  CalendarDays,
  Dumbbell,
  Bot,
  Timer,
  Wallet,
  Users,
  User,
  Flame,
  Smartphone,
  Monitor,
  ChevronRight,
  LucideIcon,
  BookOpen,
  Zap,
  FileDown,
} from 'lucide-react';
import { TabId } from './BottomNav';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from './CharacterAvatar';
import { getRankDetails, getXpRequiredForLevel } from '../lib/rankEngine';

interface DesktopSidebarProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  viewMode: 'phone' | 'desktop';
  onToggleViewMode: () => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

const SIDEBAR_ITEMS: NavItem[] = [
  { id: 'home', label: 'Tasks & Goals', icon: Home, shortcut: '1' },
  { id: 'learn', label: 'Learn Mode', icon: BookOpen, shortcut: '2' },
  { id: 'practice', label: 'Practice Hub', icon: Zap, shortcut: '3' },
  { id: 'timetable', label: 'Timetable Plan', icon: CalendarDays, shortcut: '4' },
  { id: 'workout', label: 'Gym Workout', icon: Dumbbell, shortcut: '5' },
  { id: 'companion', label: 'AI Coach', icon: Bot, shortcut: '6' },
  { id: 'focus', label: 'Zen Chamber', icon: Timer, shortcut: '7' },
  { id: 'budget', label: 'Pocket Budget', icon: Wallet, shortcut: '8' },
  { id: 'friends', label: 'Study Circle', icon: Users, shortcut: '9' },
  { id: 'profile', label: 'Profile', icon: User, shortcut: '0' },
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
  viewMode,
  onToggleViewMode,
}) => {
  const { character, setIsSwitcherOpen } = useTheme();
  const { progress } = useApp();

  const xpNeeded = getXpRequiredForLevel(progress.level);
  const xpPct = Math.min(100, Math.round((progress.currentXp / xpNeeded) * 100));
  const rank = getRankDetails(progress.level);

  return (
    <aside
      className="w-64 xl:w-72 h-screen sticky top-0 flex flex-col justify-between border-r border-edge bg-surface/95 backdrop-blur-2xl p-4 select-none z-20 transition-all duration-300"
      style={{
        borderRightColor: `${character.theme.primary}25`,
      }}
    >
      {/* Top Branding & View Mode Switcher */}
      <div className="space-y-4">
        {/* App Logo & Theme Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-edge">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: character.theme.primary }}
            >
              UL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-coffee font-display">
                  UpLevel
                </span>
                <span
                  className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border uppercase"
                  style={{
                    backgroundColor: `${character.theme.primary}15`,
                    borderColor: `${character.theme.primary}40`,
                    color: character.theme.primary,
                  }}
                >
                  Critique AI
                </span>
              </div>
              <p className="text-[11px] text-coffee-muted">Student & Gym Companion</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Phone View vs Desktop View */}
        <div className="p-1 rounded-2xl bg-surface2 border border-edge flex items-center">
          <button
            onClick={onToggleViewMode}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'phone'
                ? 'text-white shadow-sm'
                : 'text-coffee-muted hover:text-coffee'
            }`}
            style={
              viewMode === 'phone'
                ? { backgroundColor: character.theme.primary }
                : undefined
            }
          >
            <Smartphone size={13} />
            <span>Phone</span>
          </button>

          <button
            onClick={onToggleViewMode}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'desktop'
                ? 'text-white shadow-sm'
                : 'text-coffee-muted hover:text-coffee'
            }`}
            style={
              viewMode === 'desktop'
                ? { backgroundColor: character.theme.primary }
                : undefined
            }
          >
            <Monitor size={13} />
            <span>Desktop</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-coffee-muted hover:text-coffee hover:bg-surface2/60'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: character.theme.primary,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1 rounded-lg ${
                      isActive ? 'text-white' : 'group-hover:text-coffee'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-sand/20 text-coffee-muted group-hover:text-coffee'
                    }`}
                  >
                    {item.shortcut}
                  </span>
                  {isActive && <ChevronRight size={13} className="text-white" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Anime Character Card & Stats */}
      <div className="space-y-3 pt-3 border-t border-edge">
        {/* User Mini Stat Pill */}
        <div className="p-3 rounded-2xl bg-surface2 border border-edge space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-coffee">Level {progress.level}</span>
            <span style={{ color: character.theme.primary }}>{rank.tier}</span>
          </div>

          <div className="h-1.5 w-full bg-sand/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xpPct}%`,
                backgroundColor: character.theme.primary,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-coffee-muted">
            <span>{progress.currentXp}/{xpNeeded} XP</span>
            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
              <Flame size={11} /> {progress.streak}d streak
            </span>
          </div>
        </div>

        {/* Companion Card */}
        <div
          onClick={() => setIsSwitcherOpen(true)}
          className="p-2.5 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition cursor-pointer flex items-center justify-between group"
          title="Click to switch anime companion"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CharacterAvatar character={character} size="sm" />
            <div className="min-w-0">
              <span className="text-[10px] text-coffee-muted font-bold block uppercase tracking-wider">
                Companion
              </span>
              <p className="text-xs font-bold text-coffee truncate">
                {character.name}
              </p>
            </div>
          </div>

          <span
            className="text-[10px] font-bold px-2 py-1 rounded-xl border group-hover:scale-105 transition"
            style={{
              backgroundColor: `${character.theme.primary}15`,
              borderColor: `${character.theme.primary}30`,
              color: character.theme.primary,
            }}
          >
            Switch
          </span>
        </div>

        {/* Ideathon Proposal Download Link */}
        <a
          href="/UpLevel_Ideathon_Proposal.pdf"
          download="UpLevel_Ideathon_Proposal.pdf"
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/40 text-indigo-300 font-extrabold text-xs transition flex items-center justify-between group active:scale-98 shadow-sm"
          title="Download the official 6-page Ideathon pitch whitepaper"
        >
          <div className="flex items-center gap-2">
            <FileDown size={14} className="text-indigo-400 group-hover:animate-bounce" />
            <span>Ideathon Pitch PDF</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
            6 Pages
          </span>
        </a>
      </div>
    </aside>
  );
};
