import React, { useState } from 'react';
import { Character } from '../data/characters';
import { motion } from 'framer-motion';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface CharacterAvatarProps {
  character: Character;
  size?: AvatarSize;
  isTyping?: boolean;
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { dimension: string; pixelSize: number; text: string; ring: string }> = {
  xs: { dimension: 'w-8 h-8', pixelSize: 32, text: 'text-xs', ring: 'ring-1' },
  sm: { dimension: 'w-10 h-10', pixelSize: 40, text: 'text-sm', ring: 'ring-2' },
  md: { dimension: 'w-14 h-14', pixelSize: 56, text: 'text-base', ring: 'ring-2' },
  lg: { dimension: 'w-16 h-16', pixelSize: 64, text: 'text-lg', ring: 'ring-[3px]' },
  xl: { dimension: 'w-24 h-24', pixelSize: 96, text: 'text-2xl', ring: 'ring-4' },
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  isTyping = false,
  className = '',
  showGlow = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const config = SIZE_MAP[size];

  // Derive initials (e.g. "Goku" -> "G", "Naruto Uzumaki" -> "NU")
  const initials = character.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${config.dimension} ${className}`}
      animate={
        isTyping
          ? {
              y: [0, -6, 0],
              scale: [1, 1.05, 1],
              transition: { repeat: Infinity, duration: 0.9, ease: 'easeInOut' },
            }
          : undefined
      }
      style={{
        boxShadow: showGlow || isTyping ? `0 0 16px ${character.theme.primary}` : undefined,
      }}
    >
      {/* Outer Ring with Active Character Color */}
      <div
        className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center relative ${config.ring}`}
        style={{
          borderColor: character.theme.primary,
          boxShadow: isTyping ? `0 0 12px ${character.theme.primary}` : undefined,
        }}
      >
        {!imageError ? (
          <img
            src={character.avatar}
            alt={character.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
            loading="eager"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-bold text-white ${config.text}`}
            style={{
              background: `linear-gradient(135deg, ${character.theme.primary}, ${character.theme.accent})`,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Typing Pulse Beacon Indicator */}
      {isTyping && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 animate-ping"
          style={{ backgroundColor: character.theme.primary }}
        />
      )}
    </motion.div>
  );
};
