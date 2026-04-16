import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { calcBMI } from '@/lib/utils';
import MeasurementsPageClient from '@/components/measurements/MeasurementsPageClient';

async function getMeasurements() {
  const userId = getUserId();
  const rows = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  return rows.map(m => ({
    ...m,
    date: m.date.toISOString(),
    createdAt: m.createdAt.toISOString(),
    bmi: m.weightKg && m.heightCm ? calcBMI(m.weightKg, m.heightCm) : null,
  }));
}

export default async function MeasurementsPage() {
  const data = await getMeasurements();
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Suspense>
        <MeasurementsPageClient initialData={data} />
      </Suspense>
    </div>
  );
}
