'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { calcBMI, bmiCategory } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type F = {
  date: string; weightKg: string; heightCm: string; bodyFatPct: string;
  chestCm: string; waistCm: string; hipsCm: string; armCm: string; thighCm: string;
  notes: string;
};

const EMPTY: F = {
  date: new Date().toISOString().slice(0, 10),
  weightKg: '', heightCm: '', bodyFatPct: '',
  chestCm: '', waistCm: '', hipsCm: '', armCm: '', thighCm: '',
  notes: '',
};

export default function MeasurementForm({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<F>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof F, v: string) => setForm(f => ({ ...f, [k]: v }));

  const liveBMI = form.weightKg && form.heightCm
    ? calcBMI(Number(form.weightKg), Number(form.heightCm))
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:       form.date,
          weightKg:   form.weightKg   ? Number(form.weightKg)   : null,
          heightCm:   form.heightCm   ? Number(form.heightCm)   : null,
          bodyFatPct: form.bodyFatPct ? Number(form.bodyFatPct) : null,
          chestCm:    form.chestCm    ? Number(form.chestCm)    : null,
          waistCm:    form.waistCm    ? Number(form.waistCm)    : null,
          hipsCm:     form.hipsCm     ? Number(form.hipsCm)     : null,
          armCm:      form.armCm      ? Number(form.armCm)      : null,
          thighCm:    form.thighCm    ? Number(form.thighCm)    : null,
          notes:      form.notes      || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Save failed');
      onSaved();
      onClose();
      setForm(EMPTY);
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
          <DialogTitle>Add Body Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Date *</Label>
            <Input type="date" required value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Height (cm)</Label>
              <Input type="number" step="0.1" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} />
            </div>
          </div>

          {/* Live BMI */}
          {liveBMI && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2 text-sm">
              BMI: <strong className="text-indigo-700">{liveBMI}</strong>
              <span className="ml-2 text-indigo-500">({bmiCategory(liveBMI)})</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Body Fat %</Label>
              <Input type="number" step="0.1" value={form.bodyFatPct} onChange={e => set('bodyFatPct', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Waist (cm)</Label>
              <Input type="number" step="0.1" value={form.waistCm} onChange={e => set('waistCm', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Chest (cm)</Label>
              <Input type="number" step="0.1" value={form.chestCm} onChange={e => set('chestCm', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Arm (cm)</Label>
              <Input type="number" step="0.1" value={form.armCm} onChange={e => set('armCm', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Thigh (cm)</Label>
              <Input type="number" step="0.1" value={form.thighCm} onChange={e => set('thighCm', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
