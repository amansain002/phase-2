import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Sparkles,
  Flame,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Play,
  RotateCcw,
  BookOpen,
  Bot,
  Layers,
  Moon,
  Trophy,
} from 'lucide-react';
import {
  DailyWorkoutPlan,
  Exercise,
  PlannedExercise,
  DailyStats,
} from '../types/workout';
import {
  getTodayPlan,
  getExerciseLibrary,
  getDailyStats,
  resetDaily,
  getTodayLocalISO,
  updateTodayPlanExercise,
} from '../lib/workoutService';
import { WORKOUT_CONFIG } from '../data/workoutConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { WorkoutSetLoggerModal } from '../components/WorkoutSetLoggerModal';
import { FinishWorkoutModal } from '../components/FinishWorkoutModal';
import { SplitPlannerModal } from '../components/SplitPlannerModal';
import { AIWorkoutCoachModal } from '../components/AIWorkoutCoachModal';
import { ExerciseLibraryModal } from '../components/ExerciseLibraryModal';
import { WorkoutHistoryModal } from '../components/WorkoutHistoryModal';

export const WorkoutTab: React.FC = () => {
  const { character } = useTheme();
  const { progress } = useApp();

  // Core state
  const [todayPlan, setTodayPlan] = useState<DailyWorkoutPlan>(getTodayPlan);
  const [dailyStats, setDailyStats] = useState<DailyStats>(getDailyStats);
  const [library, setLibrary] = useState<Exercise[]>(getExerciseLibrary);

  // Active Modals
  const [activeExerciseToLog, setActiveExerciseToLog] = useState<{
    exercise: Exercise;
    planned: PlannedExercise;
  } | null>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isAICoachModalOpen, setIsAICoachModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Check daily reset on mount and on window focus (Midnight 12:00 AM check)
  useEffect(() => {
    const checkMidnightReset = () => {
      const stats = resetDaily();
      setDailyStats(stats);
      setTodayPlan(getTodayPlan());
      setLibrary(getExerciseLibrary());
    };

    checkMidnightReset();

    window.addEventListener('focus', checkMidnightReset);
    return () => window.removeEventListener('focus', checkMidnightReset);
  }, []);

  const refreshState = () => {
    setTodayPlan(getTodayPlan());
    setDailyStats(getDailyStats());
    setLibrary(getExerciseLibrary());
  };

  const libMap = new Map(library.map((e) => [e.id, e]));

  // Completed stats for today's plan
  const completedExercises = todayPlan.exercises.filter(
    (e) => e.status === 'completed'
  );
  const totalPlannedCount = todayPlan.exercises.length;
  const completionPercentage =
    totalPlannedCount > 0
      ? Math.round((completedExercises.length / totalPlannedCount) * 100)
      : 0;

  // Formatted local date
  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* 1. TOP BAR: Date, Daily Workout XP Counter (e.g. 120 / 300 XP), Streak */}
      <div
        className="p-4 rounded-3xl border bg-surface shadow-xs space-y-3 transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}35` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Dumbbell size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-coffee-muted block">
                Today's Training
              </span>
              <h2 className="text-sm font-black text-coffee">{todayDateFormatted}</h2>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame size={16} className="animate-pulse" />
            <span className="text-xs font-black">{dailyStats.streak} Day Streak</span>
          </div>
        </div>

        {/* Daily XP Earned Counter with Progress Bar (max 300 XP) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-coffee-muted font-bold flex items-center gap-1">
              <Sparkles size={13} style={{ color: character.theme.primary }} />
              Workout XP Today
            </span>
            <span className="font-extrabold text-coffee font-mono">
              {dailyStats.workoutXpEarned} / {WORKOUT_CONFIG.dailyXpCap} XP
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-sand/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (dailyStats.workoutXpEarned / WORKOUT_CONFIG.dailyXpCap) * 100
                )}%`,
                backgroundColor: character.theme.primary,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-coffee-muted/80">
            <span>Anti-spam cap active</span>
            <span>
              {Math.max(0, WORKOUT_CONFIG.dailyXpCap - dailyStats.workoutXpEarned)} XP
              remaining today
            </span>
          </div>
        </div>
      </div>

      {/* 2. "TODAY'S PLAN" CARD */}
      <div
        className="p-4 rounded-3xl border bg-surface shadow-xs space-y-3 transition-colors duration-500 relative overflow-hidden"
        style={{ borderColor: `${character.theme.primary}30` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border inline-block mb-1"
              style={{
                backgroundColor: `${character.theme.primary}15`,
                borderColor: `${character.theme.primary}30`,
                color: character.theme.primary,
              }}
            >
              {todayPlan.isRestDay ? 'Rest & Recovery' : "Today's Schedule"}
            </span>
            <h3 className="text-base font-black text-coffee">{todayPlan.name}</h3>
            <p className="text-xs text-coffee-muted mt-0.5">
              {todayPlan.isRestDay
                ? 'Muscles rebuild stronger while resting. Take today to rest, stretch, or review your study material.'
                : `${completedExercises.length} of ${totalPlannedCount} exercises completed`}
            </p>
          </div>

          {/* Progress Ring / Percent Gauge */}
          {!todayPlan.isRestDay && totalPlannedCount > 0 && (
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-sand/30"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={character.theme.primary}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-coffee font-mono">
                {completionPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Action Shortcuts Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-edge">
          <button
            onClick={() => setIsAICoachModalOpen(true)}
            className="p-2 rounded-2xl bg-surface2 border border-edge hover:bg-sand/25 transition flex flex-col items-center gap-1 active:scale-95 text-center group"
          >
            <Bot
              size={16}
              className="group-hover:scale-110 transition"
              style={{ color: character.theme.primary }}
            />
            <span className="text-[10px] font-bold text-coffee">AI Coach</span>
          </button>

          <button
            onClick={() => setIsSplitModalOpen(true)}
            className="p-2 rounded-2xl bg-surface2 border border-edge hover:bg-sand/25 transition flex flex-col items-center gap-1 active:scale-95 text-center group"
          >
            <Calendar
              size={16}
              className="text-amber-400 group-hover:scale-110 transition"
            />
            <span className="text-[10px] font-bold text-coffee">Split</span>
          </button>

          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="p-2 rounded-2xl bg-surface2 border border-edge hover:bg-sand/25 transition flex flex-col items-center gap-1 active:scale-95 text-center group"
          >
            <BookOpen
              size={16}
              className="text-sky-400 group-hover:scale-110 transition"
            />
            <span className="text-[10px] font-bold text-coffee">Library</span>
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-2 rounded-2xl bg-surface2 border border-edge hover:bg-sand/25 transition flex flex-col items-center gap-1 active:scale-95 text-center group"
          >
            <Clock
              size={16}
              className="text-emerald-400 group-hover:scale-110 transition"
            />
            <span className="text-[10px] font-bold text-coffee">History</span>
          </button>
        </div>
      </div>

      {/* 3. EXERCISE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
            {todayPlan.isRestDay ? 'Optional Recovery Drills' : 'Exercises To Complete'}
          </h3>
          <span className="text-xs text-coffee-muted">
            Tap a card to log sets & reps
          </span>
        </div>

        {todayPlan.isRestDay ? (
          <div className="p-6 rounded-3xl border border-edge bg-surface text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sand/20 text-coffee mx-auto flex items-center justify-center">
              <Moon size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-coffee">Rest Day Scheduled</h4>
              <p className="text-xs text-coffee-muted max-w-xs mx-auto mt-0.5">
                Take a walk, do light stretching, or let your nervous system recover.
                Want to train anyway? You can customize today's split in one tap.
              </p>
            </div>

            <button
              onClick={() => setIsSplitModalOpen(true)}
              className="py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md transition active:scale-95"
              style={{ backgroundColor: character.theme.primary }}
            >
              Change Today to a Workout Day
            </button>
          </div>
        ) : todayPlan.exercises.length === 0 ? (
          <div className="p-6 rounded-3xl border border-edge bg-surface text-center space-y-2">
            <p className="text-xs font-semibold text-coffee">No exercises planned yet.</p>
            <button
              onClick={() => setIsSplitModalOpen(true)}
              className="py-2 px-4 rounded-xl text-white text-xs font-bold"
              style={{ backgroundColor: character.theme.primary }}
            >
              Select Split Preset
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayPlan.exercises.map((pe) => {
              const ex = libMap.get(pe.exerciseId);
              const isDone = pe.status === 'completed';

              return (
                <div
                  key={pe.exerciseId}
                  onClick={() =>
                    ex && setActiveExerciseToLog({ exercise: ex, planned: pe })
                  }
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/35 hover:bg-emerald-500/15'
                      : 'bg-surface border-edge hover:border-coffee-muted/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-surface2 text-coffee-muted border border-edge'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Dumbbell size={20} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-coffee leading-tight">
                          {ex ? ex.name : pe.exerciseId}
                        </h4>
                        <span
                          className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${character.theme.primary}15`,
                            borderColor: `${character.theme.primary}30`,
                            color: character.theme.primary,
                          }}
                        >
                          {ex?.difficulty || 'easy'}
                        </span>
                      </div>

                      <p className="text-[11px] text-coffee-muted mt-0.5">
                        Target: {pe.targetSets} sets × {pe.targetReps} reps •{' '}
                        <span className="capitalize">{ex?.muscleGroup}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right shrink-0">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        Done {pe.xpEarned ? `(+${pe.xpEarned} XP)` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-surface2 text-coffee-muted border border-edge hover:text-coffee">
                        Pending <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. BOTTOM ACTION: FINISH WORKOUT */}
      {!todayPlan.isRestDay && todayPlan.exercises.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setIsFinishModalOpen(true)}
            disabled={completedExercises.length === 0}
            className="w-full py-4 rounded-2xl text-white text-sm font-black shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: character.theme.primary }}
          >
            <Trophy size={18} />
            <span>
              {dailyStats.completedWorkoutToday
                ? 'Workout Completed (View Summary)'
                : `Finish Workout (${completedExercises.length}/${totalPlannedCount} Completed)`}
            </span>
          </button>
        </div>
      )}

      {/* MODALS */}
      {activeExerciseToLog && (
        <WorkoutSetLoggerModal
          exercise={activeExerciseToLog.exercise}
          planned={activeExerciseToLog.planned}
          onClose={() => setActiveExerciseToLog(null)}
          onFinished={() => {
            setActiveExerciseToLog(null);
            refreshState();
          }}
        />
      )}

      {isFinishModalOpen && (
        <FinishWorkoutModal
          todayPlan={todayPlan}
          onClose={() => {
            setIsFinishModalOpen(false);
            refreshState();
          }}
        />
      )}

      {isSplitModalOpen && (
        <SplitPlannerModal
          onClose={() => setIsSplitModalOpen(false)}
          onSaved={() => refreshState()}
        />
      )}

      {isAICoachModalOpen && (
        <AIWorkoutCoachModal
          onClose={() => setIsAICoachModalOpen(false)}
          onPlanApplied={() => refreshState()}
        />
      )}

      {isLibraryModalOpen && (
        <ExerciseLibraryModal
          onClose={() => setIsLibraryModalOpen(false)}
          onSelectExercise={(ex) => {
            // Optional: add to today's plan
            const currentPlan = getTodayPlan();
            currentPlan.exercises.push({
              exerciseId: ex.id,
              targetSets: ex.defaultSets,
              targetReps: ex.defaultReps,
              status: 'pending',
            });
            updateTodayPlanExercise(ex.id, {
              exerciseId: ex.id,
              targetSets: ex.defaultSets,
              targetReps: ex.defaultReps,
              status: 'pending',
            });
            setIsLibraryModalOpen(false);
            refreshState();
          }}
        />
      )}

      {isHistoryModalOpen && (
        <WorkoutHistoryModal onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
};
