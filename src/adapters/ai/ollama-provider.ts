import type {
  AIProvider,
  DesignStructure,
  EvaluationResult,
  OptimizationResult,
  PromptIdea,
  PromptResult,
} from '@/types';

/**
 * Stub provider for Ollama (local LLM).
 * Ready structurally — requires Ollama server running locally to activate.
 * 
 * To implement: connect to http://localhost:11434/api/generate
 * with the appropriate model (e.g. llama3, codellama, mistral).
 */
export class OllamaProvider implements AIProvider {
  readonly name = 'Ollama (LLM Local)';

  async analyzeIdea(_idea: PromptIdea): Promise<DesignStructure> {
    throw new Error('Ollama provider no está activo. Requiere un servidor Ollama corriendo en localhost:11434.');
  }

  async generatePrompt(_design: DesignStructure): Promise<PromptResult> {
    throw new Error('Ollama provider no está activo. Requiere un servidor Ollama corriendo en localhost:11434.');
  }

  async optimizePrompt(_prompt: string): Promise<OptimizationResult> {
    throw new Error('Ollama provider no está activo. Requiere un servidor Ollama corriendo en localhost:11434.');
  }

  async evaluatePrompt(_prompt: string): Promise<EvaluationResult> {
    throw new Error('Ollama provider no está activo. Requiere un servidor Ollama corriendo en localhost:11434.');
  }
}
