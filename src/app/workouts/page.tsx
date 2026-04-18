import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import WorkoutPageClient from '@/components/workouts/WorkoutPageClient';

async function getWorkouts() {
  const userId = await getUserId();
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 500,
  });
}

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();
  // Serialise dates for client
  const data = workouts.map(w => ({
    ...w,
    date: w.date.toISOString(),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Suspense>
        <WorkoutPageClient initialData={data} />
      </Suspense>
    </div>
  );
}
