import type {
  AIProvider,
  DesignStructure,
  EvaluationResult,
  OptimizationResult,
  PromptIdea,
  PromptResult,
} from '@/types';
import { analyzeInput, assemblePrompt, designStructure, evaluatePromptV2, refinePrompt } from '@/lib/pipeline';

export class HeuristicProvider implements AIProvider {
  readonly name = 'Heuristic Engine V2 (Local)';

  async analyzeIdea(idea: PromptIdea): Promise<DesignStructure> {
    const hintType = idea.projectType !== 'other' ? idea.projectType : undefined;
    const analysis = analyzeInput(idea.rawInput, hintType);
    return designStructure(analysis, idea.detailedMode);
  }

  async generatePrompt(design: DesignStructure): Promise<PromptResult> {
    return assemblePrompt(design);
  }

  async optimizePrompt(prompt: string): Promise<OptimizationResult> {
    return refinePrompt(prompt);
  }

  async evaluatePrompt(prompt: string): Promise<EvaluationResult> {
    return evaluatePromptV2(prompt);
  }
}
