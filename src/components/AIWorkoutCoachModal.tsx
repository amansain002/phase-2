import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { DailyWorkoutPlan, DifficultyLevel } from '../types/workout';
import { generateAIWeeklySplit, saveWeeklyPlans } from '../lib/workoutService';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';

interface AIWorkoutCoachModalProps {
  onClose: () => void;
  onPlanApplied: () => void;
}

export const AIWorkoutCoachModal: React.FC<AIWorkoutCoachModalProps> = ({
  onClose,
  onPlanApplied,
}) => {
  const { character } = useTheme();

  const [goal, setGoal] = useState<'muscle_gain' | 'fat_loss' | 'strength'>('muscle_gain');
  const [experience, setExperience] = useState<DifficultyLevel>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [previewPlan, setPreviewPlan] = useState<DailyWorkoutPlan[] | null>(null);

  const handleGenerate = () => {
    const generated = generateAIWeeklySplit(goal, experience, daysPerWeek);
    setPreviewPlan(generated);
  };

  const handleApply = () => {
    if (!previewPlan) return;
    saveWeeklyPlans(previewPlan);
    onPlanApplied();
    onClose();
  };

  const COACH_INTROS: Record<string, string> = {
    goku: "Let's push your limits! Tell me your training goal and schedule, and I'll build a Gravity Chamber-tier training routine!",
    asta: "NO MAGIC? NO PROBLEM! Heavy iron and discipline will turn you into an absolute monster! Let's build your split!",
    naruto: "Believe it! A true ninja sharpens their physical stamina alongside their mind. Let's calibrate your training regimen!",
    saitama: "Look, consistency is all that matters. Pick your days, stick to it, and don't slack off. Let's get to work.",
  };

  const charKey = (character.id || 'goku').toLowerCase();
  const coachGreeting = COACH_INTROS[charKey] || COACH_INTROS.goku;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface border border-edge rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-edge flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CharacterAvatar character={character} size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-coffee">AI Workout Coach</h3>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                  style={{
                    backgroundColor: `${character.theme.primary}20`,
                    color: character.theme.primary,
                  }}
                >
                  Critique AI
                </span>
              </div>
              <p className="text-xs text-coffee-muted">
                Personalized plan generator guided by {character.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface2 hover:bg-sand/30 text-coffee-muted transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Coach Advice Speech Bubble */}
          <div
            className="p-3.5 rounded-2xl border bg-surface2 space-y-1 relative"
            style={{ borderColor: `${character.theme.primary}30` }}
          >
            <div className="flex items-center gap-2">
              <Bot size={15} style={{ color: character.theme.primary }} />
              <span className="text-xs font-bold text-coffee">
                {character.name}'s Training Philosophy
              </span>
            </div>
            <p className="text-xs text-coffee font-medium italic leading-relaxed pl-1">
              "{coachGreeting}"
            </p>
          </div>

          {/* Goal Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-coffee block">
              Primary Fitness Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
                { id: 'fat_loss', label: 'Fat Loss', icon: '🔥' },
                { id: 'strength', label: 'Max Strength', icon: '⚡' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGoal(item.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition flex flex-col items-center gap-1 ${
                    goal === item.id
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                  }`}
                  style={
                    goal === item.id
                      ? { backgroundColor: character.theme.primary }
                      : undefined
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-coffee block">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => setExperience(level)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                      experience === level
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                    }`}
                    style={
                      experience === level
                        ? { backgroundColor: character.theme.primary }
                        : undefined
                    }
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Workout Days per week */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-coffee">Workout Days per Week</span>
              <span style={{ color: character.theme.primary }}>
                {daysPerWeek} Days Training
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysPerWeek(days)}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    daysPerWeek === days
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                  }`}
                  style={
                    daysPerWeek === days
                      ? { backgroundColor: character.theme.primary }
                      : undefined
                  }
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Generate */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-coffee text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} style={{ color: character.theme.primary }} />
            <span>Generate Optimized Split</span>
          </button>

          {/* Plan Preview Result */}
          {previewPlan && (
            <div className="space-y-3 pt-2 border-t border-edge animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-coffee uppercase tracking-wider">
                  Generated Weekly Split
                </h4>
                <span className="text-[11px] text-coffee-muted">
                  {previewPlan.filter((p) => !p.isRestDay).length} Workouts / Week
                </span>
              </div>

              <div className="space-y-2">
                {previewPlan.map((p) => (
                  <div
                    key={p.dayOfWeek}
                    className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-coffee block">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][p.dayOfWeek]}: {p.name}
                      </span>
                      <span className="text-[10px] text-coffee-muted">
                        {p.isRestDay
                          ? 'Rest & muscle recovery'
                          : `${p.exercises.length} compound & isolation movements`}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        p.isRestDay
                          ? 'bg-sand/30 border-edge text-coffee-muted'
                          : 'bg-surface border-edge text-coffee'
                      }`}
                    >
                      {p.isRestDay ? 'Rest' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-edge bg-surface2/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-coffee text-xs font-bold transition active:scale-95"
          >
            Cancel
          </button>

          {previewPlan && (
            <button
              onClick={handleApply}
              className="py-2.5 px-5 rounded-xl text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: character.theme.primary }}
            >
              <CheckCircle2 size={16} />
              <span>Accept & Apply Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
