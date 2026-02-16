'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { subDays, format } from 'date-fns';

export type ProtocolRule = {
  id: string;
  user_id: string;
  rule_id: string;
  status: 'strict' | 'relaxed' | 'locked';
  relaxation_level: number;
  created_at: string;
  updated_at: string;
};

export async function getProtocolRules() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: rules, error } = await supabase
    .from('protocol_rules')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching protocol rules:', error);
    // Return empty array instead of throwing to allow initial load if table is empty
    return [];
  }

  return rules as ProtocolRule[];
}

export async function updateProtocolRule(
  ruleId: string,
  status: 'strict' | 'relaxed' | 'locked',
  relaxationLevel: number = 1
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Before allowing relaxation, check the safety net (integrity score)
  if (status === 'relaxed') {
    const isSafe = await checkSafetyNet(user.id);
    if (!isSafe) {
      throw new Error('Integrity score too low to relax rules. Maintenance mode unavailable.');
    }
  }

  const { error } = await supabase
    .from('protocol_rules')
    .upsert(
      {
        user_id: user.id,
        rule_id: ruleId,
        status,
        relaxation_level: relaxationLevel,
      },
      { onConflict: 'user_id, rule_id' }
    );

  if (error) {
    console.error('Error updating protocol rule:', error);
    throw new Error('Failed to update protocol rule');
  }

  revalidatePath('/');
}

export async function checkSafetyNet(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Calculate integrity score for the last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const formattedDate = format(sevenDaysAgo, 'yyyy-MM-dd');

  const { data: logs, error } = await supabase
    .from('daily_logs')
    .select('score')
    .eq('user_id', userId)
    .gte('date', formattedDate)
    .order('date', { ascending: true });

  if (error || !logs || logs.length === 0) {
    return true; 
  }

  const totalScore = logs.reduce((acc, log) => acc + (log.score || 0), 0);
  const averageScore = totalScore / logs.length;
  const integrityPercentage = averageScore * 10;

  return integrityPercentage >= 85;
}

export async function enforceSafetyNet() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const isSafe = await checkSafetyNet(user.id);

  if (!isSafe) {
    // Revert all rules to strict
    const { error } = await supabase
      .from('protocol_rules')
      .update({ status: 'strict' })
      .eq('user_id', user.id)
      .eq('status', 'relaxed');
      
    if (error) {
      console.error('Error enforcing safety net:', error);
    } else {
      console.log('Safety net enforced: All rules reverted to strict.');
    }
    revalidatePath('/');
  }
}
