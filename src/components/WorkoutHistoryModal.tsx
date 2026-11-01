import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Flame,
  Sparkles,
  Dumbbell,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { WorkoutLog } from '../types/workout';
import { getWorkoutLogs, getDailyStats } from '../lib/workoutService';
import { useTheme } from '../context/ThemeProvider';
import { CharacterAvatar } from './CharacterAvatar';

interface WorkoutHistoryModalProps {
  onClose: () => void;
}

export const WorkoutHistoryModal: React.FC<WorkoutHistoryModalProps> = ({
  onClose,
}) => {
  const { character } = useTheme();
  const logs = getWorkoutLogs();
  const dailyStats = getDailyStats();

  // Current calendar month view state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Map of logs by date (YYYY-MM-DD)
  const logMap = new Map<string, WorkoutLog[]>();
  logs.forEach((l) => {
    const list = logMap.get(l.date) || [];
    list.push(l);
    logMap.set(l.date, list);
  });

  // Calculate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Selected date logs or latest logs
  const displayLogs = selectedDateStr
    ? logMap.get(selectedDateStr) || []
    : logs.slice(0, 5);

  const totalAllTimeVolume = logs.reduce((sum, l) => sum + l.totalVolumeKg, 0);
  const totalAllTimeXp = logs.reduce((sum, l) => sum + l.totalXp, 0);

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
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee">Workout History</h3>
              <p className="text-xs text-coffee-muted">
                {logs.length} sessions logged • {dailyStats.streak} day streak 🔥
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
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-surface2 border border-edge text-center">
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Workouts
              </span>
              <span className="text-sm font-black text-coffee">{logs.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface2 border border-edge text-center">
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                All-time XP
              </span>
              <span
                className="text-sm font-black"
                style={{ color: character.theme.primary }}
              >
                +{totalAllTimeXp}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface2 border border-edge text-center">
              <span className="text-[10px] text-coffee-muted font-bold block uppercase">
                Volume
              </span>
              <span className="text-sm font-black text-coffee">
                {Math.round(totalAllTimeVolume / 1000)}t
              </span>
            </div>
          </div>

          {/* Interactive Month Calendar */}
          <div className="p-4 rounded-2xl border border-edge bg-surface2/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-coffee">
                {monthNames[month]} {year}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg border border-edge bg-surface text-coffee hover:bg-sand/30"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-edge bg-surface text-coffee hover:bg-sand/30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-coffee-muted py-1">
                  {d}
                </span>
              ))}

              {/* Blank initial days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} className="h-8" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const hasLogs = logMap.has(dateKey);
                const isSelected = selectedDateStr === dateKey;

                return (
                  <button
                    key={dayNum}
                    onClick={() =>
                      setSelectedDateStr(isSelected ? null : dateKey)
                    }
                    className={`h-8 rounded-xl font-bold flex flex-col items-center justify-center relative transition ${
                      isSelected
                        ? 'text-white shadow-xs'
                        : hasLogs
                        ? 'bg-surface text-coffee border border-edge hover:border-coffee-muted'
                        : 'text-coffee-muted/70 hover:bg-sand/20'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: character.theme.primary }
                        : undefined
                    }
                  >
                    <span className="text-xs">{dayNum}</span>
                    {hasLogs && (
                      <span
                        className="w-1.5 h-1.5 rounded-full absolute bottom-1"
                        style={{
                          backgroundColor: isSelected
                            ? '#ffffff'
                            : character.theme.primary,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Logs List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-coffee-muted">
              <span>
                {selectedDateStr
                  ? `Sessions for ${selectedDateStr}`
                  : 'Recent Workout Sessions'}
              </span>
              {selectedDateStr && (
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="text-[11px] underline hover:text-coffee"
                >
                  Show All Recent
                </button>
              )}
            </div>

            {displayLogs.length === 0 ? (
              <div className="p-6 rounded-2xl border border-edge bg-surface text-center space-y-1">
                <Dumbbell size={24} className="mx-auto text-coffee-muted/50" />
                <p className="text-xs font-semibold text-coffee">
                  No workouts recorded for this date.
                </p>
                <p className="text-[11px] text-coffee-muted">
                  Log your daily exercises to earn XP and build your training calendar.
                </p>
              </div>
            ) : (
              displayLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-edge bg-surface2/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-coffee">{log.planName}</h4>
                      <p className="text-[10px] text-coffee-muted">
                        {new Date(log.completedAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(log.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-lg border"
                      style={{
                        backgroundColor: `${character.theme.primary}15`,
                        borderColor: `${character.theme.primary}30`,
                        color: character.theme.primary,
                      }}
                    >
                      +{log.totalXp} XP
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-coffee-muted">
                    <span className="flex items-center gap-1 font-semibold text-coffee">
                      <Layers size={13} style={{ color: character.theme.primary }} />
                      {log.completedExercisesCount} Exercises
                    </span>
                    <span>•</span>
                    <span>{log.totalSetsCompleted} Sets</span>
                    <span>•</span>
                    <span>{log.totalVolumeKg.toLocaleString()} kg Volume</span>
                  </div>

                  {log.aiFeedback && (
                    <div className="p-2.5 rounded-xl bg-surface border border-edge flex items-start gap-2 text-xs">
                      <CharacterAvatar character={character} size="sm" />
                      <div>
                        <span className="text-[10px] font-bold text-coffee block">
                          {log.aiFeedback.characterName}
                        </span>
                        <p className="text-[11px] text-coffee-muted italic">
                          "{log.aiFeedback.quote}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-edge bg-surface2/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-edge bg-surface hover:bg-sand/30 text-xs font-bold text-coffee transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
