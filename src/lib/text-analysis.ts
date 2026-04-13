import type { ProjectType } from '@/types';

const PROJECT_TYPE_KEYWORDS: Record<ProjectType, string[]> = {
  'web-app': ['web', 'página', 'sitio', 'dashboard', 'portal', 'plataforma', 'saas', 'app web'],
  'mobile-app': ['mobile', 'móvil', 'android', 'ios', 'react native', 'flutter'],
  'api': ['api', 'backend', 'servidor', 'rest', 'graphql', 'microservicio'],
  'cli': ['cli', 'terminal', 'comando', 'consola', 'script'],
  'library': ['librería', 'library', 'paquete', 'sdk', 'framework', 'plugin'],
  'fullstack': ['fullstack', 'full-stack', 'full stack', 'frontend y backend'],
  'other': [],
};

export function detectProjectType(input: string): ProjectType {
  const lower = input.toLowerCase();
  let bestMatch: ProjectType = 'web-app';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(PROJECT_TYPE_KEYWORDS) as [ProjectType, string[]][]) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
}

export function extractKeyPhrases(input: string): string[] {
  const sentences = input.split(/[.;,\n]+/).map(s => s.trim()).filter(Boolean);
  return sentences;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
