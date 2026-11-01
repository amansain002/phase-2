import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Check,
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DayOfWeek, TimetableEntry } from '../types';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../lib/storage';

export const TimetableTab: React.FC = () => {
  const {
    timetable,
    topics,
    addTimetableEntry,
    deleteTimetableEntry,
    toggleTimetableEntry,
    autoPlanWeek,
  } = useApp();

  const today = getTodayDayOfWeek();
  const [activeDay, setActiveDay] = useState<DayOfWeek>(today);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(topics[0] || 'General Academics');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('45');

  const dayEntries = timetable
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const dayDoneCount = dayEntries.filter((e) => e.completed).length;
  const totalWeekEntries = timetable.length;
  const completedWeekEntries = timetable.filter((e) => e.completed).length;
  const weekXp = completedWeekEntries * 20;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTimetableEntry({
      title: title.trim(),
      subject: subject.trim(),
      day: activeDay,
      time: time || '10:00',
      duration: parseInt(duration, 10) || 45,
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-coffee flex items-center gap-1.5">
            <CalendarDays className="text-saddle" size={18} />
            Study Timetable
          </h2>
          <p className="text-[11px] text-coffee-muted">
            Weekly schedule & syllabus revision planner
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
          className="px-2.5 py-1.5 rounded-xl border border-edge bg-surface text-coffee hover:text-saddle transition text-xs font-semibold"
        >
          {viewMode === 'day' ? 'Week Grid' : 'Day View'}
        </button>
      </div>

      {/* Weekly Summary Card */}
      <div className="p-4 rounded-2xl border border-edge bg-surface shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-coffee-muted uppercase tracking-wider">
            This Week
          </span>
          <span className="text-[10px] font-bold text-saddle px-2 py-0.5 rounded-full bg-sand/30 border border-edge2">
            +{weekXp} XP Earned
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-surface2 border border-edge">
            <span className="text-base font-bold text-coffee block">{totalWeekEntries}</span>
            <span className="text-[10px] text-coffee-muted uppercase tracking-wide">Planned</span>
          </div>

          <div className="p-2 rounded-xl bg-surface2 border border-edge">
            <span className="text-base font-bold text-saddle block">{completedWeekEntries}</span>
            <span className="text-[10px] text-coffee-muted uppercase tracking-wide">Completed</span>
          </div>

          <div className="p-2 rounded-xl bg-surface2 border border-edge">
            <span className="text-base font-bold text-olive-dark block">{weekXp}</span>
            <span className="text-[10px] text-coffee-muted uppercase tracking-wide">XP</span>
          </div>
        </div>

        <button
          onClick={autoPlanWeek}
          className="w-full py-2 px-3 rounded-xl border border-edge2 bg-sand/25 hover:bg-sand/40 text-saddle text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Zap size={14} /> Auto-Plan My Week
        </button>
      </div>

      {viewMode === 'day' ? (
        <>
          {/* Day Tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-0.5">
            {DAYS_OF_WEEK.map((d) => {
              const isToday = d === today;
              const isActive = d === activeDay;

              return (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
                    isActive
                      ? 'bg-saddle text-white border-saddle shadow-xs'
                      : 'bg-surface border-edge text-coffee-muted hover:text-coffee'
                  }`}
                >
                  {d}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-saddle ring-2 ring-surface" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day Progress */}
          {dayEntries.length > 0 && (
            <div className="p-3 rounded-xl border border-edge bg-surface flex items-center justify-between text-xs shadow-xs">
              <span className="font-semibold text-coffee">
                {dayDoneCount} of {dayEntries.length} completed on {activeDay}
              </span>
              <span className="text-[10px] font-bold text-saddle">
                {Math.round((dayDoneCount / dayEntries.length) * 100)}%
              </span>
            </div>
          )}

          {/* Entries List */}
          {dayEntries.length === 0 ? (
            <div className="p-6 rounded-2xl border border-edge bg-surface text-center space-y-1">
              <CalendarDays size={24} className="mx-auto text-coffee-muted/40 mb-1" />
              <p className="text-xs font-semibold text-coffee">Nothing scheduled for {activeDay}</p>
              <p className="text-[11px] text-coffee-muted">
                Tap "Add Task" or use "Auto-Plan My Week" to generate study blocks.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {dayEntries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTimetableEntry(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    item.completed
                      ? 'border-edge/60 bg-sand-subtle/30 opacity-70'
                      : 'border-edge bg-surface shadow-xs hover:border-saddle/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      className="shrink-0 text-coffee-muted group-hover:text-saddle transition"
                    >
                      {item.completed ? (
                        <CheckCircle2 size={18} className="text-saddle" />
                      ) : (
                        <Circle size={18} className="text-coffee-muted/70" />
                      )}
                    </button>

                    <div className="w-12 text-center shrink-0 border-r border-edge pr-2">
                      <p className="text-xs font-bold text-coffee">{item.time}</p>
                      <p className="text-[9px] text-coffee-muted">{item.duration}m</p>
                    </div>

                    <div className="min-w-0 flex-1 pl-1">
                      <p
                        className={`text-xs font-semibold text-coffee leading-snug truncate ${
                          item.completed ? 'line-through text-coffee-muted' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[10px] text-coffee-muted truncate mt-0.5">
                        {item.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-semibold text-saddle px-1.5 py-0.5 rounded bg-sand/30 border border-edge2">
                      +20 XP
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTimetableEntry(item.id);
                      }}
                      className="p-1 text-coffee-muted hover:text-red-600 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Entry Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-edge bg-surface hover:bg-sand/20 text-coffee text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <Plus size={15} /> Add Study Block to {activeDay}
          </button>
        </>
      ) : (
        /* Week Grid View */
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-7 md:gap-2.5 overflow-x-auto">
          {DAYS_OF_WEEK.map((d) => {
            const items = timetable.filter((e) => e.day === d);
            const isToday = d === today;

            return (
              <button
                key={d}
                onClick={() => {
                  setActiveDay(d);
                  setViewMode('day');
                }}
                className="w-full p-3 rounded-xl border border-edge bg-surface hover:border-saddle/40 transition text-left shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coffee">{d}</span>
                    {isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-saddle text-white">
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-coffee-muted">
                    {items.length} sessions
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-[11px] text-coffee-muted/60 italic">Free day</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-edge bg-surface2 text-coffee flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <Clock size={9} /> {item.time} {item.title}
                      </span>
                    ))}
                    {items.length > 3 && (
                      <span className="text-[10px] text-coffee-muted font-medium self-center">
                        +{items.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm p-5 rounded-2xl border border-edge bg-surface shadow-xl animate-scaleUp">
            <h3 className="text-sm font-bold text-coffee mb-1">Add to {activeDay} Schedule</h3>
            <p className="text-[11px] text-coffee-muted mb-4">
              Block focused study time on your timetable.
            </p>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-coffee mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Lecture Revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee placeholder-coffee-muted/50 focus:outline-none focus:border-saddle"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-coffee mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee placeholder-coffee-muted/50 focus:outline-none focus:border-saddle"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-coffee mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-edge bg-surface2 text-xs text-coffee focus:outline-none focus:border-saddle"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-coffee mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee focus:outline-none focus:border-saddle cursor-pointer"
                  >
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-edge bg-surface2 text-xs font-medium text-coffee hover:bg-sand/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-saddle hover:bg-saddle-hover text-xs font-semibold text-white shadow-sm transition"
                >
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
