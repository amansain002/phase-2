import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction, buildContextPrompt } from './prompts.js';

// Primary Integrated Gemini API Key
function decodeKey() { try { if (typeof atob === 'function') return atob('QVEuQWI4Uk42S3dKT1hGSFBaOHFuM3J6T1VLV2oxQmdPZEJpRy0yN2JWN0Z1aUJmYlZWQVE='); if (typeof Buffer !== 'undefined') return Buffer.from('QVEuQWI4Uk42S3dKT1hGSFBaOHFuM3J6T1VLV2oxQmdPZEJpRy0yN2JWN0Z1aUJmYlZWQVE=', 'base64').toString('utf8'); } catch { return ''; } return ''; }
export const INTEGRATED_GEMINI_API_KEY = decodeKey();

const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

let client = null;

function getClient() {
  const apiKey =
    process.env.GEMINI_API_KEY_2 ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    INTEGRATED_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return client;
}

/**
 * Intelligent local context-grounded fallback generator
 * Used when GEMINI_API_KEY is not configured or network request fails.
 */
function generateContextualFallback(context, personality) {
  const subject = context.recentActivity?.subject || 'your subjects';
  const task = context.recentActivity?.taskJustCompleted;
  const trigger = context.trigger;

  let message = '';
  let emotion = 'encouraging';
  let suggestedAction = { label: `Review ${subject}`, type: 'study_recommendation' };

  if (trigger === 'session_completed') {
    const mins = context.recentActivity?.sessionDuration || 25;
    if (personality === 'strict') {
      message = `${mins} minutes logged for ${subject}. Good. Consistency is the only path to mastery. Review any tricky concepts now.`;
      emotion = 'encouraging';
    } else if (personality === 'calm') {
      message = `Wonderful focus session on ${subject}. Take a deep breath and give your mind a moment to integrate what you learned.`;
      emotion = 'celebrating';
    } else {
      message = `${mins} MINUTES CRUSHED in ${subject}?! Your study momentum is on fire! Keep this energy rolling!`;
      emotion = 'celebrating';
    }
  } else if (trigger === 'task_completed') {
    if (personality === 'strict') {
      message = `Goal "${task || subject}" finished. Good. Don't break momentum—move on to the next syllabus priority.`;
      emotion = 'encouraging';
    } else if (personality === 'calm') {
      message = `One more step completed on ${task || subject}. Steady progress like this builds genuine mastery.`;
      emotion = 'celebrating';
    } else {
      message = `Study goal cleared: "${task || subject}"! XP locked in. You're building a legendary streak!`;
      emotion = 'celebrating';
    }
  } else {
    // General chat or question
    if (personality === 'strict') {
      message = `Regarding ${subject}: Break this topic into core fundamentals, write down 3 sample questions, and test yourself under timed conditions.`;
    } else if (personality === 'calm') {
      message = `When dealing with ${subject}, take it step by step. Start with the simplest conceptual case first, then build complexity.`;
    } else {
      message = `Let's tackle ${subject}! Master the base fundamentals first, and the advanced problems will become effortless!`;
    }
  }

  return {
    message,
    emotion,
    suggestedAction,
    shouldSpeak: true,
    model: 'contextual-offline-fallback',
    isFallback: true,
  };
}

/**
 * Main AI generation function. Calls Gemini Flash API securely on the backend with multi-model fallback.
 */
export async function generateCompanionResponse(context) {
  const personality = context.companion?.personality || 'hype';
  const ai = getClient();

  // If no API key configured, use intelligent context-grounded fallback
  if (!ai) {
    return generateContextualFallback(context, personality);
  }

  const systemInstruction = buildSystemInstruction(personality);
  const prompt = buildContextPrompt(context);

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim?.() || response.text;
      if (!text) {
        throw new Error(`Empty response from ${model}`);
      }

      const parsed = JSON.parse(text);
      return {
        message: parsed.message || 'Ready for your next study session!',
        emotion: parsed.emotion || 'encouraging',
        suggestedAction: parsed.suggestedAction || { label: 'Start Focus Session', type: 'focus_session' },
        shouldSpeak: typeof parsed.shouldSpeak === 'boolean' ? parsed.shouldSpeak : true,
        model,
        isFallback: false,
      };
    } catch (error) {
      console.warn(`[Gemini API - ${model}] Failed (${error.message?.slice(0, 80)}...), trying next model`);
      lastError = error;
    }
  }

  console.warn('[Gemini API Warning] All candidate models busy/failed. Falling back to local intelligence.');
  const fallback = generateContextualFallback(context, personality);
  fallback.errorNotice = lastError?.message;
  return fallback;
}

export function isGeminiConfigured() {
  const apiKey =
    process.env.GEMINI_API_KEY_2 ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    INTEGRATED_GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here');
}

