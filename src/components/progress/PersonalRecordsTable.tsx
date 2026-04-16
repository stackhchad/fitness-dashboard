'use client';

import { PersonalRecord } from '@/types';

interface Props { records: PersonalRecord[] }

export default function PersonalRecordsTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
        No personal records yet. Log workouts with weight to start tracking your bests.
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Exercise</th>
            <th className="px-3 py-3 text-right font-medium">Best Weight (kg)</th>
            <th className="px-3 py-3 text-right font-medium">Best Reps</th>
            <th className="px-3 py-3 text-right font-medium">Est. 1RM (kg)</th>
            <th className="px-3 py-3 text-right font-medium hidden md:table-cell">Total Sets</th>
            <th className="px-3 py-3 text-right font-medium hidden lg:table-cell">Last Trained</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map((r, i) => (
            <tr key={r.exercise} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              <td className="px-4 py-3 font-semibold">{r.exercise}</td>
              <td className="px-3 py-3 text-right font-mono font-bold text-blue-600">
                {r.bestWeightKg.toFixed(1)}
              </td>
              <td className="px-3 py-3 text-right">{r.bestReps}</td>
              <td className="px-3 py-3 text-right font-mono font-bold text-indigo-600">
                {r.estOneRepMax.toFixed(1)}
              </td>
              <td className="px-3 py-3 text-right hidden md:table-cell text-muted-foreground">
                {r.totalSets}
              </td>
              <td className="px-3 py-3 text-right hidden lg:table-cell text-muted-foreground">
                {r.lastTrained}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
