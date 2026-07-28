import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ScanMode = 'single' | 'batch';
export type SourceType = 'manual' | 'email' | 'qr' | 'document';

export interface HistoryEntry {
  id: string;
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  timestamp: string;
  scanMode: ScanMode;
  sourceType: SourceType;
  // Legacy field for backward compatibility
  type?: 'single' | 'batch';
}

interface HistoryState {
  entries: HistoryEntry[];
  
  // Actions
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'type'>) => void;
  addBatchEntries: (entries: Omit<HistoryEntry, 'id' | 'timestamp' | 'type' | 'scanMode'>[], sourceType?: SourceType) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  getStats: () => {
    total: number;
    phishing: number;
    legitimate: number;
    today: number;
    thisWeek: number;
  };
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: entry.scanMode, // Legacy compatibility
        };
        
        set((state) => ({
          entries: [newEntry, ...state.entries].slice(0, 1000), // Keep last 1000
        }));
      },

      addBatchEntries: (entries, sourceType = 'manual') => {
        const newEntries: HistoryEntry[] = entries.map((entry) => ({
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          scanMode: 'batch' as const,
          sourceType: sourceType,
          type: 'batch' as const, // Legacy compatibility
        }));
        
        set((state) => ({
          entries: [...newEntries, ...state.entries].slice(0, 1000),
        }));
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      clearHistory: () => {
        set({ entries: [] });
      },

      getStats: () => {
        const entries = get().entries;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
          total: entries.length,
          phishing: entries.filter((e) => e.prediction === 'phishing').length,
          legitimate: entries.filter((e) => e.prediction === 'legitimate').length,
          today: entries.filter((e) => new Date(e.timestamp) >= today).length,
          thisWeek: entries.filter((e) => new Date(e.timestamp) >= weekAgo).length,
        };
      },
    }),
    {
      name: 'history-storage',
    }
  )
);