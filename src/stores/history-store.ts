import { create } from 'zustand';
import type { HistoryEntry } from '@/types';
import { clearHistory, deleteHistoryEntry, loadHistory } from '@/services/history-storage';

interface HistoryState {
  entries: HistoryEntry[];
  load: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],

  load: () => {
    set({ entries: loadHistory() });
  },

  remove: (id) => {
    deleteHistoryEntry(id);
    set({ entries: loadHistory() });
  },

  clear: () => {
    clearHistory();
    set({ entries: [] });
  },
}));
