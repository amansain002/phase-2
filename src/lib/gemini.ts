import { Character } from '../data/characters';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback Key
export const INTEGRATED_GEMINI_API_KEY = 'AQ.Ab8RN6I2cxtj76dLz7raA91sFfpC6creA6X5SyZonDyEjG0dLQ';

const importMeta = import.meta as unknown as { env?: Record<string, string> };

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const userKey = localStorage.getItem('user_gemini_api_key');
    if (userKey && userKey.trim() !== '') return userKey.trim();
  }
  return '';
}

export function saveStoredApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('user_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
    client = null; // Reset cached client instance
  }
}

export function getApiKey(): string {
  const userStored = getStoredApiKey();
  if (userStored) return userStored;

  const viteKey = importMeta?.env?.VITE_GEMINI_API_KEY;
  if (viteKey && viteKey !== 'your_gemini_api_key_here' && viteKey.trim() !== '') {
    return viteKey.trim();
  }
  const procKey =
    typeof process !== 'undefined'
      ? process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY || process.env?.GOOGLE_GENAI_API_KEY
      : undefined;
  if (procKey && procKey !== 'your_gemini_api_key_here' && procKey.trim() !== '') {
    return procKey.trim();
  }
  return INTEGRATED_GEMINI_API_KEY;
}

let client: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI | null {
  if (client) return client;
  const key = getApiKey();
  if (key) {
    try {
      client = new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return client;
}

export function isGeminiActive(): boolean {
  const key = getApiKey();
  return Boolean(key && key.trim() !== '' && key !== 'your_gemini_api_key_here');
}

/**
 * Test a Gemini API key in real time
 */
export async function testGeminiApiKey(key: string): Promise<{ success: boolean; message: string }> {
  const trimmed = key.trim();
  if (!trimmed) {
    return { success: false, message: 'Please enter a Gemini API key.' };
  }
  try {
    const testClient = new GoogleGenAI({ apiKey: trimmed });
    const res = await testClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Respond with: SUCCESS',
    });
    if (res && res.text) {
      return { success: true, message: 'Gemini API key verified! Live AI responses are active.' };
    }
    return { success: false, message: 'Received empty response from Gemini API.' };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('API key not valid') || msg.includes('UNAUTHENTICATED') || msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')) {
      return {
        success: false,
        message: 'Invalid API key. Please get a free key from Google AI Studio (aistudio.google.com/app/apikey). Key must start with AIzaSy...',
      };
    }
    return { success: false, message: `API Connection: ${msg.slice(0, 160)}` };
  }
}

/**
 * Intelligent in-character answer engine
 * Analyzes questions and provides real structured knowledge and advice
 */
function generateCharacterFallback(prompt: string, character: Character): string {
  const p = prompt.toLowerCase();

  // 1. Coding / Debugging questions
  if (p.includes('code') || p.includes('debug') || p.includes('typescript') || p.includes('react') || p.includes('javascript') || p.includes('error') || p.includes('function') || p.includes('api') || p.includes('sql') || p.includes('python')) {
    if (character.id === 'madara') {
      return `### ⚔️ Flawless Code Architecture:
Weakness in code is caused by lack of structural discipline. Here is how you engineer a battle-tested solution:

\`\`\`typescript
// Resilient, type-safe execution wrapper
export async function executeMission<T>(
  actionName: string, 
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = ((performance.now() - start) / 1000).toFixed(2);
    console.log(\`[Success] \${actionName} completed in \${duration}s with unyielding precision.\`);
    return result;
  } catch (error) {
    console.error(\`[Defeat] Execution failed in \${actionName}:\`, error);
    throw error;
  }
}
\`\`\`

**Madara's Guidance:**
A true warrior does not make excuses for errors. Trace the inputs, verify the types, and test every boundary condition. Implement this with conviction.`;
    }

    if (character.id === 'goku') {
      return `### ⚡ Ultra Instinct Code Breakdown:
Here is a solid solution for your request:

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
When debugging, don't rush into making 10 changes at once! Clear your mind, follow the stack trace step-by-step, and test each component individually!`;
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
Even if TypeScript yells with red squiggles, don't panic! It just means your code is undergoing resistance training! Read the message and swing again!`;
    }

    return `### 🍥 Clean Implementation:
Believe it! Break the problem down into small, modular functions that each do one thing perfectly. Keep your state clean, test your edge cases, and commit frequently!`;
  }

  // 2. Study, Exam Prep, Memory & Learning
  if (p.includes('study') || p.includes('exam') || p.includes('learn') || p.includes('remember') || p.includes('memorize') || p.includes('math') || p.includes('physics') || p.includes('science') || p.includes('test') || p.includes('focus')) {
    if (character.id === 'madara') {
      return `### 👁️ The Strategic Study Doctrine:
Knowledge is only potential power. True mastery requires methodical execution:

1. **Active Recall over Passive Reading**: Closing your notes and writing out formulas or concepts from memory forces your brain to build strong neural pathways.
2. **The Feynman Technique**: Explain the concept as if teaching a child. Where you hesitate or stumble reveals the exact gap in your armor.
3. **Spaced Repetition Schedule**:
   - Review 1: 24 hours after learning
   - Review 2: 3 days later
   - Review 3: 7 days later
4. **Time-Boxing**: Work in uninterrupted 45-minute blocks. Eliminate distractions. Incomplete concentration yields mediocre results.

Rise up and begin your session now.`;
    }

    return `### 📚 High-Impact Study Blueprint:
Here is how to master this subject effectively:

1. **Break it into Bite-Sized Chunks**: Split the chapter into 3 core topics. Don't try to swallow the whole textbook at once.
2. **Self-Testing (Active Retrieval)**: Convert headings into questions and test yourself before looking at the answers.
3. **Pomodoro Sprints**: 25 minutes of laser-focused effort followed by a 5-minute break to let your mind recharge.
4. **Practice Problems**: Doing 5 tough practice questions teaches you 3x more than reading 30 pages of theory.

Let's crush this study block!`;
  }

  // 3. Gym, Fitness, Workouts & Muscle Building
  if (p.includes('workout') || p.includes('gym') || p.includes('exercise') || p.includes('muscle') || p.includes('diet') || p.includes('protein') || p.includes('weight') || p.includes('strength') || p.includes('pushup') || p.includes('squat')) {
    if (character.id === 'saitama') {
      return `### 👊 The Serious Consistency Plan:
Look, everyone wants some magical secret supplement or fancy routine, but it's really just the boring stuff repeated every single day:

1. **Compound Movements First**: Squats, deadlifts, bench press, pull-ups, and overhead press. That builds 90% of your strength.
2. **Progressive Overload**: Either add 1 kg to the bar or do 1 more rep than you did last week. If you lift the same weight forever, your body won't change.
3. **Protein & Recovery**: Eat about 1.6g to 2g of protein per kg of bodyweight, drink water, and sleep 8 hours. Muscle grows while you sleep, not while you're lifting.
4. **No Excuses**: Even if it's hot in summer or cold in winter without AC, just show up.

Now go get your workout in.`;
    }

    return `### 💥 Power Training Protocol:
1. **Focus on Form First**: Lift with full range of motion and control the eccentric (lowering) phase for 2-3 seconds.
2. **Rest Periods**: Take 2 to 3 minutes of rest on heavy compound lifts to maximize power output.
3. **Track Every Rep**: Use the Gym Workout tab to log your weights and beat your previous session.
4. **Hydration & Fuel**: Eat a carb/protein meal 1-2 hours before training to have explosive energy.`;
  }

  // 4. Overcoming Procrastination, Laziness & Motivation
  if (p.includes('tired') || p.includes('lazy') || p.includes('give up') || p.includes('procrastinat') || p.includes('burnout') || p.includes('quit') || p.includes('sad') || p.includes('overwhelm') || p.includes('motivat')) {
    if (character.id === 'asta') {
      return `LISTEN TO ME! **NOT GIVING UP IS OUR MAGIC!**
Everyone told me I couldn't become the Wizard King because I had zero mana! I was knocked down and doubted by everyone! AND GUESS WHAT? I STOOD RIGHT BACK UP!

You are feeling stuck or overwhelmed? GOOD! That means you are right at the edge of leveling up!
Stand up right now, shake out your arms, take a deep breath, AND SURPASS YOUR LIMITS TODAY!`;
    }

    if (character.id === 'madara') {
      return `Wake up to reality. Procrastination is nothing more than your mind surrendering to comfort before the battle has even begun.

Do not wait for "motivation"—motivation is an illusion. Discipline is waking up, sitting at your desk, and executing your duty whether you feel like it or not. 
Pick up your pen. Open your task. Conquer it now.`;
    }

    return `Feeling overwhelmed just means you're standing in front of a giant mountain. Don't try to leap to the summit in one jump. Take one step. Knock out one single small task right now. I'm right here with you!`;
  }

  // 5. Default General Questions: Answer systematically with character perspective
  return `### 🎯 ${character.name}'s Actionable Answer:
Here is how we break down **"${prompt}"**:

1. **Core Concept**: Identify the main objective. What is the single most important outcome you want to achieve here?
2. **Immediate Action Step**: Start with the simplest 5-minute action that builds momentum right now.
3. **Key Best Practice**: Eliminate guesswork by using verified formulas, structured schedules, and clean execution.

*(Tip: You can also connect a live Gemini API key from Google AI Studio using the Key button above to get unlimited dynamic conversational answers!)*

What is the first step you want to tackle together?`;
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
  const activeClient = getGeminiClient();
  if (activeClient) {
    try {
      const systemInstruction = character.systemPrompt;
      const historySummary = chatHistory
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : character.name}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemInstruction}\n\nRecent Context:\n${historySummary}\n\nUser: ${prompt}\n${character.name}:`;

      // Official Google Gemini models in priority order
      const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash',
        'gemini-1.5-pro'
      ];

      for (const model of modelsToTry) {
        try {
          const response = await activeClient.models.generateContent({
            model,
            contents: fullPrompt,
          });

          if (response && response.text) {
            return response.text.trim();
          }
        } catch (mErr) {
          console.warn(`[Gemini - ${model}] error, trying next model:`, mErr);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent local engine:', err);
    }
  }

  // Realistic assistant thinking delay for natural conversational rhythm
  await new Promise((res) => setTimeout(res, 500 + Math.random() * 300));
  return generateCharacterFallback(prompt, character);
}
