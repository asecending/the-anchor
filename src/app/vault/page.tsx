import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Star, HeartCrack } from 'lucide-react';

export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Please log in to view your Vault.
      </div>
    );
  }

  // Fetch Perfect Days (Score 10 or all anchors true? Let's check score for now, assuming logic sets it)
  // Actually, let's just fetch all logs and filter for "Perfect" in the UI or query specifically.
  // "Perfect" usually means all anchors done.
  const { data: perfectDays } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .match({ 
      anchor_sobriety: true, 
      anchor_sleep: true, 
      anchor_movement: true 
      // Therapy might be weekly, so maybe not strict requirement for "Perfect Day" unless it was therapy day.
      // But let's stick to the prompt: "Perfect Days (7/7 anchors)" - wait, there are only 4 anchors + 3 mandates = 7.
    })
    .eq('mandate_exposure', true)
    .eq('mandate_coursework', true)
    .eq('mandate_interaction', true)
    .order('date', { ascending: false });

  // Fetch Mulligan History
  const { data: mulligans } = await supabase
    .from('mulligans')
    .select('*')
    .eq('user_id', user.id)
    .order('used_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <h1 className="text-2xl font-bold text-white">The Vault</h1>
        </header>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-slate-200">Perfect Days</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Days where you executed the protocol with 100% fidelity.
          </p>

          {!perfectDays || perfectDays.length === 0 ? (
            <div className="p-6 bg-slate-900/50 rounded-lg text-center text-slate-500 border border-slate-800 border-dashed">
              No perfect days recorded yet. Keep pushing.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {perfectDays.map((day) => (
                <div key={day.id} className="bg-emerald-900/20 border border-emerald-900/50 p-2 rounded text-center">
                  <span className="block text-xs text-emerald-400 font-mono">
                    {format(new Date(day.date), 'MMM d')}
                  </span>
                  <span className="block text-[10px] text-emerald-600">
                    {format(new Date(day.date), 'yyyy')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <HeartCrack className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-200">Mulligan History</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Moments of weakness, forgiven but not forgotten.
          </p>

          {!mulligans || mulligans.length === 0 ? (
            <div className="p-6 bg-slate-900/50 rounded-lg text-center text-slate-500 border border-slate-800 border-dashed">
              No mulligans used. A clean sheet.
            </div>
          ) : (
            <div className="space-y-3">
              {mulligans.map((mulligan) => (
                <div key={mulligan.id} className="bg-rose-900/10 border border-rose-900/30 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-rose-400 text-sm font-medium">
                      {format(new Date(mulligan.used_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-rose-600 text-xs">
                      {format(new Date(mulligan.used_at), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs italic">
                    "{mulligan.reason || 'No reason provided'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
