import React from 'react';
import { useApp } from '../context/AppContext';
import { ChatWindow } from './ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

export const CompanionHub: React.FC = () => {
  const { isCompanionHubOpen, closeCompanionHub } = useApp();

  if (!isCompanionHubOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950"
      >
        <ChatWindow onClose={closeCompanionHub} />
      </motion.div>
    </AnimatePresence>
  );
};
