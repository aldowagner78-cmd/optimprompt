import type { AIProvider } from '@/types';
import { HeuristicProvider } from './heuristic-provider';

export type ProviderType = 'heuristic';

const providers: Record<ProviderType, () => AIProvider> = {
  heuristic: () => new HeuristicProvider(),
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

export function getAvailableProviders(): { type: ProviderType; name: string }[] {
  return [
    { type: 'heuristic', name: 'Motor Heurístico (Local)' },
  ];
}
