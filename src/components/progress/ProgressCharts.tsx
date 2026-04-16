'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { WeeklyProgress } from '@/types';

interface Props { weekly: WeeklyProgress[] }

const SHORT = (s: string) => s.slice(0, 5); // "05/01"

export default function ProgressCharts({ weekly }: Props) {
  const data = weekly.map(w => ({
    week: SHORT(w.weekStart),
    Sessions: w.sessionsDone,
    Adherence: Math.round(w.adherencePct * 100),
    Volume: w.totalVolumeKg,
    RPE: w.avgRpe,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Volume trend */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Training Volume (kg)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Volume']} />
            <Area type="monotone" dataKey="Volume" stroke="#f97316" fill="url(#volGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Adherence */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Weekly Adherence %</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Adherence']} />
            <ReferenceLine y={80} stroke="#6366f1" strokeDasharray="4 2" />
            <Bar
              dataKey="Adherence"
              radius={[4, 4, 0, 0]}
              fill="#6366f1"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions per week */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Sessions per Week</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v, 'Sessions']} />
            <ReferenceLine y={5} stroke="#22c55e" strokeDasharray="4 2" />
            <Bar dataKey="Sessions" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Avg RPE trend */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Average RPE Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v.toFixed(1), 'Avg RPE']} />
            <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="4 2" />
            <Line
              type="monotone" dataKey="RPE"
              stroke="#c55a11" strokeWidth={2}
              dot={{ r: 3, fill: '#c55a11' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
