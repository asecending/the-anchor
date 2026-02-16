'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { subDays, format } from 'date-fns';
import { enforceSafetyNet } from './rules';

export async function getProtocolHistory() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('getProtocolHistory: User not authenticated');
      return [];
    }

    const ninetyDaysAgo = subDays(new Date(), 90);
    const formattedDate = format(ninetyDaysAgo, 'yyyy-MM-dd');

    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formattedDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching protocol history:', error);
      return [];
    }

    return logs || [];
  } catch (error) {
    console.error('Unexpected error in getProtocolHistory:', error);
    return [];
  }
}

export async function updateDailyLog(
  date: string,
  column: string,
  value: boolean
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Allowed columns to prevent SQL injection or invalid updates
  const allowedColumns = [
    'anchor_therapy',
    'anchor_sobriety',
    'anchor_sleep',
    'anchor_movement',
    'mandate_exposure',
    'mandate_coursework',
    'mandate_interaction',
    'night_anchor_completed',
  ];

  if (!allowedColumns.includes(column)) {
    throw new Error('Invalid column');
  }

  // Check if a log exists for this date
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle();

  if (existingLog) {
    // Update existing log
    const { error } = await supabase
      .from('daily_logs')
      .update({ [column]: value })
      .eq('id', existingLog.id);

    if (error) {
      console.error('Error updating log:', error);
      throw new Error('Failed to update log');
    }
  } else {
    // Create new log
    const { error } = await supabase.from('daily_logs').insert({
      user_id: user.id,
      date: date,
      [column]: value,
    });

    if (error) {
      console.error('Error creating log:', error);
      throw new Error('Failed to create log');
    }
  }

  // After any log update, check if safety net needs to be enforced
  // We do this asynchronously or awaited - awaited ensures consistency before UI update
  await enforceSafetyNet();

  revalidatePath('/');
}
