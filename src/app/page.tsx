import { Suspense } from 'react';
import { getDashboardData } from '@/lib/data/dashboard';
import WeightChart from '@/components/dashboard/WeightChart';
import AdherenceChart from '@/components/dashboard/AdherenceChart';
import VolumeChart from '@/components/dashboard/VolumeChart';

const STATUS_COLOR: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Ahead:     'bg-blue-100 text-blue-700',
  'On Track': 'bg-indigo-100 text-indigo-700',
  Behind:    'bg-yellow-100 text-yellow-700',
  'No Data': 'bg-gray-100 text-gray-500',
};

async function DashboardContent() {
  const d = await getDashboardData();

  const metrics = [
    { label: 'Total Sessions',   value: d.totalSessions,           color: 'text-indigo-600' },
    { label: 'This Week',        value: `${d.thisWeekSessions} / 5`, color: 'text-blue-600' },
    { label: 'Body Weight',      value: d.latestWeight ? `${d.latestWeight} kg` : '—', color: 'text-purple-600' },
    { label: 'BMI',              value: d.latestBMI ?? '—',         color: 'text-teal-600' },
    { label: 'Volume (12w)',     value: `${(d.totalVolumeKg / 1000).toFixed(1)} t`, color: 'text-orange-600' },
    { label: 'Active Goals',     value: d.activeGoals,             color: 'text-green-600' },
    { label: 'Goals Completed',  value: d.completedGoals,          color: 'text-green-600' },
    { label: 'Performance Score', value: d.latestOverallScore ?? '—', color: 'text-yellow-600' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your fitness command centre</p>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Body Weight Over Time</h2>
          <WeightChart data={d.weightHistory} />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Weekly Adherence %</h2>
          <AdherenceChart data={d.weeklyAdherence} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Training Volume Trend</h2>
          <VolumeChart data={d.weeklyVolume} />
        </div>

        {/* Goals snapshot */}
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Goals Snapshot</h2>
          {d.recentGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals yet.</p>
          ) : (
            <ul className="space-y-2">
              {d.recentGoals.map(g => (
                <li key={g.id} className="flex items-center gap-2 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[g.status] ?? ''}`}>
                    {g.status}
                  </span>
                  <span className="truncate">{g.description}</span>
                  <span className="ml-auto text-muted-foreground">{Math.round(g.progressPct * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-muted-foreground text-sm">Loading dashboard…</div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
