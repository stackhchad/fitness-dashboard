import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { calcGoalProgress, calcSchedulePct, calcGoalStatus } from '@/lib/utils';
import { GoalWithProgress } from '@/types';

export async function getGoalsWithProgress(): Promise<GoalWithProgress[]> {
  const userId = getUserId();
  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

  return goals.map(g => {
    const progressPct = g.currentValue !== null
      ? calcGoalProgress(g.startValue, g.targetValue, g.currentValue, g.higherIsBetter)
      : 0;
    const schedulePct = calcSchedulePct(g.startDate, g.targetDate);
    const status = calcGoalStatus(progressPct, schedulePct, g.currentValue, g.targetValue, g.higherIsBetter);
    const daysRemaining = Math.max(0, Math.ceil((g.targetDate.getTime() - Date.now()) / 86400000));

    // Expected value at this point in the schedule
    const range = g.targetValue - g.startValue;
    const expectedValue = g.startValue + range * schedulePct;

    const aheadBehindPct = progressPct - schedulePct;

    return {
      ...g,
      startDate: g.startDate.toISOString(),
      targetDate: g.targetDate.toISOString(),
      completedAt: g.completedAt?.toISOString() ?? null,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      progressPct,
      schedulePct,
      expectedValue,
      aheadBehindPct,
      status,
      daysRemaining,
    };
  });
}
