import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { PerformanceEvaluation } from '@/types';
import PerformancePageClient from '@/components/performance/PerformancePageClient';

async function getEvaluations(): Promise<PerformanceEvaluation[]> {
  const userId = getUserId();
  const rows = await prisma.performanceEvaluation.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return rows.map(r => ({
    id:               r.id,
    userId:           r.userId,
    month:            r.month,
    year:             r.year,
    strengthScore:    r.strengthScore,
    cardioScore:      r.cardioScore,
    flexibilityScore: r.flexibilityScore,
    nutritionScore:   r.nutritionScore,
    sleepScore:       r.sleepScore,
    recoveryScore:    r.recoveryScore,
    overallScore:     r.overallScore,
    comments:         r.comments,
    createdAt:        r.createdAt.toISOString(),
    updatedAt:        r.updatedAt.toISOString(),
  }));
}

export default async function PerformancePage() {
  const evals = await getEvaluations();
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense>
        <PerformancePageClient initialData={evals} />
      </Suspense>
    </div>
  );
}
