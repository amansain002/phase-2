export type ProfessionType =
  | 'School Student'
  | 'College Student'
  | 'Office Worker'
  | 'Entrepreneur'
  | 'Freelancer'
  | 'Job Seeker'
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type PhysiqueGoal =
  | 'Build muscle'
  | 'Lose fat'
  | 'Get lean and toned'
  | 'Improve stamina'
  | 'Stay healthy'
  | 'Gain weight';

export type TrainingPlace = 'Home' | 'Gym' | 'Outdoors';

export type FoodPreference = 'Veg' | 'Non-veg' | 'Vegan';

export type CoachPersonalityType =
  | 'Friendly'
  | 'Strict Mentor'
  | 'Funny Buddy'
  | 'Calm Guide'
  | 'Savage Roast';

export type PlanTypeSelection =
  | 'Pre-built plan for my goals'
  | "I'll build my own";

export interface BusySlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

export interface UserProfileData {
  // BASIC INFO
  name: string;
  avatar: string;

  // AIM AND PROFESSION
  mainGoal: string;
  profession: ProfessionType;
  fieldOrBranch: string;
  yearOrExperience: string;

  // SKILLS
  skillsToMaster: string[];
  skillLevels: Record<string, SkillLevel>;

  // PHYSIQUE
  wantToBuildBody: 'Yes' | 'Maybe later' | 'No';
  physiqueGoal?: PhysiqueGoal;
  height?: {
    value: number;
    unit: 'cm' | 'ft';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
  age?: number;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  targetWeight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
  trainingPlace?: TrainingPlace;
  workoutDaysPerWeek?: number;
  fitnessExperience?: SkillLevel;
  foodPreference?: FoodPreference;

  // OTHER AREAS TO IMPROVE
  otherAreas: string[];

  // DAILY ROUTINE
  wakeUpTime: string;
  sleepTime: string;
  freeHoursPerDay: number;
  busySlots: BusySlot[];

  // BLOCKERS
  blockers: string[];

  // AI COACH
  coachName: string;
  coachAvatar: string;
  coachPersonality: CoachPersonalityType;

  // PLAN TYPE
  planType: PlanTypeSelection;

  // METADATA
  completedAt?: string;
  updatedAt?: string;
}
