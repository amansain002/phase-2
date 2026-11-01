import React from 'react';
import {
  Home,
  CalendarDays,
  BookOpen,
  Wallet,
  Users,
  Bot,
  User,
  Dumbbell,
  Zap,
  LucideIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

export type TabId =
  | 'home'
  | 'learn'
  | 'practice'
  | 'timetable'
  | 'workout'
  | 'companion'
  | 'focus'
  | 'budget'
  | 'friends'
  | 'profile';

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Tasks', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: Zap },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'companion', label: 'Assistant', icon: Bot },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'friends', label: 'Circle', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { character } = useTheme();

  return (
    <nav 
      className="sticky bottom-0 z-30 border-t backdrop-blur-xl pb-safe transition-colors duration-500 shadow-lg"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: character.theme.border,
      }}
    >
      <div className="flex items-stretch justify-between px-1 py-1 max-w-[500px] mx-auto overflow-x-auto no-scrollbar gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 min-h-[44px] min-w-[42px] transition active:scale-95 group"
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'shadow-sm' : 'text-slate-400 group-hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${character.theme.primary}25`,
                        color: character.theme.primary,
                      }
                    : undefined
                }
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span
                className={`text-[9px] font-semibold tracking-tight transition truncate px-0.5 ${
                  isActive ? 'font-bold' : 'text-slate-400'
                }`}
                style={isActive ? { color: character.theme.primary } : undefined}
              >
                {item.label}
              </span>

              {isActive && (
                <span
                  className="absolute bottom-0 h-0.5 w-3.5 rounded-full"
                  style={{ backgroundColor: character.theme.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
