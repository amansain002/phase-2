import { INITIAL_USER_PROGRESS, DEMO_TASKS } from './storage';

export const AUTH_STORAGE_KEY = 'uplevel_is_logged_in';
export const USER_ACCOUNT_KEY = 'uplevel_user_account';

export interface UserAccount {
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

/**
 * Check if the user is currently authenticated
 */
export function getIsLoggedIn(): boolean {
  try {
    const val = localStorage.getItem(AUTH_STORAGE_KEY);
    // Defaults to true on first run so the user doesn't hit a wall before starting
    return val !== 'false';
  } catch {
    return true;
  }
}

/**
 * Get or initialize user account metadata
 */
export function getUserAccount(): UserAccount {
  try {
    const val = localStorage.getItem(USER_ACCOUNT_KEY);
    if (val) return JSON.parse(val);
  } catch {
    // ignore
  }
  return {
    username: 'Scholar-Athlete',
    email: 'student@uplevel.academy',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Log the user in
 */
export function loginUser(email?: string, username?: string): boolean {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (email || username) {
      const current = getUserAccount();
      localStorage.setItem(
        USER_ACCOUNT_KEY,
        JSON.stringify({
          ...current,
          email: email || current.email,
          username: username || current.username,
        })
      );
    }
    return true;
  } catch (err) {
    console.error('Failed to log in:', err);
    return false;
  }
}

/**
 * 1. LOGOUT FUNCTION
 * Signs the user out and returns to the login screen.
 * Does NOT delete any progress. XP, level, rank, quests, workouts, and the
 * selected character stay saved, and come back when the user logs in again.
 */
export function logout(): boolean {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
    return true;
  } catch (err) {
    console.error('Logout error:', err);
    throw new Error('Failed to log out. Please check browser storage settings.');
  }
}

/**
 * 2. RESTART APP FUNCTION
 * Resets the app to a fresh start:
 * - XP to 0
 * - Level back to 1
 * - Rank back to starting rank (Bronze / D rank)
 * - Clears quests/tasks progress, workout logs, sessions, streaks, and chat history.
 * - Clears all anti-spam records, daily claim records, and daily stats.
 * - Takes user to first-launch flow (character select and onboarding).
 * - Keeps the logged-in account active (Restart is NOT logout).
 * - Keeps the selected character unless user wants to choose again on the onboarding screen.
 */
export function restartApp(preserveCharacter: boolean = true): boolean {
  try {
    // Keep character if specified
    const selectedChar = preserveCharacter ? localStorage.getItem('animebuddy_selected_character') : null;
    const soundSetting = localStorage.getItem('animebuddy_sound_enabled');

    // Fresh level 1 progress object with 0 XP and starting rank
    const freshProgress = {
      ...INITIAL_USER_PROGRESS,
      level: 1,
      currentXp: 0,
      streak: 0,
      coins: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    // Reset fresh tasks
    const freshTasks = DEMO_TASKS.map((t) => ({
      ...t,
      completed: false,
    }));

    // Reset all storage keys
    localStorage.setItem('uplevel_phase2_progress', JSON.stringify(freshProgress));
    localStorage.setItem('uplevel_phase2_tasks', JSON.stringify(freshTasks));
    localStorage.setItem('uplevel_phase2_sessions', JSON.stringify([]));
    localStorage.setItem('uplevel_phase2_completed_resources', JSON.stringify([]));
    localStorage.setItem('uplevel_phase2_expenses', JSON.stringify([]));

    // Reset onboarding state so user re-enters the first-launch flow
    localStorage.removeItem('uplevel_phase2_onboarding_complete');

    // Clear workout claim records, anti-spam tokens, and streak tracking keys
    localStorage.removeItem('uplevel_last_workout_claim');
    localStorage.removeItem('uplevel_daily_reset_timestamp');
    localStorage.removeItem('uplevel_companion_memory');
    localStorage.removeItem('uplevel_workout_plans');
    localStorage.removeItem('uplevel_workout_logs');
    localStorage.removeItem('uplevel_workout_xp_claims');
    localStorage.removeItem('uplevel_workout_daily_stats');
    localStorage.removeItem('uplevel_workout_last_active_date');

    // Clear AnimeBuddy chat histories across all characters
    const animeCharIds = ['goku', 'asta', 'naruto', 'saitama'];
    animeCharIds.forEach((id) => {
      localStorage.removeItem(`animebuddy_chat_history_${id}`);
    });

    // Ensure user remains logged in (Restart is NOT logout)
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    // Restore selected character if preserved
    if (selectedChar) {
      localStorage.setItem('animebuddy_selected_character', selectedChar);
    } else {
      localStorage.removeItem('animebuddy_selected_character');
    }

    if (soundSetting) {
      localStorage.setItem('animebuddy_sound_enabled', soundSetting);
    }

    return true;
  } catch (err) {
    console.error('Restart App error:', err);
    throw new Error('Failed to restart app. Please try again.');
  }
}
