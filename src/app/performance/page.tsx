import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import PerformancePageClient from '@/components/performance/PerformancePageClient';

async function getEvaluations() {
  const userId = getUserId();
  return prisma.performanceEvaluation.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
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
