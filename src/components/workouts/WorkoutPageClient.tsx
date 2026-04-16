'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutLog } from '@/types';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { WORKOUT_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WorkoutForm from './WorkoutForm';
import WorkoutTable from './WorkoutTable';

interface Props { initialData: WorkoutLog[] }

export default function WorkoutPageClient({ initialData }: Props) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState(initialData);
  const [editing, setEditing] = useState<WorkoutLog | null>(null);
  const { filters, isFormOpen, setFilter, resetFilters, openForm, closeForm } = useWorkoutStore();

  const filtered = useMemo(() => {
    let list = workouts;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(w =>
        w.exercise?.toLowerCase().includes(q) ||
        w.notes?.toLowerCase().includes(q) ||
        w.muscleGroup?.toLowerCase().includes(q)
      );
    }
    if (filters.workoutType) list = list.filter(w => w.workoutType === filters.workoutType);
    if (filters.from)        list = list.filter(w => w.date >= filters.from);
    if (filters.to)          list = list.filter(w => w.date <= filters.to + 'T23:59:59');
    return list;
  }, [workouts, filters]);

  const totalVolume = useMemo(() =>
    filtered.reduce((s, w) => s + (w.sets ?? 0) * (w.reps ?? 0) * (w.weightKg ?? 0), 0),
    [filtered]
  );
  const totalSessions = useMemo(() => filtered.filter(w => w.isSessionStart).length, [filtered]);
  const totalDuration = useMemo(() => filtered.reduce((s, w) => s + (w.durationMin ?? 0), 0), [filtered]);

  function handleSaved(entry: WorkoutLog) {
    setWorkouts(ws => {
      const idx = ws.findIndex(w => w.id === entry.id);
      if (idx >= 0) {
        const copy = [...ws];
        copy[idx] = entry;
        return copy;
      }
      return [entry, ...ws];
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
    setWorkouts(ws => ws.filter(w => w.id !== id));
    router.refresh();
  }

  function handleEdit(w: WorkoutLog) {
    setEditing(w);
    openForm(w.id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workout Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track every set, rep and kg</p>
        </div>
        <Button onClick={() => { setEditing(null); openForm(); }}>+ Log Workout</Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sessions', value: totalSessions },
          { label: 'Volume', value: `${totalVolume.toLocaleString()} kg` },
          { label: 'Duration', value: `${totalDuration} min` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-indigo-600 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search exercise, notes…" className="w-48"
          value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        <Input type="date" className="w-40"
          value={filters.from} onChange={e => setFilter('from', e.target.value)} />
        <span className="text-muted-foreground text-sm">to</span>
        <Input type="date" className="w-40"
          value={filters.to} onChange={e => setFilter('to', e.target.value)} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filters.workoutType} onChange={e => setFilter('workoutType', e.target.value)}>
          <option value="">All types</option>
          {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {(filters.search || filters.from || filters.to || filters.workoutType) && (
          <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
            Clear filters
          </button>
        )}
      </div>

      <WorkoutTable workouts={filtered} onEdit={handleEdit} onDelete={handleDelete} />

      <WorkoutForm
        open={isFormOpen}
        editing={editing}
        onClose={() => { closeForm(); setEditing(null); }}
        onSaved={handleSaved}
      />
    </div>
  );
}
