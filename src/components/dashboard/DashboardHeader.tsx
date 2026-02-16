import { Heart, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface DashboardHeaderProps {
  day: number;
  totalDays: number;
  mulligans: number;
}

export function DashboardHeader({ day, totalDays, mulligans }: DashboardHeaderProps) {
  const hearts = Array.from({ length: 3 });

  return (
    <div className="flex items-center justify-between py-6 px-4 border-b border-slate-800">
      <Link href="/history" className="group">
        <h1 className="text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
          Day {day}
          <Activity className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
        </h1>
        <p className="text-sm text-slate-400">of {totalDays}</p>
      </Link>
      <div className="flex gap-2">
        {hearts.map((_, index) => (
          <Heart
            key={index}
            className={clsx(
              "w-6 h-6 transition-colors duration-300",
              index < mulligans ? "text-rose-500 fill-rose-500" : "text-slate-600"
            )}
          />
        ))}
      </div>
    </div>
  );
}
