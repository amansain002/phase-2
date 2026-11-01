export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export type ExerciseType = 'compound' | 'isolation' | 'bodyweight' | 'cardio';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  defaultSets: number;
  defaultReps: number;
  description?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: number; // timestamp in ms for 20-second gap enforcement
}

export interface PlannedExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
  status: 'pending' | 'completed';
  loggedSets?: WorkoutSet[];
  xpEarned?: number;
}

export interface DailyWorkoutPlan {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  name: string;
  isRestDay: boolean;
  exercises: PlannedExercise[];
}

export interface XPClaimRecord {
  date: string; // YYYY-MM-DD local
  exerciseId: string;
  sets: number;
  reps: number;
  xp: number;
  claimedAt: number;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  planName: string;
  totalXp: number;
  totalVolumeKg: number;
  completedExercisesCount: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  completedAt: string;
  exerciseLogs: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: MuscleGroup;
    sets: WorkoutSet[];
    xpEarned: number;
  }[];
  aiFeedback?: {
    characterId: string;
    characterName: string;
    quote: string;
  };
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  workoutXpEarned: number; // capped at 300
  streak: number;
  lastWorkoutDate?: string;
  completedWorkoutToday: boolean;
  allExercisesCompletedToday: boolean;
}

export interface WeeklySplitPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  days: {
    dayOfWeek: number;
    dayName: string;
    planName: string;
    isRestDay: boolean;
    exerciseIds: string[];
  }[];
}
