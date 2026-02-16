import { create } from 'zustand';

interface PanicState {
  isPanic: boolean;
  setPanic: (value: boolean) => void;
}

export const usePanicStore = create<PanicState>((set) => ({
  isPanic: false,
  setPanic: (value) => set({ isPanic: value }),
}));
