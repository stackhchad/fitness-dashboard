import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { startOfWeek, endOfWeek, subWeeks, eachWeekOfInterval, format } from 'date-fns';
import { WeeklyProgress, PersonalRecord } from '@/types';

export async function getWeeklyProgress(weeks = 12): Promise<WeeklyProgress[]> {
  const userId = getUserId();
  const now = new Date();
  const start = startOfWeek(subWeeks(now, weeks - 1), { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
  });

  const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

  return weekStarts.map((ws, i) => {
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const weekLogs = logs.filter(l => l.date >= ws && l.date <= we);
    const sessionLogs = weekLogs.filter(l => l.isSessionStart);
    const sessionsPlanned = 5;
    const sessionsDone = sessionLogs.length;

    const totalVolume = weekLogs.reduce((sum, l) => {
      return sum + (l.sets ?? 0) * (l.reps ?? 0) * (l.weightKg ?? 0);
    }, 0);

    const totalDuration = weekLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
    const avgDuration = sessionsDone > 0 ? totalDuration / sessionsDone : 0;

    const rpeVals = weekLogs.map(l => l.rpe).filter((v): v is number => v !== null && v !== undefined);
    const avgRpe = rpeVals.length > 0 ? rpeVals.reduce((a, b) => a + b, 0) / rpeVals.length : 0;

    return {
      weekNumber: i + 1,
      weekStart: format(ws, 'dd/MM/yyyy'),
      weekEnd: format(we, 'dd/MM/yyyy'),
      sessionsPlanned,
      sessionsDone,
      adherencePct: sessionsPlanned > 0 ? sessionsDone / sessionsPlanned : 0,
      totalVolumeKg: Math.round(totalVolume),
      totalDurationMin: totalDuration,
      avgSessionMin: Math.round(avgDuration * 10) / 10,
      avgRpe: Math.round(avgRpe * 10) / 10,
    };
  });
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const userId = getUserId();
  const logs = await prisma.workoutLog.findMany({
    where: { userId, exercise: { not: null }, weightKg: { gt: 0 } },
    orderBy: { date: 'asc' },
  });

  const byExercise = new Map<string, typeof logs>();
  for (const log of logs) {
    if (!log.exercise) continue;
    if (!byExercise.has(log.exercise)) byExercise.set(log.exercise, []);
    byExercise.get(log.exercise)!.push(log);
  }

  const records: PersonalRecord[] = [];
  for (const [exercise, exLogs] of byExercise) {
    const bestWeightKg = Math.max(...exLogs.map(l => l.weightKg ?? 0));
    const atBest = exLogs.filter(l => l.weightKg === bestWeightKg);
    const bestReps = Math.max(...atBest.map(l => l.reps ?? 0));
    const estOneRepMax = bestReps > 0
      ? Math.round(bestWeightKg * (1 + bestReps / 30) * 10) / 10
      : bestWeightKg;
    const totalSets = exLogs.filter(l => (l.sets ?? 0) > 0).length;
    const lastLog = exLogs[exLogs.length - 1];

    records.push({
      exercise,
      bestWeightKg,
      bestReps,
      estOneRepMax,
      totalSets,
      lastTrained: format(lastLog.date, 'dd/MM/yyyy'),
    });
  }

  records.sort((a, b) => b.bestWeightKg - a.bestWeightKg);
  return records;
}
