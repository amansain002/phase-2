import React, { useState } from 'react';
import {
  X,
  Search,
  Dumbbell,
  Plus,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Exercise,
  MuscleGroup,
  ExerciseType,
  DifficultyLevel,
} from '../types/workout';
import {
  getExerciseLibrary,
  addCustomExercise,
} from '../lib/workoutService';
import { useTheme } from '../context/ThemeProvider';

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS: { id: MuscleGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onSelectExercise,
}) => {
  const { character } = useTheme();

  const [library, setLibrary] = useState<Exercise[]>(getExerciseLibrary);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New exercise form state
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('chest');
  const [customType, setCustomType] = useState<ExerciseType>('compound');
  const [customDiff, setCustomDiff] = useState<DifficultyLevel>('intermediate');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState(10);
  const [customDesc, setCustomDesc] = useState('');

  const filteredExercises = library.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle =
      selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const created = addCustomExercise({
      name: customName.trim(),
      muscleGroup: customMuscle,
      type: customType,
      difficulty: customDiff,
      defaultSets: customSets,
      defaultReps: customReps,
      description: customDesc.trim() || undefined,
    });

    setLibrary((prev) => [created, ...prev]);
    setCustomName('');
    setCustomDesc('');
    setShowAddForm(false);
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
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee">Exercise Library</h3>
              <p className="text-xs text-coffee-muted">
                {library.length} exercises cataloged with XP tags
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-1.5 px-3 rounded-xl border border-edge bg-surface2 hover:bg-sand/30 text-xs font-bold text-coffee transition flex items-center gap-1 active:scale-95"
            >
              <Plus size={14} />
              <span>{showAddForm ? 'View List' : 'Add Custom'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface2 hover:bg-sand/30 text-coffee-muted transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Add Custom Exercise Form (Expandable) */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCustom}
            className="p-4 border-b border-edge bg-surface2/60 space-y-3 animate-fadeIn"
          >
            <h4 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Add Custom Exercise
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Pendlay Row"
                className="w-full py-2 px-3 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                  Muscle Group
                </label>
                <select
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                  className="w-full py-2 px-2.5 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none capitalize"
                >
                  {MUSCLE_GROUPS.filter((g) => g.id !== 'all').map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                  Exercise Type
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as ExerciseType)}
                  className="w-full py-2 px-2.5 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none capitalize"
                >
                  <option value="compound">Compound (30 Base XP)</option>
                  <option value="isolation">Isolation (20 Base XP)</option>
                  <option value="bodyweight">Bodyweight (20 Base XP)</option>
                  <option value="cardio">Cardio (25 Base XP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                  Difficulty
                </label>
                <select
                  value={customDiff}
                  onChange={(e) => setCustomDiff(e.target.value as DifficultyLevel)}
                  className="w-full py-2 px-2 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none capitalize"
                >
                  <option value="beginner">Beginner (1.0x)</option>
                  <option value="intermediate">Intermediate (1.2x)</option>
                  <option value="advanced">Advanced (1.5x)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={customSets}
                  onChange={(e) => setCustomSets(parseInt(e.target.value) || 3)}
                  className="w-full py-2 px-2 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-coffee-muted block mb-1">
                  Reps
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customReps}
                  onChange={(e) => setCustomReps(parseInt(e.target.value) || 10)}
                  className="w-full py-2 px-2 rounded-xl border border-edge bg-surface text-xs text-coffee outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-1.5 px-3 rounded-xl border border-edge bg-surface text-xs text-coffee-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl text-white text-xs font-bold shadow-xs"
                style={{ backgroundColor: character.theme.primary }}
              >
                Save Exercise
              </button>
            </div>
          </form>
        )}

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-edge bg-surface space-y-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ gym exercises..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee outline-none placeholder:text-coffee-muted/70"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedMuscle(g.id)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold shrink-0 transition border ${
                  selectedMuscle === g.id
                    ? 'text-white border-transparent shadow-xs'
                    : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                }`}
                style={
                  selectedMuscle === g.id
                    ? { backgroundColor: character.theme.primary }
                    : undefined
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Cards List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="p-8 text-center text-xs text-coffee-muted">
              No exercises match your search or filter.
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelectExercise && onSelectExercise(ex)}
                className={`p-3 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition space-y-1.5 ${
                  onSelectExercise ? 'cursor-pointer hover:border-coffee-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coffee">{ex.name}</span>
                    {ex.isCustom && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        CUSTOM
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${character.theme.primary}15`,
                        borderColor: `${character.theme.primary}30`,
                        color: character.theme.primary,
                      }}
                    >
                      {ex.difficulty}
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sand/30 text-coffee-muted">
                      {ex.type}
                    </span>
                  </div>
                </div>

                {ex.description && (
                  <p className="text-[11px] text-coffee-muted leading-tight">
                    {ex.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-coffee-muted pt-0.5">
                  <span className="capitalize">
                    Target: {ex.muscleGroup} • {ex.defaultSets} sets × {ex.defaultReps} reps
                  </span>
                  {onSelectExercise && (
                    <span
                      className="font-bold flex items-center gap-0.5"
                      style={{ color: character.theme.primary }}
                    >
                      Select <Check size={12} />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
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
