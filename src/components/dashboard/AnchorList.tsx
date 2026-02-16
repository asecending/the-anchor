import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface AnchorItem {
  id: string;
  label: string;
  checked: boolean;
  status?: 'strict' | 'relaxed' | 'locked';
}

interface AnchorListProps {
  title: string;
  items: AnchorItem[];
  onToggle: (id: string) => void;
  isPracticeMode?: boolean;
}

export function AnchorList({ title, items, onToggle, isPracticeMode }: AnchorListProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4 flex justify-between items-center">
        <span>{title}</span>
        {isPracticeMode && (
          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900">
            PRACTICE MODE
          </span>
        )}
      </h2>
      <div className="space-y-2 px-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={clsx(
              "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
              item.checked
                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-100"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            )}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-lg">{item.label}</span>
              {item.status === 'relaxed' && (
                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-900/50 uppercase tracking-wide">
                  Maintenance
                </span>
              )}
            </div>
            <div
              className={clsx(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
                item.checked
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-slate-600"
              )}
            >
              {item.checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
