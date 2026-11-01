import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Dumbbell,
  Plus,
  Minus,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { Exercise, PlannedExercise, WorkoutSet } from '../types/workout';
import {
  calculateXP,
  canClaimXP,
  recordXPClaim,
  updateTodayPlanExercise,
  getTodayLocalISO,
} from '../lib/workoutService';
import { WORKOUT_CONFIG } from '../data/workoutConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from './CharacterAvatar';

interface WorkoutSetLoggerModalProps {
  exercise: Exercise;
  planned: PlannedExercise;
  onClose: () => void;
  onFinished: (xpEarned: number) => void;
}

export const WorkoutSetLoggerModal: React.FC<WorkoutSetLoggerModalProps> = ({
  exercise,
  planned,
  onClose,
  onFinished,
}) => {
  const { character } = useTheme();
  const { addXp } = useApp();

  // Initialize sets from planned or previous log or defaults
  const [sets, setSets] = useState<WorkoutSet[]>(() => {
    if (planned.loggedSets && planned.loggedSets.length > 0) {
      return planned.loggedSets;
    }
    const initial: WorkoutSet[] = [];
    const count = planned.targetSets || exercise.defaultSets || 3;
    const defaultReps = planned.targetReps || exercise.defaultReps || 10;
    const defaultWeight = planned.targetWeightKg || (exercise.type === 'compound' ? 40 : 15);

    for (let i = 1; i <= count; i++) {
      initial.push({
        setNumber: i,
        reps: defaultReps,
        weightKg: defaultWeight,
        completed: false,
      });
    }
    return initial;
  });

  // Anti-spam & rest validation state
  const [lastCompletedTime, setLastCompletedTime] = useState<number | null>(null);
  const [restGapWarning, setRestGapWarning] = useState<string | null>(null);

  // Rest Timer State (30s / 60s / 90s)
  const [restDuration, setRestDuration] = useState<number>(60);
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [restPrompt, setRestPrompt] = useState<string | null>(null);

  // Claim check
  const claimStatus = canClaimXP(exercise.id, getTodayLocalISO());

  // Timer tick effect
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            setRestPrompt(`${character.name}: "Rest over! Next set! Time to push!"`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restRemaining, character.name]);

  const startRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setRestRemaining(seconds);
    setIsRestTimerActive(true);
    setRestPrompt(null);
  };

  const handleUpdateWeight = (index: number, delta: number) => {
    setSets((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, weightKg: Math.max(0, s.weightKg + delta) } : s
      )
    );
  };

  const handleUpdateReps = (index: number, delta: number) => {
    setSets((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, reps: Math.max(1, s.reps + delta) } : s
      )
    );
  };

  const handleToggleComplete = (index: number) => {
    const targetSet = sets[index];
    const willComplete = !targetSet.completed;

    if (willComplete) {
      // Rule 1: reps >= 1
      if (targetSet.reps < 1) {
        setRestGapWarning('At least 1 rep required to complete set.');
        return;
      }

      // Rule 2: Minimum 20s gap since previous set completion
      const now = Date.now();
      if (lastCompletedTime !== null) {
        const diffSeconds = (now - lastCompletedTime) / 1000;
        if (diffSeconds < WORKOUT_CONFIG.minRestGapSeconds) {
          const remainingSecs = Math.ceil(WORKOUT_CONFIG.minRestGapSeconds - diffSeconds);
          setRestGapWarning(
            `⏳ Minimum effort required: Please rest ${remainingSecs}s before completing the next set!`
          );
          return;
        }
      }

      setRestGapWarning(null);
      setLastCompletedTime(now);

      // Auto-start rest timer
      startRestTimer(restDuration);

      setSets((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, completed: true, completedAt: now } : s
        )
      );
    } else {
      // Uncheck
      setSets((prev) =>
        prev.map((s, i) => (i === index ? { ...s, completed: false } : s))
      );
    }
  };

  const handleAddSet = () => {
    const nextNum = sets.length + 1;
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        setNumber: nextNum,
        reps: lastSet ? lastSet.reps : 10,
        weightKg: lastSet ? lastSet.weightKg : 20,
        completed: false,
      },
    ]);
  };

  const handleRemoveSet = () => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.slice(0, prev.length - 1));
  };

  // Preview potential XP calculation
  const completedCount = sets.filter((s) => s.completed && s.reps >= 1).length;
  const rawCalculatedXp = calculateXP(
    exercise,
    sets,
    planned.targetSets,
    planned.targetReps
  );

  const finalEarnableXp = claimStatus.canClaim
    ? Math.min(rawCalculatedXp, claimStatus.remainingCap)
    : 0;

  const handleFinishExercise = () => {
    if (completedCount === 0) {
      setRestGapWarning('Please complete at least 1 set before finishing this exercise.');
      return;
    }

    let awarded = 0;
    if (claimStatus.canClaim && finalEarnableXp > 0) {
      const claimResult = recordXPClaim({
        date: getTodayLocalISO(),
        exerciseId: exercise.id,
        sets: completedCount,
        reps: sets.reduce((sum, s) => (s.completed ? sum + s.reps : sum), 0),
        xp: finalEarnableXp,
        claimedAt: Date.now(),
      });
      awarded = claimResult.xpAwarded;

      // Add to global AppContext XP engine
      addXp(awarded, `Workout: ${exercise.name}`);
    }

    // Update today's plan exercise state to completed
    updateTodayPlanExercise(exercise.id, {
      status: 'completed',
      loggedSets: sets,
      xpEarned: awarded,
    });

    onFinished(awarded);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface border border-edge rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b border-edge flex items-center justify-between"
          style={{
            background: `linear-gradient(to right, ${character.theme.primary}15, transparent)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Dumbbell size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-coffee leading-tight">
                  {exercise.name}
                </h3>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: `${character.theme.primary}20`,
                    color: character.theme.primary,
                  }}
                >
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-xs text-coffee-muted mt-0.5">
                Target: {planned.targetSets} sets × {planned.targetReps} reps •{' '}
                <span className="capitalize">{exercise.muscleGroup}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface2 hover:bg-sand/30 text-coffee-muted transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Warning / Error alerts */}
          {restGapWarning && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{restGapWarning}</span>
            </div>
          )}

          {/* XP Status Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface2 border border-edge">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: character.theme.primary }} />
              <div>
                <span className="text-xs font-semibold text-coffee block">
                  Reward for this Exercise
                </span>
                <span className="text-[11px] text-coffee-muted">
                  {claimStatus.canClaim
                    ? `Formula: Base (${WORKOUT_CONFIG.baseXP[exercise.type]} XP) × Mult (${
                        WORKOUT_CONFIG.difficultyMultiplier[exercise.difficulty]
                      }) × Sets & Reps`
                    : claimStatus.reason}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-base font-black px-2.5 py-1 rounded-xl border block"
                style={{
                  backgroundColor: `${character.theme.primary}15`,
                  borderColor: `${character.theme.primary}30`,
                  color: character.theme.primary,
                }}
              >
                +{finalEarnableXp} XP
              </span>
            </div>
          </div>

          {/* Rest Timer Widget */}
          <div className="p-3.5 rounded-2xl border border-edge bg-surface2/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-coffee flex items-center gap-1.5">
                <Clock size={14} style={{ color: character.theme.primary }} />
                Rest Timer Between Sets
              </span>
              <div className="flex items-center gap-1.5">
                {[30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRestTimer(sec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      restDuration === sec && isRestTimerActive
                        ? 'text-white border-transparent'
                        : 'border-edge bg-surface text-coffee-muted hover:text-coffee'
                    }`}
                    style={
                      restDuration === sec && isRestTimerActive
                        ? { backgroundColor: character.theme.primary }
                        : undefined
                    }
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown bar */}
            {isRestTimerActive && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-coffee-muted">Resting...</span>
                  <span className="font-mono font-bold text-coffee text-sm">
                    {restRemaining}s
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-sand/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(restRemaining / restDuration) * 100}%`,
                      backgroundColor: character.theme.primary,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Character in-character rest finish prompt */}
            {restPrompt && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-sand/20 border border-edge animate-fadeIn">
                <CharacterAvatar character={character} size="sm" />
                <p className="text-xs text-coffee font-medium italic">
                  {restPrompt}
                </p>
              </div>
            )}
          </div>

          {/* Sets List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-coffee-muted font-bold px-1">
              <span className="w-12">SET</span>
              <span className="flex-1 text-center">WEIGHT (KG)</span>
              <span className="flex-1 text-center">REPS</span>
              <span className="w-16 text-right">DONE</span>
            </div>

            {sets.map((set, idx) => (
              <div
                key={set.setNumber}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition ${
                  set.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-surface2 border-edge'
                }`}
              >
                {/* Set number */}
                <div className="w-10 text-center">
                  <span
                    className={`inline-block w-7 h-7 leading-7 rounded-xl text-xs font-bold ${
                      set.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-sand/30 text-coffee-muted'
                    }`}
                  >
                    {set.setNumber}
                  </span>
                </div>

                {/* Weight Controls */}
                <div className="flex-1 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleUpdateWeight(idx, -5)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleUpdateWeight(idx, -1)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    -1
                  </button>
                  <span className="w-10 text-center font-bold text-coffee text-sm font-mono">
                    {set.weightKg}
                  </span>
                  <button
                    onClick={() => handleUpdateWeight(idx, +1)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateWeight(idx, +5)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    +5
                  </button>
                </div>

                {/* Reps Controls */}
                <div className="flex-1 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleUpdateReps(idx, -1)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    <Minus size={12} className="mx-auto" />
                  </button>
                  <span className="w-8 text-center font-bold text-coffee text-sm font-mono">
                    {set.reps}
                  </span>
                  <button
                    onClick={() => handleUpdateReps(idx, +1)}
                    disabled={set.completed}
                    className="w-7 h-7 rounded-lg bg-surface border border-edge text-coffee-muted hover:text-coffee text-xs font-bold disabled:opacity-40"
                  >
                    <Plus size={12} className="mx-auto" />
                  </button>
                </div>

                {/* Complete Set Checkbox Button */}
                <div className="w-14 text-right">
                  <button
                    onClick={() => handleToggleComplete(idx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                      set.completed
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-surface border border-edge text-coffee-muted hover:border-coffee-muted'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add / Remove Set buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddSet}
                className="flex-1 py-2 px-3 rounded-xl border border-dashed border-edge hover:border-coffee-muted text-xs font-semibold text-coffee-muted hover:text-coffee transition flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Set
              </button>
              {sets.length > 1 && (
                <button
                  onClick={handleRemoveSet}
                  className="py-2 px-3 rounded-xl border border-dashed border-edge hover:border-red-400 text-xs font-semibold text-coffee-muted hover:text-red-400 transition flex items-center justify-center gap-1.5"
                >
                  <Minus size={14} /> Remove Set
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-edge bg-surface2/50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-coffee text-xs font-bold transition active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={handleFinishExercise}
            disabled={completedCount === 0}
            className="flex-2 py-3 px-5 rounded-xl text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: character.theme.primary }}
          >
            <CheckCircle2 size={16} />
            <span>Finish Exercise ({completedCount}/{sets.length} Sets Done)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
