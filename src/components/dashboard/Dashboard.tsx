'use client';

import { useOptimistic, useTransition } from 'react';
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
  const [optimisticLog, addOptimisticLog] = useOptimistic(
    initialDailyLog,
    (state: DailyLog, newLog: Partial<DailyLog>) => ({
      ...state,
      ...newLog,
    })
  );

  const [isPending, startTransition] = useTransition();

  const handleToggle = async (column: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Optimistically update
    startTransition(async () => {
      addOptimisticLog({ [column]: newValue });
      try {
        await updateDailyLog(initialDailyLog.date, column, newValue);
      } catch (error) {
        console.error('Failed to update log:', error);
        // In a real app, you might want to revert the optimistic update or show a toast
      }
    });
  };

  const anchors: AnchorItem[] = [
    { 
      id: 'anchor_sobriety', 
      label: 'Sobriety (Zero THC)', 
      checked: optimisticLog.anchor_sobriety,
      status: rules.find(r => r.rule_id === 'anchor_sobriety')?.status 
    },
    { 
      id: 'anchor_sleep', 
      label: 'Sleep (Digital Sundown)', 
      checked: optimisticLog.anchor_sleep,
      status: rules.find(r => r.rule_id === 'anchor_sleep')?.status 
    },
    { 
      id: 'anchor_therapy', 
      label: 'Therapy (Weekly)', 
      checked: optimisticLog.anchor_therapy,
      status: rules.find(r => r.rule_id === 'anchor_therapy')?.status 
    },
    { 
      id: 'anchor_movement', 
      label: 'Movement (5/week)', 
      checked: optimisticLog.anchor_movement,
      status: rules.find(r => r.rule_id === 'anchor_movement')?.status 
    },
  ];

  const mandates: AnchorItem[] = [
    { id: 'mandate_exposure', label: 'Public Exposure', checked: optimisticLog.mandate_exposure },
    { id: 'mandate_coursework', label: 'Coursework', checked: optimisticLog.mandate_coursework },
    { id: 'mandate_interaction', label: 'Human Interaction', checked: optimisticLog.mandate_interaction },
  ];

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
          onToggle={(id) => handleToggle(id, optimisticLog[id as keyof DailyLog] as boolean)} 
        />
        
        <AnchorList 
          title="Daily Mandates" 
          items={mandates} 
          onToggle={(id) => handleToggle(id, optimisticLog[id as keyof DailyLog] as boolean)} 
        />
        
        {day >= 91 && (
          <RuleDimmer rules={rules} />
        )}
      </div>

      <PanicButton />
    </div>
  );
}
