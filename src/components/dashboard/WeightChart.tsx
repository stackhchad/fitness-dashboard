'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; weight: number; bmi: number | null }[];
  targetWeight?: number | null;
}

export default function WeightChart({ data, targetWeight }: Props) {
  if (data.length === 0) return (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
      No weight data yet
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit=" kg" />
        <Tooltip formatter={(v: number) => [`${v} kg`, 'Weight']} />
        {targetWeight && (
          <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="4 2"
            label={{ value: `Target ${targetWeight}kg`, fontSize: 10, fill: '#22c55e' }} />
        )}
        <Line type="monotone" dataKey="weight" stroke="#2e75b6" strokeWidth={2}
          dot={{ r: 3, fill: '#2e75b6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
