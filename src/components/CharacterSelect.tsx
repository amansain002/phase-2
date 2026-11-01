import React from 'react';
import { CHARACTERS, Character } from '../data/characters';
import { useTheme } from '../context/ThemeProvider';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Zap, Flame, Award } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar';

const ICONS: Record<string, React.ReactNode> = {
  goku: <Zap className="w-4 h-4 text-sky-400" />,
  asta: <Flame className="w-4 h-4 text-red-500" />,
  naruto: <Shield className="w-4 h-4 text-amber-500" />,
  saitama: <Award className="w-4 h-4 text-yellow-400" />,
};

export const CharacterSelect: React.FC = () => {
  const { setCharacter, playSound } = useTheme();
  const characterList = Object.values(CHARACTERS);

  const handleSelect = (char: Character) => {
    playSound('chime');
    setCharacter(char.id);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none bg-slate-950 text-white">
      {/* Dynamic ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
      
      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 backdrop-blur-md mb-3 text-xs sm:text-sm font-medium text-slate-300 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AnimeBuddy AI Personal Assistant</span>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-center tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400"
        >
          Choose Your Assistant
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 text-center max-w-xl mb-8 sm:mb-12 font-normal"
        >
          Select an anime companion to transform your workspace theme, motivation, and personalized AI coaching style.
        </motion.p>

        {/* 4 Large Character Image Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
          {characterList.map((char, index) => {
            return (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                whileHover={{ y: -6 }}
                onClick={() => handleSelect(char)}
                className="group relative h-[420px] sm:h-[460px] rounded-2xl overflow-hidden cursor-pointer border border-slate-800 transition-all duration-300 shadow-xl"
                style={{
                  boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.6)`,
                }}
              >
                {/* Background Artwork Image with Hover Zoom to 1.05 */}
                <div className="absolute inset-0 overflow-hidden bg-slate-900">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Outer Glow Effect on Hover in the Theme Color */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 40px ${char.theme.primary}50, 0 0 30px ${char.theme.primary}40`,
                    }}
                  />
                </div>

                {/* Gradient Overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                {/* Top Corner Trait Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-200 shadow-md">
                  {ICONS[char.id]}
                  <span>{char.anime}</span>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end">
                  {/* Mini Avatar + Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <CharacterAvatar character={char} size="sm" showGlow />
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300 leading-tight"
                        style={{
                          backgroundImage: `linear-gradient(to right, #FFFFFF, ${char.theme.primary})`,
                        }}
                      >
                        {char.name}
                      </h3>
                      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: char.theme.primary }}>
                        {char.title}
                      </p>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-slate-300/90 line-clamp-2 mb-4 leading-relaxed">
                    "{char.tagline}"
                  </p>

                  {/* Select CTA Button */}
                  <div
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 group-hover:shadow-lg"
                    style={{
                      backgroundColor: char.theme.primary,
                      boxShadow: `0 4px 14px ${char.theme.primary}50`,
                    }}
                  >
                    <span>Activate Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Active Accent Border on Hover */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 pointer-events-none transition-colors duration-300 border-transparent group-hover:border-opacity-100"
                  style={{
                    borderColor: char.theme.primary,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
