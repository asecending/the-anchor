'use client';

import { useMemo } from 'react';
import { subDays, isSameDay, format, isAfter } from 'date-fns';

interface DailyLog {
  date: string;
  anchor_therapy: boolean;
  anchor_sobriety: boolean;
  anchor_sleep: boolean;
  anchor_movement: boolean;
  mandate_exposure: boolean;
  mandate_coursework: boolean;
  mandate_interaction: boolean;
  night_anchor_completed: boolean;
}

interface IntegrityScoreProps {
  logs: DailyLog[];
}

export default function IntegrityScore({ logs = [] }: IntegrityScoreProps) {
  const { score, trend } = useMemo(() => {
    if (!logs || logs.length === 0) return { score: 0, trend: 'No Data' };
    
    const today = new Date();
    
    let totalChecked = 0;
    const totalPossible = 7 * 8; // 7 days * 8 tasks

    // Loop through the last 7 days to ensure we count missing logs as 0
    for (let i = 0; i < 7; i++) {
      const targetDate = subDays(today, i);
      const log = logs.find((l) => isSameDay(new Date(l.date), targetDate));
      
      if (log) {
        if (log.anchor_therapy) totalChecked++;
        if (log.anchor_sobriety) totalChecked++;
        if (log.anchor_sleep) totalChecked++;
        if (log.anchor_movement) totalChecked++;
        if (log.mandate_exposure) totalChecked++;
        if (log.mandate_coursework) totalChecked++;
        if (log.mandate_interaction) totalChecked++;
        if (log.night_anchor_completed) totalChecked++;
      }
    }

    const calculatedScore = Math.round((totalChecked / totalPossible) * 100);

    let trendText = 'Stable';
    if (calculatedScore >= 90) trendText = 'Excellent';
    else if (calculatedScore >= 80) trendText = 'Good';
    else if (calculatedScore >= 60) trendText = 'Fair';
    else trendText = 'Needs Focus';

    return { score: calculatedScore, trend: trendText };
  }, [logs]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-500';
    if (s >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 50) return 'text-yellow-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">
        7-Day Integrity
      </h2>
      <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      <p className="text-slate-400 text-sm mt-2 font-medium">
        {trend}
      </p>
    </div>
  );
}
