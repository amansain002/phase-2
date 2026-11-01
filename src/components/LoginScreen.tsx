import React, { useState } from 'react';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';
import { loginUser, getUserAccount } from '../lib/profileService';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { character, playSound } = useTheme();
  const account = getUserAccount();

  const [email, setEmail] = useState(account.email || 'student@uplevel.academy');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playSound('chime');

    setTimeout(() => {
      loginUser(email);
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950 text-white overflow-hidden select-none">
      {/* Background artwork blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover filter blur-2xl opacity-20 scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: character.theme.auraGradient }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm rounded-3xl p-6 sm:p-7 border backdrop-blur-xl shadow-2xl space-y-6 text-center"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          borderColor: character.theme.border,
          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.7), 0 0 25px ${character.theme.primary}25`,
        }}
      >
        {/* Assistant Avatar Header */}
        <div className="flex flex-col items-center">
          <CharacterAvatar character={character} size="xl" showGlow />
          
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: `${character.theme.primary}15`,
              borderColor: `${character.theme.primary}40`,
              color: character.theme.primary,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>Assistant: {character.name}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mt-2">
            Welcome Back!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your student quests, focus sessions, and rank.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Student Email / ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: character.theme.border,
              }}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: character.theme.border,
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 hover:brightness-110"
            style={{
              backgroundColor: character.theme.primary,
              boxShadow: `0 4px 18px ${character.theme.primary}50`,
            }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center">
          All your existing XP, levels, rank, and character memory are safely preserved.
        </p>
      </motion.div>
    </div>
  );
};
