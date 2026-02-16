"use client";

import { usePanicStore } from '@/lib/stores/usePanicStore';
import { X } from 'lucide-react';

export function PanicOverlay() {
  const { isPanic, setPanic } = usePanicStore();

  if (!isPanic) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <button 
        onClick={() => setPanic(false)}
        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-300"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="space-y-12 max-w-md w-full">
        <div>
          <h1 className="text-4xl font-black text-rose-500 mb-2 tracking-tight">BREATHE.</h1>
          <p className="text-slate-400 text-lg">You are in control.</p>
        </div>

        <div className="space-y-6 text-left">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <span className="text-rose-500 font-bold text-sm tracking-wider uppercase block mb-1">Step 1</span>
            <h2 className="text-2xl font-bold text-white">STOP</h2>
            <p className="text-slate-400 mt-1">Interrupt the pattern. Put the phone down.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <span className="text-rose-500 font-bold text-sm tracking-wider uppercase block mb-1">Step 2</span>
            <h2 className="text-2xl font-bold text-white">MOVE</h2>
            <p className="text-slate-400 mt-1">15 pushups or a cold shower. Immediately.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <span className="text-rose-500 font-bold text-sm tracking-wider uppercase block mb-1">Step 3</span>
            <h2 className="text-2xl font-bold text-white">CONNECT</h2>
            <p className="text-slate-400 mt-1">Call for support. Don't fight this alone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
