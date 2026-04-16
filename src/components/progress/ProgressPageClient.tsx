'use client';

import { useState } from 'react';
import { WeeklyProgress, PersonalRecord } from '@/types';
import ProgressCharts from './ProgressCharts';
import WeeklyProgressTable from './WeeklyProgressTable';
import PersonalRecordsTable from './PersonalRecordsTable';

const TABS = ['Charts', 'Weekly Table', 'Personal Records'] as const;
type Tab = typeof TABS[number];

interface Props {
  weekly: WeeklyProgress[];
  records: PersonalRecord[];
}

export default function ProgressPageClient({ weekly, records }: Props) {
  const [tab, setTab] = useState<Tab>('Charts');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Weekly training trends and personal bests
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Charts'         && <ProgressCharts weekly={weekly} />}
      {tab === 'Weekly Table'   && <WeeklyProgressTable weekly={weekly} />}
      {tab === 'Personal Records' && <PersonalRecordsTable records={records} />}
    </div>
  );
}
