'use client';

import { useState } from 'react';
import { ProtocolRule, updateProtocolRule } from '@/app/actions/rules';
import { useRouter } from 'next/navigation';

interface RuleDimmerProps {
  rules: ProtocolRule[];
}

export function RuleDimmer({ rules }: RuleDimmerProps) {
  const router = useRouter();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'strict' | 'relaxed' | 'locked' | null>(null);

  const handleToggle = (ruleId: string, currentStatus: string) => {
    if (currentStatus === 'strict') {
      setSelectedRule(ruleId);
      setPendingStatus('relaxed');
      setShowConfirm(true);
    } else if (currentStatus === 'relaxed') {
      // Reverting to strict is always allowed without confirmation? Or should we confirm too?
      // Assuming reverting is safe.
      updateRule(ruleId, 'strict');
    }
  };

  const updateRule = async (ruleId: string, status: 'strict' | 'relaxed' | 'locked') => {
    try {
      await updateProtocolRule(ruleId, status);
      router.refresh(); // Refresh to update dashboard UI
    } catch (error) {
      console.error('Failed to update rule:', error);
      alert('Failed to update rule. Integrity score may be too low.');
    }
  };

  const confirmRelaxation = () => {
    if (selectedRule && pendingStatus) {
      updateRule(selectedRule, pendingStatus);
      setShowConfirm(false);
      setSelectedRule(null);
      setPendingStatus(null);
    }
  };

  const anchors = [
    { id: 'anchor_sobriety', label: 'Sobriety' },
    { id: 'anchor_sleep', label: 'Sleep' },
    { id: 'anchor_therapy', label: 'Therapy' },
    { id: 'anchor_movement', label: 'Movement' },
  ];

  return (
    <div className="mt-8 p-6 bg-slate-900 rounded-lg border border-slate-800">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">Protocol Control Panel</h3>
      <p className="text-slate-400 text-sm mb-6">
        You have earned the right to adjust your anchors. Proceed with caution.
        Relaxing a rule moves it to "Maintenance Mode". If your integrity score drops below 85%, all rules will automatically revert to Strict.
      </p>

      <div className="space-y-4">
        {anchors.map((anchor) => {
          const rule = rules.find((r) => r.rule_id === anchor.id);
          const status = rule?.status || 'strict'; // Default to strict if no rule found
          const isRelaxed = status === 'relaxed';

          return (
            <div key={anchor.id} className="flex items-center justify-between p-4 bg-slate-950 rounded border border-slate-800">
              <div>
                <span className="text-slate-200 font-medium block">{anchor.label}</span>
                <span className={`text-xs ${isRelaxed ? 'text-yellow-500' : 'text-emerald-500'}`}>
                  {isRelaxed ? 'Maintenance Mode' : 'Strict Adherence'}
                </span>
              </div>
              
              <button
                onClick={() => handleToggle(anchor.id, status)}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                  isRelaxed 
                    ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-800 hover:bg-yellow-900/50' 
                    : 'bg-emerald-900/30 text-emerald-500 border border-emerald-800 hover:bg-emerald-900/50'
                }`}
              >
                {isRelaxed ? 'Switch to Strict' : 'Relax Rule'}
              </button>
            </div>
          );
        })}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg max-w-md w-full shadow-2xl">
            <h4 className="text-xl font-bold text-white mb-4">The North Star Check</h4>
            <p className="text-slate-300 mb-6">
              Does relaxing this anchor move you closer to the version of yourself you want to be (Scenario A) or the version you left behind (Scenario B)?
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRelaxation}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 transition-colors"
              >
                Yes, I Am Ready
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
