'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { PerformanceEvaluation } from '@/types';
import PerformanceForm from './PerformanceForm';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DIM_KEYS = [
  'strengthScore', 'cardioScore', 'flexibilityScore',
  'nutritionScore', 'sleepScore', 'recoveryScore',
] as const;

const DIM_LABELS: Record<string, string> = {
  strengthScore: 'Strength', cardioScore: 'Cardio',
  flexibilityScore: 'Flexibility', nutritionScore: 'Nutrition',
  sleepScore: 'Sleep', recoveryScore: 'Recovery',
};

function scoreColor(s: number) {
  if (s >= 8) return 'text-green-600';
  if (s >= 6) return 'text-indigo-600';
  if (s >= 4) return 'text-yellow-600';
  return 'text-red-500';
}

interface Props {
  initialData: PerformanceEvaluation[];
}

export default function PerformancePageClient({ initialData }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PerformanceEvaluation | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(e: PerformanceEvaluation) { setEditing(e); setFormOpen(true); }

  async function handleDelete(id: string) {
    if (confirmDel !== id) { setConfirmDel(id); return; }
    await fetch(`/api/performance/${id}`, { method: 'DELETE' });
    setData(d => d.filter(e => e.id !== id));
    setConfirmDel(null);
    router.refresh();
  }

  function onSaved() { router.refresh(); }

  // Latest entry for radar chart
  const latest = data[0] ?? null;
  const radarData = latest
    ? DIM_KEYS.map(k => ({ subject: DIM_LABELS[k], score: latest[k] }))
    : [];

  // Bar chart: overall + per-dimension over time (last 6)
  const barData = [...data].slice(0, 6).reverse().map(e => ({
    name: `${MONTHS[e.month - 1]} ${e.year}`,
    Overall: e.overallScore,
    Strength: e.strengthScore,
    Cardio: e.cardioScore,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Evaluation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly self-assessment across 6 dimensions</p>
        </div>
        <Button onClick={openNew}>+ New Evaluation</Button>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
          No evaluations yet. Add your first monthly score.
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold mb-3">
                Latest: {MONTHS[latest!.month - 1]} {latest!.year}
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar trend */}
            <div className="rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold mb-3">Trend (last 6 months)</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Overall"  fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="Strength" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="Cardio"   fill="#22c55e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Month</th>
                  <th className="px-3 py-3 text-center font-medium">Overall</th>
                  {DIM_KEYS.map(k => (
                    <th key={k} className="px-3 py-3 text-center font-medium hidden lg:table-cell">
                      {DIM_LABELS[k]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium hidden xl:table-cell">Comments</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="px-4 py-3 font-medium">
                      {MONTHS[e.month - 1]} {e.year}
                    </td>
                    <td className={`px-3 py-3 text-center font-bold text-base ${scoreColor(e.overallScore)}`}>
                      {e.overallScore.toFixed(1)}
                    </td>
                    {DIM_KEYS.map(k => (
                      <td key={k} className={`px-3 py-3 text-center hidden lg:table-cell ${scoreColor(e[k])}`}>
                        {e[k]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate hidden xl:table-cell">
                      {e.comments ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className={`text-xs ${confirmDel === e.id ? 'text-red-600 font-semibold' : 'text-muted-foreground hover:text-destructive'}`}
                        >
                          {confirmDel === e.id ? 'Confirm?' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PerformanceForm
        open={formOpen}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={onSaved}
      />
    </div>
  );
}
