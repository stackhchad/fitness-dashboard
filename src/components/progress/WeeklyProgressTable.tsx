'use client';

import { WeeklyProgress } from '@/types';

interface Props { weekly: WeeklyProgress[] }

function statusBadge(adherence: number) {
  if (adherence >= 0.9) return <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">Excellent</span>;
  if (adherence >= 0.7) return <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium">On Track</span>;
  if (adherence >= 0.5) return <span className="rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs font-medium">Below Target</span>;
  if (adherence === 0)  return <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs font-medium">No Data</span>;
  return <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">Poor</span>;
}

export default function WeeklyProgressTable({ weekly }: Props) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Week</th>
            <th className="px-3 py-3 text-left font-medium">Start</th>
            <th className="px-3 py-3 text-center font-medium">Done / Planned</th>
            <th className="px-3 py-3 text-center font-medium">Adherence</th>
            <th className="px-3 py-3 text-right font-medium">Volume (kg)</th>
            <th className="px-3 py-3 text-right font-medium hidden md:table-cell">Avg Session (min)</th>
            <th className="px-3 py-3 text-right font-medium hidden lg:table-cell">Avg RPE</th>
            <th className="px-3 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[...weekly].reverse().map((w, i) => (
            <tr key={w.weekNumber} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              <td className="px-4 py-3 font-medium text-muted-foreground">W{w.weekNumber}</td>
              <td className="px-3 py-3">{w.weekStart}</td>
              <td className="px-3 py-3 text-center">
                {w.sessionsDone} / {w.sessionsPlanned}
              </td>
              <td className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(w.adherencePct * 100, 100)}%` }}
                    />
                  </div>
                  <span>{Math.round(w.adherencePct * 100)}%</span>
                </div>
              </td>
              <td className="px-3 py-3 text-right font-mono">
                {w.totalVolumeKg.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-right hidden md:table-cell">
                {w.sessionsDone > 0 ? w.avgSessionMin.toFixed(0) : '—'}
              </td>
              <td className="px-3 py-3 text-right hidden lg:table-cell">
                {w.avgRpe > 0 ? w.avgRpe.toFixed(1) : '—'}
              </td>
              <td className="px-3 py-3">{statusBadge(w.adherencePct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
