'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeasurementWithBMI } from '@/types';
import { Button } from '@/components/ui/button';
import MeasurementForm from './MeasurementForm';
import MeasurementChart from './MeasurementChart';

interface Props { initialData: MeasurementWithBMI[] }

export default function MeasurementsPageClient({ initialData }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmDel !== id) {
      setConfirmDel(id);
      setTimeout(() => setConfirmDel(c => c === id ? null : c), 3000);
      return;
    }
    await fetch(`/api/measurements/${id}`, { method: 'DELETE' });
    setData(d => d.filter(m => m.id !== id));
    setConfirmDel(null);
    router.refresh();
  }

  function onSaved() { router.refresh(); }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Body Measurements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track weight, BMI, and body composition over time</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Add Measurement</Button>
      </div>

      {data.length > 1 && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Trend</h2>
          <MeasurementChart measurements={data} />
        </div>
      )}

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
          No measurements yet. Add your first entry.
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-3 py-3 text-right font-medium">Weight (kg)</th>
                <th className="px-3 py-3 text-right font-medium">BMI</th>
                <th className="px-3 py-3 text-right font-medium hidden md:table-cell">Body Fat %</th>
                <th className="px-3 py-3 text-right font-medium hidden lg:table-cell">Waist (cm)</th>
                <th className="px-3 py-3 text-left font-medium hidden xl:table-cell">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-4 py-3 font-medium">
                    {new Date(m.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-indigo-600">
                    {m.weightKg ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {m.bmi ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-right hidden md:table-cell">
                    {m.bodyFatPct ? `${m.bodyFatPct}%` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right hidden lg:table-cell">
                    {m.waistCm ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs truncate max-w-[160px] hidden xl:table-cell">
                    {m.notes ?? ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(m.id)}
                      className={`text-xs ${confirmDel === m.id ? 'text-red-600 font-semibold' : 'text-muted-foreground hover:text-destructive'}`}>
                      {confirmDel === m.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MeasurementForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={onSaved} />
    </div>
  );
}
