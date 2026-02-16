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
import { usePracticeStore } from '@/lib/stores/usePracticeStore';
import { DailyLog } from '@/types';

interface DashboardProps {
  initialDailyLog: DailyLog;
  day: number;
  mulligans: number;
  rules?: ProtocolRule[];
}

export function Dashboard({ initialDailyLog, day, mulligans, rules = [] }: DashboardProps) {
  const isPracticeMode = day === 0;
  
  // Local state for normal days
  const [log, setLog] = useState<DailyLog>(initialDailyLog);
  
  // Store for Practice Mode persistence
  const { practiceLog, setPracticeLog, updatePracticeLog } = usePracticeStore();
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);
  
  const [isPending, startTransition] = useTransition();

  // Initialize practice store on mount if in practice mode
  useEffect(() => {
    if (isPracticeMode) {
      // If store is empty, initialize with props
      if (!practiceLog) {
        setPracticeLog(initialDailyLog);
      }
      setIsStoreLoaded(true);
    }
  }, [isPracticeMode, initialDailyLog, practiceLog, setPracticeLog]);

  // Sync with server updates if initialDailyLog changes (e.g. revalidation) - Only for non-practice days
  useEffect(() => {
    if (!isPracticeMode) {
      setLog(initialDailyLog);
    }
  }, [initialDailyLog, isPracticeMode]);

  // Determine which log to display
  // For Practice Mode: use store (if loaded) -> otherwise initial
  // For Real Mode: use local state
  const displayLog = isPracticeMode 
    ? (practiceLog || initialDailyLog) 
    : log;

  const handleToggle = async (column: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    if (isPracticeMode) {
      // Update store directly
      updatePracticeLog(column as keyof DailyLog, newValue);
    } else {
      // Normal flow: Update local state + Server Action
      setLog(prev => ({ ...prev, [column]: newValue }));
      
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
      checked: displayLog.anchor_sobriety,
      status: rules.find(r => r.rule_id === 'anchor_sobriety')?.status 
    },
    { 
      id: 'anchor_sleep', 
      label: 'Sleep (Digital Sundown)', 
      checked: displayLog.anchor_sleep,
      status: rules.find(r => r.rule_id === 'anchor_sleep')?.status 
    },
    { 
      id: 'anchor_therapy', 
      label: 'Therapy (Weekly)', 
      checked: displayLog.anchor_therapy,
      status: rules.find(r => r.rule_id === 'anchor_therapy')?.status 
    },
    { 
      id: 'anchor_movement', 
      label: 'Movement (5/week)', 
      checked: displayLog.anchor_movement,
      status: rules.find(r => r.rule_id === 'anchor_movement')?.status 
    },
  ];

  const mandates: AnchorItem[] = [
    { id: 'mandate_exposure', label: 'Public Exposure', checked: displayLog.mandate_exposure },
    { id: 'mandate_coursework', label: 'Coursework', checked: displayLog.mandate_coursework },
    { id: 'mandate_interaction', label: 'Human Interaction', checked: displayLog.mandate_interaction },
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
          onToggle={(id) => handleToggle(id, displayLog[id as keyof DailyLog] as boolean)}
          isPracticeMode={isPracticeMode} 
        />
        
        <AnchorList 
          title="Daily Mandates" 
          items={mandates} 
          onToggle={(id) => handleToggle(id, displayLog[id as keyof DailyLog] as boolean)}
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
