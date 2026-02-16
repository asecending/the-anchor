import { createClient } from '@/lib/supabase/server';
import { Dashboard, DailyLog } from '@/components/dashboard/Dashboard';
import { format } from 'date-fns';
import { getProtocolRules, ProtocolRule } from '@/app/actions/rules';

// Mock Start Date (e.g., Feb 1, 2026)
const START_DATE = new Date('2026-02-01');

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Calculate current day
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - START_DATE.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const currentDay = diffDays > 0 ? diffDays : 1;
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
