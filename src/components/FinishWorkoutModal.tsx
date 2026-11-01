import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Dumbbell,
  Flame,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Repeat,
  ArrowRight,
} from 'lucide-react';
import { DailyWorkoutPlan, WorkoutLog } from '../types/workout';
import {
  getDailyStats,
  saveDailyStats,
  saveWorkoutLog,
  getAICharacterFeedback,
  getTodayLocalISO,
  getExerciseLibrary,
} from '../lib/workoutService';
import { WORKOUT_CONFIG } from '../data/workoutConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from './CharacterAvatar';
import { feedback } from '../lib/sound';

interface FinishWorkoutModalProps {
  todayPlan: DailyWorkoutPlan;
  onClose: () => void;
}

export const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({
  todayPlan,
  onClose,
}) => {
  const { character } = useTheme();
  const { addXp, progress } = useApp();

  const library = getExerciseLibrary();
  const libMap = new Map(library.map((e) => [e.id, e]));

  // Calculate session metrics
  const completedExercises = todayPlan.exercises.filter((e) => e.status === 'completed');
  const allCompleted =
    todayPlan.exercises.length > 0 &&
    completedExercises.length === todayPlan.exercises.length;

  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;
  let sessionXp = 0;

  completedExercises.forEach((pe) => {
    sessionXp += pe.xpEarned || 0;
    if (pe.loggedSets) {
      pe.loggedSets.forEach((s) => {
        if (s.completed) {
          totalSets += 1;
          totalReps += s.reps;
          totalVolumeKg += s.weightKg * s.reps;
        }
      });
    }
  });

  const dailyStats = getDailyStats();
  const streakDays = dailyStats.streak + (dailyStats.completedWorkoutToday ? 0 : 1);
  const streakBonus = Math.min(
    WORKOUT_CONFIG.maxStreakBonus,
    streakDays * WORKOUT_CONFIG.streakBonusPerDay
  );
  const completionBonus = allCompleted ? WORKOUT_CONFIG.fullPlanCompletionBonus : 0;
  const totalBonusXp = completionBonus + streakBonus;

  // AI Feedback
  const aiCoach = getAICharacterFeedback(character.id, {
    totalVolume: totalVolumeKg,
    sets: totalSets,
    reps: totalReps,
    xp: sessionXp + totalBonusXp,
    streak: streakDays,
  });

  useEffect(() => {
    feedback.playLevelUp();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  const handleClaimSummaryAndSave = () => {
    // Award bonus XP if not already awarded today
    if (!dailyStats.completedWorkoutToday && totalBonusXp > 0) {
      addXp(totalBonusXp, `Workout Bonus: Full Plan & Streak`);
    }

    // Save Workout Log record
    const logRecord: WorkoutLog = {
      id: `log_${Date.now()}`,
      date: getTodayLocalISO(),
      planName: todayPlan.name,
      totalXp: sessionXp + totalBonusXp,
      totalVolumeKg,
      completedExercisesCount: completedExercises.length,
      totalSetsCompleted: totalSets,
      totalRepsCompleted: totalReps,
      completedAt: new Date().toISOString(),
      exerciseLogs: completedExercises.map((pe) => {
        const ex = libMap.get(pe.exerciseId);
        return {
          exerciseId: pe.exerciseId,
          exerciseName: ex ? ex.name : pe.exerciseId,
          muscleGroup: ex ? ex.muscleGroup : 'chest',
          sets: pe.loggedSets || [],
          xpEarned: pe.xpEarned || 0,
        };
      }),
      aiFeedback: {
        characterId: character.id,
        characterName: aiCoach.characterName,
        quote: aiCoach.quote,
      },
    };

    saveWorkoutLog(logRecord);

    // Update daily stats
    saveDailyStats({
      ...dailyStats,
      streak: streakDays,
      completedWorkoutToday: true,
      allExercisesCompletedToday: allCompleted,
      workoutXpEarned: dailyStats.workoutXpEarned + totalBonusXp,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="w-full max-w-md bg-surface border border-edge rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}50` }}
      >
        {/* Background glow header */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: character.theme.primary }}
        />

        {/* Top Trophy & Title */}
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg border text-white animate-bounce"
            style={{
              backgroundColor: character.theme.primary,
              borderColor: `${character.theme.primary}60`,
            }}
          >
            <Trophy size={32} />
          </div>

          <div>
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
              style={{
                backgroundColor: `${character.theme.primary}15`,
                borderColor: `${character.theme.primary}30`,
                color: character.theme.primary,
              }}
            >
              Workout Completed!
            </span>
            <h2 className="text-xl font-extrabold text-coffee mt-1">
              {todayPlan.name}
            </h2>
            <p className="text-xs text-coffee-muted">
              Awesome work! Your session has been locked in and logged.
            </p>
          </div>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl text-white"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Total XP Earned
              </span>
              <span
                className="text-base font-black"
                style={{ color: character.theme.primary }}
              >
                +{sessionXp + totalBonusXp} XP
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Dumbbell size={16} />
            </div>
            <div>
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Total Volume
              </span>
              <span className="text-base font-black text-coffee">
                {totalVolumeKg.toLocaleString()} kg
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Layers size={16} />
            </div>
            <div>
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Sets Done
              </span>
              <span className="text-base font-black text-coffee">
                {totalSets} Sets
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame size={16} />
            </div>
            <div>
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Active Streak
              </span>
              <span className="text-base font-black text-coffee">
                {streakDays} Days 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Bonus Breakdown Pill */}
        <div className="p-3 rounded-2xl bg-sand/15 border border-edge text-xs space-y-1">
          <div className="flex items-center justify-between text-coffee font-semibold">
            <span>Exercises Completed:</span>
            <span>
              {completedExercises.length} / {todayPlan.exercises.length}
            </span>
          </div>
          {completionBonus > 0 && (
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Full Plan Completion Bonus:</span>
              <span>+{completionBonus} XP</span>
            </div>
          )}
          {streakBonus > 0 && (
            <div className="flex items-center justify-between text-orange-400 font-bold">
              <span>Streak Loyalty Bonus:</span>
              <span>+{streakBonus} XP</span>
            </div>
          )}
        </div>

        {/* AI Character Critique Box */}
        <div
          className="p-3.5 rounded-2xl border bg-surface2 relative space-y-2"
          style={{ borderColor: `${character.theme.primary}35` }}
        >
          <div className="flex items-center gap-2">
            <CharacterAvatar character={character} size="sm" />
            <div>
              <h4 className="text-xs font-bold text-coffee leading-none">
                {aiCoach.characterName}
              </h4>
              <span className="text-[10px] text-coffee-muted">AI Workout Coach</span>
            </div>
          </div>
          <p className="text-xs text-coffee font-medium italic pl-1 leading-relaxed">
            "{aiCoach.quote}"
          </p>
        </div>

        {/* Lock In Button */}
        <button
          onClick={handleClaimSummaryAndSave}
          className="w-full py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: character.theme.primary }}
        >
          <span>Claim Progress & Save Log</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
