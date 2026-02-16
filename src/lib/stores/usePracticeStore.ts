import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog } from '@/types';

interface PracticeState {
  practiceLog: DailyLog | null;
  setPracticeLog: (log: DailyLog) => void;
  updatePracticeLog: (column: keyof DailyLog, value: boolean) => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      practiceLog: null,
      setPracticeLog: (log) => set({ practiceLog: log }),
      updatePracticeLog: (column, value) =>
        set((state) => ({
          practiceLog: state.practiceLog
            ? { ...state.practiceLog, [column]: value }
            : null,
        })),
    }),
    {
      name: 'practice-mode-storage',
    }
  )
);
