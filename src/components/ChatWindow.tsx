import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';
import { generateAssistantReply } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Users,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bell,
  RefreshCw,
  Zap,
  X,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatWindowProps {
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const {
    character,
    setIsSwitcherOpen,
    setIsInitialSelectOpen,
    sendNotification,
    soundEnabled,
    setSoundEnabled,
    playSound,
  } = useTheme();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Per-character separate chat history in localStorage
  const storageKey = `animebuddy_chat_history_${character.id}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    // Default initial greeting if no history
    return [
      {
        id: `init_${Date.now()}`,
        role: 'assistant',
        content: character.greeting,
        timestamp: Date.now(),
      },
    ];
  });

  // Re-load messages when switching character
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`animebuddy_chat_history_${character.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    setMessages([
      {
        id: `init_${character.id}_${Date.now()}`,
        role: 'assistant',
        content: character.greeting,
        timestamp: Date.now(),
      },
    ]);
  }, [character.id, character.greeting]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // storage full or disabled
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    setInput('');
    playSound('send');

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const reply = await generateAssistantReply(
        text,
        character,
        newHistory.map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      playSound('receive');
    } catch (err) {
      console.error('Error generating reply:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(`Clear chat history with ${character.name}?`)) {
      const freshGreet: ChatMessage = {
        id: `reset_${Date.now()}`,
        role: 'assistant',
        content: character.greeting,
        timestamp: Date.now(),
      };
      setMessages([freshGreet]);
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      playSound('chime');
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-white font-sans">
      {/* 
        Background: The selected character's landscape image is the blurred, 
        darkened background (~25% opacity) as specified.
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover object-center filter blur-xl scale-105 opacity-25 transition-all duration-700"
        />
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: character.theme.auraGradient,
          }}
        />
        {/* Soft dark vignette */}
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      {/* HEADER: Shows 64px avatar, name, and "Change Character" button */}
      <header
        className="relative z-20 shrink-0 border-b px-4 py-3 sm:px-6 backdrop-blur-xl transition-colors duration-500 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(11, 15, 25, 0.85)',
          borderColor: character.theme.border,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`,
        }}
      >
        <div className="flex items-center gap-3.5">
          {/* Header 64px Character Avatar */}
          <div className="cursor-pointer" onClick={() => setIsSwitcherOpen(true)}>
            <CharacterAvatar character={character} size="lg" isTyping={isTyping} showGlow />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                {character.name}
              </h2>
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${character.theme.primary}20`,
                  color: character.theme.primary,
                  border: `1px solid ${character.theme.primary}40`,
                }}
              >
                <Zap className="w-3 h-3" />
                {character.statusText}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>{character.anime}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-slate-400 font-mono text-[11px]">{character.title}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-600 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            aria-label="Sound Toggle"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Test in-character notification */}
          <button
            onClick={() => {
              const notifs = character.notifications;
              const random = notifs[Math.floor(Math.random() * notifs.length)];
              sendNotification(random.title, random.message);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition"
            title="Trigger In-Character Notification"
          >
            <Bell className="w-3.5 h-3.5" style={{ color: character.theme.primary }} />
            <span>Alert</span>
          </button>

          {/* Clear Chat History */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition"
            title="Clear Chat History"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Change Character Button */}
          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: character.theme.primary,
              boxShadow: `0 2px 12px ${character.theme.primary}50`,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Change</span> Character
          </button>

          {/* Close button if rendered in modal/drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* CHAT MESSAGES BODY */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-12 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar (40px) */}
                  {!isUser && (
                    <div className="shrink-0 mt-1">
                      <CharacterAvatar character={character} size="sm" showGlow />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xl text-sm leading-relaxed ${
                      isUser
                        ? 'text-white rounded-tr-none'
                        : 'text-slate-100 rounded-tl-none border backdrop-blur-md'
                    }`}
                    style={
                      isUser
                        ? {
                            background: `linear-gradient(135deg, ${character.theme.primary}, ${character.theme.accent})`,
                            boxShadow: `0 4px 18px ${character.theme.primary}40`,
                          }
                        : {
                            backgroundColor: 'rgba(15, 23, 42, 0.88)',
                            borderColor: character.theme.border,
                            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`,
                          }
                    }
                  >
                    {/* Header line for Assistant */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/50">
                        <span className="font-bold text-xs" style={{ color: character.theme.primary }}>
                          {character.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Content with rich markdown code formatting */}
                    <div className="whitespace-pre-wrap font-sans text-sm break-words select-text space-y-2">
                      {message.content}
                    </div>

                    {/* Copy message button */}
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-slate-400 hover:text-white bg-slate-900/60"
                      title="Copy text"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator with bouncy avatar */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <CharacterAvatar character={character} size="sm" isTyping={true} showGlow />
              <div
                className="rounded-2xl rounded-tl-none px-4 py-3 border backdrop-blur-md flex items-center gap-1.5 shadow-lg"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.88)',
                  borderColor: character.theme.border,
                }}
              >
                <span className="text-xs font-semibold mr-1" style={{ color: character.theme.primary }}>
                  {character.name} is thinking
                </span>
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: character.theme.primary, animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: character.theme.primary, animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: character.theme.primary, animationDelay: '300ms' }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* QUICK PROMPT CHIPS */}
      <div className="relative z-10 px-4 sm:px-6 md:px-12 pb-2">
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Ask:
          </span>
          {character.quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-xs px-3 py-1 rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm truncate max-w-[240px]"
              style={{
                borderColor: `${character.theme.primary}40`,
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT AREA */}
      <footer
        className="relative z-20 shrink-0 border-t p-3 sm:p-4 backdrop-blur-xl transition-colors duration-500"
        style={{
          backgroundColor: 'rgba(11, 15, 25, 0.92)',
          borderColor: character.theme.border,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-end gap-2.5">
          <div
            className="flex-1 relative rounded-2xl border transition-all duration-300 bg-slate-900/90 shadow-inner focus-within:ring-2"
            style={{
              borderColor: character.theme.border,
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${character.name} for study help, coding, tips, or motivation...`}
              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[48px]"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-95 shrink-0"
            style={{
              backgroundColor: character.theme.primary,
              boxShadow: input.trim() ? `0 4px 18px ${character.theme.primary}60` : undefined,
            }}
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
