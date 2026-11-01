import { Character } from '../data/characters';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Check for Vite frontend env or standard process env
const importMeta = import.meta as unknown as { env?: Record<string, string> };
const API_KEY =
  (importMeta && importMeta.env && importMeta.env.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
  '';

let client: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== 'your_gemini_api_key_here' && API_KEY.trim() !== '') {
  try {
    client = new GoogleGenAI({ apiKey: API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Intelligent in-character fallback generator
 * Provides rich, useful, structured answers first, with character personality infused.
 */
function generateCharacterFallback(prompt: string, character: Character): string {
  const p = prompt.toLowerCase();

  // 1. Coding / Debugging questions
  if (p.includes('code') || p.includes('debug') || p.includes('typescript') || p.includes('react') || p.includes('javascript') || p.includes('error') || p.includes('function') || p.includes('api')) {
    if (character.id === 'goku') {
      return `### ⚡ Ultra Instinct Code Breakdown:
Here is a battle-tested solution for your request:

\`\`\`typescript
// Clean, optimized implementation
export async function handleTaskExecution<T>(
  taskName: string,
  executor: () => Promise<T>
): Promise<T> {
  console.log(\`[Focus Chamber] Starting: \${taskName}\`);
  const startTime = performance.now();
  
  try {
    const result = await executor();
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(\`✅ Finished \${taskName} in \${duration}s with maximum precision!\`);
    return result;
  } catch (err) {
    console.error(\`⚠️ Error detected in \${taskName}: \`, err);
    throw err;
  }
}
\`\`\`

**Goku's Training Tip:**
When debugging, don't rush into making 10 changes at once! Clear your mind, follow the stack trace step-by-step, and test each component individually. Once you crush this bug, we celebrate with dumplings!`;
    }

    if (character.id === 'asta') {
      return `### 🗡️ ANTI-MAGIC CODE STRIKE!
NO ERROR CAN WITHSTAND ENOUGH REPETITIONS! Here is how we crush this problem:

\`\`\`typescript
// Resilient Error-Boundary & Retry Strategy
export async function executeWithRelentlessRetry<T>(
  action: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await action();
    } catch (error) {
      attempt++;
      console.warn(\`Attempt \${attempt} failed! BUT WE DON'T GIVE UP!\`, error);
      if (attempt >= maxAttempts) throw new Error("Surpassed max retries! Time to rethink our strike!");
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
  throw new Error("Unreachable");
}
\`\`\`

**Asta's Rule:**
Even if TypeScript yells at you with 20 red squiggles, don't panic! It just means your code is undergoing resistance training! Read the error message, fix the types, and swing again!`;
    }

    if (character.id === 'naruto') {
      return `### 🍥 Shadow Clone Multi-Step Solution:
Believe it! Here is a structured and reliable approach to tackle this:

\`\`\`typescript
import { useState, useEffect, useCallback } from 'react';

// Custom Hook to manage state like coordinated Shadow Clones
export function useNinjaTaskTracker<T>(initialTasks: T[]) {
  const [tasks, setTasks] = useState<T[]>(initialTasks);
  const [isProcessing, setIsProcessing] = useState(false);

  const completeTask = useCallback((index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { tasks, completeTask, isProcessing, setIsProcessing };
}
\`\`\`

**Naruto's Advice:**
A good shinobi always organizes their ninja tools before heading into the forest. Keep your state clean, decouple your logic into reusable functions, and test early! You've got this!`;
    }

    // Saitama
    return `Here’s the answer in one clean shot. No fluff:

\`\`\`typescript
// Simple, clean, zero unnecessary dependencies
export const solveProblem = (input: string): string => {
  if (!input.trim()) return 'Nothing to do.';
  return input.trim().split('').reverse().join('');
};
\`\`\`

Look, don't over-engineer things. If a simple function works, don't wrap it in 5 classes and a microservice. Keep it simple, push the commit, and let's go check the flyer for today's market sale.`;
  }

  // 2. Study / Focus / Schedule questions
  if (p.includes('study') || p.includes('schedule') || p.includes('routine') || p.includes('exam') || p.includes('focus') || p.includes('time')) {
    if (character.id === 'goku') {
      return `### 🥋 Whis-Style Deep Focus Routine:

1. **Warmup (5 mins):** Clear your desk, close all distracting tabs, grab water.
2. **First Round (25 mins):** Zero distractions. Pure high-intensity problem solving.
3. **Breathing Break (5 mins):** Step away from the screen, stretch, do 10 deep breaths.
4. **Second Round (25 mins):** Practice applying what you just read into active recall.
5. **Recovery (15 mins):** Light snack, protein, and congratulate yourself!

> *"You don't get stronger by training mindlessly for 10 hours. You get stronger by giving 100% focus during every single minute!"* Let's start Round 1!`;
    }

    if (character.id === 'asta') {
      return `### 🔥 SURPASS YOUR LIMITS STUDY PLAN!
PUT YOUR PHONE IN ANOTHER ROOM! HERE IS OUR BATTLE PLAN:

- **Phase 1: The Core Objective (30 Mins)** — Tackle the hardest topic FIRST while your mind is fresh!
- **Phase 2: Speed Drill (20 Mins)** — Flashcards, practice quizzes, or writing code without checking docs!
- **Phase 3: The 100-Pushup Sprint (5 Mins)** — Physical movement to pump blood back to your brain!
- **Phase 4: Synthesis (15 Mins)** — Teach what you learned out loud to an imaginary Black Bull!

WE ARE NOT LEAVING THIS CHAIR UNTIL THAT OBJECTIVE IS VANQUISHED! LET'S GOOOO!`;
    }

    if (character.id === 'naruto') {
      return `### 📜 Hokage Study Scroll:

Managing your studies is just like leading a village: you need steady pacing and clear priorities:

1. **Rank A (High Priority):** Difficult topics that are weighted heavily on your exam. Give these your morning hours.
2. **Rank B (Medium Priority):** Daily homework and project assignments.
3. **Rank C (Maintenance):** Reviewing past notes so you don't forget old jutsu.

Remember: Even the greatest ninja started at the academy failing clone techniques. Consistency is your true power, believe it!`;
    }

    // Saitama
    return `### 🛒 The Simple Study Plan

1. Pick the one thing you actually need to learn.
2. Turn off your notifications.
3. Spend 45 minutes doing it without checking social media.
4. Take a 10 minute break. Eat something.
5. Repeat twice. Done.

People spend 3 hours making fancy color-coded notion templates and 10 minutes actually studying. Just sit down and read the book.`;
  }

  // 3. Motivation / Overwhelmed
  if (p.includes('motivat') || p.includes('tired') || p.includes('overwhelm') || p.includes('give up') || p.includes('hard') || p.includes('lazy')) {
    if (character.id === 'goku') {
      return `Hey, listen to me for a second. When Beerus first showed up, I couldn't even land a scratch on him. But you know what? That didn't make me want to quit—it excited me! It showed me how much room I still had to grow!

Feeling overwhelmed just means you're standing in front of a giant mountain. Don't try to leap to the summit in one jump. Take one step. Knock out one single small task right now. I'm right here with you!`;
    }

    if (character.id === 'asta') {
      return `LISTEN TO ME! **NOT GIVING UP IS OUR MAGIC!**
Everyone told me I couldn't become the Wizard King because I had zero mana! I was laughed at, knocked down, and beaten to a pulp! AND GUESS WHAT? I STOOD RIGHT BACK UP!

You are facing a challenge right now? GOOD! That means you are about to level up! Stand up, shake out your arms, scream if you have to, AND SURPASS YOUR LIMITS RIGHT HERE AND NOW!`;
    }

    if (character.id === 'naruto') {
      return `I know what it feels like when nobody believes in you, and when everything feels too heavy to carry. Back at the ninja academy, I used to sit on that swing all by myself, wondering if I'd ever amount to anything.

But you know what made the difference? I refused to run away. Even when I failed the graduation exam three times, I kept training until my hands blistered. You've come so far already. Don't turn back now. Your ninja way starts with finishing today's goal, believe it!`;
    }

    // Saitama
    return `Look, you're tired because you're thinking too much about all the things you haven't done yet.

When I started my 100 pushups, 100 situps, 100 squats, and 10km run, it was pure agony. On year two, my arms made weird popping noises. But I didn't think about "year three". I just did today's 100 pushups.

Just do 5 minutes of work right now. If you still hate it after 5 minutes, take a nap. But 90% of the time, once you start, you'll finish. Now get to it.`;
  }

  // 4. Default in-character helpful reply
  return character.greeting + `\n\nI hear you loud and clear on: "${prompt}". Let's break this down into clear steps so you can conquer it smoothly! Let me know which part you'd like to dive into first!`;
}

/**
 * Generate assistant reply using Gemini API if key is present,
 * otherwise seamlessly fallback to in-character intelligent local engine.
 */
export async function generateAssistantReply(
  prompt: string,
  character: Character,
  chatHistory: Message[] = []
): Promise<string> {
  // Try Live Gemini API if available
  if (client) {
    try {
      const systemInstruction = character.systemPrompt;
      const historySummary = chatHistory
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : character.name}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemInstruction}\n\nRecent Context:\n${historySummary}\n\nUser: ${prompt}\n${character.name}:`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: fullPrompt,
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent local engine:', err);
    }
  }

  // Simulate realistic assistant thinking delay for natural conversational rhythm
  await new Promise((res) => setTimeout(res, 650 + Math.random() * 400));
  return generateCharacterFallback(prompt, character);
}
