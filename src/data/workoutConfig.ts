import { Exercise, WeeklySplitPreset } from '../types/workout';

export const WORKOUT_CONFIG = {
  // Base XP by exercise type
  baseXP: {
    compound: 30,
    isolation: 20,
    bodyweight: 20,
    cardio: 25,
  },
  // Multipliers by difficulty
  difficultyMultiplier: {
    beginner: 1.0,
    intermediate: 1.2,
    advanced: 1.5,
  },
  // Daily cap for workout XP
  dailyXpCap: 300,
  // Bonus XP
  fullPlanCompletionBonus: 25,
  streakBonusPerDay: 10,
  maxStreakBonus: 50,
  // Minimum rest gap between logged sets (in seconds)
  minRestGapSeconds: 20,
};

export const DEFAULT_EXERCISE_LIBRARY: Exercise[] = [
  // CHEST (6)
  {
    id: 'chest_bench_press',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 8,
    description: 'The king of upper body pressing for raw chest & triceps power.',
  },
  {
    id: 'chest_incline_db_press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Targets the upper clavicular chest fibers for full upper chest thickness.',
  },
  {
    id: 'chest_pushups',
    name: 'Push-ups',
    muscleGroup: 'chest',
    type: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 15,
    description: 'Fundamental bodyweight push movement for chest, shoulders, and core stability.',
  },
  {
    id: 'chest_cable_fly',
    name: 'Cable Chest Flyes',
    muscleGroup: 'chest',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Continuous tension on chest fibers through full adduction and squeeze.',
  },
  {
    id: 'chest_dips',
    name: 'Chest Dips',
    muscleGroup: 'chest',
    type: 'bodyweight',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Lean forward slightly to prioritize lower chest and front delts.',
  },
  {
    id: 'chest_db_pullover',
    name: 'Dumbbell Pullover',
    muscleGroup: 'chest',
    type: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Expands the ribcage and isolates serratus anterior and chest stretch.',
  },

  // BACK (7)
  {
    id: 'back_deadlift',
    name: 'Barbell Conventional Deadlift',
    muscleGroup: 'back',
    type: 'compound',
    difficulty: 'advanced',
    defaultSets: 3,
    defaultReps: 5,
    description: 'Ultimate full posterior chain strength builder from hamstrings to traps.',
  },
  {
    id: 'back_barbell_row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'back',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 8,
    description: 'Heavy horizontal pulling for back thickness and lat engagement.',
  },
  {
    id: 'back_pullups',
    name: 'Pull-ups / Chin-ups',
    muscleGroup: 'back',
    type: 'bodyweight',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 8,
    description: 'Essential vertical pulling movement for wide V-taper lats.',
  },
  {
    id: 'back_lat_pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'back',
    type: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Controlled vertical pull targeting lat width and teres major.',
  },
  {
    id: 'back_seated_cable_row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    type: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Horizontal cable pull targeting rhomboids, mid-traps, and lats.',
  },
  {
    id: 'back_face_pulls',
    name: 'Rope Face Pulls',
    muscleGroup: 'back',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 15,
    description: 'Crucial for shoulder health, external rotators, and rear delts.',
  },
  {
    id: 'back_single_arm_db_row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'back',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Unilateral back work to eliminate imbalances and maximize stretch.',
  },

  // LEGS (8)
  {
    id: 'legs_barbell_squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'legs',
    type: 'compound',
    difficulty: 'advanced',
    defaultSets: 4,
    defaultReps: 6,
    description: 'The golden standard lower body exercise for massive quad and glute power.',
  },
  {
    id: 'legs_romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'legs',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Hinge movement emphasizing hamstring stretch and glute hypertrophy.',
  },
  {
    id: 'legs_leg_press',
    name: '45-Degree Leg Press',
    muscleGroup: 'legs',
    type: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Safe heavy quad and glute loading without spinal axial compression.',
  },
  {
    id: 'legs_bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'legs',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Intense unilateral challenge building stability and single-leg strength.',
  },
  {
    id: 'legs_leg_extension',
    name: 'Leg Extension Machine',
    muscleGroup: 'legs',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Quad isolation locking out rectus femoris at peak contraction.',
  },
  {
    id: 'legs_hamstring_curl',
    name: 'Lying Hamstring Leg Curl',
    muscleGroup: 'legs',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Direct knee-flexion hamstring isolation for bulletproof legs.',
  },
  {
    id: 'legs_calf_raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'legs',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 4,
    defaultReps: 15,
    description: 'Full ankle plantarflexion for gastrocnemius diamond calves.',
  },
  {
    id: 'legs_walking_lunges',
    name: 'Dumbbell Walking Lunges',
    muscleGroup: 'legs',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Dynamic lower body burn improving athletic stride and balance.',
  },

  // SHOULDERS (6)
  {
    id: 'shoulders_overhead_press',
    name: 'Standing Overhead Barbell Press (OHP)',
    muscleGroup: 'shoulders',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 6,
    description: 'Strict vertical press for boulder shoulders and core rigidity.',
  },
  {
    id: 'shoulders_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'shoulders',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 4,
    defaultReps: 12,
    description: 'Essential exercise for building 3D capped side delts.',
  },
  {
    id: 'shoulders_arnold_press',
    name: 'Arnold Dumbbell Press',
    muscleGroup: 'shoulders',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Rotational pressing engaging anterior, lateral delts through fluid path.',
  },
  {
    id: 'shoulders_rear_delt_fly',
    name: 'Reverse Pec Deck / Rear Delt Fly',
    muscleGroup: 'shoulders',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 15,
    description: 'Isolates the posterior deltoid head for complete shoulder balance.',
  },
  {
    id: 'shoulders_front_raise',
    name: 'Dumbbell Front Raise',
    muscleGroup: 'shoulders',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Strict front delt isolation with controlled tempo.',
  },
  {
    id: 'shoulders_upright_row',
    name: 'EZ-Bar Upright Row',
    muscleGroup: 'shoulders',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Targets lateral delts and upper trapezius with elbow-high lead.',
  },

  // ARMS (7)
  {
    id: 'arms_barbell_curl',
    name: 'Standing Barbell Bicep Curl',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Classic mass builder for bicep peaks and forearm flexion.',
  },
  {
    id: 'arms_incline_db_curl',
    name: 'Incline Dumbbell Curl',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Deep stretch on the long head of the bicep from an angled bench.',
  },
  {
    id: 'arms_hammer_curl',
    name: 'Neutral Grip Hammer Curl',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Builds the brachialis and brachioradialis for forearm thickness.',
  },
  {
    id: 'arms_rope_pushdown',
    name: 'Triceps Rope Pushdown',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Spreading the ropes at the bottom locks out lateral tricep head.',
  },
  {
    id: 'arms_skull_crushers',
    name: 'EZ-Bar Skull Crushers',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Overhead tricep extension targeting the fleshy long head.',
  },
  {
    id: 'arms_close_grip_bench',
    name: 'Close-Grip Barbell Bench Press',
    muscleGroup: 'arms',
    type: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 8,
    description: 'Heavy compound pushing overloading triceps with shoulder-width grip.',
  },
  {
    id: 'arms_preacher_curl',
    name: 'Preacher Bench Curl',
    muscleGroup: 'arms',
    type: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Strict arm brace eliminating momentum for short head bicep peak.',
  },

  // CORE (6)
  {
    id: 'core_plank',
    name: 'Isometric Core Plank',
    muscleGroup: 'core',
    type: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 45, // seconds counted as reps
    description: 'Foundational anti-extension core brace for transverse abdominis.',
  },
  {
    id: 'core_hanging_leg_raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'core',
    type: 'bodyweight',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Hanging from a bar, curling pelvis up to target lower abs and hip flexors.',
  },
  {
    id: 'core_russian_twists',
    name: 'Russian Twists',
    muscleGroup: 'core',
    type: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 20,
    description: 'Rotational oblique exercise for torso twist power.',
  },
  {
    id: 'core_ab_wheel',
    name: 'Ab Wheel Rollout',
    muscleGroup: 'core',
    type: 'bodyweight',
    difficulty: 'advanced',
    defaultSets: 3,
    defaultReps: 10,
    description: 'Extreme anti-extension tension strengthening deep core fibers.',
  },
  {
    id: 'core_cable_woodchopper',
    name: 'Cable Woodchopper',
    muscleGroup: 'core',
    type: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    description: 'Functional diagonal core rotation against steady cable resistance.',
  },
  {
    id: 'core_bicycle_crunches',
    name: 'Bicycle Crunches',
    muscleGroup: 'core',
    type: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 20,
    description: 'Simultaneous rectus abdominis crunch and oblique cross-activation.',
  },

  // CARDIO & CONDITIONING (5)
  {
    id: 'cardio_treadmill_incline',
    name: 'Incline Treadmill Power Walk',
    muscleGroup: 'cardio',
    type: 'cardio',
    difficulty: 'beginner',
    defaultSets: 1,
    defaultReps: 20, // 20 mins
    description: '12% incline, 4.5 km/h for low-impact steady-state fat burning.',
  },
  {
    id: 'cardio_jump_rope',
    name: 'Speed Jump Rope Intervals',
    muscleGroup: 'cardio',
    type: 'cardio',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 100, // 100 skips
    description: 'Fierce cardio agility, calf endurance, and rhythm training.',
  },
  {
    id: 'cardio_rowing_machine',
    name: 'Concept2 Rowing Ergometer',
    muscleGroup: 'cardio',
    type: 'cardio',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 500, // 500m
    description: 'Full-body cardiovascular burn engaging legs, core, and back.',
  },
  {
    id: 'cardio_bike_sprints',
    name: 'Stationary Assault Bike Sprints',
    muscleGroup: 'cardio',
    type: 'cardio',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 30, // 30 sec sprints
    description: 'High-intensity interval training pushing VO2 max to the limit.',
  },
  {
    id: 'cardio_burpees',
    name: 'Explosive Chest-to-Floor Burpees',
    muscleGroup: 'cardio',
    type: 'bodyweight',
    difficulty: 'advanced',
    defaultSets: 3,
    defaultReps: 15,
    description: 'Full body conditioning combining push-up, squat thrust, and jump.',
  },
];

export const SPLIT_PRESETS: WeeklySplitPreset[] = [
  {
    id: 'ppl_6day',
    name: 'Push / Pull / Legs (PPL)',
    tagline: 'High Frequency & Hypertrophy',
    description: '6 training days + 1 rest day. Ideal for intermediate to advanced lifters aiming for maximum muscle growth.',
    days: [
      {
        dayOfWeek: 1, // Mon
        dayName: 'Monday',
        planName: 'Push A: Chest, Shoulders & Triceps',
        isRestDay: false,
        exerciseIds: ['chest_bench_press', 'chest_incline_db_press', 'shoulders_lateral_raise', 'shoulders_overhead_press', 'arms_rope_pushdown'],
      },
      {
        dayOfWeek: 2, // Tue
        dayName: 'Tuesday',
        planName: 'Pull A: Back, Traps & Biceps',
        isRestDay: false,
        exerciseIds: ['back_deadlift', 'back_lat_pulldown', 'back_barbell_row', 'back_face_pulls', 'arms_barbell_curl'],
      },
      {
        dayOfWeek: 3, // Wed
        dayName: 'Wednesday',
        planName: 'Legs A: Quads, Hamstrings & Calves',
        isRestDay: false,
        exerciseIds: ['legs_barbell_squat', 'legs_romanian_deadlift', 'legs_leg_press', 'legs_calf_raise', 'core_plank'],
      },
      {
        dayOfWeek: 4, // Thu
        dayName: 'Thursday',
        planName: 'Push B: Chest & Shoulder Focus',
        isRestDay: false,
        exerciseIds: ['chest_incline_db_press', 'chest_cable_fly', 'shoulders_arnold_press', 'chest_dips', 'arms_skull_crushers'],
      },
      {
        dayOfWeek: 5, // Fri
        dayName: 'Friday',
        planName: 'Pull B: Lat Width & Forearms',
        isRestDay: false,
        exerciseIds: ['back_pullups', 'back_single_arm_db_row', 'back_seated_cable_row', 'arms_incline_db_curl', 'arms_hammer_curl'],
      },
      {
        dayOfWeek: 6, // Sat
        dayName: 'Saturday',
        planName: 'Legs B & Core Conditioning',
        isRestDay: false,
        exerciseIds: ['legs_bulgarian_split_squat', 'legs_leg_extension', 'legs_hamstring_curl', 'core_hanging_leg_raise', 'cardio_jump_rope'],
      },
      {
        dayOfWeek: 0, // Sun
        dayName: 'Sunday',
        planName: 'Active Recovery & Mobility',
        isRestDay: true,
        exerciseIds: [],
      },
    ],
  },
  {
    id: 'upper_lower_4day',
    name: 'Upper / Lower Split',
    tagline: 'Balanced Strength & Recovery',
    description: '4 training days + 3 rest days. Perfect for busy students balancing heavy study loads and gym progress.',
    days: [
      {
        dayOfWeek: 1, // Mon
        dayName: 'Monday',
        planName: 'Upper Body Power',
        isRestDay: false,
        exerciseIds: ['chest_bench_press', 'back_barbell_row', 'shoulders_overhead_press', 'back_lat_pulldown', 'arms_barbell_curl'],
      },
      {
        dayOfWeek: 2, // Tue
        dayName: 'Tuesday',
        planName: 'Lower Body Strength',
        isRestDay: false,
        exerciseIds: ['legs_barbell_squat', 'legs_romanian_deadlift', 'legs_leg_extension', 'legs_calf_raise', 'core_plank'],
      },
      {
        dayOfWeek: 3, // Wed
        dayName: 'Wednesday',
        planName: 'Rest & Mental Re-charge',
        isRestDay: true,
        exerciseIds: [],
      },
      {
        dayOfWeek: 4, // Thu
        dayName: 'Thursday',
        planName: 'Upper Body Hypertrophy',
        isRestDay: false,
        exerciseIds: ['chest_incline_db_press', 'back_pullups', 'shoulders_lateral_raise', 'arms_rope_pushdown', 'arms_hammer_curl'],
      },
      {
        dayOfWeek: 5, // Fri
        dayName: 'Friday',
        planName: 'Lower Body & Core',
        isRestDay: false,
        exerciseIds: ['legs_leg_press', 'legs_bulgarian_split_squat', 'legs_hamstring_curl', 'core_hanging_leg_raise', 'cardio_treadmill_incline'],
      },
      {
        dayOfWeek: 6, // Sat
        dayName: 'Saturday',
        planName: 'Weekend Rest Day',
        isRestDay: true,
        exerciseIds: [],
      },
      {
        dayOfWeek: 0, // Sun
        dayName: 'Sunday',
        planName: 'Sunday Prep & Rest',
        isRestDay: true,
        exerciseIds: [],
      },
    ],
  },
  {
    id: 'full_body_3day',
    name: 'Full Body (3 Days/Week)',
    tagline: 'Maximum Efficiency for Beginners',
    description: '3 full-body sessions hitting compound lifts every 48 hours with ample rest.',
    days: [
      {
        dayOfWeek: 1, // Mon
        dayName: 'Monday',
        planName: 'Full Body A: Squat & Bench Foundation',
        isRestDay: false,
        exerciseIds: ['legs_barbell_squat', 'chest_bench_press', 'back_lat_pulldown', 'shoulders_lateral_raise', 'core_plank'],
      },
      {
        dayOfWeek: 2, // Tue
        dayName: 'Tuesday',
        planName: 'Rest & Recovery',
        isRestDay: true,
        exerciseIds: [],
      },
      {
        dayOfWeek: 3, // Wed
        dayName: 'Wednesday',
        planName: 'Full Body B: Deadlift & Overhead Press',
        isRestDay: false,
        exerciseIds: ['back_deadlift', 'shoulders_overhead_press', 'legs_leg_press', 'chest_cable_fly', 'arms_barbell_curl'],
      },
      {
        dayOfWeek: 4, // Thu
        dayName: 'Thursday',
        planName: 'Rest & Recovery',
        isRestDay: true,
        exerciseIds: [],
      },
      {
        dayOfWeek: 5, // Fri
        dayName: 'Friday',
        planName: 'Full Body C: Lunge, Row & Arms',
        isRestDay: false,
        exerciseIds: ['legs_walking_lunges', 'back_barbell_row', 'chest_incline_db_press', 'arms_rope_pushdown', 'core_russian_twists'],
      },
      {
        dayOfWeek: 6, // Sat
        dayName: 'Saturday',
        planName: 'Active Weekend',
        isRestDay: true,
        exerciseIds: [],
      },
      {
        dayOfWeek: 0, // Sun
        dayName: 'Sunday',
        planName: 'Sunday Reset',
        isRestDay: true,
        exerciseIds: [],
      },
    ],
  },
  {
    id: 'bro_split_5day',
    name: 'Classic Bro Split (5 Days)',
    tagline: 'Dedicated Muscle Group Focus',
    description: 'Dedicated focus per muscle group: Chest, Back, Shoulders, Legs, Arms. Legendary pump!',
    days: [
      {
        dayOfWeek: 1, // Mon
        dayName: 'Monday',
        planName: 'International Chest Day',
        isRestDay: false,
        exerciseIds: ['chest_bench_press', 'chest_incline_db_press', 'chest_cable_fly', 'chest_dips', 'chest_pushups'],
      },
      {
        dayOfWeek: 2, // Tue
        dayName: 'Tuesday',
        planName: 'Thick Back Day',
        isRestDay: false,
        exerciseIds: ['back_deadlift', 'back_pullups', 'back_barbell_row', 'back_seated_cable_row', 'back_face_pulls'],
      },
      {
        dayOfWeek: 3, // Wed
        dayName: 'Wednesday',
        planName: 'Boulder Shoulders & Core',
        isRestDay: false,
        exerciseIds: ['shoulders_overhead_press', 'shoulders_lateral_raise', 'shoulders_arnold_press', 'shoulders_rear_delt_fly', 'core_hanging_leg_raise'],
      },
      {
        dayOfWeek: 4, // Thu
        dayName: 'Thursday',
        planName: 'Brutal Leg Day',
        isRestDay: false,
        exerciseIds: ['legs_barbell_squat', 'legs_romanian_deadlift', 'legs_leg_press', 'legs_leg_extension', 'legs_calf_raise'],
      },
      {
        dayOfWeek: 5, // Fri
        dayName: 'Friday',
        planName: 'Armageddon: Biceps & Triceps',
        isRestDay: false,
        exerciseIds: ['arms_barbell_curl', 'arms_close_grip_bench', 'arms_incline_db_curl', 'arms_skull_crushers', 'arms_hammer_curl'],
      },
      {
        dayOfWeek: 6, // Sat
        dayName: 'Saturday',
        planName: 'Cardio & Abs Conditioning',
        isRestDay: false,
        exerciseIds: ['cardio_jump_rope', 'cardio_treadmill_incline', 'core_plank', 'core_ab_wheel'],
      },
      {
        dayOfWeek: 0, // Sun
        dayName: 'Sunday',
        planName: 'Sunday Rest & Feast',
        isRestDay: true,
        exerciseIds: [],
      },
    ],
  },
];

export const AI_CHARACTER_FEEDBACK = {
  goku: [
    "WOOHOO! That was an incredible workout! Your muscles are screaming, which means you're breaking your limits! Push even heavier next time!",
    "Haha! I can feel your Ki rising from here! Every single rep you just did brought you closer to Super Saiyan level! Eat a feast and rest up!",
    "Great session! But don't get complacent—there's always someone stronger out there. Tomorrow, we go beyond 100%!",
    "That volume was monstrous! Even Master Roshi would be proud of that discipline. Keep your head high, warrior!",
  ],
  asta: [
    "NOT YET! NOT DONE YET! MY MAGIC IS NEVER GIVING UP! That pump was unbelievable! Keep swinging your swords!",
    "YEEEEAAAH! Look at that volume! We don't need magic when we have iron and sweat! 1000 push-ups next? Just kidding, rest up brother!",
    "You pushed through the burn! That's what a Black Bull does! Never back down, no matter how heavy the weights feel!",
    "SURPASS YOUR LIMITS! Right here, right now! You locked in every single rep with pure grit. I'm hyped!",
  ],
  naruto: [
    "Believe it! That was pure ninja discipline! When you don't give up on your sets, that's your true nindo—your ninja way!",
    "Dattebayo! You crushed that workout like a Giant Rasengan! Let's hit the ramen shop and refuel those muscles!",
    "Hard work beats raw talent when talent doesn't work hard. Guy Sensei and Rock Lee would shed tears of youth over this session!",
    "Look at that streak! Step by step, rep by rep, you're on the path to becoming the Hokage of your own life!",
  ],
  saitama: [
    "Oh, you finished already? Nice. Keep that up every single day and maybe your hair will start falling out too. Just don't skip AC in summer.",
    "Good job. 100 pushups, 100 situps, 100 squats, and now your gym weights. Just make sure you don't miss the grocery bargain day.",
    "Not bad at all. You actually broke a sweat. Remember, the real battle is just showing up even when you really want to stay in bed reading manga.",
    "Solid workout. Now go eat a banana or some hot pot. Consistency is all that matters.",
  ],
};
