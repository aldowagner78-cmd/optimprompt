import type {
  DesignStructure,
  EvaluationResult,
  OptimizationResult,
  PromptIdea,
  PromptResult,
} from './prompt';

export interface HistoryEntry {
  id: string;
  createdAt: string;
  type: 'create' | 'optimize';
  inputSummary: string;
  idea?: PromptIdea;
  design?: DesignStructure;
  result?: PromptResult;
  optimization?: OptimizationResult;
  evaluation?: EvaluationResult;
}
