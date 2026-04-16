'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  data: { week: string; sessions: number; adherence: number }[];
}

export default function AdherenceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
        <Tooltip formatter={(v: number) => [`${v}%`, 'Adherence']} />
        <ReferenceLine y={80} stroke="#6366f1" strokeDasharray="4 2" />
        <Bar dataKey="adherence" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.adherence >= 80 ? '#6366f1' : entry.adherence >= 60 ? '#a5b4fc' : '#d1d5db'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
