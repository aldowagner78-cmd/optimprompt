import type { AIProvider } from '@/types';
import { HeuristicProvider } from './heuristic-provider';
import { OllamaProvider } from './ollama-provider';
import { BrowserLocalProvider } from './browser-local-provider';

export type ProviderType = 'heuristic' | 'ollama' | 'browser-local';

export type ProviderStatus = 'available' | 'not-configured' | 'planned';

export interface ProviderInfo {
  type: ProviderType;
  name: string;
  description: string;
  status: ProviderStatus;
}

const providers: Record<ProviderType, () => AIProvider> = {
  heuristic: () => new HeuristicProvider(),
  ollama: () => new OllamaProvider(),
  'browser-local': () => new BrowserLocalProvider(),
};

let currentProvider: AIProvider | null = null;
let currentType: ProviderType = 'heuristic';

export function getAIProvider(): AIProvider {
  if (!currentProvider) {
    currentProvider = providers[currentType]();
  }
  return currentProvider;
}

export function setAIProvider(type: ProviderType): void {
  currentType = type;
  currentProvider = providers[type]();
}

export function getCurrentProviderType(): ProviderType {
  return currentType;
}

export function getAvailableProviders(): ProviderInfo[] {
  return [
    {
      type: 'heuristic',
      name: 'Motor Heurístico V2',
      description: 'Procesamiento local con pipeline de análisis, sin costo ni dependencias externas.',
      status: 'available',
    },
    {
      type: 'ollama',
      name: 'Ollama (LLM Local)',
      description: 'Requiere servidor Ollama corriendo en localhost:11434 con un modelo compatible.',
      status: 'not-configured',
    },
    {
      type: 'browser-local',
      name: 'IA en Navegador',
      description: 'Inferencia directa en el navegador con WebLLM o Transformers.js (experimental).',
      status: 'planned',
    },
  ];
}
