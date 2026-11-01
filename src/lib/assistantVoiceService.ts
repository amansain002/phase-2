import {
  CHARACTERS_VOICE,
  CharacterVoiceProfile,
  TriggerType,
  VoiceLine,
  LineRarity,
} from '../data/charactersVoice';

export interface VoiceAssistantSettings {
  voiceEnabled: boolean;
  volume: number; // 0.0 - 1.0
  rate: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 1.5
  preferredVoiceURI?: string;
  onlyBigMoments: boolean;
  onlyTextNoVoice: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number; // 0 - 23 (e.g. 22)
  quietHoursEnd: number; // 0 - 23 (e.g. 7)
}

export interface AssistantSpeechContext {
  name?: string;
  task?: string;
  xp?: number | string;
  streak?: number | string;
  rank?: string;
  level?: number | string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface AssistantHistoryItem {
  id: string;
  characterId: string;
  trigger: TriggerType;
  text: string;
  rarity: LineRarity;
  timestamp: string;
  date: string;
}

export type AssistantSpeakListener = (event: {
  isSpeaking: boolean;
  characterId: string;
  line: VoiceLine | null;
  renderedText: string;
  isAttackAnimation: boolean;
}) => void;

const SETTINGS_KEY = 'animebuddy_voice_assistant_settings';
const HISTORY_KEY = 'animebuddy_voice_assistant_history';
const RECENT_LINES_KEY = 'animebuddy_voice_recent_lines';

const DEFAULT_SETTINGS: VoiceAssistantSettings = {
  voiceEnabled: true,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  onlyBigMoments: false,
  onlyTextNoVoice: false,
  quietHoursEnabled: false,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

class AssistantVoiceService {
  private settings: VoiceAssistantSettings;
  private listeners: Set<AssistantSpeakListener> = new Set();
  private lastSpokenTime: number = 0;
  private idleTimestamps: number[] = [];
  private recentSpokenHistory: Record<string, string[]> = {};
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private currentSpokenText: string = '';
  private currentCharacterId: string = 'goku';
  private currentLine: VoiceLine | null = null;
  private isSpeakingFlag: boolean = false;
  private userHasInteracted: boolean = false;

  constructor() {
    this.settings = this.loadSettings();
    this.loadRecentLines();
    this.initUserInteractionListeners();
  }

  private initUserInteractionListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.userHasInteracted = true;
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public getSettings(): VoiceAssistantSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceAssistantSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
  }

  private loadSettings(): VoiceAssistantSettings {
    if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettings() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private loadRecentLines() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(RECENT_LINES_KEY);
      if (raw) {
        this.recentSpokenHistory = JSON.parse(raw);
      }
    } catch {
      this.recentSpokenHistory = {};
    }
  }

  private saveRecentLines() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(RECENT_LINES_KEY, JSON.stringify(this.recentSpokenHistory));
    } catch {
      // ignore
    }
  }

  public subscribe(listener: AssistantSpeakListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean, isAttack: boolean = false) {
    this.isSpeakingFlag = isSpeaking;
    for (const listener of this.listeners) {
      listener({
        isSpeaking,
        characterId: this.currentCharacterId,
        line: this.currentLine,
        renderedText: this.currentSpokenText,
        isAttackAnimation: isAttack,
      });
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingFlag;
  }

  public getCurrentLine() {
    return {
      characterId: this.currentCharacterId,
      line: this.currentLine,
      text: this.currentSpokenText,
      isSpeaking: this.isSpeakingFlag,
    };
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    this.notify(false, false);
  }

  private isQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;
    const hour = new Date().getHours();
    const { quietHoursStart, quietHoursEnd } = this.settings;
    if (quietHoursStart > quietHoursEnd) {
      // e.g. 22:00 to 07:00
      return hour >= quietHoursStart || hour < quietHoursEnd;
    } else {
      return hour >= quietHoursStart && hour < quietHoursEnd;
    }
  }

  /**
   * Main speech invocation method
   */
  public speak(
    characterId: string,
    trigger: TriggerType,
    context: AssistantSpeechContext = {},
    overrideLine?: VoiceLine
  ): boolean {
    const charProfile = CHARACTERS_VOICE[characterId] || CHARACTERS_VOICE.goku;
    const priority = context.priority || 'normal';

    // 1. Check big moments filter
    const isBigMoment =
      trigger === 'level_up' ||
      trigger === 'rank_up' ||
      trigger === 'attack_line' ||
      trigger === 'hard_task_complete' ||
      trigger === 'quest_complete' ||
      trigger === 'streak_milestone';

    if (this.settings.onlyBigMoments && !isBigMoment && priority !== 'critical') {
      return false;
    }

    // 2. Cooldown check (8 seconds between speech)
    const now = Date.now();
    const isCritical = priority === 'critical' || trigger === 'attack_line' || trigger === 'rank_up';
    if (!isCritical && now - this.lastSpokenTime < 8000) {
      return false;
    }

    // 3. Idle limits check (max 3 idle lines per hour)
    if (trigger === 'idle_motivation') {
      const oneHourAgo = now - 3600000;
      this.idleTimestamps = this.idleTimestamps.filter((t) => t > oneHourAgo);
      if (this.idleTimestamps.length >= 3) {
        return false;
      }
      this.idleTimestamps.push(now);
    }

    // 4. Stop any lower-priority speaking if active
    this.stop();

    // 5. Select or use provided line
    const selectedLine = overrideLine || this.pickLine(charProfile, trigger);
    if (!selectedLine) return false;

    // 6. Format placeholders
    const rendered = this.fillPlaceholders(selectedLine.text, context);
    this.currentCharacterId = characterId;
    this.currentLine = selectedLine;
    this.currentSpokenText = rendered;
    this.lastSpokenTime = now;

    // Log to history
    this.logHistory(characterId, trigger, rendered, selectedLine.rarity);

    const isAttack = trigger === 'attack_line' || selectedLine.rarity === 'legendary';

    // Send visual notification & bubble
    this.notify(true, isAttack);

    // Browser push notification if permitted and in background
    this.sendSystemNotification(charProfile, rendered);

    // 7. Check if voice audio output is disabled or in quiet hours
    if (
      !this.settings.voiceEnabled ||
      this.settings.onlyTextNoVoice ||
      this.isQuietHours()
    ) {
      // Only show text bubble for 5 seconds then dismiss
      setTimeout(() => {
        if (this.currentSpokenText === rendered) {
          this.notify(false, false);
        }
      }, 5500);
      return true;
    }

    // 8. Try custom audio file first if configured
    if (selectedLine.customAudioKey && charProfile.customAudio[selectedLine.customAudioKey]) {
      const audioUrl = charProfile.customAudio[selectedLine.customAudioKey];
      try {
        const audio = new Audio(audioUrl);
        audio.volume = this.settings.volume;
        this.activeAudio = audio;
        audio.onended = () => {
          this.activeAudio = null;
          this.notify(false, false);
        };
        audio.onerror = () => {
          this.activeAudio = null;
          // Fall back to TTS
          this.speakWithTTS(charProfile, rendered, isAttack);
        };
        audio.play().catch(() => {
          this.speakWithTTS(charProfile, rendered, isAttack);
        });
        return true;
      } catch {
        // Fall back to TTS
      }
    }

    // 9. Speak with Web Speech API
    this.speakWithTTS(charProfile, rendered, isAttack);
    return true;
  }

  private pickLine(charProfile: CharacterVoiceProfile, trigger: TriggerType): VoiceLine {
    const list = charProfile.lines[trigger] || charProfile.lines.idle_motivation;
    if (!list || list.length === 0) {
      return {
        text: `Keep up the good work, {name}!`,
        rarity: 'normal',
        expression: 'proud',
      };
    }

    const key = `${charProfile.id}_${trigger}`;
    const recent = this.recentSpokenHistory[key] || [];

    // Filter by time of day if available
    const hour = new Date().getHours();
    const currentPeriod: 'morning' | 'afternoon' | 'night' =
      hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'night';

    // Weighted Rarity Roll: 70% normal, 25% hype, 5% legendary
    const roll = Math.random() * 100;
    let targetRarity: LineRarity = 'normal';
    if (roll > 95) {
      targetRarity = 'legendary';
    } else if (roll > 70) {
      targetRarity = 'hype';
    }

    // First try matching target rarity and not in recent 5
    let candidates = list.filter(
      (item) =>
        item.rarity === targetRarity &&
        !recent.includes(item.text) &&
        (!item.timeOfDay || item.timeOfDay === currentPeriod)
    );

    // If none found, fall back to any line not in recent 5
    if (candidates.length === 0) {
      candidates = list.filter((item) => !recent.includes(item.text));
    }

    // If still empty (e.g. all 10 used recently), reset history for this trigger
    if (candidates.length === 0) {
      candidates = list;
      this.recentSpokenHistory[key] = [];
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];

    // Update history (last 5 used)
    const updated = [picked.text, ...recent.filter((t) => t !== picked.text)].slice(0, 5);
    this.recentSpokenHistory[key] = updated;
    this.saveRecentLines();

    return picked;
  }

  private fillPlaceholders(template: string, ctx: AssistantSpeechContext): string {
    const name = ctx.name || 'Hero';
    const task = ctx.task || 'your goal';
    const xp = String(ctx.xp ?? '25');
    const streak = String(ctx.streak ?? '3');
    const rank = ctx.rank || 'Bronze';
    const level = String(ctx.level ?? '1');

    return template
      .replace(/{name}/g, name)
      .replace(/{task}/g, task)
      .replace(/{xp}/g, xp)
      .replace(/{streak}/g, streak)
      .replace(/{rank}/g, rank)
      .replace(/{level}/g, level);
  }

  private speakWithTTS(charProfile: CharacterVoiceProfile, text: string, isAttack: boolean) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => this.notify(false, false), 4500);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.settings.volume;
      utterance.rate = charProfile.voiceSettings.rate * this.settings.rate;
      utterance.pitch = charProfile.voiceSettings.pitch * this.settings.pitch;

      // Select system voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let voice: SpeechSynthesisVoice | undefined;

        // User preference
        if (this.settings.preferredVoiceURI) {
          voice = voices.find((v) => v.voiceURI === this.settings.preferredVoiceURI);
        }

        // Character preference
        if (!voice && charProfile.voiceSettings.preferredVoiceName) {
          voice = voices.find((v) =>
            v.name.toLowerCase().includes(charProfile.voiceSettings.preferredVoiceName!.toLowerCase())
          );
        }

        // English language fallback
        if (!voice) {
          voice =
            voices.find((v) => v.lang.startsWith(charProfile.voiceSettings.fallbackLang)) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
        }

        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => {
        this.activeUtterance = null;
        this.notify(false, false);
      };

      utterance.onerror = () => {
        this.activeUtterance = null;
        this.notify(false, false);
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      setTimeout(() => this.notify(false, false), 4500);
    }
  }

  private sendSystemNotification(char: CharacterVoiceProfile, text: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(`${char.displayName} (AI Assistant)`, {
          body: text,
          icon: char.avatarImage,
          tag: 'animebuddy-assistant',
        });
      } catch {
        // ignore notification error
      }
    }
  }

  private logHistory(
    characterId: string,
    trigger: TriggerType,
    text: string,
    rarity: LineRarity
  ) {
    if (typeof localStorage === 'undefined') return;
    try {
      const now = new Date();
      const item: AssistantHistoryItem = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        characterId,
        trigger,
        text,
        rarity,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString(),
      };
      const existing = this.getHistory();
      const updated = [item, ...existing].slice(0, 50); // Keep last 50
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  public getHistory(): AssistantHistoryItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public clearHistory() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
  }

  /**
   * Preview a voice sample for a character
   */
  public preview(characterId: string) {
    this.stop();
    this.speak(characterId, 'character_select', { name: 'Hero' }, undefined);
  }
}

export const assistantVoice = new AssistantVoiceService();
