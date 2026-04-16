'use client';

import { useState } from 'react';
import { WorkoutLog } from '@/types';

interface Props {
  workouts: WorkoutLog[];
  onEdit: (w: WorkoutLog) => void;
  onDelete: (id: string) => void;
}

const PAGE = 20;

function rpeColor(rpe: number | null) {
  if (!rpe) return '';
  if (rpe >= 9) return 'text-red-600 font-bold';
  if (rpe >= 7) return 'text-orange-500 font-medium';
  return 'text-green-600';
}

export default function WorkoutTable({ workouts, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const pages = Math.ceil(workouts.length / PAGE);
  const slice = workouts.slice(page * PAGE, (page + 1) * PAGE);

  function handleDelete(id: string) {
    if (confirmDel !== id) {
      setConfirmDel(id);
      setTimeout(() => setConfirmDel(c => c === id ? null : c), 3000);
      return;
    }
    onDelete(id);
    setConfirmDel(null);
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
        No workout entries match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-3 py-3 text-left font-medium">Exercise</th>
              <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Type</th>
              <th className="px-3 py-3 text-center font-medium">Sets</th>
              <th className="px-3 py-3 text-center font-medium">Reps</th>
              <th className="px-3 py-3 text-right font-medium">Weight</th>
              <th className="px-3 py-3 text-right font-medium hidden lg:table-cell">Vol (kg)</th>
              <th className="px-3 py-3 text-center font-medium hidden lg:table-cell">RPE</th>
              <th className="px-3 py-3 text-left font-medium hidden xl:table-cell">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {slice.map((w, i) => (
              <tr key={w.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                  {new Date(w.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  {w.isSessionStart && <span className="ml-1 text-indigo-500" title="Session start">●</span>}
                </td>
                <td className="px-3 py-2.5 font-medium">{w.exercise ?? '—'}</td>
                <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{w.workoutType ?? '—'}</td>
                <td className="px-3 py-2.5 text-center">{w.sets ?? '—'}</td>
                <td className="px-3 py-2.5 text-center">{w.reps ?? '—'}</td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {w.weightKg ? `${w.weightKg} kg` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono hidden lg:table-cell">
                  {w.sets && w.reps && w.weightKg
                    ? (w.sets * w.reps * w.weightKg).toLocaleString()
                    : '—'}
                </td>
                <td className={`px-3 py-2.5 text-center hidden lg:table-cell ${rpeColor(w.rpe)}`}>
                  {w.rpe ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs truncate max-w-[140px] hidden xl:table-cell">
                  {w.notes ?? ''}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(w)}
                      className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                    <button onClick={() => handleDelete(w.id)}
                      className={`text-xs ${confirmDel === w.id ? 'text-red-600 font-semibold' : 'text-muted-foreground hover:text-destructive'}`}>
                      {confirmDel === w.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{workouts.length} entries</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted">Prev</button>
            <span className="px-2 py-1">{page + 1} / {pages}</span>
            <button disabled={page === pages - 1} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
