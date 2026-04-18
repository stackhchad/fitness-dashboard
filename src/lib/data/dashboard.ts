import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { calcBMI, calcGoalProgress, calcSchedulePct, calcGoalStatus } from '@/lib/utils';
import { startOfWeek, subWeeks, endOfWeek, eachWeekOfInterval, format } from 'date-fns';

export async function getDashboardData() {
  const userId = await getUserId();
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [
    totalSessions,
    thisWeekSessions,
    latestMeasurement,
    allGoals,
    recentLogs,
    lastEval,
  ] = await Promise.all([
    prisma.workoutLog.count({ where: { userId, isSessionStart: true } }),
    prisma.workoutLog.count({ where: { userId, isSessionStart: true, date: { gte: startOfWeek(now, { weekStartsOn: 1 }) } } }),
    prisma.bodyMeasurement.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.workoutLog.findMany({ where: { userId, date: { gte: subWeeks(now, 12) } }, orderBy: { date: 'asc' } }),
    prisma.performanceEvaluation.findFirst({ where: { userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
  ]);

  // Weight history (last 12 measurements)
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    take: 24,
  });
  const weightHistory = measurements
    .filter(m => m.weightKg)
    .map(m => ({
      date: format(m.date, 'dd/MM/yy'),
      weight: m.weightKg!,
      bmi: m.heightCm ? calcBMI(m.weightKg!, m.heightCm) : null,
    }));

  // Total volume
  const totalVolume = recentLogs.reduce((s, l) => s + (l.sets ?? 0) * (l.reps ?? 0) * (l.weightKg ?? 0), 0);

  // Goals enriched
  const goalsWithProgress = allGoals.map(g => {
    const progressPct = g.currentValue !== null
      ? calcGoalProgress(g.startValue, g.targetValue, g.currentValue, g.higherIsBetter)
      : 0;
    const schedulePct = calcSchedulePct(g.startDate, g.targetDate);
    const status = calcGoalStatus(progressPct, schedulePct, g.currentValue, g.targetValue, g.higherIsBetter);
    return { ...g, progressPct, schedulePct, status };
  });

  // Weekly adherence for chart (last 12 weeks)
  const ws12 = startOfWeek(subWeeks(now, 11), { weekStartsOn: 1 });
  const weekStarts = eachWeekOfInterval({ start: ws12, end: now }, { weekStartsOn: 1 });
  const weeklyAdherence = weekStarts.map(ws => {
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const done = recentLogs.filter(l => l.isSessionStart && l.date >= ws && l.date <= we).length;
    return { week: format(ws, 'dd/MM'), sessions: done, adherence: Math.round(done / 5 * 100) };
  });

  // Weekly volume for chart
  const weeklyVolume = weekStarts.map(ws => {
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const vol = recentLogs
      .filter(l => l.date >= ws && l.date <= we)
      .reduce((s, l) => s + (l.sets ?? 0) * (l.reps ?? 0) * (l.weightKg ?? 0), 0);
    return { week: format(ws, 'dd/MM'), volume: Math.round(vol) };
  });

  return {
    totalSessions,
    thisWeekSessions,
    latestWeight: latestMeasurement?.weightKg ?? null,
    latestBMI: latestMeasurement?.weightKg && latestMeasurement?.heightCm
      ? calcBMI(latestMeasurement.weightKg, latestMeasurement.heightCm)
      : null,
    totalVolumeKg: Math.round(totalVolume),
    activeGoals: goalsWithProgress.filter(g => g.status !== 'Completed').length,
    completedGoals: goalsWithProgress.filter(g => g.status === 'Completed').length,
    latestOverallScore: lastEval?.overallScore ?? null,
    weightHistory,
    weeklyAdherence,
    weeklyVolume,
    recentGoals: goalsWithProgress.slice(0, 6),
  };
}
