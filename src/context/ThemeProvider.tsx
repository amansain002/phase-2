import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Character, CHARACTERS, DEFAULT_CHARACTER_ID } from '../data/characters';

export interface ToastItem {
  id: string;
  characterId: string;
  characterName: string;
  avatar: string;
  title: string;
  message: string;
  timestamp: number;
}

interface ThemeContextType {
  character: Character;
  setCharacter: (id: string) => void;
  isSwitcherOpen: boolean;
  setIsSwitcherOpen: (open: boolean) => void;
  isInitialSelectOpen: boolean;
  setIsInitialSelectOpen: (open: boolean) => void;
  isTransitioning: boolean;
  notifications: ToastItem[];
  sendNotification: (title: string, message: string, charOverride?: Character) => void;
  dismissNotification: (id: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
  browserNotificationPermission: NotificationPermission;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (type: 'send' | 'receive' | 'switch' | 'notification' | 'chime') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SELECTED_CHAR_KEY = 'animebuddy_selected_character';
const SOUND_KEY = 'animebuddy_sound_enabled';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characterId, setCharacterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_CHAR_KEY);
      if (saved && CHARACTERS[saved]) return saved;
    } catch {
      // fallback
    }
    return DEFAULT_CHARACTER_ID;
  });

  const [isInitialSelectOpen, setIsInitialSelectOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(SELECTED_CHAR_KEY);
    } catch {
      return true;
    }
  });

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [notifications, setNotifications] = useState<ToastItem[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const character = CHARACTERS[characterId] || CHARACTERS[DEFAULT_CHARACTER_ID];

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
    } catch {
      // storage disabled
    }
  };

  // Synthesized Web Audio API sound effects (no external mp3 dependencies)
  const playSound = useCallback(
    (type: 'send' | 'receive' | 'switch' | 'notification' | 'chime') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'send') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'receive') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.23);
        } else if (type === 'switch') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.5);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.58);
        } else if (type === 'notification') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(784, now); // G5
          osc.frequency.setValueAtTime(1046.5, now + 0.1); // C6
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.32);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.22);
        }
      } catch {
        // audio context blocked or unsupported
      }
    },
    [soundEnabled]
  );

  // Apply CSS Variables directly to documentElement for instant theme morphing
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = character;

    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-bg', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-surface-hover', theme.surfaceHover);
    root.style.setProperty('--color-card', theme.card);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-border-glow', theme.borderGlow);
    root.style.setProperty('--color-ring', theme.ring);
  }, [character]);

  const setCharacter = (id: string) => {
    if (!CHARACTERS[id] || id === characterId) {
      setIsSwitcherOpen(false);
      return;
    }

    setIsTransitioning(true);
    playSound('switch');

    setTimeout(() => {
      setCharacterId(id);
      try {
        localStorage.setItem(SELECTED_CHAR_KEY, id);
      } catch {
        // ignore
      }
      setTimeout(() => {
        setIsTransitioning(false);
        setIsSwitcherOpen(false);
        setIsInitialSelectOpen(false);

        // Character sends a spontaneous greeting notification upon switching!
        const newChar = CHARACTERS[id];
        sendNotification(newChar.title, newChar.greeting, newChar);
      }, 300);
    }, 300);
  };

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const sendNotification = useCallback(
    (title: string, message: string, charOverride?: Character) => {
      const activeChar = charOverride || character;
      const newToast: ToastItem = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        characterId: activeChar.id,
        characterName: activeChar.name,
        avatar: activeChar.avatar,
        title,
        message,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [newToast, ...prev].slice(0, 4));
      playSound('notification');

      // Trigger native browser notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`${activeChar.name}: ${title}`, {
            body: message,
            icon: activeChar.avatar,
            badge: activeChar.avatar,
          });
        } catch {
          // ignore
        }
      }
    },
    [character, playSound]
  );

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserNotificationPermission(permission);
      if (permission === 'granted') {
        sendNotification('Notifications Enabled!', "Awesome! I'll alert you with mission updates and reminders!");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        character,
        setCharacter,
        isSwitcherOpen,
        setIsSwitcherOpen,
        isInitialSelectOpen,
        setIsInitialSelectOpen,
        isTransitioning,
        notifications,
        sendNotification,
        dismissNotification,
        requestNotificationPermission,
        browserNotificationPermission,
        soundEnabled,
        setSoundEnabled,
        playSound,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
