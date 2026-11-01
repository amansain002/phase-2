import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeProvider';
import { CharacterSelect } from './components/CharacterSelect';
import { ChatWindow } from './components/ChatWindow';
import { CharacterSwitcher } from './components/CharacterSwitcher';
import { NotificationContainer, NotificationPermissionBanner } from './components/Notification';
import { motion, AnimatePresence } from 'framer-motion';

const MainView: React.FC = () => {
  const { isInitialSelectOpen, isTransitioning, character } = useTheme();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* 0.6s Crossfade & Color Morph Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center backdrop-blur-xl"
            style={{
              backgroundColor: character.theme.background,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: character.theme.primary, borderTopColor: 'transparent' }}
              />
              <span className="text-sm font-bold uppercase tracking-widest text-white">
                Synchronizing with {character.name}...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen 1 (Initial Launch Selection) vs Screen 2 (Chat Interface) */}
      <AnimatePresence mode="wait">
        {isInitialSelectOpen ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <CharacterSelect />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col"
          >
            <NotificationPermissionBanner />
            <ChatWindow />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in Switcher Panel */}
      <CharacterSwitcher />

      {/* Toast Notification Container */}
      <NotificationContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainView />
    </ThemeProvider>
  );
}
