import React, { useState } from 'react';
import {
  UserProfileData,
  ProfessionType,
  SkillLevel,
  PhysiqueGoal,
  TrainingPlace,
  FoodPreference,
  CoachPersonalityType,
  PlanTypeSelection,
  BusySlot,
} from '../types/onboarding';
import { loadUserProfile, saveUserProfile, DEFAULT_USER_PROFILE } from '../lib/onboardingStorage';
import { generateUserPlanAndQuests } from '../lib/planGenerator';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  User,
  Shield,
  Briefcase,
  Zap,
  Target,
  Brain,
  Flame,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface OnboardingProps {
  onComplete: () => void;
  initialData?: UserProfileData;
  isEditing?: boolean;
}

const AVATAR_OPTIONS = [
  { id: 'naruto', path: '/avatars/naruto.png', label: 'Naruto' },
  { id: 'goku', path: '/avatars/goku.png', label: 'Goku' },
  { id: 'asta', path: '/avatars/asta.png', label: 'Asta' },
  { id: 'saitama', path: '/avatars/saitama.png', label: 'Saitama' },
];

const GOAL_EXAMPLES = [
  'Master Full-Stack AI Dev & land high-impact role',
  'Score top 1% in competitive university exams',
  'Build athletic physique while studying 5 hrs/day',
  'Launch profitable digital product & master coding',
  'Crush procrastination and build unstoppable discipline',
];

const PROFESSION_OPTIONS: ProfessionType[] = [
  'School Student',
  'College Student',
  'Office Worker',
  'Entrepreneur',
  'Freelancer',
  'Job Seeker',
  'Other',
];

const FIELD_SUGGESTIONS: Record<string, string[]> = {
  'College Student': [
    'CS - Artificial Intelligence & Data Science',
    'Computer Science & Engineering',
    'Information Technology',
    'Commerce & Finance',
    'Mechanical / Electrical Engineering',
    'Medicine / Healthcare',
    'Law & Public Policy',
  ],
  'School Student': [
    'Science (PCM/PCB) - 11th/12th',
    'Commerce with Mathematics',
    'Humanities & Social Sciences',
    'High School Foundation (9th/10th)',
  ],
  'Office Worker': [
    'Software Engineer / Backend Dev',
    'Product Management',
    'Data Science & Analytics',
    'Marketing & Growth',
    'Operations & Strategy',
    'Finance & Accounting',
  ],
  'Entrepreneur': [
    'Tech & SaaS Startup',
    'E-Commerce & D2C',
    'Digital Agency / Consulting',
    'Content & Media Creation',
  ],
  'Freelancer': [
    'Full-Stack Web Development',
    'UI/UX & Product Design',
    'Copywriting & Content Strategy',
    'Video Production & 3D Art',
  ],
  'Job Seeker': [
    'Entry-level Software Engineering',
    'Business Analytics',
    'Data Engineering',
    'Sales & Customer Success',
  ],
  'Other': ['Creative Arts', 'Research & Academia', 'Self-Directed Learning'],
};

const POPULAR_SKILLS = [
  'React & TypeScript',
  'Full-Stack Web Dev',
  'Data Structures & Algorithms',
  'AI / Machine Learning',
  'System Design',
  'Python Programming',
  'UI/UX Design',
  'Public Speaking',
  'Financial Management',
  'Time Management',
];

const OTHER_AREAS_OPTIONS = [
  'Money and savings',
  'Business',
  'Confidence and communication',
  'Productivity',
  'Sleep and wellness',
  'Study habits',
];

const BLOCKERS_OPTIONS = [
  'Procrastination',
  'No motivation',
  'No time',
  'No clear plan',
  'Distractions',
  'Inconsistency',
];

const COACH_PERSONALITIES: CoachPersonalityType[] = [
  'Friendly',
  'Strict Mentor',
  'Funny Buddy',
  'Calm Guide',
  'Savage Roast',
];

export const Onboarding: React.FC<OnboardingProps> = ({
  onComplete,
  initialData,
  isEditing = false,
}) => {
  const { setCompanion } = useApp();
  const { character, setCharacter } = useTheme();

  const [profile, setProfile] = useState<UserProfileData>(() => {
    return initialData || loadUserProfile();
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Dynamic step identifiers based on whether user wants to build body
  const buildBody = profile.wantToBuildBody === 'Yes';

  const stepsList = [
    'name',
    'avatar',
    'mainGoal',
    'profession',
    'fieldOrBranch',
    'yearOrExperience',
    'skills',
    'skillLevels',
    'wantToBuildBody',
    ...(buildBody
      ? ['physiqueGoal', 'bodyMeasurements', 'ageAndGender', 'fitnessRoutine', 'fitnessExpFood']
      : []),
    'otherAreas',
    'dailyRoutine',
    'blockers',
    'aiCoach',
    'planType',
  ];

  const currentStep = stepsList[stepIndex];
  const totalSteps = stepsList.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Update profile field helper
  const updateField = <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  // Validation before proceeding
  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'name':
        if (!profile.name.trim()) {
          setValidationError('Please enter your name or preferred student handle.');
          return false;
        }
        break;
      case 'mainGoal':
        if (!profile.mainGoal.trim()) {
          setValidationError('Please describe your main goal or pick one of the suggestion chips.');
          return false;
        }
        break;
      case 'fieldOrBranch':
        if (!profile.fieldOrBranch.trim()) {
          setValidationError('Please select or specify your field, branch, or major.');
          return false;
        }
        break;
      case 'skills':
        if (profile.skillsToMaster.length === 0) {
          setValidationError('Please select at least 1 skill you want to master.');
          return false;
        }
        break;
      case 'aiCoach':
        if (!profile.coachName.trim()) {
          setValidationError('Please name your AI Coach.');
          return false;
        }
        break;
    }
    setValidationError(null);
    return true;
  };

  // Next Question
  const handleContinue = () => {
    if (!validateStep()) return;

    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Completed last question!
      finishOnboarding();
    }
  };

  // Back Question
  const handleBack = () => {
    setValidationError(null);
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  // Skip optional step
  const handleSkip = () => {
    setValidationError(null);
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  // Finalize & Plan Generation
  const finishOnboarding = () => {
    setIsLoading(true);

    const loadingMsgs = [
      'Synthesizing your personalized 7-day timetable...',
      'Mapping your target skills to daily XP quests...',
      'Calibrating your AI Coach tone and motivation rules...',
      'Saving your preferences to your student profile...',
    ];

    let currentMsg = 0;
    const interval = setInterval(() => {
      currentMsg++;
      if (currentMsg < loadingMsgs.length) {
        setLoadingTextIndex(currentMsg);
      } else {
        clearInterval(interval);
        // Persist profile
        saveUserProfile(profile);

        // Generate plan, tasks, timetable
        generateUserPlanAndQuests(profile);

        // Map coach avatar if matches anime character
        if (profile.coachAvatar.includes('goku')) setCharacter('goku');
        else if (profile.coachAvatar.includes('asta')) setCharacter('asta');
        else if (profile.coachAvatar.includes('naruto')) setCharacter('naruto');
        else if (profile.coachAvatar.includes('saitama')) setCharacter('saitama');

        try {
          localStorage.setItem('uplevel_phase2_onboarding_complete', 'true');
        } catch {
          // ignore
        }

        setIsLoading(false);
        onComplete();
      }
    }, 600);
  };

  // --------------------------------------------------------------------------
  // Loading Transition Screen
  // --------------------------------------------------------------------------
  if (isLoading) {
    const loadingMsgs = [
      'Synthesizing your personalized 7-day timetable...',
      'Mapping your target skills to daily XP quests...',
      'Calibrating your AI Coach tone and motivation rules...',
      'Saving your preferences to your student profile...',
    ];

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm rounded-3xl p-8 border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-tr from-amber-500 via-orange-500 to-sky-500 shadow-xl">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Generating Your System</h2>
            <p className="text-xs text-slate-400 mt-2 min-h-[36px]">
              {loadingMsgs[loadingTextIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-sky-500"
              initial={{ width: '10%' }}
              animate={{ width: `${((loadingTextIndex + 1) / loadingMsgs.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Calibrating custom quests...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto select-none">
      {/* -------------------------------------------------------------------- */}
      {/* HEADER: Progress Bar & Step Counter                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="w-full space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono text-[11px] border border-slate-700">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <span className="text-slate-300 font-semibold truncate max-w-[160px] sm:max-w-none">
              {isEditing ? 'Edit Profile' : 'System Setup'}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-sky-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 border border-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-500 rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* BODY: ONE QUESTION PER SCREEN                                        */}
      {/* -------------------------------------------------------------------- */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* 1. BASIC INFO: Name */}
            {currentStep === 'name' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Basic Info
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What should we call you?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Your name will appear across your student profile, study leaderboard, and daily reports.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your name or handle..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* 2. BASIC INFO: Avatar */}
            {currentStep === 'avatar' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Basic Info
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Choose your student avatar
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Pick an avatar representation for your academy badge and rank card.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = profile.avatar === av.path;
                    return (
                      <div
                        key={av.id}
                        onClick={() => updateField('avatar', av.path)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center gap-2.5 text-center ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400 shadow-lg'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={av.path}
                          alt={av.label}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700"
                        />
                        <span className="text-xs font-bold text-white">{av.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. AIM: Main Goal */}
            {currentStep === 'mainGoal' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Aim & Direction
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What is your #1 primary goal right now?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Type your milestone or pick one of the verified suggestions below.
                  </p>
                </div>

                <div className="pt-1">
                  <textarea
                    rows={3}
                    value={profile.mainGoal}
                    onChange={(e) => updateField('mainGoal', e.target.value)}
                    placeholder="E.g. Master React and Land a Software Engineer job..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none transition"
                  />
                </div>

                {/* Example Chips */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_EXAMPLES.map((eg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('mainGoal', eg)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition text-left"
                      >
                        {eg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. PROFESSION */}
            {currentStep === 'profession' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Profession
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What describes your current role?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    This tailors your timetable schedule and daily task weights.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {PROFESSION_OPTIONS.map((prof) => {
                    const isSelected = profile.profession === prof;
                    return (
                      <button
                        key={prof}
                        type="button"
                        onClick={() => {
                          updateField('profession', prof);
                          // Suggest a default field if changing profession
                          const sugg = FIELD_SUGGESTIONS[prof];
                          if (sugg && sugg.length > 0) {
                            updateField('fieldOrBranch', sugg[0]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{prof}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. FIELD OR BRANCH (Searchable / Tailored) */}
            {currentStep === 'fieldOrBranch' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Field or Branch
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What is your specific field or major?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Suggestions tailored for: <strong className="text-sky-400">{profile.profession}</strong>
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={profile.fieldOrBranch}
                    onChange={(e) => updateField('fieldOrBranch', e.target.value)}
                    placeholder="Enter or select your branch/field..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                  />
                </div>

                {/* Tailored suggestions */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Popular for {profile.profession}:
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {(FIELD_SUGGESTIONS[profile.profession] || FIELD_SUGGESTIONS['College Student']).map(
                      (field, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateField('fieldOrBranch', field)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                            profile.fieldOrBranch === field
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {field}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. YEAR OR EXPERIENCE LEVEL */}
            {currentStep === 'yearOrExperience' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Level & Standing
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What is your current year or experience level?
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {[
                    '1st Year / Foundation',
                    '2nd Year',
                    '3rd Year',
                    '4th Year / Final Year',
                    'Entry Level (0-1 yrs exp)',
                    'Mid Level (2-4 yrs exp)',
                    'Senior Level (5+ yrs exp)',
                  ].map((lvl) => {
                    const isSelected = profile.yearOrExperience === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateField('yearOrExperience', lvl)}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{lvl}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. SKILLS: Up to 5 chips + custom entry */}
            {currentStep === 'skills' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                      Target Skills
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {profile.skillsToMaster.length}/5 selected
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Select up to 5 skills to master
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Your weekly timetable and daily quests will be generated from these skills.
                  </p>
                </div>

                {/* Popular skill chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = profile.skillsToMaster.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField(
                              'skillsToMaster',
                              profile.skillsToMaster.filter((s) => s !== skill)
                            );
                          } else {
                            if (profile.skillsToMaster.length >= 5) {
                              setValidationError('You can select a maximum of 5 target skills.');
                              return;
                            }
                            updateField('skillsToMaster', [...profile.skillsToMaster, skill]);
                          }
                        }}
                        className={`text-xs px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold ring-1 ring-sky-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill adder */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="+ Add your own custom skill..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!customSkillInput.trim()) return;
                        if (profile.skillsToMaster.length >= 5) {
                          setValidationError('You can select a maximum of 5 target skills.');
                          return;
                        }
                        updateField('skillsToMaster', [...profile.skillsToMaster, customSkillInput.trim()]);
                        setCustomSkillInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customSkillInput.trim()) return;
                      if (profile.skillsToMaster.length >= 5) {
                        setValidationError('You can select a maximum of 5 target skills.');
                        return;
                      }
                      updateField('skillsToMaster', [...profile.skillsToMaster, customSkillInput.trim()]);
                      setCustomSkillInput('');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* 8. SKILL LEVELS: Beginner, Intermediate, Advanced for each */}
            {currentStep === 'skillLevels' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Skill Baseline
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What is your current level in each skill?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Quests scale in difficulty (XP rewards) based on your baseline.
                  </p>
                </div>

                <div className="space-y-3 pt-2 max-h-72 overflow-y-auto pr-1">
                  {profile.skillsToMaster.map((skill) => {
                    const currentLvl = profile.skillLevels[skill] || 'Intermediate';
                    return (
                      <div
                        key={skill}
                        className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <span className="font-bold text-xs text-white truncate max-w-xs">{skill}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                updateField('skillLevels', {
                                  ...profile.skillLevels,
                                  [skill]: lvl,
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                currentLvl === lvl
                                  ? 'bg-sky-500 text-white font-bold'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 9. PHYSIQUE: Gatekeeper (Yes, Maybe later, No) */}
            {currentStep === 'wantToBuildBody' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Physical Conditioning
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Do you want to build your body?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Choosing "No" automatically skips all fitness and body measurement questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {(['Yes', 'Maybe later', 'No'] as const).map((opt) => {
                    const isSelected = profile.wantToBuildBody === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('wantToBuildBody', opt)}
                        className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <Dumbbell className={`w-6 h-6 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10. PHYSIQUE: Goal */}
            {currentStep === 'physiqueGoal' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Body Goal
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What is your main physique goal?
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {(
                    [
                      'Build muscle',
                      'Lose fat',
                      'Get lean and toned',
                      'Improve stamina',
                      'Stay healthy',
                      'Gain weight',
                    ] as PhysiqueGoal[]
                  ).map((goal) => {
                    const isSelected = profile.physiqueGoal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => updateField('physiqueGoal', goal)}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{goal}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 11. PHYSIQUE: Height & Weight with toggles */}
            {currentStep === 'bodyMeasurements' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Measurements
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Height & Weight
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Height */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400">Height</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateField('height', {
                            value: profile.height?.value || 175,
                            unit: profile.height?.unit === 'cm' ? 'ft' : 'cm',
                          })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400"
                      >
                        Toggle: {profile.height?.unit || 'cm'}
                      </button>
                    </div>
                    <input
                      type="number"
                      value={profile.height?.value || ''}
                      onChange={(e) =>
                        updateField('height', {
                          value: Number(e.target.value),
                          unit: profile.height?.unit || 'cm',
                        })
                      }
                      placeholder={profile.height?.unit === 'ft' ? '5.9' : '175'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold text-base focus:outline-none"
                    />
                  </div>

                  {/* Weight */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400">Current Weight</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateField('weight', {
                            value: profile.weight?.value || 68,
                            unit: profile.weight?.unit === 'kg' ? 'lb' : 'kg',
                          })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400"
                      >
                        Toggle: {profile.weight?.unit || 'kg'}
                      </button>
                    </div>
                    <input
                      type="number"
                      value={profile.weight?.value || ''}
                      onChange={(e) =>
                        updateField('weight', {
                          value: Number(e.target.value),
                          unit: profile.weight?.unit || 'kg',
                        })
                      }
                      placeholder={profile.weight?.unit === 'lb' ? '150' : '68'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold text-base focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Weight (Optional) */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400">
                      Target Weight (Optional)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                  </div>
                  <input
                    type="number"
                    value={profile.targetWeight?.value || ''}
                    onChange={(e) =>
                      updateField('targetWeight', {
                        value: Number(e.target.value),
                        unit: profile.weight?.unit || 'kg',
                      })
                    }
                    placeholder="E.g. 74"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold text-base focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 12. PHYSIQUE: Age & Gender */}
            {currentStep === 'ageAndGender' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Demographics
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Age & Gender
                  </h1>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Age</label>
                    <input
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => updateField('age', Number(e.target.value))}
                      placeholder="E.g. 21"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Gender (Optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateField('gender', g)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left ${
                            profile.gender === g
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 13. PHYSIQUE: Training place & Days per week */}
            {currentStep === 'fitnessRoutine' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Training Setup
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Where and how often do you train?
                  </h1>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Training Place
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Home', 'Gym', 'Outdoors'] as TrainingPlace[]).map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => updateField('trainingPlace', place)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center ${
                            profile.trainingPlace === place
                              ? 'bg-slate-800 border-sky-400 text-white ring-1 ring-sky-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {place}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Workout Days Per Week (2 to 6 days)
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[2, 3, 4, 5, 6].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => updateField('workoutDaysPerWeek', days)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center ${
                            profile.workoutDaysPerWeek === days
                              ? 'bg-sky-500 text-white font-bold shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 14. PHYSIQUE: Experience & Food preference */}
            {currentStep === 'fitnessExpFood' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Fitness & Nutrition
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Experience & Food Preference
                  </h1>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Fitness Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((exp) => (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => updateField('fitnessExperience', exp)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center ${
                            profile.fitnessExperience === exp
                              ? 'bg-slate-800 border-sky-400 text-white ring-1 ring-sky-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Food Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Veg', 'Non-veg', 'Vegan'] as FoodPreference[]).map((food) => (
                        <button
                          key={food}
                          type="button"
                          onClick={() => updateField('foodPreference', food)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center ${
                            profile.foodPreference === food
                              ? 'bg-slate-800 border-sky-400 text-white ring-1 ring-sky-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 15. OTHER AREAS TO IMPROVE (Multi-select) */}
            {currentStep === 'otherAreas' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Holistic Growth
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Other areas you want to upgrade:
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Select all that apply for customized daily habits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {OTHER_AREAS_OPTIONS.map((area) => {
                    const isSelected = profile.otherAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField(
                              'otherAreas',
                              profile.otherAreas.filter((a) => a !== area)
                            );
                          } else {
                            updateField('otherAreas', [...profile.otherAreas, area]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{area}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 16. DAILY ROUTINE: Wake up, sleep, free hours, busy slots */}
            {currentStep === 'dailyRoutine' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Schedule Rhythm
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Daily Timetable & Available Hours
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Wake-up Time</label>
                    <input
                      type="time"
                      value={profile.wakeUpTime}
                      onChange={(e) => updateField('wakeUpTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-sm"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Sleep Time</label>
                    <input
                      type="time"
                      value={profile.sleepTime}
                      onChange={(e) => updateField('sleepTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400">
                      Estimated Free Study/Workout Hours Per Day
                    </label>
                    <span className="text-xs font-bold text-sky-400 font-mono">
                      {profile.freeHoursPerDay} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={profile.freeHoursPerDay}
                    onChange={(e) => updateField('freeHoursPerDay', Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Busy slot definition */}
                <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">
                    Main Busy Block (College / Office)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={profile.busySlots[0]?.startTime || '09:00'}
                      onChange={(e) => {
                        const slots = [...profile.busySlots];
                        slots[0] = {
                          id: 'slot-1',
                          label: 'Work/Classes',
                          startTime: e.target.value,
                          endTime: slots[0]?.endTime || '16:00',
                        };
                        updateField('busySlots', slots);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
                    <span className="text-slate-500 font-bold">to</span>
                    <input
                      type="time"
                      value={profile.busySlots[0]?.endTime || '16:00'}
                      onChange={(e) => {
                        const slots = [...profile.busySlots];
                        slots[0] = {
                          id: 'slot-1',
                          label: 'Work/Classes',
                          startTime: slots[0]?.startTime || '09:00',
                          endTime: e.target.value,
                        };
                        updateField('busySlots', slots);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 17. BLOCKERS (Multi-select) */}
            {currentStep === 'blockers' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Obstacles & Hurdles
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What holds you back the most?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Your AI companion will calibrate accountability rules around these blockers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {BLOCKERS_OPTIONS.map((blocker) => {
                    const isSelected = profile.blockers.includes(blocker);
                    return (
                      <button
                        key={blocker}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField(
                              'blockers',
                              profile.blockers.filter((b) => b !== blocker)
                            );
                          } else {
                            updateField('blockers', [...profile.blockers, blocker]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{blocker}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 18. AI COACH: Name, Avatar, Personality */}
            {currentStep === 'aiCoach' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    AI Companion
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Configure your AI Coach
                  </h1>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Coach Name</label>
                    <input
                      type="text"
                      value={profile.coachName}
                      onChange={(e) => updateField('coachName', e.target.value)}
                      placeholder="E.g. Naruto, Goku, Sylphie, Sensei..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  {/* Coach Avatar Picker */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Coach Avatar
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_OPTIONS.map((av) => (
                        <div
                          key={av.id}
                          onClick={() => updateField('coachAvatar', av.path)}
                          className={`p-2 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-1 ${
                            profile.coachAvatar === av.path
                              ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <img src={av.path} alt={av.label} className="w-10 h-10 rounded-full object-cover" />
                          <span className="text-[10px] font-bold text-slate-300">{av.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coach Personality */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Coaching Tone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COACH_PERSONALITIES.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => updateField('coachPersonality', tone)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                            profile.coachPersonality === tone
                              ? 'bg-sky-500 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 19. PLAN TYPE: Pre-built vs Build my own */}
            {currentStep === 'planType' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                    Plan Blueprint
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    How would you like to set up your plan?
                  </h1>
                </div>

                <div className="space-y-3 pt-2">
                  {(
                    [
                      'Pre-built plan for my goals',
                      "I'll build my own",
                    ] as PlanTypeSelection[]
                  ).map((plan) => {
                    const isSelected = profile.planType === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => updateField('planType', plan)}
                        className={`w-full p-5 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400 shadow-xl'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-base font-bold text-white mb-0.5">{plan}</div>
                          <p className="text-xs text-slate-400 font-normal">
                            {plan === 'Pre-built plan for my goals'
                              ? 'Our AI engine will auto-schedule your 7-day timetable and assign targeted quests.'
                              : 'Start with a clean canvas and craft your custom timetable entries & tasks.'}
                          </p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-sky-400 shrink-0 ml-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation Error Message */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mt-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* FOOTER: Back Button & Big Touch-Friendly Continue Button             */}
      {/* -------------------------------------------------------------------- */}
      <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {/* Skip link for optional steps */}
          {(currentStep === 'gender' ||
            currentStep === 'targetWeight' ||
            currentStep === 'otherAreas') && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 transition"
            >
              Skip
            </button>
          )}

          {/* Continue / Finish Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{stepIndex === totalSteps - 1 ? 'Generate Plan' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
