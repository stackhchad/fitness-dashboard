'use client';

import { GoalWithProgress } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Ahead:     'bg-blue-100 text-blue-700',
  'On Track': 'bg-indigo-100 text-indigo-700',
  Behind:    'bg-yellow-100 text-yellow-700',
  'No Data': 'bg-gray-100 text-gray-500',
};

const CAT_BORDER: Record<string, string> = {
  Strength:          'border-l-blue-500',
  Cardio:            'border-l-green-500',
  Weight:            'border-l-purple-500',
  'Body Composition': 'border-l-teal-500',
  Flexibility:       'border-l-yellow-500',
  Habit:             'border-l-orange-500',
  Other:             'border-l-gray-400',
};

interface Props {
  goal: GoalWithProgress;
  onEdit: (g: GoalWithProgress) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: Props) {
  const pct = Math.round(goal.progressPct * 100);
  const sPct = Math.round(goal.schedulePct * 100);
  const border = CAT_BORDER[goal.category] ?? 'border-l-gray-400';

  return (
    <div className={`rounded-xl border border-l-4 ${border} bg-card p-4 group relative`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm leading-snug">{goal.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{goal.category} · {goal.unit ?? ''}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${STATUS_STYLES[goal.status] ?? ''}`}>
          {goal.status}
        </span>
      </div>

      {/* Values */}
      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
        <span>Start: <strong className="text-foreground">{goal.startValue}</strong></span>
        <span>Current: <strong className="text-foreground">{goal.currentValue ?? '—'}</strong></span>
        <span>Target: <strong className="text-foreground">{goal.targetValue}</strong></span>
      </div>

      {/* Progress bar with schedule marker */}
      <div className="relative h-2 w-full rounded-full bg-muted overflow-visible mb-1">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {/* Schedule marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-orange-400 rounded-full"
          style={{ left: `${Math.min(sPct, 100)}%` }}
          title={`Expected: ${sPct}%`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pct}% done</span>
        <span>{goal.daysRemaining}d left</span>
      </div>

      {/* Edit/Delete — hover reveal */}
      <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
        <button onClick={() => onEdit(goal)}
          className="text-xs text-muted-foreground hover:text-foreground bg-background border rounded px-2 py-0.5">
          Edit
        </button>
        <button onClick={() => onDelete(goal.id)}
          className="text-xs text-muted-foreground hover:text-destructive bg-background border rounded px-2 py-0.5">
          Del
        </button>
      </div>
    </div>
  );
}
