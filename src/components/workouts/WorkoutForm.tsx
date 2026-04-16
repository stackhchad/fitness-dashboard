'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WORKOUT_TYPES, MUSCLE_GROUPS, INTENSITY_LEVELS } from '@/lib/constants';
import { WorkoutLog } from '@/types';

interface Props {
  open: boolean;
  editing: WorkoutLog | null;
  onClose: () => void;
  onSaved: (entry: WorkoutLog) => void;
}

type F = {
  date: string; workoutType: string; muscleGroup: string; exercise: string;
  sets: string; reps: string; weightKg: string; durationMin: string;
  rpe: string; intensity: string; notes: string;
  isSessionStart: boolean; keepOpen: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: F = {
  date: today(), workoutType: '', muscleGroup: '', exercise: '',
  sets: '', reps: '', weightKg: '', durationMin: '',
  rpe: '', intensity: '', notes: '',
  isSessionStart: true, keepOpen: false,
};

export default function WorkoutForm({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<F>(EMPTY);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          date: editing.date.slice(0, 10),
          workoutType: editing.workoutType ?? '',
          muscleGroup: editing.muscleGroup ?? '',
          exercise: editing.exercise ?? '',
          sets: editing.sets?.toString() ?? '',
          reps: editing.reps?.toString() ?? '',
          weightKg: editing.weightKg?.toString() ?? '',
          durationMin: editing.durationMin?.toString() ?? '',
          rpe: editing.rpe?.toString() ?? '',
          intensity: editing.intensity ?? '',
          notes: editing.notes ?? '',
          isSessionStart: editing.isSessionStart,
          keepOpen: false,
        });
        setSessionId(editing.sessionId);
      } else {
        setForm({ ...EMPTY, date: today() });
        setSessionId(crypto.randomUUID());
      }
      setError('');
    }
  }, [open, editing]);

  const set = (k: keyof F, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = editing ? 'PATCH' : 'POST';
      const url = editing ? `/api/workouts/${editing.id}` : '/api/workouts';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          sessionId,
          isSessionStart: form.isSessionStart,
          workoutType: form.workoutType || null,
          muscleGroup: form.muscleGroup || null,
          exercise: form.exercise || null,
          sets:        form.sets        ? Number(form.sets)        : null,
          reps:        form.reps        ? Number(form.reps)        : null,
          weightKg:    form.weightKg    ? Number(form.weightKg)    : null,
          durationMin: form.durationMin ? Number(form.durationMin) : null,
          rpe:         form.rpe         ? Number(form.rpe)         : null,
          intensity:   form.intensity   || null,
          notes:       form.notes       || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Save failed');
      const { data } = await res.json();
      onSaved(data);
      if (form.keepOpen && !editing) {
        // next exercise in same session: same date/sessionId, not session start
        setForm(f => ({ ...f, exercise: '', sets: '', reps: '', weightKg: '', rpe: '', notes: '', isSessionStart: false }));
      } else {
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Workout Entry' : 'Log Workout'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Workout Type</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.workoutType} onChange={e => set('workoutType', e.target.value)}>
                <option value="">Select…</option>
                {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Muscle Group</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.muscleGroup} onChange={e => set('muscleGroup', e.target.value)}>
                <option value="">Select…</option>
                {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Exercise</Label>
              <Input value={form.exercise} onChange={e => set('exercise', e.target.value)}
                placeholder="e.g. Bench Press" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Sets</Label>
              <Input type="number" min={1} value={form.sets} onChange={e => set('sets', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Reps</Label>
              <Input type="number" min={1} value={form.reps} onChange={e => set('reps', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.5" min={0} value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Duration (min)</Label>
              <Input type="number" min={1} value={form.durationMin} onChange={e => set('durationMin', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>RPE (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.rpe} onChange={e => set('rpe', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Intensity</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.intensity} onChange={e => set('intensity', e.target.value)}>
                <option value="">Select…</option>
                {INTENSITY_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Form notes, PR comments…" />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isSessionStart}
                onChange={e => set('isSessionStart', e.target.checked)} />
              Session start
            </label>
            {!editing && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.keepOpen}
                  onChange={e => set('keepOpen', e.target.checked)} />
                Add another exercise
              </label>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Update' : 'Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
