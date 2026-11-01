import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeProvider';
import { getRankDetails } from '../lib/rankEngine';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { logout, restartApp } from '../lib/profileService';
import { EditProfileModal } from '../components/EditProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Shield,
  Trophy,
  LogOut,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Sliders,
  RefreshCw,
} from 'lucide-react';

interface ProfileTabProps {
  onLogout?: () => void;
  onRestart?: () => void;
  onRedoSetup?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout, onRestart, onRedoSetup }) => {
  const { progress } = useApp();
  const { character, playSound, sendNotification } = useTheme();

  const rank = getRankDetails(progress.level);

  // Map tier to hunter / academy rank label
  const getRankLetter = (level: number) => {
    if (level >= 30) return 'Grandmaster (S+ Rank)';
    if (level >= 20) return 'Diamond (S Rank)';
    if (level >= 14) return 'Platinum (A Rank)';
    if (level >= 8) return 'Gold (B Rank)';
    if (level >= 4) return 'Silver (C Rank)';
    return 'Bronze (D Rank)';
  };

  // State for Confirm Modals & Questionnaire Editor
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showEditAnswersModal, setShowEditAnswersModal] = useState(false);
  const [restartInput, setRestartInput] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger confetti if level ascended recently
  useEffect(() => {
    try {
      const lastLvl = sessionStorage.getItem('profile_last_seen_level');
      if (lastLvl && Number(lastLvl) < progress.level) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      sessionStorage.setItem('profile_last_seen_level', String(progress.level));
    } catch {
      // ignore
    }
  }, [progress.level]);

  // Handle Logout
  const handleConfirmLogout = () => {
    try {
      playSound('chime');
      logout();
      setShowLogoutModal(false);
      if (onLogout) {
        onLogout();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      sendNotification('Error', msg);
    }
  };

  // Handle Restart App
  const handleConfirmRestart = () => {
    try {
      playSound('switch');
      restartApp(true);
      setShowRestartModal(false);
      if (onRestart) {
        onRestart();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Restart failed';
      sendNotification('Error', msg);
    }
  };

  // 3-Second Hold Logic for Restart Confirmation
  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const start = Date.now();
    const duration = 3000;

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);

      if (elapsed >= duration) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        setIsHolding(false);
        handleConfirmRestart();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 sm:p-6 animate-fadeIn select-none space-y-6">
      {/* 
        CLEAN, CENTERED CARD
        Shows ONLY:
        1. Selected character's avatar above with subtle theme glow
        2. Current Level (e.g. "Level 7")
        3. Current Rank (e.g. "D Rank" with badge & icon from existing rank system)
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-3xl p-6 sm:p-8 border backdrop-blur-xl text-center flex flex-col items-center relative overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          borderColor: character.theme.border,
          boxShadow: `0 12px 35px rgba(0, 0, 0, 0.5), 0 0 25px ${character.theme.primary}20`,
        }}
      >
        {/* Subtle Theme Background Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 filter blur-2xl"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${character.theme.primary}, transparent 70%)`,
          }}
        />

        {/* Selected Character's Avatar */}
        <div className="relative mb-5 z-10">
          <CharacterAvatar character={character} size="xl" showGlow={true} />
          <span
            className="absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-md"
            title={`${character.name} active`}
          />
        </div>

        {/* 1. CURRENT LEVEL */}
        <div className="z-10 mb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">
            Student Standing
          </span>
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight text-white"
            style={{
              textShadow: `0 0 20px ${character.theme.primary}40`,
            }}
          >
            Level {progress.level}
          </h1>
        </div>

        {/* 2. CURRENT RANK (with existing badge & icon) */}
        <div className="z-10">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm font-extrabold text-sm ${rank.badgeBg}`}
            style={{
              boxShadow: `0 0 16px ${character.theme.primary}25`,
            }}
          >
            <Shield className="w-4 h-4" />
            <span>{getRankLetter(progress.level)}</span>
          </div>
        </div>
      </motion.div>

      {/* QUESTIONNAIRE MANAGEMENT: EDIT ANSWERS & REDO SETUP */}
      <div className="w-full grid grid-cols-2 gap-2.5 z-10">
        <button
          onClick={() => setShowEditAnswersModal(true)}
          className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Edit Answers</span>
        </button>

        <button
          onClick={() => {
            playSound('chime');
            if (onRedoSetup) onRedoSetup();
          }}
          className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Redo Setup</span>
        </button>
      </div>

      {/* 
        TWO SEPARATE BUTTONS (at the bottom, clearly separated, different colors)
        1. LOGOUT button (Signs out, retains all progress)
        2. RESTART APP button (danger style, red, with confirmation)
      */}
      <div className="w-full space-y-3 z-10">
        {/* 1. LOGOUT BUTTON */}
        <button
          onClick={() => {
            playSound('chime');
            setShowLogoutModal(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Log Out</span>
        </button>

        {/* 2. RESTART APP BUTTON (Danger Style, Red) */}
        <button
          onClick={() => {
            playSound('chime');
            setShowRestartModal(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-red-600/90 hover:bg-red-500 border border-red-500/80 shadow-lg shadow-red-950/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>Restart App</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EDIT QUESTIONNAIRE MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      <EditProfileModal
        isOpen={showEditAnswersModal}
        onClose={() => setShowEditAnswersModal(false)}
        onSaved={() => {
          // Profile answers updated
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: SIMPLE LOGOUT CONFIRMATION DIALOG                     */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm rounded-3xl p-6 border border-slate-700 bg-slate-900 text-white shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 mx-auto flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Log out?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You will return to the sign-in screen. All your XP, level, rank,
                  quests, workouts, and selected character will remain safely saved.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 transition shadow-md"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: STRONG RESTART APP CONFIRMATION DIALOG (DANGER)       */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showRestartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm rounded-3xl p-6 border-2 border-red-500/80 bg-slate-950 text-white shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Restart the app?</h3>
                <p className="text-xs text-red-300/90 mt-1.5 leading-relaxed font-medium">
                  All your progress will be permanently deleted. This cannot be undone.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Resets XP to 0, level back to 1, starting rank (Bronze / D rank), and clears quest progress and chat history.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Type <span className="text-red-400 font-mono">RESTART</span> to confirm:
                </label>
                <input
                  type="text"
                  value={restartInput}
                  onChange={(e) => setRestartInput(e.target.value)}
                  placeholder="RESTART"
                  className="w-full px-3 py-2 rounded-xl border border-red-500/40 bg-slate-900 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest text-center uppercase"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  disabled={restartInput.trim() !== 'RESTART'}
                  onClick={handleConfirmRestart}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Permanently Restart App
                </button>

                <div className="relative pt-1">
                  <button
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-300 border border-slate-700 bg-slate-900 hover:bg-slate-800 transition relative overflow-hidden select-none"
                  >
                    <div
                      className="absolute inset-0 bg-red-600/50 transition-all pointer-events-none"
                      style={{ width: `${holdProgress}%` }}
                    />
                    <span className="relative z-10">
                      {isHolding ? `Holding... ${holdProgress}%` : 'Or Hold for 3 Seconds'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowRestartModal(false);
                    setRestartInput('');
                    cancelHold();
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel & Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
