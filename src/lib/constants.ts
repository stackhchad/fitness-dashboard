export const WORKOUT_TYPES = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Sports', 'Other'] as const;
export type WorkoutType = typeof WORKOUT_TYPES[number];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio',
] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const INTENSITY_LEVELS = ['Low', 'Moderate', 'High', 'Max'] as const;
export type IntensityLevel = typeof INTENSITY_LEVELS[number];

export const GOAL_CATEGORIES = [
  'Strength', 'Cardio', 'Weight', 'Body Composition', 'Flexibility', 'Habit', 'Other',
] as const;
export type GoalCategory = typeof GOAL_CATEGORIES[number];
