import { UserProfileData } from '../types/onboarding';

export const USER_PROFILE_STORAGE_KEY = 'uplevel_user_onboarding_profile';

export const DEFAULT_USER_PROFILE: UserProfileData = {
  name: 'Scholar-Athlete',
  avatar: '/avatars/naruto.png',
  mainGoal: 'Master full-stack AI development & ace university exams with top grades',
  profession: 'College Student',
  fieldOrBranch: 'CS - Artificial Intelligence & Data Science',
  yearOrExperience: '3rd Year',
  skillsToMaster: ['React & TypeScript', 'Full-Stack Web Dev', 'System Design & OS', 'Data Structures & Algorithms'],
  skillLevels: {
    'React & TypeScript': 'Intermediate',
    'Full-Stack Web Dev': 'Intermediate',
    'System Design & OS': 'Beginner',
    'Data Structures & Algorithms': 'Intermediate',
  },
  wantToBuildBody: 'Yes',
  physiqueGoal: 'Build muscle',
  height: { value: 175, unit: 'cm' },
  weight: { value: 68, unit: 'kg' },
  age: 20,
  gender: 'Prefer not to say',
  targetWeight: { value: 74, unit: 'kg' },
  trainingPlace: 'Gym',
  workoutDaysPerWeek: 4,
  fitnessExperience: 'Intermediate',
  foodPreference: 'Non-veg',
  otherAreas: ['Productivity', 'Sleep and wellness', 'Money and savings', 'Confidence and communication'],
  wakeUpTime: '06:30',
  sleepTime: '23:30',
  freeHoursPerDay: 5,
  busySlots: [
    { id: 'slot-1', label: 'College Lectures & Labs', startTime: '09:00', endTime: '16:00' },
  ],
  blockers: ['Procrastination', 'Distractions', 'Inconsistency'],
  coachName: 'Naruto',
  coachAvatar: '/avatars/naruto.png',
  coachPersonality: 'Strict Mentor',
  planType: 'Pre-built plan for my goals',
};

/**
 * Load user onboarding profile from localStorage
 */
export function loadUserProfile(): UserProfileData {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse user profile from localStorage:', err);
  }
  return DEFAULT_USER_PROFILE;
}

/**
 * Save user onboarding profile to localStorage
 */
export function saveUserProfile(data: UserProfileData): boolean {
  try {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save user profile:', err);
    return false;
  }
}
