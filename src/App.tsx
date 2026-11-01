import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeProvider';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { FocusChamber } from './components/FocusChamber';
import { CompanionHub } from './components/CompanionHub';
import { CompanionWidget } from './components/CompanionWidget';
import { LevelUpModal } from './components/LevelUpModal';
import { ToastContainer } from './components/ToastContainer';
import { BottomNav, TabId } from './components/BottomNav';
import { ProfileTab } from './tabs/ProfileTab';
import { LearnTab } from './tabs/LearnTab';
import { BudgetTab } from './tabs/BudgetTab';
import { TimetableTab } from './tabs/TimetableTab';
import { WorkoutTab } from './tabs/WorkoutTab';
import { FriendsTab } from './tabs/FriendsTab';
import { Onboarding } from './components/Onboarding';
import { ChatWindow } from './components/ChatWindow';
import { CharacterSwitcher } from './components/CharacterSwitcher';
import { NotificationContainer } from './components/Notification';
import { LoginScreen } from './components/LoginScreen';
import { getIsLoggedIn } from './lib/profileService';
import {
  Timer,
  Sparkles,
  Bot,
  Clock,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Wallet,
  Users,
} from 'lucide-react';
import { getTodayDayOfWeek } from './lib/storage';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const [isOnboardingDone, setIsOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem('uplevel_phase2_onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  const {
    openFocusChamber,
    openCompanionHub,
    tasks,
    progress,
    sessions,
    timetable,
    expenses,
    monthlyBudget,
  } = useApp();

  const { character } = useTheme();

  const completedToday = tasks.filter((t) => t.completed).length;
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.completedMinutes, 0);

  // Timetable metrics
  const todayDay = getTodayDayOfWeek();
  const todaySessions = timetable.filter((t) => t.day === todayDay);
  const todaySessionsDone = todaySessions.filter((t) => t.completed).length;

  // Budget metrics
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);

  // Check authentication
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (!isOnboardingDone) {
    return (
      <Onboarding
        onComplete={() => {
          try {
            localStorage.setItem('uplevel_phase2_onboarding_complete', 'true');
          } catch {
            // ignore
          }
          setIsOnboardingDone(true);
        }}
      />
    );
  }

  return (
    <div className="app-frame flex flex-col min-h-screen relative">
      {/* Mobile Header with Quick Navigation */}
      <Header onNavigateTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Minimal Focus Banner Card */}
            <div 
              className="p-4 rounded-2xl border bg-surface shadow-xs space-y-3 transition-colors duration-500"
              style={{
                borderColor: `${character.theme.primary}35`,
              }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${character.theme.primary}15`,
                    borderColor: `${character.theme.primary}40`,
                    color: character.theme.primary,
                  }}
                >
                  Daily Progress
                </span>
                <span className="text-[11px] text-coffee-muted">
                  {completedToday}/{tasks.length} goals done
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-coffee flex items-center gap-1.5">
                  <span>Ready to Study with {character.name}?</span>
                </h2>
                <p className="text-xs text-coffee-muted mt-0.5">
                  Begin a 25-minute Pomodoro session or chat with your AI assistant for study tips and motivation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => openFocusChamber()}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
                  style={{
                    backgroundColor: character.theme.primary,
                  }}
                >
                  <Timer size={14} />
                  Start Focus
                </button>

                <button
                  onClick={openCompanionHub}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-edge bg-surface2 hover:bg-sand/25 text-coffee text-xs font-semibold transition active:scale-95"
                >
                  <Bot size={14} style={{ color: character.theme.primary }} />
                  Ask {character.name}
                </button>
              </div>
            </div>

            {/* Daily Task List */}
            <TaskList />
            <TaskList />
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === 'timetable' && <TimetableTab />}

        {/* AnimeBuddy Dedicated Assistant Tab */}
        {activeTab === 'companion' && (
          <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-edge shadow-md">
            <ChatWindow />
          </div>
        )}

        {/* Focus Mode Tab */}
        {activeTab === 'focus' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-6 rounded-2xl border border-edge bg-surface text-center space-y-3">
              <div 
                className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: `${character.theme.primary}20`,
                  color: character.theme.primary,
                }}
              >
                <Timer size={28} />
              </div>
              <div>
                <h2 className="text-base font-bold text-coffee">Zen Mode Focus Chamber</h2>
                <p className="text-xs text-coffee-muted mt-1 max-w-xs mx-auto">
                  Distraction-free countdown with {character.name}. Earn 5 XP for every 5 completed minutes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-left max-w-xs mx-auto">
                <div className="p-2.5 rounded-xl border border-edge bg-surface2">
                  <span className="text-[10px] text-coffee-muted font-medium block">Total Studied</span>
                  <span className="text-sm font-bold text-coffee">{totalMinutesStudied} mins</span>
                </div>
                <div className="p-2.5 rounded-xl border border-edge bg-surface2">
                  <span className="text-[10px] text-coffee-muted font-medium block">Completed</span>
                  <span className="text-sm font-bold text-coffee">{sessions.length} sessions</span>
                </div>
              </div>

              <button
                onClick={() => openFocusChamber()}
                className="w-full max-w-xs mx-auto py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                style={{
                  backgroundColor: character.theme.primary,
                }}
              >
                Enter Zen Chamber <ArrowRight size={14} />
              </button>
            </div>

            {/* Past Sessions List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-coffee">Session History</h3>
              {sessions.length === 0 ? (
                <div className="p-5 rounded-xl border border-edge bg-surface text-center">
                  <p className="text-xs text-coffee-muted">No focus sessions recorded yet today.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-edge bg-surface text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-sand/30 text-saddle flex items-center justify-center">
                          <Timer size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-coffee">{s.completedMinutes} Minutes</p>
                          <p className="text-[10px] text-coffee-muted">
                            {new Date(s.completedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            •{' '}
                            {new Date(s.completedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sand/30 text-saddle border border-edge2">
                        <Sparkles size={10} /> +{s.xpAwarded} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learn Mode Tab */}
        {activeTab === 'learn' && <LearnTab />}

        {/* Budget Tracker Tab */}
        {activeTab === 'budget' && <BudgetTab />}

        {/* Friends & Campus Leaderboard Tab */}
        {activeTab === 'friends' && <FriendsTab />}

        {/* Minimal Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab
            onLogout={() => {
              setIsLoggedIn(false);
            }}
            onRestart={() => {
              setIsOnboardingDone(false);
              setActiveTab('home');
              window.location.reload();
            }}
            onRedoSetup={() => {
              setIsOnboardingDone(false);
            }}
          />
        )}
      </main>

      {/* Floating Mini Companion Avatar Widget */}
      <CompanionWidget />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Focus Chamber (Zen Mode Timer Modal) */}
      <FocusChamber />

      {/* AI Companion Hub Modal (AnimeBuddy) */}
      <CompanionHub />

      {/* Slide-in Anime Character Switcher Panel */}
      <CharacterSwitcher />

      {/* Floating Notifications & Celebrations */}
      <NotificationContainer />
      <ToastContainer />
      <LevelUpModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ThemeProvider>
  );
}
