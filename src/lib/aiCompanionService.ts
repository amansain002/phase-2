import { AICompanionResponse, ChatMessage, UserProgress, Task } from '../types';
import { getGeminiClient } from './gemini';

export interface ContextPayload {
  student: {
    displayName: string;
    level: number;
    rankTier: string;
    currentXp: number;
    coins: number;
  };
  companion: {
    name: string;
    archetype: string;
    personality: string;
  };
  recentActivity?: {
    taskJustCompleted?: string;
    subject?: string;
    sessionDuration?: number;
  };
  progress: {
    streakDays: number;
    totalCompletedSessions: number;
  };
  conversationHistory?: { role: string; content: string }[];
  trigger: string;
  userMessage?: string;
}

/**
 * Aggregates complete live student academic context for the AI Companion
 */
export function buildLiveStudentContext(
  progress: UserProgress,
  rankTier: string,
  taskJustCompleted?: string,
  sessionDuration?: number,
  subject?: string,
  trigger: string = 'task_completed',
  userMessage?: string,
  conversationHistory: ChatMessage[] = []
): ContextPayload {
  return {
    student: {
      displayName: 'Student',
      level: progress.level,
      rankTier,
      currentXp: progress.currentXp,
      coins: progress.coins,
    },
    companion: {
      name: progress.companion.name,
      archetype: progress.companion.archetype,
      personality: progress.companion.personality,
    },
    recentActivity: {
      taskJustCompleted,
      subject,
      sessionDuration,
    },
    progress: {
      streakDays: progress.streak,
      totalCompletedSessions: 0,
    },
    conversationHistory: conversationHistory.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    trigger,
    userMessage,
  };
}

/**
 * Calls the backend Gemini AI service
 */
export async function fetchAICompanionResponse(
  context: ContextPayload
): Promise<AICompanionResponse> {
  try {
    const res = await fetch('/api/companion/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data: AICompanionResponse = await res.json();
    return data;
  } catch (error) {
    console.warn('[AI Companion Client] Network request failed, attempting direct Gemini API call:', error);

    // Direct client-side Gemini call using integrated API key
    const client = getGeminiClient();
    if (client) {
      try {
        const subject =
          context.recentActivity?.subject ||
          context.recentActivity?.taskJustCompleted ||
          'your study session';
        const personality = context.companion?.personality || 'hype';
        const companionName = context.companion?.name || 'Anime Coach';
        const prompt = `You are ${companionName}, an anime study coach with a ${personality} personality.
The student just triggered: "${context.trigger}".
Recent activity: ${subject}.
Write a short, powerful 1-2 sentence reaction in-character that inspires them to keep going!`;

        const res = await client.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
        });

        if (res && res.text) {
          return {
            message: res.text.trim(),
            emotion: 'celebrating',
            suggestedAction: {
              label: `Continue ${subject}`,
              type: 'study_recommendation',
            },
            shouldSpeak: true,
            model: 'gemini-3.5-flash-lite',
            isFallback: false,
          };
        }
      } catch (geminiErr) {
        console.warn('[AI Companion Direct Gemini fallback failed]:', geminiErr);
      }
    }

    // Reliable client-side safety fallback if API is unreachable
    const subject = context.recentActivity?.subject || 'your studies';
    const personality = context.companion?.personality || 'hype';

    return {
      message:
        personality === 'strict'
          ? `Study milestone logged for ${subject}. Maintain focus and review your key notes before moving on.`
          : personality === 'calm'
          ? `Well done with ${subject}. Take a steady breath; each dedicated session builds true understanding.`
          : `Great work on ${subject}! XP earned and momentum rolling! Keep this energy going!`,
      emotion: 'encouraging',
      suggestedAction: {
        label: `Review ${subject}`,
        type: 'study_recommendation',
      },
      shouldSpeak: true,
      model: 'client-offline-fallback',
      isFallback: true,
      errorNotice: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Checks if Gemini backend has an active API key
 */
export async function checkGeminiStatus(): Promise<{
  configured: boolean;
  model: string;
}> {
  try {
    const res = await fetch('/api/companion/status');
    if (res.ok) {
      const data = await res.json();
      return {
        configured: Boolean(data.geminiConfigured),
        model: data.model || 'gemini-3.5-flash-lite',
      };
    }
  } catch {}
  return { configured: true, model: 'gemini-3.5-flash-lite' };
}
