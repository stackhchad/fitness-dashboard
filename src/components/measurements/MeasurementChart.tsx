'use client';

import { useState } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MeasurementWithBMI } from '@/types';

type Metric = 'weight' | 'bmi' | 'bodyFat';

interface Props { measurements: MeasurementWithBMI[] }

export default function MeasurementChart({ measurements }: Props) {
  const [metric, setMetric] = useState<Metric>('weight');

  const data = [...measurements].reverse().map(m => ({
    date: new Date(m.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    weight:  m.weightKg ?? null,
    bmi:     m.bmi ?? null,
    bodyFat: m.bodyFatPct ?? null,
  }));

  const CONFIG: Record<Metric, { key: string; label: string; color: string; unit: string }> = {
    weight:  { key: 'weight',  label: 'Weight',    color: '#6366f1', unit: ' kg' },
    bmi:     { key: 'bmi',     label: 'BMI',        color: '#14b8a6', unit: '' },
    bodyFat: { key: 'bodyFat', label: 'Body Fat %', color: '#f97316', unit: '%' },
  };
  const cfg = CONFIG[metric];

  return (
    <div className="space-y-3">
      {/* Metric toggle */}
      <div className="flex gap-2">
        {(Object.keys(CONFIG) as Metric[]).map(m => (
          <button key={m} onClick={() => setMetric(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              metric === m
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {CONFIG[m].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit={cfg.unit} />
          <Tooltip formatter={(v: number) => [`${v}${cfg.unit}`, cfg.label]} />
          <Bar dataKey={cfg.key} fill={cfg.color} opacity={0.3} radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2}
            dot={{ r: 3, fill: cfg.color }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
