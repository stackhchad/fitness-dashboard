import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const hm = heightCm / 100;
  return Math.round((weightKg / (hm * hm)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

/** Returns 0–1 progress towards target. Handles both directions. */
export function calcGoalProgress(
  startValue: number,
  targetValue: number,
  currentValue: number,
  higherIsBetter: boolean,
): number {
  const total = Math.abs(targetValue - startValue);
  if (total === 0) return 1;
  const made = higherIsBetter
    ? currentValue - startValue
    : startValue - currentValue;
  return Math.min(Math.max(made / total, 0), 1);
}

/** Returns 0–1 fraction of time elapsed between startDate and targetDate */
export function calcSchedulePct(startDate: Date, targetDate: Date, now = new Date()): number {
  const total = targetDate.getTime() - startDate.getTime();
  if (total <= 0) return 1;
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(Math.max(elapsed / total, 0), 1);
}

export function calcGoalStatus(
  progressPct: number,
  schedulePct: number,
  currentValue: number | null,
  targetValue: number,
  higherIsBetter: boolean,
): 'Completed' | 'Ahead' | 'On Track' | 'Behind' | 'No Data' {
  if (currentValue === null) return 'No Data';
  const completed = higherIsBetter
    ? currentValue >= targetValue
    : currentValue <= targetValue;
  if (completed) return 'Completed';
  const diff = progressPct - schedulePct;
  if (diff >= 0.05)  return 'Ahead';
  if (diff >= -0.1)  return 'On Track';
  return 'Behind';
}

export function calcOverallScore(scores: number[]): number {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10) / 10;
}

export function formatDate(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
