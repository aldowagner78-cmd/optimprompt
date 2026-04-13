import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  DesignStructure,
  EvaluationResult,
  PromptIdea,
  PromptResult,
} from '@/types';
import { getAIProvider } from '@/adapters/ai';
import { saveHistoryEntry } from '@/services/history-storage';

type WorkflowStage = 'idle' | 'analyzing' | 'design' | 'generating' | 'result' | 'error';

interface PromptWorkflowState {
  stage: WorkflowStage;
  idea: PromptIdea | null;
  design: DesignStructure | null;
  result: PromptResult | null;
  evaluation: EvaluationResult | null;
  error: string | null;
  isLoading: boolean;

  setIdea: (idea: PromptIdea) => void;
  analyzeIdea: () => Promise<void>;
  updateDesign: (design: DesignStructure) => void;
  generatePrompt: () => Promise<void>;
  evaluateResult: () => Promise<void>;
  reset: () => void;
}

export const usePromptWorkflowStore = create<PromptWorkflowState>((set, get) => ({
  stage: 'idle',
  idea: null,
  design: null,
  result: null,
  evaluation: null,
  error: null,
  isLoading: false,

  setIdea: (idea) => set({ idea, stage: 'idle', error: null }),

  analyzeIdea: async () => {
    const { idea } = get();
    if (!idea) return;

    set({ isLoading: true, stage: 'analyzing', error: null });
    try {
      const provider = getAIProvider();
      const design = await provider.analyzeIdea(idea);
      set({ design, stage: 'design', isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, stage: 'error', isLoading: false });
    }
  },

  updateDesign: (design) => set({ design }),

  generatePrompt: async () => {
    const { design } = get();
    if (!design) return;

    set({ isLoading: true, stage: 'generating', error: null });
    try {
      const provider = getAIProvider();
      const result = await provider.generatePrompt(design);
      set({ result, stage: 'result', isLoading: false });

      // Auto-evaluate
      const evaluation = await provider.evaluatePrompt(result.masterPrompt);
      set({ evaluation });

      // Save to history
      const { idea } = get();
      saveHistoryEntry({
        id: uuid(),
        createdAt: new Date().toISOString(),
        type: 'create',
        inputSummary: idea?.rawInput.slice(0, 100) ?? 'Prompt generado',
        idea: idea ?? undefined,
        design,
        result,
        evaluation,
      });
    } catch (e) {
      set({ error: (e as Error).message, stage: 'error', isLoading: false });
    }
  },

  evaluateResult: async () => {
    const { result } = get();
    if (!result) return;

    try {
      const provider = getAIProvider();
      const evaluation = await provider.evaluatePrompt(result.masterPrompt);
      set({ evaluation });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  reset: () => set({
    stage: 'idle',
    idea: null,
    design: null,
    result: null,
    evaluation: null,
    error: null,
    isLoading: false,
  }),
}));
