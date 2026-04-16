// ─── Prisma model shapes (subset safe to expose to client) ──────────────────

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string;          // ISO string after JSON serialisation
  sessionId: string;
  isSessionStart: boolean;
  workoutType: string | null;
  muscleGroup: string | null;
  exercise: string | null;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  durationMin: number | null;
  notes: string | null;
  rpe: number | null;
  intensity: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  category: string;
  description: string;
  startValue: number;
  targetValue: number;
  currentValue: number | null;
  startDate: string;
  targetDate: string;
  unit: string | null;
  higherIsBetter: boolean;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceEvaluation {
  id: string;
  userId: string;
  month: number;
  year: number;
  strengthScore: number;
  cardioScore: number;
  flexibilityScore: number;
  nutritionScore: number;
  sleepScore: number;
  recoveryScore: number;
  overallScore: number;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Enriched / computed types ───────────────────────────────────────────────

export interface GoalWithProgress extends Goal {
  progressPct: number;       // 0–1
  schedulePct: number;       // 0–1 — where on the timeline we should be
  expectedValue: number;
  aheadBehindPct: number;    // positive = ahead
  status: 'Completed' | 'Ahead' | 'On Track' | 'Behind' | 'No Data';
  daysRemaining: number;
}

export interface MeasurementWithBMI extends BodyMeasurement {
  bmi: number | null;
}

export interface PersonalRecord {
  exercise: string;
  bestWeightKg: number;
  bestReps: number;
  estOneRepMax: number;
  totalSets: number;
  lastTrained: string;
}

export interface WeeklyProgress {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  sessionsPlanned: number;
  sessionsDone: number;
  adherencePct: number;
  totalVolumeKg: number;
  totalDurationMin: number;
  avgSessionMin: number;
  avgRpe: number;
}

// ─── API response envelope ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}
