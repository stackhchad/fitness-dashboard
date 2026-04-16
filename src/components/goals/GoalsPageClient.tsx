'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoalWithProgress } from '@/types';
import { Button } from '@/components/ui/button';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

interface Props { initialGoals: GoalWithProgress[] }

export default function GoalsPageClient({ initialGoals }: Props) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoalWithProgress | null>(null);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(g: GoalWithProgress) { setEditing(g); setFormOpen(true); }

  async function handleDelete(id: string) {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    setGoals(gs => gs.filter(g => g.id !== id));
    router.refresh();
  }

  function onSaved() {
    router.refresh();
    // Re-fetch from server by navigating (router.refresh re-runs server component)
  }

  const active = goals.filter(g => g.status !== 'Completed');
  const done   = goals.filter(g => g.status === 'Completed');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals & Targets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} active · {done.length} completed
          </p>
        </div>
        <Button onClick={openNew}>+ New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
          No goals yet. Create your first goal to get started.
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Active ({active.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map(g => (
                  <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Completed ({done.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-70">
                {done.map(g => (
                  <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <GoalForm
        open={formOpen}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={onSaved}
      />
    </div>
  );
}
