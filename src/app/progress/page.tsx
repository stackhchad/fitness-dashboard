import { Suspense } from 'react';
import { getWeeklyProgress, getPersonalRecords } from '@/lib/data/progress';
import ProgressPageClient from '@/components/progress/ProgressPageClient';

export default async function ProgressPage() {
  const [weekly, records] = await Promise.all([
    getWeeklyProgress(12),
    getPersonalRecords(),
  ]);
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense>
        <ProgressPageClient weekly={weekly} records={records} />
      </Suspense>
    </div>
  );
}
