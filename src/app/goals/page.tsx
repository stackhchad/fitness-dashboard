import { Suspense } from 'react';
import { getGoalsWithProgress } from '@/lib/data/goals';
import GoalsPageClient from '@/components/goals/GoalsPageClient';

export default async function GoalsPage() {
  const goals = await getGoalsWithProgress();
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense>
        <GoalsPageClient initialGoals={goals} />
      </Suspense>
    </div>
  );
}
