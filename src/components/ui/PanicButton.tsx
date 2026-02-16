"use client";

import { usePanicStore } from '@/lib/stores/usePanicStore';

export function PanicButton() {
  const setPanic = usePanicStore((state) => state.setPanic);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent pb-8">
      <button
        onClick={() => setPanic(true)}
        className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-900/20 transition-all duration-200 transform active:scale-95 text-lg tracking-wider"
      >
        I'M SLIPPING
      </button>
    </div>
  );
}
