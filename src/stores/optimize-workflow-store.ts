import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { EvaluationResult, OptimizationResult } from '@/types';
import { getAIProvider } from '@/adapters/ai';
import { saveHistoryEntry } from '@/services/history-storage';

type OptimizeStage = 'idle' | 'analyzing' | 'result' | 'error';

interface OptimizeWorkflowState {
  stage: OptimizeStage;
  originalPrompt: string;
  optimization: OptimizationResult | null;
  evaluation: EvaluationResult | null;
  error: string | null;
  isLoading: boolean;

  submitPrompt: (prompt: string) => Promise<void>;
  analyze: () => Promise<void>;
  evaluateOptimized: () => Promise<void>;
  reset: () => void;
}

export const useOptimizeWorkflowStore = create<OptimizeWorkflowState>((set, get) => ({
  stage: 'idle',
  originalPrompt: '',
  optimization: null,
  evaluation: null,
  error: null,
  isLoading: false,

  submitPrompt: async (prompt) => {
    set({ originalPrompt: prompt, stage: 'idle', error: null });
    const { analyze } = get();
    await analyze();
  },

  analyze: async () => {
    const { originalPrompt } = get();
    if (!originalPrompt.trim()) return;

    set({ isLoading: true, stage: 'analyzing', error: null });
    try {
      const provider = getAIProvider();
      const optimization = await provider.optimizePrompt(originalPrompt);
      const evaluation = await provider.evaluatePrompt(optimization.optimizedPrompt);

      set({ optimization, evaluation, stage: 'result', isLoading: false });

      saveHistoryEntry({
        id: uuid(),
        createdAt: new Date().toISOString(),
        type: 'optimize',
        inputSummary: originalPrompt.slice(0, 100),
        optimization,
        evaluation,
      });
    } catch (e) {
      set({ error: (e as Error).message, stage: 'error', isLoading: false });
    }
  },

  evaluateOptimized: async () => {
    const { optimization } = get();
    if (!optimization) return;

    try {
      const provider = getAIProvider();
      const evaluation = await provider.evaluatePrompt(optimization.optimizedPrompt);
      set({ evaluation });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  reset: () => set({
    stage: 'idle',
    originalPrompt: '',
    optimization: null,
    evaluation: null,
    error: null,
    isLoading: false,
  }),
}));
