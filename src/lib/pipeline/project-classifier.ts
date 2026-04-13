import type { ProjectType } from '@/types';

interface ClassificationRule {
  type: ProjectType;
  keywords: string[];
  weight: number;
  contextPatterns?: RegExp[];
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    type: 'fullstack',
    keywords: ['fullstack', 'full-stack', 'full stack', 'frontend y backend', 'front y back'],
    weight: 3,
    contextPatterns: [/frontend.*backend/i, /backend.*frontend/i, /cliente.*servidor/i],
  },
  {
    type: 'web-app',
    keywords: ['web', 'página', 'sitio', 'dashboard', 'portal', 'plataforma', 'saas', 'app web', 'webapp', 'aplicación web', 'interfaz web'],
    weight: 1,
    contextPatterns: [/navegador/i, /browser/i, /SPA/i, /single\s*page/i],
  },
  {
    type: 'mobile-app',
    keywords: ['mobile', 'móvil', 'android', 'ios', 'react native', 'flutter', 'app móvil', 'aplicación móvil'],
    weight: 2,
    contextPatterns: [/play\s*store/i, /app\s*store/i, /nativa?/i],
  },
  {
    type: 'api',
    keywords: ['api', 'backend', 'servidor', 'rest', 'graphql', 'microservicio', 'endpoint', 'servicio web'],
    weight: 2,
    contextPatterns: [/REST\s*API/i, /API\s*REST/i, /GraphQL/i, /webhook/i],
  },
  {
    type: 'cli',
    keywords: ['cli', 'terminal', 'comando', 'consola', 'script', 'línea de comandos', 'command line'],
    weight: 2,
    contextPatterns: [/npm\s+run/i, /npx/i, /bash/i, /shell/i],
  },
  {
    type: 'library',
    keywords: ['librería', 'library', 'paquete', 'sdk', 'framework', 'plugin', 'módulo npm', 'package'],
    weight: 2,
    contextPatterns: [/npm\s+publish/i, /importar/i, /exportar.*API/i],
  },
];

export function classifyProject(input: string, hintType?: ProjectType): { type: ProjectType; confidence: number } {
  if (hintType && hintType !== 'other') {
    return { type: hintType, confidence: 0.95 };
  }

  const lower = input.toLowerCase();
  const scores: Record<ProjectType, number> = {
    'web-app': 0,
    'mobile-app': 0,
    'api': 0,
    'cli': 0,
    'library': 0,
    'fullstack': 0,
    'other': 0,
  };

  for (const rule of CLASSIFICATION_RULES) {
    // Keyword matching
    const keywordHits = rule.keywords.filter(k => lower.includes(k)).length;
    scores[rule.type] += keywordHits * rule.weight;

    // Context pattern matching
    if (rule.contextPatterns) {
      const patternHits = rule.contextPatterns.filter(p => p.test(input)).length;
      scores[rule.type] += patternHits * (rule.weight + 1);
    }
  }

  // Find best match
  let bestType: ProjectType = 'web-app';
  let bestScore = 0;
  let totalScore = 0;

  for (const [type, score] of Object.entries(scores) as [ProjectType, number][]) {
    totalScore += score;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  // Confidence based on how dominant the best match is
  const confidence = totalScore > 0 ? Math.min(0.95, 0.4 + (bestScore / totalScore) * 0.55) : 0.3;

  return { type: bestType, confidence };
}
