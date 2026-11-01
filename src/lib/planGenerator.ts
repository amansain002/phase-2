import { UserProfileData } from '../types/onboarding';
import { Task, TimetableEntry, DayOfWeek, CompanionConfig } from '../types';
import { saveStoredTasks, saveStoredTimetable } from './storage';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface GeneratedPlanResult {
  timetable: TimetableEntry[];
  tasks: Task[];
  coachConfig: Partial<CompanionConfig>;
  summary: string;
}

/**
 * Generate a complete personalized 7-day timetable, categorized study & fitness quests,
 * and calibrated AI coach configuration from the onboarding questionnaire answers.
 */
export function generateUserPlanAndQuests(profile: UserProfileData): GeneratedPlanResult {
  // 1. GENERATE CATEGORIZED TASKS / QUESTS
  const tasks: Task[] = [];
  let taskIdCounter = 1;

  // A. Skill-specific quests
  const primarySkills = profile.skillsToMaster.length > 0
    ? profile.skillsToMaster.slice(0, 4)
    : [profile.fieldOrBranch || 'Core Subject'];

  primarySkills.forEach((skill) => {
    const level = profile.skillLevels[skill] || 'Intermediate';
    let title = '';
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    let xp = 50;

    if (level === 'Beginner') {
      title = `Master foundational concepts & take structured notes in ${skill}`;
      difficulty = 'easy';
      xp = 30;
    } else if (level === 'Advanced') {
      title = `Build complex system project & benchmark performance in ${skill}`;
      difficulty = 'hard';
      xp = 100;
    } else {
      title = `Complete 3 hands-on practical implementation problems in ${skill}`;
      difficulty = 'medium';
      xp = 60;
    }

    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title,
      subject: skill,
      difficulty,
      xpReward: xp,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  });

  // B. Physique & Wellness quests (if user chose to build body)
  if (profile.wantToBuildBody === 'Yes') {
    const workoutDays = profile.workoutDaysPerWeek || 4;
    const trainingLocation = profile.trainingPlace || 'Gym';
    const goal = profile.physiqueGoal || 'Build muscle';

    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title: `Complete 45-min ${goal} training session at ${trainingLocation}`,
      subject: 'Fitness & Physique',
      difficulty: 'medium',
      xpReward: 50,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title: `Hydrate (3L water) & meet daily ${profile.foodPreference || 'healthy'} nutrition target`,
      subject: 'Fitness & Physique',
      difficulty: 'easy',
      xpReward: 25,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  // C. Anti-Blocker & Habit quests
  if (profile.blockers.includes('Procrastination') || profile.blockers.includes('Distractions')) {
    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title: 'Run one distraction-free 25-minute Pomodoro focus block in Zen Chamber',
      subject: 'Focus Habits',
      difficulty: 'easy',
      xpReward: 35,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (profile.otherAreas.includes('Money and savings')) {
    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title: 'Log daily UPI expenses & review remaining pocket budget',
      subject: 'Financial Discipline',
      difficulty: 'easy',
      xpReward: 20,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (profile.otherAreas.includes('Sleep and wellness')) {
    tasks.push({
      id: `task-onboarding-${taskIdCounter++}`,
      title: `Screen-free cooldown routine starting at ${profile.sleepTime || '23:00'}`,
      subject: 'Recovery & Sleep',
      difficulty: 'easy',
      xpReward: 25,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. GENERATE 7-DAY TIMETABLE
  const timetable: TimetableEntry[] = [];
  let ttIdCounter = 1;

  const workoutDaysTarget = profile.wantToBuildBody === 'Yes' ? (profile.workoutDaysPerWeek || 4) : 0;
  // Pick active workout days (e.g. Mon, Wed, Fri, Sat)
  const workoutDaysSet = new Set<DayOfWeek>();
  if (workoutDaysTarget >= 2) workoutDaysSet.add('Mon');
  if (workoutDaysTarget >= 3) workoutDaysSet.add('Wed');
  if (workoutDaysTarget >= 4) workoutDaysSet.add('Fri');
  if (workoutDaysTarget >= 5) workoutDaysSet.add('Sat');
  if (workoutDaysTarget >= 6) workoutDaysSet.add('Tue');

  DAYS.forEach((day, dayIndex) => {
    const isWeekend = day === 'Sat' || day === 'Sun';

    // Morning Routine block
    timetable.push({
      id: `tt-gen-${ttIdCounter++}`,
      title: `${primarySkills[0]} Focus Session`,
      subject: primarySkills[0],
      day,
      time: isWeekend ? '09:30' : '07:30',
      duration: 45,
      completed: day === 'Mon' && dayIndex === 0, // friendly starter checked state
    });

    // Daytime Primary Activity (Lectures, Job, or Deep Study)
    if (!isWeekend) {
      const busyLabel = profile.busySlots[0]?.label || `${profile.profession} Work & Study`;
      timetable.push({
        id: `tt-gen-${ttIdCounter++}`,
        title: busyLabel,
        subject: profile.fieldOrBranch || 'Work / Class',
        day,
        time: profile.busySlots[0]?.startTime || '10:00',
        duration: 90,
        completed: false,
      });
    }

    // Workout session if this day is a designated workout day
    if (workoutDaysSet.has(day)) {
      timetable.push({
        id: `tt-gen-${ttIdCounter++}`,
        title: `${profile.physiqueGoal || 'Workout'} (${profile.trainingPlace || 'Gym'})`,
        subject: 'Physique & Health',
        day,
        time: isWeekend ? '11:00' : '17:30',
        duration: 50,
        completed: false,
      });
    }

    // Evening Skill or Revision block
    const eveningSubject = primarySkills[1] || primarySkills[0];
    timetable.push({
      id: `tt-gen-${ttIdCounter++}`,
      title: `${eveningSubject} Practice & Problem Solving`,
      subject: eveningSubject,
      day,
      time: isWeekend ? '16:00' : '20:00',
      duration: 45,
      completed: false,
    });
  });

  // 3. CALIBRATE AI COACH CONFIG
  let personalityType: 'hype' | 'strict' | 'calm' = 'hype';
  if (profile.coachPersonality === 'Strict Mentor' || profile.coachPersonality === 'Savage Roast') {
    personalityType = 'strict';
  } else if (profile.coachPersonality === 'Calm Guide') {
    personalityType = 'calm';
  } else {
    personalityType = 'hype';
  }

  const coachConfig: Partial<CompanionConfig> = {
    name: profile.coachName || 'AI Coach',
    personality: personalityType,
    voiceLine: `Let's conquer your goal: "${profile.mainGoal}". No distractions!`,
  };

  // Save generated quests and timetable to storage
  try {
    saveStoredTasks(tasks);
    saveStoredTimetable(timetable);
  } catch (err) {
    console.error('Failed to persist generated plan to storage:', err);
  }

  return {
    timetable,
    tasks,
    coachConfig,
    summary: `Plan customized for ${profile.name} (${profile.profession} - ${profile.fieldOrBranch})`,
  };
}
