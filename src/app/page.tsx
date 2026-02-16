import { createClient } from '@/lib/supabase/server';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DailyLog } from '@/types';
import { format } from 'date-fns';
import { getProtocolRules, ProtocolRule } from '@/app/actions/rules';

// Protocol Start Date: Tuesday, Feb 17, 2026
const START_DATE = new Date('2026-02-17T00:00:00-05:00'); // EST

export default async function Home() {
  console.log('Current Server Time:', new Date().toISOString());
  console.log('Protocol Start Date:', START_DATE.toISOString());
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Calculate current day
  const now = new Date();
  // Use 'America/New_York' time for accurate day calculation
  const estDateString = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  const currentDate = new Date(estDateString);
  
  // Ensure start date is also treated as midnight in local time context
  const startDate = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
  
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Logic: 
  // If diffDays < 0 (Before start date) -> Day 0
  // If diffDays >= 0 (On or after start date) -> Day (diff + 1)
  
  const currentDay = diffDays >= 0 ? diffDays + 1 : 0;
  const todayStr = format(now, 'yyyy-MM-dd');

  let initialDailyLog: DailyLog = {
    date: todayStr,
    anchor_therapy: false,
    anchor_sobriety: false,
    anchor_sleep: false,
    anchor_movement: false,
    mandate_exposure: false,
    mandate_coursework: false,
    mandate_interaction: false,
    night_anchor_completed: false,
  };

  let mulligansRemaining = 3;
  let rules: ProtocolRule[] = [];

  if (user) {
    // Fetch daily log
    const { data: log } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .maybeSingle();

    if (log) {
      initialDailyLog = log;
    }

    // Fetch mulligans
    const { data: mulliganData } = await supabase
      .from('mulligans')
      .select('remaining')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (mulliganData) {
      mulligansRemaining = mulliganData.remaining;
    }

    // Fetch rules for Day 91+ features (or pre-fetch for display logic anyway)
    rules = await getProtocolRules();
  }

  return (
    <main>
      <Dashboard 
        initialDailyLog={initialDailyLog} 
        day={currentDay} 
        mulligans={mulligansRemaining} 
        rules={rules}
      />
    </main>
  );
}
