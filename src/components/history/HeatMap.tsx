'use client';

import { useMemo } from 'react';
import { format, subDays, isSameDay, startOfWeek, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface HeatMapProps {
  logs: DailyLog[];
}

export default function HeatMap({ logs = [] }: HeatMapProps) {
  // Generate the last 90 days
  const days = useMemo(() => {
    if (!logs) return [];
    const today = new Date();
    const startDate = subDays(today, 89); // 90 days inclusive
    
    // To make the grid nice, maybe we align to the start of the week?
    // But for a straight 90-day history, just listing them is fine.
    // GitHub style usually goes column-first (weeks).
    // For mobile, row-first (weeks) is often easier to read (calendar style).
    
    // Let's do a simple array of 90 days.
    return Array.from({ length: 90 }).map((_, i) => {
      const date = addDays(startDate, i);
      const log = logs.find((l) => isSameDay(new Date(l.date), date));
      
      // Calculate score
      let completedCount = 0;
      if (log) {
        if (log.anchor_therapy) completedCount++;
        if (log.anchor_sobriety) completedCount++;
        if (log.anchor_sleep) completedCount++;
        if (log.anchor_movement) completedCount++;
        if (log.mandate_exposure) completedCount++;
        if (log.mandate_coursework) completedCount++;
        if (log.mandate_interaction) completedCount++;
        if (log.night_anchor_completed) completedCount++;
      }
      
      const percentage = (completedCount / 8) * 100;
      
      return {
        date,
        percentage,
        hasLog: !!log,
      };
    });
  }, [logs]);

  // Color scale helper
  const getColor = (percentage: number, hasLog: boolean) => {
    if (!hasLog) return 'bg-slate-100 dark:bg-slate-800'; // No data
    if (percentage === 0) return 'bg-rose-100 dark:bg-rose-900/20'; // 0%
    if (percentage < 30) return 'bg-emerald-200 dark:bg-emerald-900/40';
    if (percentage < 60) return 'bg-emerald-300 dark:bg-emerald-700/60';
    if (percentage < 90) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500'; // 100% or close
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          90-Day Protocol
        </h3>
        <span className="text-xs text-slate-500">
          {format(days[0].date, 'MMM d')} - {format(days[days.length - 1].date, 'MMM d')}
        </span>
      </div>
      
      {/* 
        Grid Layout:
        Mobile: 7 columns (weeks), reading left-to-right, top-to-bottom.
        Desktop: We can stick to the same layout or make it wider.
        A 7-column grid works well for "calendar" feel.
      */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-[10px] text-center text-slate-400 font-medium pb-1">
            {day}
          </div>
        ))}
        
        {/* Offset for the first day of the week to align correctly? 
            If we want a true calendar view, we need to pad the start. 
        */}
        {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            className={cn(
              "aspect-square rounded-sm sm:rounded-md transition-all duration-200",
              getColor(day.percentage, day.hasLog)
            )}
            title={`${format(day.date, 'MMM d, yyyy')}: ${Math.round(day.percentage)}%`}
          />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-rose-100 dark:bg-rose-900/20" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
