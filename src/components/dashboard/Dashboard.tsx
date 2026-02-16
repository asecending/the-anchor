'use client';

import { useState, useTransition, useEffect } from 'react';
import { AnchorList, AnchorItem } from '@/components/dashboard/AnchorList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PanicButton } from '@/components/ui/PanicButton';
import { PanicOverlay } from '@/components/overlays/PanicOverlay';
import { updateDailyLog } from '@/app/actions/protocol';
import { format } from 'date-fns';
import { ProtocolRule } from '@/app/actions/rules';
import { RuleDimmer } from '@/components/graduation/RuleDimmer';

export interface DailyLog {
  id?: string;
  user_id?: string;
  date: string;
  anchor_therapy: boolean;
  anchor_sobriety: boolean;
  anchor_sleep: boolean;
  anchor_movement: boolean;
  mandate_exposure: boolean;
  mandate_coursework: boolean;
  mandate_interaction: boolean;
  night_anchor_completed: boolean;
  notes?: string | null;
  score?: number | null;
}

interface DashboardProps {
  initialDailyLog: DailyLog;
  day: number;
  mulligans: number;
  rules?: ProtocolRule[];
}

export function Dashboard({ initialDailyLog, day, mulligans, rules = [] }: DashboardProps) {
  // Use local state instead of optimistic to handle Day 0 behavior correctly
  const [log, setLog] = useState<DailyLog>(initialDailyLog);
  const [isPending, startTransition] = useTransition();

  // Sync with server updates if initialDailyLog changes (e.g. revalidation)
  useEffect(() => {
    setLog(initialDailyLog);
  }, [initialDailyLog]);

  const handleToggle = async (column: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Immediate local update (Optimistic UI)
    setLog(prev => ({ ...prev, [column]: newValue }));

    // Only persist to server if NOT Practice Mode (Day 0)
    if (day > 0) {
      startTransition(async () => {
        try {
          await updateDailyLog(initialDailyLog.date, column, newValue);
        } catch (error) {
          console.error('Failed to update log:', error);
          // Revert on failure
          setLog(prev => ({ ...prev, [column]: currentValue }));
        }
      });
    }
  };

  const anchors: AnchorItem[] = [
    { 
      id: 'anchor_sobriety', 
      label: 'Sobriety (Zero THC)', 
      checked: log.anchor_sobriety,
      status: rules.find(r => r.rule_id === 'anchor_sobriety')?.status 
    },
    { 
      id: 'anchor_sleep', 
      label: 'Sleep (Digital Sundown)', 
      checked: log.anchor_sleep,
      status: rules.find(r => r.rule_id === 'anchor_sleep')?.status 
    },
    { 
      id: 'anchor_therapy', 
      label: 'Therapy (Weekly)', 
      checked: log.anchor_therapy,
      status: rules.find(r => r.rule_id === 'anchor_therapy')?.status 
    },
    { 
      id: 'anchor_movement', 
      label: 'Movement (5/week)', 
      checked: log.anchor_movement,
      status: rules.find(r => r.rule_id === 'anchor_movement')?.status 
    },
  ];

  const mandates: AnchorItem[] = [
    { id: 'mandate_exposure', label: 'Public Exposure', checked: log.mandate_exposure },
    { id: 'mandate_coursework', label: 'Coursework', checked: log.mandate_coursework },
    { id: 'mandate_interaction', label: 'Human Interaction', checked: log.mandate_interaction },
  ];

  const isPracticeMode = day === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      <PanicOverlay />
      
      <DashboardHeader 
        day={day} 
        totalDays={90} 
        mulligans={mulligans} 
      />

      <div className="p-4 space-y-2 mt-4">
        <AnchorList 
          title="The 4 Anchors" 
          items={anchors} 
          onToggle={(id) => handleToggle(id, log[id as keyof DailyLog] as boolean)}
          isPracticeMode={isPracticeMode} 
        />
        
        <AnchorList 
          title="Daily Mandates" 
          items={mandates} 
          onToggle={(id) => handleToggle(id, log[id as keyof DailyLog] as boolean)}
          isPracticeMode={isPracticeMode} 
        />
        
        {day >= 91 && (
          <RuleDimmer rules={rules} />
        )}
      </div>

      <PanicButton />
    </div>
  );
}
