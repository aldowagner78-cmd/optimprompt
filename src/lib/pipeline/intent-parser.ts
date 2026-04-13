import type { ParsedIntent } from '@/types';
import { detectSystemType } from './core-mechanics-extractor';

const ACTION_VERBS = [
  'crear', 'construir', 'hacer', 'desarrollar', 'implementar', 'diseñar',
  'gestionar', 'administrar', 'manejar', 'controlar', 'monitorear',
  'visualizar', 'mostrar', 'presentar', 'renderizar',
  'buscar', 'filtrar', 'listar', 'ordenar',
  'editar', 'modificar', 'actualizar', 'eliminar',
  'conectar', 'integrar', 'sincronizar', 'importar', 'exportar',
  'autenticar', 'autorizar', 'registrar', 'login',
  'enviar', 'recibir', 'notificar', 'alertar',
  'analizar', 'optimizar', 'evaluar', 'comparar',
  'generar', 'producir', 'calcular', 'procesar',
];

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'e-commerce': ['tienda', 'producto', 'carrito', 'compra', 'pago', 'inventario', 'catálogo', 'precio', 'venta'],
  'social': ['red social', 'perfil', 'publicación', 'seguir', 'feed', 'like', 'comentario', 'chat', 'mensaje'],
  'education': ['curso', 'aprender', 'enseñar', 'lección', 'quiz', 'examen', 'alumno', 'estudiante', 'profesor'],
  'productivity': ['tarea', 'proyecto', 'kanban', 'sprint', 'equipo', 'calendario', 'agenda', 'organizar'],
  'finance': ['pago', 'factura', 'contabilidad', 'presupuesto', 'gasto', 'ingreso', 'banco', 'finanza'],
  'health': ['salud', 'paciente', 'médico', 'cita', 'diagnóstico', 'historial', 'clínica', 'hospital'],
  'content': ['blog', 'artículo', 'contenido', 'publicar', 'CMS', 'editor', 'medio', 'revista'],
  'analytics': ['dashboard', 'métrica', 'reporte', 'estadística', 'gráfico', 'dato', 'análisis', 'KPI'],
  'devtools': ['API', 'SDK', 'CI/CD', 'deploy', 'testing', 'debug', 'repositorio', 'código'],
  'general': [],
};

const USER_KEYWORDS: Record<string, string[]> = {
  'administrador': ['administrador', 'admin', 'gestor', 'operador'],
  'usuario final': ['usuario', 'cliente', 'persona', 'consumidor', 'visitante'],
  'desarrollador': ['desarrollador', 'programador', 'dev', 'ingeniero'],
  'equipo': ['equipo', 'team', 'empresa', 'organización', 'compañía'],
};

function extractActionVerbs(input: string): string[] {
  const lower = input.toLowerCase();
  return ACTION_VERBS.filter(verb => lower.includes(verb));
}

function detectDomain(input: string): string {
  const lower = input.toLowerCase();
  let bestDomain = 'general';
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  return bestDomain;
}

function detectTargetUser(input: string): string {
  const lower = input.toLowerCase();

  for (const [user, keywords] of Object.entries(USER_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      return user;
    }
  }

  return 'usuario final';
}

function detectComplexity(input: string, actions: string[]): 'simple' | 'moderate' | 'complex' {
  const wordCount = input.split(/\s+/).filter(Boolean).length;
  const sentenceCount = input.split(/[.;!\n]+/).filter(s => s.trim()).length;

  if (wordCount > 150 || actions.length > 6 || sentenceCount > 8) return 'complex';
  if (wordCount > 50 || actions.length > 3 || sentenceCount > 4) return 'moderate';
  return 'simple';
}

function extractGoal(input: string): string {
  const sentences = input.split(/[.\n]+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length === 0) return input.trim();

  // First sentence or the longest sentence usually contains the main goal
  const first = sentences[0];
  const longest = sentences.reduce((a, b) => a.length > b.length ? a : b);

  // If first sentence is very short, combine first two
  if (first.split(/\s+/).length < 5 && sentences.length > 1) {
    return `${first}. ${sentences[1]}`;
  }

  // If first sentence is reasonable, use it; if longest is much more descriptive, use that
  return first.length > longest.length * 0.5 ? first : longest;
}

function extractExpectedOutcome(input: string): string {
  // Look for explicit outcome markers
  const outcomePatterns = [
    /(?:para|con el fin de|con el objetivo de|de modo que|de manera que)\s+(.{10,80}?)(?:\.|,|;|$)/i,
    /(?:el resultado|el objetivo|la meta|el propósito)\s+(?:es|será|debería ser)\s+(.{10,60}?)(?:\.|,|;|$)/i,
    /(?:que permita|que logre|que consiga|que facilite)\s+(.{10,60}?)(?:\.|,|;|$)/i,
  ];

  for (const pattern of outcomePatterns) {
    const match = input.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback: derive from main goal
  const sentences = input.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length > 1) {
    return sentences[sentences.length - 1];
  }

  return 'producto funcional que cumpla los requisitos del usuario';
}

export function parseIntent(input: string): ParsedIntent {
  const actions = extractActionVerbs(input);
  const primaryAction = actions[0] ?? 'desarrollar';
  const secondaryActions = actions.slice(1);
  const domain = detectDomain(input);
  const targetUser = detectTargetUser(input);
  const complexity = detectComplexity(input, actions);
  const goal = extractGoal(input);
  const systemType = detectSystemType(input);
  const dominantVerb = primaryAction;
  const expectedOutcome = extractExpectedOutcome(input);

  return {
    goal,
    targetUser,
    primaryAction,
    secondaryActions,
    domain,
    complexity,
    systemType,
    dominantVerb,
    expectedOutcome,
  };
}
