import type { DesignStructure, EvaluationResult, OptimizationResult, PromptIdea, PromptResult } from './prompt';

export interface AIProvider {
  readonly name: string;

  analyzeIdea(idea: PromptIdea): Promise<DesignStructure>;

  generatePrompt(design: DesignStructure): Promise<PromptResult>;

  optimizePrompt(prompt: string): Promise<OptimizationResult>;

  evaluatePrompt(prompt: string): Promise<EvaluationResult>;
}
