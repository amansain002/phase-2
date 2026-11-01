import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Dumbbell,
  Moon,
} from 'lucide-react';
import { DailyWorkoutPlan, WeeklySplitPreset } from '../types/workout';
import { SPLIT_PRESETS } from '../data/workoutConfig';
import {
  getWeeklyPlans,
  saveWeeklyPlans,
  getExerciseLibrary,
} from '../lib/workoutService';
import { useTheme } from '../context/ThemeProvider';

interface SplitPlannerModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SplitPlannerModal: React.FC<SplitPlannerModalProps> = ({
  onClose,
  onSaved,
}) => {
  const { character } = useTheme();
  const library = getExerciseLibrary();
  const libMap = new Map(library.map((e) => [e.id, e]));

  const [plans, setPlans] = useState<DailyWorkoutPlan[]>(getWeeklyPlans);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(new Date().getDay());
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const selectedPlan = plans.find((p) => p.dayOfWeek === selectedDayIdx) || plans[0];

  const handleApplyPreset = (preset: WeeklySplitPreset) => {
    const newPlans: DailyWorkoutPlan[] = preset.days.map((d) => {
      const dayExercises: any[] = [];
      d.exerciseIds.forEach((id) => {
        const ex = libMap.get(id);
        if (ex) {
          dayExercises.push({
            exerciseId: id,
            targetSets: ex.defaultSets,
            targetReps: ex.defaultReps,
            targetWeightKg: ex.type === 'compound' ? 40 : 15,
            status: 'pending',
          });
        }
      });
      return {
        dayOfWeek: d.dayOfWeek,
        name: d.planName,
        isRestDay: d.isRestDay,
        exercises: dayExercises,
      };
    });

    setPlans(newPlans);
    saveWeeklyPlans(newPlans);
    onSaved();
  };

  const handleToggleRestDay = (dayOfWeek: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.dayOfWeek === dayOfWeek) {
          const nextRest = !p.isRestDay;
          return {
            ...p,
            isRestDay: nextRest,
            name: nextRest ? 'Rest & Recovery Day' : 'Custom Workout Day',
            exercises: nextRest ? [] : p.exercises,
          };
        }
        return p;
      })
    );
  };

  const handleRemoveExercise = (dayOfWeek: number, exerciseId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.dayOfWeek === dayOfWeek) {
          return {
            ...p,
            exercises: p.exercises.filter((e) => e.exerciseId !== exerciseId),
          };
        }
        return p;
      })
    );
  };

  const handleSaveCustom = () => {
    saveWeeklyPlans(plans);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface border border-edge rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-edge flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee">Weekly Split Planner</h3>
              <p className="text-xs text-coffee-muted">
                Assign workouts to each day (Mon to Sun)
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

        {/* Tab Switcher */}
        <div className="flex border-b border-edge bg-surface2/50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 transition border-b-2 ${
              activeTab === 'presets'
                ? 'text-coffee'
                : 'text-coffee-muted border-transparent hover:text-coffee'
            }`}
            style={
              activeTab === 'presets'
                ? { borderColor: character.theme.primary }
                : undefined
            }
          >
            Split Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 transition border-b-2 ${
              activeTab === 'custom'
                ? 'text-coffee'
                : 'text-coffee-muted border-transparent hover:text-coffee'
            }`}
            style={
              activeTab === 'custom'
                ? { borderColor: character.theme.primary }
                : undefined
            }
          >
            Custom Day-by-Day
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              <p className="text-xs text-coffee-muted">
                Select a proven gym split to instantly configure your Monday through Sunday schedule:
              </p>

              {SPLIT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-coffee group-hover:text-coffee transition">
                        {preset.name}
                      </h4>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          backgroundColor: `${character.theme.primary}20`,
                          color: character.theme.primary,
                        }}
                      >
                        {preset.tagline}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="py-1.5 px-3 rounded-xl text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
                      style={{ backgroundColor: character.theme.primary }}
                    >
                      <Check size={14} /> Apply Split
                    </button>
                  </div>

                  <p className="text-xs text-coffee-muted leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preset.days.map((d) => (
                      <span
                        key={d.dayOfWeek}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                          d.isRestDay
                            ? 'bg-sand/20 border-edge text-coffee-muted'
                            : 'bg-surface border-edge text-coffee'
                        }`}
                      >
                        {d.dayName.substring(0, 3)}: {d.isRestDay ? 'Rest' : d.planName.split(':')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day Selector Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[1, 2, 3, 4, 5, 6, 0].map((dIdx) => {
                  const p = plans.find((item) => item.dayOfWeek === dIdx);
                  const isSelected = selectedDayIdx === dIdx;
                  return (
                    <button
                      key={dIdx}
                      onClick={() => setSelectedDayIdx(dIdx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition border flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: character.theme.primary }
                          : undefined
                      }
                    >
                      <span>{DAY_NAMES[dIdx].substring(0, 3)}</span>
                      <span className="text-[9px] opacity-80">
                        {p?.isRestDay ? 'Rest' : `${p?.exercises.length || 0} ex`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Day Editor Card */}
              {selectedPlan && (
                <div className="p-4 rounded-2xl border border-edge bg-surface2/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-coffee">
                        {DAY_NAMES[selectedPlan.dayOfWeek]}
                      </h4>
                      <p className="text-xs text-coffee-muted">{selectedPlan.name}</p>
                    </div>

                    <button
                      onClick={() => handleToggleRestDay(selectedPlan.dayOfWeek)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        selectedPlan.isRestDay
                          ? 'bg-sand/30 border-edge text-coffee-muted'
                          : 'bg-surface border-edge text-coffee'
                      }`}
                    >
                      <Moon size={14} />
                      {selectedPlan.isRestDay ? 'Rest Day' : 'Training Day'}
                    </button>
                  </div>

                  {selectedPlan.isRestDay ? (
                    <div className="p-4 rounded-xl bg-surface border border-edge text-center space-y-1">
                      <p className="text-xs font-semibold text-coffee">
                        Rest & Recovery Day
                      </p>
                      <p className="text-[11px] text-coffee-muted">
                        Muscles rebuild during recovery. No exercises scheduled for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-coffee-muted font-bold">
                        <span>Planned Exercises ({selectedPlan.exercises.length})</span>
                      </div>

                      {selectedPlan.exercises.length === 0 ? (
                        <div className="p-4 rounded-xl bg-surface border border-edge text-center text-xs text-coffee-muted">
                          No exercises added yet for this day.
                        </div>
                      ) : (
                        selectedPlan.exercises.map((pe) => {
                          const ex = libMap.get(pe.exerciseId);
                          return (
                            <div
                              key={pe.exerciseId}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-edge text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-sand/30 flex items-center justify-center text-coffee">
                                  <Dumbbell size={14} />
                                </div>
                                <div>
                                  <p className="font-semibold text-coffee">
                                    {ex ? ex.name : pe.exerciseId}
                                  </p>
                                  <p className="text-[10px] text-coffee-muted">
                                    {pe.targetSets} sets × {pe.targetReps} reps •{' '}
                                    <span className="capitalize">{ex?.muscleGroup}</span>
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  handleRemoveExercise(
                                    selectedPlan.dayOfWeek,
                                    pe.exerciseId
                                  )
                                }
                                className="p-1.5 rounded-lg text-coffee-muted hover:text-red-400 hover:bg-sand/20 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-edge bg-surface2/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-coffee text-xs font-bold transition active:scale-95"
          >
            Close
          </button>
          {activeTab === 'custom' && (
            <button
              onClick={handleSaveCustom}
              className="py-2.5 px-5 rounded-xl text-white text-xs font-bold shadow-md transition active:scale-95"
              style={{ backgroundColor: character.theme.primary }}
            >
              Save Custom Split
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
