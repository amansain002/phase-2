import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  UserProgress,
  ToastMessage,
  TaskDifficulty,
  FocusSessionRecord,
  CompanionConfig,
  AIPersonality,
  Expense,
  ExpenseCategory,
  TimetableEntry,
  DayOfWeek,
} from '../types';
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredProgress,
  saveStoredProgress,
  loadStoredSessions,
  saveStoredSessions,
  loadStoredCompletedResources,
  saveStoredCompletedResources,
  loadStoredTopics,
  saveStoredTopics,
  loadStoredExpenses,
  saveStoredExpenses,
  loadStoredBudget,
  saveStoredBudget,
  loadStoredTimetable,
  saveStoredTimetable,
  autoPlanWeeklySchedule,
  resetToDemoData,
  INITIAL_USER_PROGRESS,
  DEMO_TASKS,
  DEFAULT_TOPICS,
  DEMO_EXPENSES,
  DEFAULT_MONTHLY_BUDGET,
  DEMO_TIMETABLE,
} from '../lib/storage';
import {
  DIFFICULTY_XP,
  calculateSessionXp,
  getXpRequiredForLevel,
  getRankDetails,
} from '../lib/rankEngine';
import { feedback } from '../lib/sound';
import { companionSpeech } from '../lib/companionSpeech';
import { buildLiveStudentContext, fetchAICompanionResponse } from '../lib/aiCompanionService';
import { loadCompanionMemory, saveCompanionMemory } from '../lib/companionMemory';

export interface CompletedSessionSummary {
  sessionId: string;
  durationMinutes: number;
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  rankTier?: string;
  aiMessage?: string;
}

interface AppContextType {
  tasks: Task[];
  topics: string[];
  completedResourceIds: string[];
  expenses: Expense[];
  monthlyBudget: number;
  timetable: TimetableEntry[];
  progress: UserProgress;
  sessions: FocusSessionRecord[];
  toasts: ToastMessage[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  isFocusChamberOpen: boolean;
  isCompanionHubOpen: boolean;
  activeSessionSummary: CompletedSessionSummary | null;
  levelUpData: { newLevel: number; rankTier: string } | null;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setCompanion: (companion: CompanionConfig) => void;
  setPersonality: (personality: AIPersonality) => void;
  closeLevelUp: () => void;
  openFocusChamber: () => void;
  closeFocusChamber: () => void;
  openCompanionHub: () => void;
  closeCompanionHub: () => void;
  clearSessionSummary: () => void;
  completeFocusSession: (durationMinutes: number) => Promise<CompletedSessionSummary>;
  toggleTask: (taskId: string) => void;
  addTask: (title: string, subject: string, difficulty: TaskDifficulty) => void;
  deleteTask: (taskId: string) => void;
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  completeResource: (resourceId: string, xpReward?: number) => void;
  addExpense: (amount: number, category: ExpenseCategory, note: string) => void;
  deleteExpense: (id: string) => void;
  updateMonthlyBudget: (budget: number) => void;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id' | 'completed'>) => void;
  deleteTimetableEntry: (id: string) => void;
  toggleTimetableEntry: (id: string) => void;
  autoPlanWeek: () => void;
  resetDemo: () => void;
  addXp: (amount: number, reason?: string) => { leveledUp: boolean; newLevel?: number; rankTier?: string };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks);
  const [topics, setTopics] = useState<string[]>(loadStoredTopics);
  const [completedResourceIds, setCompletedResourceIds] = useState<string[]>(loadStoredCompletedResources);
  const [expenses, setExpenses] = useState<Expense[]>(loadStoredExpenses);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(loadStoredBudget);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(loadStoredTimetable);
  const [progress, setProgress] = useState<UserProgress>(loadStoredProgress);
  const [sessions, setSessions] = useState<FocusSessionRecord[]>(loadStoredSessions);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isFocusChamberOpen, setIsFocusChamberOpen] = useState(false);
  const [isCompanionHubOpen, setIsCompanionHubOpen] = useState(false);
  const [activeSessionSummary, setActiveSessionSummary] = useState<CompletedSessionSummary | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; rankTier: string } | null>(null);

  // Sync to sound engine settings
  useEffect(() => {
    feedback.soundEnabled = progress.soundEnabled;
    feedback.hapticsEnabled = progress.hapticsEnabled;
  }, [progress.soundEnabled, progress.hapticsEnabled]);

  // Persist to LocalStorage
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredTopics(topics);
  }, [topics]);

  useEffect(() => {
    saveStoredCompletedResources(completedResourceIds);
  }, [completedResourceIds]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredBudget(monthlyBudget);
  }, [monthlyBudget]);

  useEffect(() => {
    saveStoredTimetable(timetable);
  }, [timetable]);

  useEffect(() => {
    saveStoredProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const toggleSound = () => {
    setProgress((prev) => {
      const next = !prev.soundEnabled;
      feedback.soundEnabled = next;
      return { ...prev, soundEnabled: next };
    });
  };

  const toggleHaptics = () => {
    setProgress((prev) => {
      const next = !prev.hapticsEnabled;
      feedback.hapticsEnabled = next;
      return { ...prev, hapticsEnabled: next };
    });
  };

  const setCompanion = (companion: CompanionConfig) => {
    setProgress((prev) => ({ ...prev, companion }));
    addToast({
      type: 'info',
      title: `${companion.name} Selected`,
      subtitle: `${companion.personality.toUpperCase()} • ${companion.archetype}`,
    });
  };

  const setPersonality = (personality: AIPersonality) => {
    setProgress((prev) => ({
      ...prev,
      companion: {
        ...prev.companion,
        personality,
      },
    }));
  };

  const closeLevelUp = () => {
    setLevelUpData(null);
  };

  const openFocusChamber = () => {
    setIsFocusChamberOpen(true);
  };

  const closeFocusChamber = () => {
    setIsFocusChamberOpen(false);
  };

  const openCompanionHub = () => {
    setIsCompanionHubOpen(true);
  };

  const closeCompanionHub = () => {
    setIsCompanionHubOpen(false);
  };

  const clearSessionSummary = () => {
    setActiveSessionSummary(null);
  };

  /**
   * Completes a focus session reliably:
   * - Awards strictly 5 XP per 5 completed minutes
   * - Records session history
   * - Calls Gemini AI backend for context-grounded reaction
   * - Speaks the reaction if autoSpeak is on
   */
  const completeFocusSession = async (
    durationMinutes: number
  ): Promise<CompletedSessionSummary> => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const xpEarned = calculateSessionXp(durationMinutes);
    const coinsEarned = Math.floor(xpEarned / 2);

    // Record session
    const record: FocusSessionRecord = {
      id: sessionId,
      targetMinutes: durationMinutes,
      completedMinutes: durationMinutes,
      mode: durationMinutes === 25 ? 'pomodoro' : 'custom',
      completedAt: new Date().toISOString(),
      xpAwarded: xpEarned,
    };
    setSessions((prev) => [record, ...prev]);

    // Update Player Progress & Level Check
    let leveledUp = false;
    let newLevel = progress.level;
    let newTier = '';

    setProgress((prev) => {
      let currentXp = prev.currentXp + xpEarned;
      let level = prev.level;
      let required = getXpRequiredForLevel(level);

      while (currentXp >= required) {
        currentXp -= required;
        level += 1;
        leveledUp = true;
        required = getXpRequiredForLevel(level);
      }

      newLevel = level;
      newTier = getRankDetails(level).tier;

      const today = new Date().toISOString().split('T')[0];
      const nextStreak = prev.lastActiveDate === today ? prev.streak : prev.streak + 1;

      return {
        ...prev,
        level,
        currentXp,
        coins: prev.coins + coinsEarned,
        streak: nextStreak,
        lastActiveDate: today,
      };
    });

    feedback.playSessionComplete();

    if (leveledUp) {
      setTimeout(() => {
        setLevelUpData({ newLevel, rankTier: newTier });
        feedback.playLevelUp();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }, 700);
    } else {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    // Call Gemini AI companion for live reaction
    const rank = getRankDetails(newLevel);
    const context = buildLiveStudentContext(
      progress,
      rank.tier,
      undefined,
      durationMinutes,
      undefined,
      'session_completed',
      undefined,
      loadCompanionMemory()
    );

    const aiResult = await fetchAICompanionResponse(context);

    // Save to conversational memory
    const memory = loadCompanionMemory();
    const updatedMemory = [
      ...memory,
      {
        id: `session-react-${Date.now()}`,
        role: 'companion' as const,
        content: aiResult.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: aiResult.emotion,
        suggestedAction: aiResult.suggestedAction,
        isFallback: aiResult.isFallback,
      },
    ];
    saveCompanionMemory(updatedMemory);

    // Speak reaction if autoSpeak is on
    if (progress.companion.autoSpeak && aiResult.shouldSpeak) {
      setTimeout(() => {
        companionSpeech.speak(aiResult.message, progress.companion.personality, true);
      }, 500);
    }

    const summary: CompletedSessionSummary = {
      sessionId,
      durationMinutes,
      xpEarned,
      coinsEarned,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      rankTier: leveledUp ? newTier : undefined,
      aiMessage: aiResult.message,
    };

    setActiveSessionSummary(summary);
    return summary;
  };

  /**
   * Toggles task completion:
   * - Awards/deducts task XP
   * - Triggers AI companion reaction
   */
  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    const xpChange = task.xpReward;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );

    if (nextCompleted) {
      feedback.playQuestComplete();

      setProgress((prev) => {
        let currentXp = prev.currentXp + xpChange;
        let level = prev.level;
        let leveledUp = false;

        let required = getXpRequiredForLevel(level);
        while (currentXp >= required) {
          currentXp -= required;
          level += 1;
          leveledUp = true;
          required = getXpRequiredForLevel(level);
        }

        if (leveledUp) {
          const rank = getRankDetails(level);
          setLevelUpData({ newLevel: level, rankTier: rank.tier });
          feedback.playLevelUp();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        return {
          ...prev,
          level,
          currentXp,
          coins: prev.coins + Math.floor(xpChange / 2),
        };
      });

      addToast({
        type: 'xp',
        title: `+${xpChange} XP Earned`,
        subtitle: task.title,
        amount: xpChange,
      });

      // Trigger companion context reaction
      const rank = getRankDetails(progress.level);
      const context = buildLiveStudentContext(
        progress,
        rank.tier,
        task.title,
        undefined,
        task.subject,
        'task_completed',
        undefined,
        loadCompanionMemory()
      );
      fetchAICompanionResponse(context).then((res) => {
        const mem = loadCompanionMemory();
        saveCompanionMemory([
          ...mem,
          {
            id: `task-react-${Date.now()}`,
            role: 'companion',
            content: res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emotion: res.emotion,
          },
        ]);
        // Voice feature on completing task removed per user request
        companionSpeech.stop();
      });
    } else {
      setProgress((prev) => ({
        ...prev,
        currentXp: Math.max(0, prev.currentXp - xpChange),
        coins: Math.max(0, prev.coins - Math.floor(xpChange / 2)),
      }));
    }
  };

  const addTask = (title: string, subject: string, difficulty: TaskDifficulty) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      subject,
      difficulty,
      xpReward: DIFFICULTY_XP[difficulty],
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    // Also ensure subject is tracked in topics for Learn Mode recommendations
    if (subject.trim() && !topics.includes(subject.trim())) {
      setTopics((prev) => [subject.trim(), ...prev]);
    }

    addToast({
      type: 'info',
      title: 'Goal Added',
      subtitle: `Target: +${newTask.xpReward} XP`,
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addTopic = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed || topics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    setTopics((prev) => [trimmed, ...prev]);
    addToast({
      type: 'info',
      title: 'Topic Added',
      subtitle: `Sources generated for ${trimmed}`,
    });
  };

  const removeTopic = (topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  };

  const completeResource = (resourceId: string, xpReward: number = 15) => {
    if (completedResourceIds.includes(resourceId)) return;

    setCompletedResourceIds((prev) => [...prev, resourceId]);
    feedback.playQuestComplete();

    setProgress((prev) => {
      let currentXp = prev.currentXp + xpReward;
      let level = prev.level;
      let leveledUp = false;

      let required = getXpRequiredForLevel(level);
      while (currentXp >= required) {
        currentXp -= required;
        level += 1;
        leveledUp = true;
        required = getXpRequiredForLevel(level);
      }

      if (leveledUp) {
        const rank = getRankDetails(level);
        setLevelUpData({ newLevel: level, rankTier: rank.tier });
        feedback.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return {
        ...prev,
        level,
        currentXp,
        coins: prev.coins + Math.floor(xpReward / 2),
      };
    });

    addToast({
      type: 'xp',
      title: `+${xpReward} XP Earned`,
      subtitle: 'Resource studied and completed!',
      amount: xpReward,
    });
  };

  // ---- Budget & Expenses ----
  const addExpense = (amount: number, category: ExpenseCategory, note: string) => {
    if (amount <= 0) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toISOString().split('T')[0];

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      amount,
      category,
      note: note.trim() || category,
      time: timeFormatted,
      date: dateFormatted,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    feedback.playQuestComplete();

    // Award +5 XP for financial discipline
    setProgress((prev) => {
      let currentXp = prev.currentXp + 5;
      let level = prev.level;
      let required = getXpRequiredForLevel(level);
      let leveledUp = false;

      while (currentXp >= required) {
        currentXp -= required;
        level += 1;
        leveledUp = true;
        required = getXpRequiredForLevel(level);
      }

      if (leveledUp) {
        const rank = getRankDetails(level);
        setLevelUpData({ newLevel: level, rankTier: rank.tier });
        feedback.playLevelUp();
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }

      return {
        ...prev,
        level,
        currentXp,
      };
    });

    addToast({
      type: 'xp',
      title: '+5 XP • Expense Logged',
      subtitle: `₹${amount} for ${category}`,
      amount: 5,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateMonthlyBudget = (budget: number) => {
    const val = Math.max(500, budget);
    setMonthlyBudget(val);
    addToast({
      type: 'info',
      title: 'Monthly Budget Updated',
      subtitle: `Target limit: ₹${val.toLocaleString()}`,
    });
  };

  // ---- Timetable Management ----
  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id' | 'completed'>) => {
    const newEntry: TimetableEntry = {
      ...entry,
      id: `tt-${Date.now()}`,
      completed: false,
    };
    setTimetable((prev) => [...prev, newEntry]);
    addToast({
      type: 'info',
      title: 'Timetable Entry Added',
      subtitle: `${entry.day} at ${entry.time}: ${entry.title}`,
    });
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTimetableEntry = (id: string) => {
    const entry = timetable.find((t) => t.id === id);
    if (!entry) return;

    const nextCompleted = !entry.completed;
    setTimetable((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    if (nextCompleted) {
      feedback.playQuestComplete();
      const xpReward = 20;

      setProgress((prev) => {
        let currentXp = prev.currentXp + xpReward;
        let level = prev.level;
        let required = getXpRequiredForLevel(level);
        let leveledUp = false;

        while (currentXp >= required) {
          currentXp -= required;
          level += 1;
          leveledUp = true;
          required = getXpRequiredForLevel(level);
        }

        if (leveledUp) {
          const rank = getRankDetails(level);
          setLevelUpData({ newLevel: level, rankTier: rank.tier });
          feedback.playLevelUp();
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
        }

        return {
          ...prev,
          level,
          currentXp,
          coins: prev.coins + 10,
        };
      });

      addToast({
        type: 'xp',
        title: `+20 XP • Schedule Completed!`,
        subtitle: `${entry.title}`,
        amount: 20,
      });
    }
  };

  const autoPlanWeek = () => {
    const autoSchedule = autoPlanWeeklySchedule(topics);
    setTimetable(autoSchedule);
    feedback.playQuestComplete();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    addToast({
      type: 'info',
      title: 'Week Auto-Planned!',
      subtitle: 'Generated 7 balanced study blocks across your subjects.',
    });
  };

  const resetDemo = () => {
    resetToDemoData();
    setTasks(DEMO_TASKS);
    setTopics(DEFAULT_TOPICS);
    setCompletedResourceIds([]);
    setExpenses(DEMO_EXPENSES);
    setMonthlyBudget(DEFAULT_MONTHLY_BUDGET);
    setTimetable(DEMO_TIMETABLE);
    setProgress(INITIAL_USER_PROGRESS);
    setSessions([]);
    setActiveSessionSummary(null);
    setLevelUpData(null);
    companionSpeech.stop();
    addToast({
      type: 'info',
      title: 'Demo State Reset',
      subtitle: 'Sample study records restored.',
    });
  };
  const addXp = (amount: number, reason: string = 'Quest Completed') => {
    if (amount <= 0) return { leveledUp: false };

    let didLevelUp = false;
    let resultingLevel = progress.level;
    let resultingTier = '';

    setProgress((prev) => {
      let currentXp = prev.currentXp + amount;
      let level = prev.level;
      let leveledUp = false;

      let required = getXpRequiredForLevel(level);
      while (currentXp >= required) {
        currentXp -= required;
        level += 1;
        leveledUp = true;
        required = getXpRequiredForLevel(level);
      }

      if (leveledUp) {
        didLevelUp = true;
        resultingLevel = level;
        const rank = getRankDetails(level);
        resultingTier = rank.tier;
        setLevelUpData({ newLevel: level, rankTier: rank.tier });
        feedback.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return {
        ...prev,
        level,
        currentXp,
        coins: prev.coins + Math.floor(amount / 2),
      };
    });

    feedback.playQuestComplete();
    addToast({
      type: 'xp',
      title: `+${amount} XP Earned`,
      subtitle: reason,
      amount,
    });

    return {
      leveledUp: didLevelUp,
      newLevel: didLevelUp ? resultingLevel : undefined,
      rankTier: didLevelUp ? resultingTier : undefined,
    };
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        topics,
        completedResourceIds,
        expenses,
        monthlyBudget,
        timetable,
        progress,
        sessions,
        toasts,
        soundEnabled: progress.soundEnabled,
        hapticsEnabled: progress.hapticsEnabled,
        isFocusChamberOpen,
        isCompanionHubOpen,
        activeSessionSummary,
        levelUpData,
        toggleSound,
        toggleHaptics,
        setCompanion,
        setPersonality,
        closeLevelUp,
        openFocusChamber,
        closeFocusChamber,
        openCompanionHub,
        closeCompanionHub,
        clearSessionSummary,
        completeFocusSession,
        toggleTask,
        addTask,
        deleteTask,
        addTopic,
        removeTopic,
        completeResource,
        addExpense,
        deleteExpense,
        updateMonthlyBudget,
        addTimetableEntry,
        deleteTimetableEntry,
        toggleTimetableEntry,
        autoPlanWeek,
        resetDemo,
        addXp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
