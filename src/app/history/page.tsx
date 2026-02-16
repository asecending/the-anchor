import { getProtocolHistory } from '@/app/actions/protocol';
import HeatMap from '@/components/history/HeatMap';
import IntegrityScore from '@/components/history/IntegrityScore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function HistoryPage() {
  const logs = await getProtocolHistory();

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
