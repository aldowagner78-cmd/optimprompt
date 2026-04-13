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
  const cleaned = input.trim().replace(/\s+/g, ' ');

  // For short-to-medium inputs (≤400 chars), use the FULL text as goal.
  // Most user ideas are 1-3 sentences — truncating loses critical info.
  if (cleaned.length <= 400) {
    return cleaned;
  }

  // For longer inputs, combine sentences up to ~400 chars
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  let goal = '';
  for (const s of sentences) {
    if (goal.length + s.length > 400) break;
    goal += (goal ? ' ' : '') + s.trim();
  }

  return goal || sentences[0] || cleaned.slice(0, 400);
}

function extractPrimaryActionPhrase(input: string): string {
  // Try to extract verb + object from natural Spanish patterns
  const patterns = [
    // "una app para VERB..." | "una plataforma que VERB..."
    /(?:app|aplicación|plataforma|sistema|herramienta|software)\s+(?:para|que)\s+(\w+(?:ar|er|ir)\s+.{3,80}?)(?:\s*[.,;]|\s+y\s+que)/i,
    // "para VERB..." at sentence start
    /^(?:para|que\s+permita|que\s+pueda)\s+(\w+(?:ar|er|ir)\s+.{3,60}?)(?:\s*[.,;]|$)/im,
  ];

  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1].trim();
  }

  // Fallback: first detected action verb
  const lower = input.toLowerCase();
  return ACTION_VERBS.find(v => lower.includes(v)) ?? 'desarrollar';
}

function extractExpectedOutcome(input: string): string {
  // Look for explicit outcome markers — improved for natural Spanish
  const outcomePatterns = [
    // "la idea es que..." / "la idea es..." — very common in natural Spanish
    /la\s+idea\s+es\s+(?:que\s+)?(.{10,120}?)(?:\.|$)/i,
    // "para que..." / "de modo que..."
    /(?:para\s+que|con\s+el\s+fin\s+de|con\s+el\s+objetivo\s+de|de\s+modo\s+que|de\s+manera\s+que)\s+(.{10,100}?)(?:\.|,|;|$)/i,
    // "que permita..." / "que logre..."
    /(?:que\s+permita|que\s+logre|que\s+consiga|que\s+facilite)\s+(.{10,80}?)(?:\.|,|;|$)/i,
    // "y que después..." / "y que luego..."
    /y\s+que\s+(?:después|luego|finalmente|además)\s+(?:pueda\s+)?(.{10,80}?)(?:\.|,|;|$)/i,
    // "el resultado es..." / "el objetivo es..."
    /(?:el\s+resultado|el\s+objetivo|la\s+meta)\s+(?:es|será|debería\s+ser)\s+(.{10,80}?)(?:\.|,|;|$)/i,
  ];

  for (const pattern of outcomePatterns) {
    const match = input.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback: last meaningful sentence
  const sentences = input.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length > 1) {
    return sentences[sentences.length - 1];
  }

  return 'producto funcional que cumpla los requisitos del usuario';
}

export function parseIntent(input: string): ParsedIntent {
  const actions = extractActionVerbs(input);
  const primaryAction = extractPrimaryActionPhrase(input);
  const secondaryActions = actions.slice(1);
  const domain = detectDomain(input);
  const targetUser = detectTargetUser(input);
  const complexity = detectComplexity(input, actions);
  const goal = extractGoal(input);
  const systemType = detectSystemType(input);
  const dominantVerb = actions[0] ?? 'desarrollar';
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
