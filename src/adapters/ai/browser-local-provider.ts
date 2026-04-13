import type {
  AIProvider,
  DesignStructure,
  EvaluationResult,
  OptimizationResult,
  PromptIdea,
  PromptResult,
} from '@/types';

/**
 * Stub provider for browser-local AI (e.g. WebLLM, Transformers.js).
 * Prepared for future integration with in-browser model inference.
 */
export class BrowserLocalProvider implements AIProvider {
  readonly name = 'IA en Navegador (Experimental)';

  async analyzeIdea(_idea: PromptIdea): Promise<DesignStructure> {
    throw new Error('Browser AI no está disponible aún. Requiere integración con WebLLM o Transformers.js.');
  }

  async generatePrompt(_design: DesignStructure): Promise<PromptResult> {
    throw new Error('Browser AI no está disponible aún. Requiere integración con WebLLM o Transformers.js.');
  }

  async optimizePrompt(_prompt: string): Promise<OptimizationResult> {
    throw new Error('Browser AI no está disponible aún. Requiere integración con WebLLM o Transformers.js.');
  }

  async evaluatePrompt(_prompt: string): Promise<EvaluationResult> {
    throw new Error('Browser AI no está disponible aún. Requiere integración con WebLLM o Transformers.js.');
  }
}
