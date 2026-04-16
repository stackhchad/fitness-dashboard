'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PerformanceEvaluation } from '@/types';

const DIMENSIONS = [
  { key: 'strengthScore',     label: 'Strength',     color: 'bg-blue-500' },
  { key: 'cardioScore',       label: 'Cardio',       color: 'bg-green-500' },
  { key: 'flexibilityScore',  label: 'Flexibility',  color: 'bg-yellow-500' },
  { key: 'nutritionScore',    label: 'Nutrition',    color: 'bg-orange-500' },
  { key: 'sleepScore',        label: 'Sleep',        color: 'bg-purple-500' },
  { key: 'recoveryScore',     label: 'Recovery',     color: 'bg-teal-500' },
] as const;

type ScoreKey = typeof DIMENSIONS[number]['key'];

type F = {
  month: number;
  year: number;
  strengthScore: number;
  cardioScore: number;
  flexibilityScore: number;
  nutritionScore: number;
  sleepScore: number;
  recoveryScore: number;
  comments: string;
};

const now = new Date();
const EMPTY: F = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  strengthScore: 5,
  cardioScore: 5,
  flexibilityScore: 5,
  nutritionScore: 5,
  sleepScore: 5,
  recoveryScore: 5,
  comments: '',
};

interface Props {
  open: boolean;
  editing: PerformanceEvaluation | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PerformanceForm({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<F>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        month: editing.month,
        year: editing.year,
        strengthScore: editing.strengthScore,
        cardioScore: editing.cardioScore,
        flexibilityScore: editing.flexibilityScore,
        nutritionScore: editing.nutritionScore,
        sleepScore: editing.sleepScore,
        recoveryScore: editing.recoveryScore,
        comments: editing.comments ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editing, open]);

  const overall = Math.round(
    (form.strengthScore + form.cardioScore + form.flexibilityScore +
      form.nutritionScore + form.sleepScore + form.recoveryScore) / 6 * 10
  ) / 10;

  const set = (k: keyof F, val: string | number) =>
    setForm(f => ({ ...f, [k]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = editing ? 'PATCH' : 'POST';
      const url = editing
        ? `/api/performance/${editing.id}`
        : '/api/performance';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Save failed');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Evaluation' : 'New Monthly Evaluation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Month / Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Month</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.month}
                onChange={e => set('month', Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Year</Label>
              <Input
                type="number"
                min={2020}
                max={2099}
                value={form.year}
                onChange={e => set('year', Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Score sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Scores (1–10)</span>
              <span className="text-sm font-semibold">
                Overall: <span className="text-indigo-600">{overall}</span>
              </span>
            </div>
            {DIMENSIONS.map(({ key, label, color }) => (
              <div key={key} className="grid grid-cols-[100px_1fr_40px] items-center gap-3">
                <Label className="text-right">{label}</Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={form[key as ScoreKey]}
                  onChange={e => set(key as ScoreKey, Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold ${color}`}>
                  {form[key as ScoreKey]}
                </span>
              </div>
            ))}
          </div>

          {/* Overall bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall score</span>
              <span>{overall} / 10</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${overall * 10}%` }}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <Label>Comments (optional)</Label>
            <Textarea
              rows={3}
              placeholder="Key wins, challenges, focus for next month..."
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
