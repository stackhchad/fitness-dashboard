'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GOAL_CATEGORIES } from '@/lib/constants';
import { GoalWithProgress } from '@/types';

interface Props {
  open: boolean;
  editing: GoalWithProgress | null;
  onClose: () => void;
  onSaved: () => void;
}

type F = {
  category: string; description: string; unit: string;
  startValue: string; targetValue: string; currentValue: string;
  startDate: string; targetDate: string;
  higherIsBetter: boolean; notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const inMonths = (n: number) => {
  const d = new Date(); d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

const EMPTY: F = {
  category: 'Strength', description: '', unit: '',
  startValue: '', targetValue: '', currentValue: '',
  startDate: today(), targetDate: inMonths(3),
  higherIsBetter: true, notes: '',
};

export default function GoalForm({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<F>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        category:       editing.category,
        description:    editing.description,
        unit:           editing.unit ?? '',
        startValue:     String(editing.startValue),
        targetValue:    String(editing.targetValue),
        currentValue:   editing.currentValue !== null ? String(editing.currentValue) : '',
        startDate:      editing.startDate.slice(0, 10),
        targetDate:     editing.targetDate.slice(0, 10),
        higherIsBetter: editing.higherIsBetter,
        notes:          editing.notes ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editing, open]);

  const set = (k: keyof F, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = editing ? 'PATCH' : 'POST';
      const url = editing ? `/api/goals/${editing.id}` : '/api/goals';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startValue:   Number(form.startValue),
          targetValue:  Number(form.targetValue),
          currentValue: form.currentValue ? Number(form.currentValue) : null,
          unit:         form.unit || null,
          notes:        form.notes || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Save failed');
      onSaved();
      onClose();
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
          <DialogTitle>{editing ? 'Edit Goal' : 'New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Category *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.category} onChange={e => set('category', e.target.value)}>
                {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Unit (optional)</Label>
              <Input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="kg, %, reps…" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description *</Label>
            <Input required value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. Bench press 100 kg" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Start Value *</Label>
              <Input type="number" step="any" required value={form.startValue}
                onChange={e => set('startValue', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Current Value</Label>
              <Input type="number" step="any" value={form.currentValue}
                onChange={e => set('currentValue', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Target Value *</Label>
              <Input type="number" step="any" required value={form.targetValue}
                onChange={e => set('targetValue', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Date *</Label>
              <Input type="date" required value={form.startDate}
                onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Target Date *</Label>
              <Input type="date" required value={form.targetDate}
                onChange={e => set('targetDate', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.higherIsBetter}
              onChange={e => set('higherIsBetter', e.target.checked)} />
            Higher value = better progress (uncheck for weight loss, etc.)
          </label>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
