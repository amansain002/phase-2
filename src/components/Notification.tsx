import React, { useEffect } from 'react';
import { useTheme, ToastItem } from '../context/ThemeProvider';
import { CHARACTERS } from '../data/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing, Check } from 'lucide-react';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const char = CHARACTERS[toast.characterId] || CHARACTERS.goku;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto w-full max-w-sm rounded-xl p-3.5 shadow-2xl border backdrop-blur-md relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: char.theme.primary,
        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${char.theme.primary}40`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${char.theme.primary}, ${char.theme.accent})`,
        }}
      />

      <div className="flex items-start gap-3 mt-0.5">
        <CharacterAvatar character={char} size="xs" showGlow />

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {toast.characterName}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>
          <h4 className="text-sm font-bold text-white leading-tight mb-1">{toast.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed break-words">{toast.message}</p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress timer bar (5s duration) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        style={{ backgroundColor: char.theme.primary }}
      />
    </motion.div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, dismissNotification } = useTheme();

  return (
    <div
      className="fixed z-50 pointer-events-none top-4 inset-x-4 sm:inset-x-auto sm:right-5 flex flex-col gap-2.5 items-end max-w-sm"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const NotificationPermissionBanner: React.FC = () => {
  const { browserNotificationPermission, requestNotificationPermission, character } = useTheme();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (browserNotificationPermission !== 'default' || isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md my-2 p-3 rounded-lg border flex items-center justify-between gap-3 text-xs backdrop-blur-md"
      style={{
        backgroundColor: `${character.theme.surface}dd`,
        borderColor: character.theme.border,
      }}
    >
      <div className="flex items-center gap-2 text-slate-200">
        <BellRing className="w-4 h-4 shrink-0 text-amber-400 animate-bounce" />
        <span>Allow notifications for {character.name}'s mission alerts?</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => requestNotificationPermission()}
          className="px-2.5 py-1 rounded text-white font-semibold transition hover:brightness-110 flex items-center gap-1"
          style={{ backgroundColor: character.theme.primary }}
        >
          <Check className="w-3 h-3" /> Allow
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-white transition"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
