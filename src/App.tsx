import React, { useState, useEffect } from 'react';
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
import { DesktopSidebar } from './components/DesktopSidebar';
import { ProfileTab } from './tabs/ProfileTab';
import { LearnTab } from './tabs/LearnTab';
import { PracticeTab } from './tabs/PracticeTab';
import { BudgetTab } from './tabs/BudgetTab';
import { TimetableTab } from './tabs/TimetableTab';
import { WorkoutTab } from './tabs/WorkoutTab';
import { FriendsTab } from './tabs/FriendsTab';
import { HomeBudgetCard } from './components/HomeBudgetCard';
import { TinyAddExpenseModal } from './components/TinyAddExpenseModal';
import {
  loadStoredBudgetPlan,
  loadStoredDetailedExpenses,
  saveStoredDetailedExpenses,
  computeBudgetMetrics,
  canClaimExpenseXP,
  recordExpenseXPClaim,
} from './lib/budgetService';
import { DetailedExpense, BudgetPlan } from './types/budget';
import { Onboarding } from './components/Onboarding';
import { ChatWindow } from './components/ChatWindow';
import { CharacterSwitcher } from './components/CharacterSwitcher';
import { CharacterAvatar } from './components/CharacterAvatar';
import { NotificationContainer } from './components/Notification';
import { AssistantSpeechBubble } from './components/AssistantSpeechBubble';
import { assistantVoice } from './lib/assistantVoiceService';
import { LoginScreen } from './components/LoginScreen';
import { getIsLoggedIn } from './lib/profileService';
import {
  Timer,
  Sparkles,
  Bot,
  Clock,
  ArrowRight,
  Monitor,
  Smartphone,
  Flame,
  Trophy,
  Shield,
  Layers,
  Zap,
  Plus,
} from 'lucide-react';
import { getTodayDayOfWeek } from './lib/storage';
import { getRankDetails, getXpRequiredForLevel } from './lib/rankEngine';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedLearnTopic, setSelectedLearnTopic] = useState<string>('Operating Systems');
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan>(loadStoredBudgetPlan);
  const [detailedExpenses, setDetailedExpenses] = useState<DetailedExpense[]>(loadStoredDetailedExpenses);
  const [isHomeAddExpenseOpen, setIsHomeAddExpenseOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const [isOnboardingDone, setIsOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem('uplevel_phase2_onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  // Responsive View Mode Toggle: 'phone' (Critique AI phone frame) vs 'desktop' (Two-column layout)
  const [viewMode, setViewMode] = useState<'phone' | 'desktop'>(() => {
    try {
      const saved = localStorage.getItem('uplevel_view_mode');
      return saved === 'desktop' ? 'desktop' : 'phone';
    } catch {
      return 'phone';
    }
  });

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'phone' ? 'desktop' : 'phone';
      try {
        localStorage.setItem('uplevel_view_mode', next);
      } catch {}
      return next;
    });
  };

  const {
    openFocusChamber,
    closeFocusChamber,
    openCompanionHub,
    closeCompanionHub,
    tasks,
    progress,
    sessions,
    addXp,
  } = useApp();

  const { character, setIsSwitcherOpen } = useTheme();

  const completedToday = tasks.filter((t) => t.completed).length;
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.completedMinutes, 0);

  const xpNeeded = getXpRequiredForLevel(progress.level);
  const rank = getRankDetails(progress.level);

  // Keyboard Navigation: Tab Shortcuts (1-8) & Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          setActiveTab('home');
          break;
        case '2':
          setActiveTab('learn');
          break;
        case '3':
          setActiveTab('practice');
          break;
        case '4':
          setActiveTab('timetable');
          break;
        case '5':
          setActiveTab('workout');
          break;
        case '6':
          setActiveTab('companion');
          break;
        case '7':
          setActiveTab('focus');
          break;
        case '8':
          setActiveTab('budget');
          break;
        case '9':
          setActiveTab('friends');
          break;
        case '0':
          setActiveTab('profile');
          break;
        case 'Escape':
          closeFocusChamber();
          closeCompanionHub();
          setIsSwitcherOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeFocusChamber, closeCompanionHub, setIsSwitcherOpen]);

  // Check authentication
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Check onboarding flow
  if (!isOnboardingDone) {
    return (
      <Onboarding
        onComplete={() => {
          try {
            localStorage.setItem('uplevel_phase2_onboarding_complete', 'true');
          } catch {}
          setIsOnboardingDone(true);
        }}
      />
    );
  }

  const handleHomeAddExpense = (amount: number, category: string) => {
    const now = new Date();
    const newExp: DetailedExpense = {
      id: `exp-${Date.now()}`,
      amount,
      category,
      note: category,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      paymentMethod: 'UPI',
      createdAt: now.toISOString(),
    };
    const updated = [newExp, ...detailedExpenses];
    setDetailedExpenses(updated);
    saveStoredDetailedExpenses(updated);

    const m = computeBudgetMetrics(budgetPlan, updated);
    if (canClaimExpenseXP()) {
      recordExpenseXPClaim();
      addXp(
        5,
        `${category} -${budgetPlan.currency}${amount}. ${budgetPlan.currency}${m.remainingSpendable.toLocaleString()} left this month. Today's limit: ${budgetPlan.currency}${m.dailySpendingLimit} left.`
      );
    } else {
      addXp(
        0,
        `${category} -${budgetPlan.currency}${amount}. ${budgetPlan.currency}${m.remainingSpendable.toLocaleString()} left this month. Today's limit: ${budgetPlan.currency}${m.dailySpendingLimit} left.`
      );
    }
  };

  // Render the Tab's Content
  const renderTabContent = () => (
    <>
      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Minimal Focus Banner Card */}
          <div
            className="p-4 rounded-3xl border bg-surface shadow-xs space-y-3 transition-colors duration-500"
            style={{
              borderColor: `${character.theme.primary}35`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
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
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl text-white text-xs font-bold shadow-xs transition active:scale-95 touch-target"
                style={{
                  backgroundColor: character.theme.primary,
                }}
              >
                <Timer size={15} />
                Start Focus
              </button>

              <button
                onClick={openCompanionHub}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border border-edge bg-surface2 hover:bg-sand/25 text-coffee text-xs font-bold transition active:scale-95 touch-target"
              >
                <Bot size={15} style={{ color: character.theme.primary }} />
                Ask {character.name}
              </button>
            </div>
          </div>

          {/* Daily Task List */}
          <TaskList
            onLearnTopic={(topic) => {
              setSelectedLearnTopic(topic);
              setActiveTab('learn');
            }}
          />

          {/* Real-Time Budget Card on Home */}
          <HomeBudgetCard
            plan={budgetPlan}
            expenses={detailedExpenses}
            onOpenBudgetTab={() => setActiveTab('budget')}
            onOpenAddExpense={() => setIsHomeAddExpenseOpen(true)}
          />
        </div>
      )}

      {/* Learn Mode Tab */}
      {activeTab === 'learn' && <LearnTab initialTopic={selectedLearnTopic} />}

      {/* Practice Hub Tab */}
      {activeTab === 'practice' && <PracticeTab initialTopic={selectedLearnTopic} />}

      {/* Timetable Tab */}
      {activeTab === 'timetable' && <TimetableTab />}

      {/* Gym Workout Tab */}
      {activeTab === 'workout' && <WorkoutTab />}

      {/* AnimeBuddy Dedicated Assistant Tab */}
      {activeTab === 'companion' && (
        <div className="h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-edge shadow-md">
          <ChatWindow />
        </div>
      )}

      {/* Focus Mode Tab */}
      {activeTab === 'focus' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-6 rounded-3xl border border-edge bg-surface text-center space-y-3">
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
              <div className="p-2.5 rounded-2xl border border-edge bg-surface2">
                <span className="text-[10px] text-coffee-muted font-medium block">Total Studied</span>
                <span className="text-sm font-bold text-coffee">{totalMinutesStudied} mins</span>
              </div>
              <div className="p-2.5 rounded-2xl border border-edge bg-surface2">
                <span className="text-[10px] text-coffee-muted font-medium block">Completed</span>
                <span className="text-sm font-bold text-coffee">{sessions.length} sessions</span>
              </div>
            </div>

            <button
              onClick={() => openFocusChamber()}
              className="w-full max-w-xs mx-auto py-3 rounded-2xl text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 touch-target"
              style={{
                backgroundColor: character.theme.primary,
              }}
            >
              Enter Zen Chamber <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

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
    </>
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative selection:bg-orange-500 selection:text-white">
      {/* ==================================================================== */}
      {/* LAYOUT 1: TWO-COLUMN DESKTOP VIEW (Visible when mode === 'desktop' on lg:) */}
      {/* ==================================================================== */}
      {viewMode === 'desktop' && (
        <div className="hidden lg:flex w-full min-h-screen">
          {/* Left Sticky Sidebar */}
          <DesktopSidebar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />

          {/* Right Main Content Stream */}
          <div className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
            <Header
              onNavigateTab={setActiveTab}
              viewMode={viewMode}
              onToggleViewMode={toggleViewMode}
            />

            <main className="flex-1 max-w-4xl w-full mx-auto p-6 lg:p-8 space-y-6">
              {renderTabContent()}
            </main>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* LAYOUT 2: CRITIQUE AI PORTRAIT PHONE CONTAINER (Default & on Mobile) */}
      {/* ==================================================================== */}
      <div
        className={`${
          viewMode === 'desktop' ? 'lg:hidden' : 'flex'
        } min-h-screen w-full items-center justify-center p-0 md:p-6 lg:p-8 relative overflow-x-hidden`}
      >
        {/* Soft Ambient Glows in Character Theme Color */}
        <div
          className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ backgroundColor: character.theme.primary }}
        />
        <div
          className="hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-15"
          style={{ backgroundColor: character.theme.accent }}
        />

        {/* Subtle Drifting Smoke Layer when Madara Uchiha is active */}
        {character.id === 'madara' && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 animate-driftingSmoke z-0"
            style={{
              background:
                'radial-gradient(circle at 35% 25%, rgba(74, 44, 79, 0.45) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(215, 38, 61, 0.3) 0%, transparent 65%)',
            }}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* LEFT FLANKING PANEL (Visible on wide screens >= 1280px)             */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden xl:flex flex-col w-72 mr-8 p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-5 select-none">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ backgroundColor: character.theme.primary }}
            >
              UL
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white font-display">
                UpLevel
              </h2>
              <span className="text-[10px] text-slate-400 block">Critique AI Mobile Frame</span>
            </div>
          </div>

          {/* Character Spotlight */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-3">
              <CharacterAvatar character={character} size="md" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 block">
                  Active Assistant
                </span>
                <h4 className="text-sm font-bold text-white">{character.name}</h4>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic pl-1 leading-relaxed border-l-2 border-orange-500/50">
              "{character.tagline}"
            </p>
          </div>

          {/* User Progress Stats */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Current Rank</span>
              <span style={{ color: character.theme.primary }}>{rank.tier}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Current Level</span>
              <span className="text-white">Level {progress.level}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Daily Streak</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Flame size={13} /> {progress.streak} Days
              </span>
            </div>
          </div>

          {/* Switch to Desktop Layout Button */}
          <button
            onClick={toggleViewMode}
            className="w-full py-2.5 px-3 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center gap-2 active:scale-95 touch-target"
          >
            <Monitor size={14} style={{ color: character.theme.primary }} />
            <span>Switch to Desktop View</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CENTER PHONE FRAME CONTAINER (Portrait Base Width 360-430px)       */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="w-full max-w-[430px] min-h-[100dvh] md:min-h-[850px] md:max-h-[92vh] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_0_60px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col bg-surface critique-phone-container transition-all duration-300"
          style={{
            boxShadow: `0 0 50px ${character.theme.primary}20`,
          }}
        >
          {/* Phone Speaker & Dynamic Notch Detail on Desktop */}
          <div className="hidden md:block w-32 h-4.5 bg-slate-800 rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none" />

          {/* Mobile Header with Quick Navigation */}
          <Header
            onNavigateTab={setActiveTab}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />

          {/* Main View Area (Mobile Scrollable) */}
          <main className="flex-1 p-3.5 sm:p-4 space-y-4 overflow-y-auto no-scrollbar pb-safe">
            {renderTabContent()}
          </main>

          {/* Fixed Bottom Navigation (Mobile Tab Bar) */}
          <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT FLANKING PANEL (Visible on wide screens >= 1280px)            */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden xl:flex flex-col w-72 ml-8 p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-5 select-none">
          {/* Mobile-First Architecture Card */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
              <Smartphone size={16} />
              <span>Critique AI Architecture</span>
            </div>
            <h3 className="text-sm font-extrabold text-white">
              Portrait Mobile-First
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed portrait-first for 360-430px phones, single-column actions, and touch targets ≥ 44px.
            </p>
          </div>

          {/* Keyboard Cheatsheet Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Desktop Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">1</kbd>
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">2</kbd>
                <span>Timetable</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">3</kbd>
                <span>Workout</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">4</kbd>
                <span>Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">5</kbd>
                <span>Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">8</kbd>
                <span>Profile</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Press <kbd className="px-1 rounded bg-slate-800 text-[10px]">Esc</kbd> anytime to close modals.
            </p>
          </div>

          {/* Mobile Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <span className="text-xl">📱</span>
            <div>
              <span className="text-xs font-bold text-emerald-400 block">
                Mobile Polish Active
              </span>
              <p className="text-[11px] text-slate-300">
                Centered portrait lock in landscape with safe-area spacing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mini Companion Avatar Widget */}
      <CompanionWidget />

      {/* Focus Chamber (Zen Mode Timer Modal) */}
      <FocusChamber />

      {/* AI Companion Hub Modal (AnimeBuddy) */}
      <CompanionHub />

      {/* Slide-in Anime Character Switcher Panel */}
      <CharacterSwitcher />

      {/* Floating "+ Add Expense" FAB on Home */}
      {activeTab === 'home' && (
        <button
          onClick={() => setIsHomeAddExpenseOpen(true)}
          className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full text-white shadow-xl transition active:scale-95 hover:scale-105 flex items-center gap-1.5"
          style={{
            backgroundColor: character.theme.primary,
            boxShadow: `0 4px 20px ${character.theme.primary}50`,
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span className="text-xs font-extrabold pr-1">+ Expense</span>
        </button>
      )}

      {/* Home Tiny Add Expense Modal */}
      <TinyAddExpenseModal
        isOpen={isHomeAddExpenseOpen}
        onClose={() => setIsHomeAddExpenseOpen(false)}
        onSave={handleHomeAddExpense}
        categories={budgetPlan.categories}
        currency={budgetPlan.currency}
      />

      {/* Floating Notifications & Celebrations */}
      <NotificationContainer />
      <ToastContainer />
      <LevelUpModal />
      <AssistantSpeechBubble />
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
