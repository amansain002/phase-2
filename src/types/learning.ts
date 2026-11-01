export type LearningResourceType = 'video' | 'article' | 'notes' | 'course' | 'cheatsheet';

export type PracticeDifficulty = 'easy' | 'medium' | 'hard';

export interface LearningResource {
  id: string;
  title: string;
  topic: string;
  type: LearningResourceType;
  siteName: string;
  url: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  channelName?: string;
  duration?: string;
}

export interface PracticeQuestion {
  id: string;
  topic: string;
  difficulty: PracticeDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject?: string;
}

export interface ExternalPracticeLink {
  id: string;
  siteName: string;
  topic: string;
  difficulty: PracticeDifficulty;
  title: string;
  description: string;
  url: string;
  badge: string;
  xpReward: number;
}

export interface QuickNotes {
  topic: string;
  title: string;
  summary: string;
  keyPoints: string[];
  codeOrFormula?: string;
  miniQuiz: {
    question: string;
    answer: string;
  }[];
}

export interface MistakeRecord {
  id: string;
  question: PracticeQuestion;
  userSelectedIndex: number;
  timestamp: string;
  resolved: boolean;
}

export interface LearningStats {
  date: string;
  dailyXpEarned: number;
  watchedVideoIds: string[];
  completedResourceIds: string[];
  bookmarkedResourceIds: string[];
  recentTopics: string[];
  practiceStreak: number;
  lastPracticeDate?: string;
}
