import type { OptimizationObservation, OptimizationResult } from '@/types';

// ── Detección de problemas ─────────────────────────────────────────

const VAGUE_TERMS = [
  { term: 'algo así', fix: 'específica qué es exactamente' },
  { term: 'más o menos', fix: 'indica el rango o valor preciso' },
  { term: 'quizás', fix: 'decide: ¿se incluye o no?' },
  { term: 'cosa', fix: 'nombra la entidad o concepto concreto' },
  { term: 'lo que sea', fix: 'define los criterios exactos' },
  { term: 'etc.', fix: 'lista todos los elementos relevantes' },
  { term: 'etc', fix: 'lista todos los elementos relevantes' },
  { term: 'bonito', fix: 'define el sistema de diseño o estilo visual específico' },
  { term: 'genial', fix: 'indica qué resultado concreto se espera' },
  { term: 'lindo', fix: 'define los criterios de diseño visual' },
  { term: 'fácil de usar', fix: 'describe los flujos UX esperados y acciones del usuario' },
  { term: 'rápido', fix: 'define métricas de rendimiento (ej: < 200ms TTI)' },
  { term: 'simple', fix: 'describe la complejidad exacta esperada' },
];

interface DetectionRule {
  id: string;
  detect: (input: string, lower: string) => OptimizationObservation | null;
}

const DETECTION_RULES: DetectionRule[] = [
  // Vague terms
  ...VAGUE_TERMS.map((v): DetectionRule => ({
    id: `vague-${v.term}`,
    detect: (_input, lower) => {
      if (!lower.includes(v.term)) return null;
      return {
        type: 'ambiguity',
        severity: 'medium',
        message: `Término vago: "${v.term}"`,
        location: v.term,
        fix: v.fix,
      };
    },
  })),

  // No modularity mentioned
  {
    id: 'no-modularity',
    detect: (_input, lower) => {
      if (lower.includes('módulo') || lower.includes('modular') || lower.includes('componente') || lower.includes('feature') || lower.includes('separar')) return null;
      return {
        type: 'modularity',
        severity: 'high',
        message: 'No se menciona ninguna estrategia de modularidad o separación de responsabilidades.',
        fix: 'Agrega una sección de arquitectura que describa la separación por módulos/features.',
      };
    },
  },

  // Monolith risk
  {
    id: 'monolith-risk',
    detect: (_input, lower) => {
      if (!lower.includes('todo en un archivo') && !lower.includes('un solo archivo') && !lower.includes('app.tsx') && !lower.includes('app.js')) return null;
      return {
        type: 'monolith-risk',
        severity: 'high',
        message: 'Se sugiere concentrar código en un solo archivo, lo que genera código monolítico.',
        fix: 'Establece restricciones: máximo 150 líneas por archivo, un módulo por carpeta.',
      };
    },
  },

  // Aesthetic before structure
  {
    id: 'order-aesthetic-first',
    detect: (_input, lower) => {
      const structIdx = Math.min(
        lower.indexOf('estructura') === -1 ? Infinity : lower.indexOf('estructura'),
        lower.indexOf('arquitectura') === -1 ? Infinity : lower.indexOf('arquitectura'),
        lower.indexOf('módulo') === -1 ? Infinity : lower.indexOf('módulo'),
      );
      const aestheticIdx = Math.min(
        lower.indexOf('estilo') === -1 ? Infinity : lower.indexOf('estilo'),
        lower.indexOf('diseño visual') === -1 ? Infinity : lower.indexOf('diseño visual'),
        lower.indexOf('colores') === -1 ? Infinity : lower.indexOf('colores'),
      );
      if (aestheticIdx >= structIdx || aestheticIdx === Infinity) return null;
      return {
        type: 'order-issue',
        severity: 'medium',
        message: 'La estética se menciona antes que la estructura/arquitectura.',
        fix: 'Reordena: estructura → función → integración → estética.',
      };
    },
  },

  // Too short
  {
    id: 'too-short',
    detect: (input) => {
      const wordCount = input.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 30) return null;
      return {
        type: 'missing-detail',
        severity: 'high',
        message: `Prompt muy corto (${wordCount} palabras). Falta contexto para generar código de calidad.`,
        fix: 'Agrega: objetivo, módulos, flujo principal, entidades y restricciones.',
      };
    },
  },

  // Missing flow
  {
    id: 'no-flow',
    detect: (_input, lower) => {
      if (lower.includes('flujo') || lower.includes('flow') || lower.includes('paso') || lower.includes('secuencia') || lower.includes('proceso')) return null;
      return {
        type: 'missing-flow',
        severity: 'medium',
        message: 'No se describe el flujo principal del usuario o del sistema.',
        fix: 'Agrega una sección "Flujo Principal" con los pasos numerados.',
      };
    },
  },

  // Missing tech stack
  {
    id: 'no-stack',
    detect: (_input, lower) => {
      if (lower.includes('typescript') || lower.includes('javascript') || lower.includes('react') || lower.includes('vue') || lower.includes('angular') || lower.includes('node') || lower.includes('python') || lower.includes('stack') || lower.includes('tech')) return null;
      return {
        type: 'missing-detail',
        severity: 'low',
        message: 'No se especifica stack técnico.',
        fix: 'Define el stack: lenguaje, framework, base de datos, herramientas.',
      };
    },
  },

  // No entities
  {
    id: 'no-entities',
    detect: (_input, lower) => {
      const entityWords = ['entidad', 'modelo', 'tabla', 'schema', 'entity', 'objeto', 'recurso'];
      if (entityWords.some(e => lower.includes(e))) return null;
      // Check for common entity names
      const commonEntities = ['usuario', 'producto', 'pedido', 'tarea', 'proyecto', 'mensaje', 'curso'];
      if (commonEntities.filter(e => lower.includes(e)).length >= 2) return null;
      return {
        type: 'missing-detail',
        severity: 'medium',
        message: 'No se definen las entidades del dominio.',
        fix: 'Agrega una sección de entidades con sus atributos y relaciones.',
      };
    },
  },

  // No clear structure (no headers/sections)
  {
    id: 'no-structure',
    detect: (input) => {
      if (input.includes('##') || input.includes('# ') || (input.includes('1.') && input.includes('2.'))) return null;
      if (input.split(/\s+/).filter(Boolean).length < 50) return null; // short prompts don't need headers
      return {
        type: 'vague-scope',
        severity: 'medium',
        message: 'El prompt no tiene estructura con secciones diferenciadas.',
        fix: 'Usa encabezados Markdown (## Sección) para organizar: Objetivo, Módulos, Flujo, Stack, Restricciones.',
      };
    },
  },

  // Contradictions
  {
    id: 'contradiction-simple-complex',
    detect: (_input, lower) => {
      const simple = lower.includes('simple') || lower.includes('sencillo') || lower.includes('básico');
      const complex = lower.includes('complejo') || lower.includes('avanzado') || lower.includes('enterprise');
      if (!simple || !complex) return null;
      return {
        type: 'inconsistency',
        severity: 'high',
        message: 'Contradicción: se pide algo "simple" y a la vez "complejo/avanzado".',
        fix: 'Decide la complejidad: MVP simple o sistema enterprise. No ambos.',
      };
    },
  },

  // Weak constraints
  {
    id: 'weak-constraints',
    detect: (_input, lower) => {
      const weakPhrases = ['si es posible', 'si se puede', 'opcionalmente', 'sería bueno', 'estaría bien', 'quizá'];
      const found = weakPhrases.filter(p => lower.includes(p));
      if (found.length === 0) return null;
      return {
        type: 'weak-constraint',
        severity: 'low',
        message: `Restricciones débiles: "${found.join('", "')}". Un prompt efectivo usa instrucciones directas.`,
        fix: 'Convierte las sugerencias en instrucciones claras: "DEBE..." en vez de "sería bueno si...".',
      };
    },
  },
];

function detectObservations(prompt: string): OptimizationObservation[] {
  const lower = prompt.toLowerCase();
  const observations: OptimizationObservation[] = [];

  for (const rule of DETECTION_RULES) {
    const obs = rule.detect(prompt, lower);
    if (obs) observations.push(obs);
  }

  return observations;
}

// ── Reescritura inteligente ─────────────────────────────────────────

function extractIntentFromPrompt(prompt: string): string {
  const lines = prompt.split('\n').map(l => l.trim()).filter(Boolean);

  // Try to find explicit objective
  const objIdx = lines.findIndex(l => /^#+\s*(objetivo|goal|qué|what)/i.test(l));
  if (objIdx !== -1 && objIdx + 1 < lines.length) {
    return lines[objIdx + 1];
  }

  // Use first substantive sentence
  const substantive = lines.find(l => l.length > 20 && !l.startsWith('#'));
  return substantive ?? lines[0] ?? prompt.slice(0, 200);
}

function rewritePrompt(original: string, observations: OptimizationObservation[]): { prompt: string; changes: string[] } {
  const changes: string[] = [];
  let content = original.trim();

  // Step 1: Add structure if missing
  const hasHeaders = content.includes('##') || content.includes('# ');
  if (!hasHeaders && content.split(/\s+/).length > 20) {
    const intent = extractIntentFromPrompt(content);
    content = `## OBJETIVO\n\n${content}`;
    changes.push('Agregada estructura con encabezados Markdown');

    // Don't duplicate the objective if it's already the first line
    if (intent !== content.split('\n')[2]) {
      changes.push('Sección de objetivo identificada y destacada');
    }
  }

  // Step 2: Replace vague terms
  for (const v of VAGUE_TERMS) {
    if (content.toLowerCase().includes(v.term)) {
      const regex = new RegExp(v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      content = content.replace(regex, `[DEFINIR: ${v.fix}]`);
      changes.push(`Término vago "${v.term}" marcado para definición precisa`);
    }
  }

  // Step 3: Add missing sections
  const lower = content.toLowerCase();

  const needsModularity = observations.some(o => o.type === 'modularity');
  if (needsModularity) {
    content += '\n\n## ARQUITECTURA MODULAR\n';
    content += '- Cada módulo debe tener responsabilidad única\n';
    content += '- No crear archivos de más de 150 líneas\n';
    content += '- Separar lógica de negocio de la presentación\n';
    content += '- Usar arquitectura por features con barrel exports\n';
    content += '- Interfaces para comunicación entre módulos';
    changes.push('Agregada sección de arquitectura modular');
  }

  const needsFlow = observations.some(o => o.type === 'missing-flow');
  if (needsFlow) {
    content += '\n\n## FLUJO PRINCIPAL\n';
    content += '1. [Define el primer paso del usuario]\n';
    content += '2. [Define la acción principal]\n';
    content += '3. [Define el procesamiento]\n';
    content += '4. [Define el resultado/feedback]';
    changes.push('Agregada plantilla de flujo principal');
  }

  const needsStack = observations.some(o => o.message.includes('stack'));
  if (needsStack) {
    content += '\n\n## STACK TÉCNICO\n';
    content += '- [Define lenguaje principal]\n';
    content += '- [Define framework/librería]\n';
    content += '- [Define base de datos si aplica]\n';
    content += '- [Define herramientas adicionales]';
    changes.push('Agregada plantilla de stack técnico');
  }

  // Step 4: Add implementation order if missing
  if (!lower.includes('orden') && !lower.includes('fase') && !lower.includes('prioridad')) {
    content += '\n\n## ORDEN DE IMPLEMENTACIÓN\n';
    content += '1. **Estructura:** Módulos, carpetas, tipos e interfaces\n';
    content += '2. **Función:** Lógica de negocio, flujos, validaciones\n';
    content += '3. **Integración:** Conectar módulos, verificar E2E\n';
    content += '4. **Estética:** Diseño visual, estilos, UX\n';
    content += '5. **Calidad:** Tests, optimización, documentación';
    changes.push('Agregado orden de implementación recomendado');
  }

  // Step 5: Handle weak constraints
  const weakPhrases = ['si es posible', 'si se puede', 'opcionalmente', 'sería bueno', 'estaría bien'];
  for (const phrase of weakPhrases) {
    if (content.toLowerCase().includes(phrase)) {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      content = content.replace(regex, 'DEBE');
      changes.push(`Restricción débil "${phrase}" convertida en instrucción directa`);
    }
  }

  return { prompt: content, changes };
}

export function refinePrompt(prompt: string): OptimizationResult {
  const observations = detectObservations(prompt);
  const { prompt: optimizedPrompt, changes } = rewritePrompt(prompt, observations);
  const preservedIntent = extractIntentFromPrompt(prompt);

  return {
    originalPrompt: prompt,
    observations,
    optimizedPrompt,
    changesSummary: changes,
    preservedIntent,
  };
}
