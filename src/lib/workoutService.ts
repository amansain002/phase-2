import {
  Exercise,
  WorkoutSet,
  PlannedExercise,
  DailyWorkoutPlan,
  XPClaimRecord,
  WorkoutLog,
  DailyStats,
  DifficultyLevel,
} from '../types/workout';
import {
  WORKOUT_CONFIG,
  DEFAULT_EXERCISE_LIBRARY,
  SPLIT_PRESETS,
  AI_CHARACTER_FEEDBACK,
} from '../data/workoutConfig';

const STORAGE_KEYS = {
  PLANS: 'uplevel_workout_plans',
  EXERCISES: 'uplevel_workout_exercise_library',
  LOGS: 'uplevel_workout_logs',
  CLAIMS: 'uplevel_workout_xp_claims',
  STATS: 'uplevel_workout_daily_stats',
  LAST_ACTIVE_DATE: 'uplevel_workout_last_active_date',
};

/**
 * Returns today's date string in the user's local timezone (YYYY-MM-DD)
 */
export function getTodayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date string in user's local timezone (YYYY-MM-DD)
 */
export function getYesterdayLocalISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load or initialize exercise library
 */
export function getExerciseLibrary(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (raw) {
      const parsed: Exercise[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load exercises:', e);
  }
  // Initialize with defaults
  saveExerciseLibrary(DEFAULT_EXERCISE_LIBRARY);
  return DEFAULT_EXERCISE_LIBRARY;
}

export function saveExerciseLibrary(library: Exercise[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save exercise library:', e);
  }
}

export function addCustomExercise(
  exercise: Omit<Exercise, 'id' | 'isCustom'>
): Exercise {
  const library = getExerciseLibrary();
  const newEx: Exercise = {
    ...exercise,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isCustom: true,
  };
  const updated = [newEx, ...library];
  saveExerciseLibrary(updated);
  return newEx;
}

/**
 * Load or initialize weekly workout plans
 */
export function getWeeklyPlans(): DailyWorkoutPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (raw) {
      const parsed: DailyWorkoutPlan[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load weekly plans:', e);
  }

  // Initialize with PPL 6-day preset by default
  const defaultPreset = SPLIT_PRESETS[0];
  const library = getExerciseLibrary();
  const libMap = new Map(library.map((e) => [e.id, e]));

  const initialPlans: DailyWorkoutPlan[] = defaultPreset.days.map((day) => {
    const exercises: PlannedExercise[] = [];
    day.exerciseIds.forEach((id) => {
      const ex = libMap.get(id);
      if (ex) {
        exercises.push({
          exerciseId: id,
          targetSets: ex.defaultSets,
          targetReps: ex.defaultReps,
          targetWeightKg: ex.type === 'compound' ? 40 : 15,
          status: 'pending',
        });
      }
    });

    return {
      dayOfWeek: day.dayOfWeek,
      name: day.planName,
      isRestDay: day.isRestDay,
      exercises,
    };
  });

  saveWeeklyPlans(initialPlans);
  return initialPlans;
}

export function saveWeeklyPlans(plans: DailyWorkoutPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save weekly plans:', e);
  }
}

/**
 * Get workout plan for today
 */
export function getTodayPlan(): DailyWorkoutPlan {
  const plans = getWeeklyPlans();
  const todayDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  const found = plans.find((p) => p.dayOfWeek === todayDayOfWeek);
  if (found) return found;

  return {
    dayOfWeek: todayDayOfWeek,
    name: 'Rest & Recovery',
    isRestDay: true,
    exercises: [],
  };
}

/**
 * Update a planned exercise in today's plan
 */
export function updateTodayPlanExercise(
  exerciseId: string,
  updates: Partial<PlannedExercise>
): void {
  const plans = getWeeklyPlans();
  const todayDayOfWeek = new Date().getDay();
  const dayIdx = plans.findIndex((p) => p.dayOfWeek === todayDayOfWeek);
  if (dayIdx === -1) return;

  const currentDay = plans[dayIdx];
  const updatedExercises = currentDay.exercises.map((e) => {
    if (e.exerciseId === exerciseId) {
      return { ...e, ...updates };
    }
    return e;
  });

  plans[dayIdx] = {
    ...currentDay,
    exercises: updatedExercises,
  };

  saveWeeklyPlans(plans);
}

/**
 * Load or initialize daily stats
 */
export function getDailyStats(): DailyStats {
  const today = getTodayLocalISO();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed: DailyStats = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load daily stats:', e);
  }

  // Not today or not found -> trigger resetDaily
  return resetDaily();
}

export function saveDailyStats(stats: DailyStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save daily stats:', e);
  }
}

/**
 * Get all XP claim records
 */
export function getXPClaims(): XPClaimRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load XP claims:', e);
  }
  return [];
}

export function saveXPClaims(claims: XPClaimRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
  } catch (e) {
    console.error('Failed to save XP claims:', e);
  }
}

/**
 * Anti-spam rule: check if an exercise can be claimed for XP today
 */
export function canClaimXP(
  exerciseId: string,
  date: string = getTodayLocalISO()
): {
  canClaim: boolean;
  reason?: string;
  currentDailyXp: number;
  remainingCap: number;
} {
  const claims = getXPClaims();
  const hasClaimed = claims.some(
    (c) => c.exerciseId === exerciseId && c.date === date
  );

  const stats = getDailyStats();
  const remainingCap = Math.max(0, WORKOUT_CONFIG.dailyXpCap - stats.workoutXpEarned);

  if (hasClaimed) {
    return {
      canClaim: false,
      reason: 'Exercise XP already claimed today (+0 XP)',
      currentDailyXp: stats.workoutXpEarned,
      remainingCap,
    };
  }

  if (remainingCap <= 0) {
    return {
      canClaim: false,
      reason: 'Daily workout XP cap (300 XP) reached (+0 XP)',
      currentDailyXp: stats.workoutXpEarned,
      remainingCap: 0,
    };
  }

  return {
    canClaim: true,
    currentDailyXp: stats.workoutXpEarned,
    remainingCap,
  };
}

/**
 * Calculates XP for a completed exercise according to strict formula:
 * XP = base XP x difficulty multiplier x set factor x rep factor
 * - Base XP: compound 30, isolation 20, bodyweight 20, cardio 25
 * - Difficulty multiplier: beginner 1.0, intermediate 1.2, advanced 1.5
 * - Set factor: completed sets / target sets (max 1.0)
 * - Rep factor: min(actual reps / target reps, 1.0) averaged across completed sets
 */
export function calculateXP(
  exercise: Exercise,
  sets: WorkoutSet[],
  targetSets: number,
  targetReps: number
): number {
  const completedSets = sets.filter((s) => s.completed && s.reps >= 1);
  if (completedSets.length === 0) return 0;

  const base = WORKOUT_CONFIG.baseXP[exercise.type] || 20;
  const diffMultiplier =
    WORKOUT_CONFIG.difficultyMultiplier[exercise.difficulty] || 1.0;

  const setFactor = Math.min(1.0, completedSets.length / Math.max(1, targetSets));

  const totalRepRatios = completedSets.reduce((acc, s) => {
    return acc + Math.min(1.0, s.reps / Math.max(1, targetReps));
  }, 0);

  const avgRepFactor = totalRepRatios / completedSets.length;

  const rawXp = base * diffMultiplier * setFactor * avgRepFactor;
  return Math.round(rawXp);
}

/**
 * Records an XP claim and updates daily stats with cap enforcement
 */
export function recordXPClaim(claim: XPClaimRecord): {
  xpAwarded: number;
  newDailyXp: number;
} {
  const claims = getXPClaims();
  const stats = getDailyStats();

  const remainingCap = Math.max(0, WORKOUT_CONFIG.dailyXpCap - stats.workoutXpEarned);
  const actualXp = Math.min(claim.xp, remainingCap);

  const newRecord: XPClaimRecord = {
    ...claim,
    xp: actualXp,
    claimedAt: Date.now(),
  };

  claims.push(newRecord);
  saveXPClaims(claims);

  const updatedStats: DailyStats = {
    ...stats,
    workoutXpEarned: stats.workoutXpEarned + actualXp,
    lastWorkoutDate: claim.date,
  };
  saveDailyStats(updatedStats);

  return {
    xpAwarded: actualXp,
    newDailyXp: updatedStats.workoutXpEarned,
  };
}

/**
 * Midnight (12:00 AM) Reset Routine:
 * Compares stored lastActiveDate with today's local date.
 * If new date:
 * - Resets all exercises in weekly plans to 'pending'
 * - Resets daily XP counter to 0
 * - Checks streak: if yesterday had completed workout, streak continues; else resets to 0
 */
export function resetDaily(): DailyStats {
  const today = getTodayLocalISO();
  const yesterday = getYesterdayLocalISO();

  let prevStats: DailyStats | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      prevStats = JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }

  let streak = 0;
  if (prevStats) {
    if (prevStats.date === today) {
      return prevStats;
    }
    // New calendar day! Check streak
    if (prevStats.date === yesterday && prevStats.completedWorkoutToday) {
      streak = prevStats.streak + 1;
    } else {
      streak = 0;
    }
  }

  // Reset exercise statuses in weekly plans for the new day
  try {
    const plans = getWeeklyPlans();
    const resetPlans = plans.map((p) => ({
      ...p,
      exercises: p.exercises.map((e) => ({
        ...e,
        status: 'pending' as const,
        loggedSets: undefined,
        xpEarned: undefined,
      })),
    }));
    saveWeeklyPlans(resetPlans);
  } catch (e) {
    console.error('Error resetting plans on daily reset:', e);
  }

  const freshStats: DailyStats = {
    date: today,
    workoutXpEarned: 0,
    streak,
    completedWorkoutToday: false,
    allExercisesCompletedToday: false,
  };

  saveDailyStats(freshStats);
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
  } catch (e) {
    // ignore
  }

  return freshStats;
}

/**
 * Load and save past workout logs
 */
export function getWorkoutLogs(): WorkoutLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load workout logs:', e);
  }
  return [];
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  logs.unshift(log); // latest first
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save workout log:', e);
  }
}

/**
 * Generates Critique AI-style character feedback after workout
 */
export function getAICharacterFeedback(
  characterId: string,
  summary: {
    totalVolume: number;
    sets: number;
    reps: number;
    xp: number;
    streak: number;
  }
): { characterName: string; quote: string } {
  const charKey = (characterId || 'goku').toLowerCase() as keyof typeof AI_CHARACTER_FEEDBACK;
  const quotes = AI_CHARACTER_FEEDBACK[charKey] || AI_CHARACTER_FEEDBACK.goku;

  // Pick quote deterministically or by volume
  const idx = Math.min(
    quotes.length - 1,
    Math.floor((summary.totalVolume + summary.sets) % quotes.length)
  );

  const charNames: Record<string, string> = {
    goku: 'Son Goku',
    asta: 'Asta',
    naruto: 'Naruto Uzumaki',
    saitama: 'Saitama',
  };

  return {
    characterName: charNames[charKey] || 'AI Coach',
    quote: quotes[idx],
  };
}

/**
 * AI Workout Coach plan generator:
 * Generates a full weekly split based on user goal, experience, and days/week
 */
export function generateAIWeeklySplit(
  goal: 'muscle_gain' | 'fat_loss' | 'strength',
  experience: DifficultyLevel,
  daysPerWeek: number
): DailyWorkoutPlan[] {
  const library = getExerciseLibrary();
  const libMap = new Map(library.map((e) => [e.id, e]));

  // Select suitable preset or tailor
  let basePreset = SPLIT_PRESETS[0]; // PPL
  if (daysPerWeek <= 3) {
    basePreset = SPLIT_PRESETS[2]; // Full Body 3-Day
  } else if (daysPerWeek === 4) {
    basePreset = SPLIT_PRESETS[1]; // Upper/Lower 4-Day
  } else if (daysPerWeek === 5) {
    basePreset = SPLIT_PRESETS[3]; // Bro Split 5-Day
  } else {
    basePreset = SPLIT_PRESETS[0]; // PPL 6-Day
  }

  const generatedPlans: DailyWorkoutPlan[] = basePreset.days.map((day) => {
    if (day.isRestDay) {
      return {
        dayOfWeek: day.dayOfWeek,
        name: 'Rest & Recovery Day',
        isRestDay: true,
        exercises: [],
      };
    }

    // Configure sets/reps based on goal
    let targetSets = 3;
    let targetReps = 10;
    if (goal === 'strength') {
      targetSets = 4;
      targetReps = 5;
    } else if (goal === 'fat_loss') {
      targetSets = 3;
      targetReps = 15;
    } else {
      // muscle gain
      targetSets = 4;
      targetReps = 8;
    }

    const exercises: PlannedExercise[] = [];
    day.exerciseIds.forEach((id) => {
      const ex = libMap.get(id);
      if (ex) {
        exercises.push({
          exerciseId: id,
          targetSets,
          targetReps: ex.type === 'cardio' ? ex.defaultReps : targetReps,
          targetWeightKg: ex.type === 'compound' ? 50 : 15,
          status: 'pending',
        });
      }
    });

    return {
      dayOfWeek: day.dayOfWeek,
      name: day.planName,
      isRestDay: false,
      exercises,
    };
  });

  return generatedPlans;
}
