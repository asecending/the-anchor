import { getProtocolHistory } from '@/app/actions/protocol';
import HeatMap from '@/components/history/HeatMap';
import IntegrityScore from '@/components/history/IntegrityScore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function HistoryPage() {
  const logs = await getProtocolHistory();

  // Hard empty state check
  if (!logs || logs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20 sm:p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/" 
              className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              The Mirror
            </h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🪞</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">The Mirror is Waiting</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                Your journey begins Tuesday.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20 sm:p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/" 
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            The Mirror
          </h1>
        </div>

        {/* Integrity Score */}
        <IntegrityScore logs={logs} />

        {/* Heat Map */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <HeatMap logs={logs} />
        </div>

        {/* Insight/Footer (Optional placeholder for future) */}
        <div className="text-center text-xs text-slate-400 mt-8">
          "The mirror does not lie."
        </div>
      </div>
    </div>
  );
}
