import type { EvaluationObservation, EvaluationResult, EvaluationScore } from '@/types';

// ── Utilidades ──────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countSections(text: string): number {
  return (text.match(/^#{1,3}\s+/gm) ?? []).length;
}

function countListItems(text: string): number {
  return (text.match(/^[\s]*[-*]\s+/gm) ?? []).length + (text.match(/^\d+\.\s+/gm) ?? []).length;
}

function hasSection(text: string, ...keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// ── Métricas individuales ───────────────────────────────────────────

function scoreClarity(prompt: string): { score: number; detail: string } {
  let score = 3;
  const reasons: string[] = [];

  const sections = countSections(prompt);
  if (sections >= 3) { score += 2; reasons.push(`${sections} secciones con encabezados`); }
  else if (sections >= 1) { score += 1; reasons.push(`${sections} sección(es) con encabezado`); }
  else { reasons.push('sin estructura de encabezados'); }

  const listItems = countListItems(prompt);
  if (listItems >= 5) { score += 2; reasons.push(`${listItems} items en listas`); }
  else if (listItems >= 2) { score += 1; reasons.push(`${listItems} items en listas`); }

  const words = countWords(prompt);
  if (words >= 200) { score += 1; reasons.push('longitud adecuada'); }
  if (words >= 500) { score += 1; reasons.push('buen nivel de detalle'); }

  // Check for numbered steps
  if (/\d+\.\s+/.test(prompt)) { score += 1; reasons.push('pasos numerados'); }

  return { score: Math.min(score, 10), detail: reasons.join('; ') };
}

function scoreCompleteness(prompt: string): { score: number; detail: string } {
  let score = 1;
  const found: string[] = [];
  const missing: string[] = [];

  const checks = [
    { label: 'objetivo', keywords: ['objetivo', 'goal', 'qué', 'construir', 'crear', 'desarrollar'] },
    { label: 'módulos', keywords: ['módulo', 'modular', 'componente', 'feature', 'module'] },
    { label: 'flujo', keywords: ['flujo', 'flow', 'paso', 'secuencia', 'proceso', 'workflow'] },
    { label: 'entidades', keywords: ['entidad', 'modelo', 'dato', 'schema', 'tabla', 'entity'] },
    { label: 'stack', keywords: ['stack', 'tech', 'typescript', 'react', 'node', 'framework', 'herramienta'] },
    { label: 'restricciones', keywords: ['restricción', 'regla', 'constraint', 'limite', 'no debe', 'obligatorio'] },
    { label: 'arquitectura', keywords: ['arquitectura', 'patrón', 'separación', 'capa', 'layer'] },
    { label: 'usuario', keywords: ['usuario', 'user', 'cliente', 'persona', 'actor'] },
    { label: 'orden', keywords: ['orden', 'prioridad', 'fase', 'etapa', 'primero', 'después'] },
  ];

  const lower = prompt.toLowerCase();
  for (const check of checks) {
    if (check.keywords.some(k => lower.includes(k))) {
      score += 1;
      found.push(check.label);
    } else {
      missing.push(check.label);
    }
  }

  const detail = missing.length > 0
    ? `Presente: ${found.join(', ')}. Falta: ${missing.join(', ')}`
    : `Secciones completas: ${found.join(', ')}`;

  return { score: Math.min(score, 10), detail };
}

function scoreModularity(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let score = 2;
  const signals: string[] = [];

  // Positive signals
  if (lower.includes('modular') || lower.includes('módulo')) { score += 2; signals.push('modularidad mencionada'); }
  if (lower.includes('feature') || lower.includes('componente')) { score += 1; signals.push('features/componentes'); }
  if (lower.includes('separar') || lower.includes('independiente') || lower.includes('desacopl')) { score += 1; signals.push('separación de concerns'); }
  if (lower.includes('responsabilidad') || lower.includes('srp')) { score += 1; signals.push('responsabilidad única'); }
  if (lower.includes('interfaz') || lower.includes('interface') || lower.includes('contrato')) { score += 1; signals.push('interfaces/contratos'); }
  if (lower.includes('barrel') || lower.includes('index.ts') || lower.includes('re-export')) { score += 1; signals.push('barrel exports'); }

  // Negative signals
  if (lower.includes('todo en un archivo') || lower.includes('un solo archivo')) { score -= 3; signals.push('⚠ monolítico'); }
  if (lower.includes('app.tsx') || lower.includes('app.js')) { score -= 1; signals.push('⚠ referencia a archivo central'); }

  return { score: Math.max(1, Math.min(score, 10)), detail: signals.join('; ') || 'sin señales claras' };
}

function scoreScalability(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let score = 3;
  const signals: string[] = [];

  if (lower.includes('escal')) { score += 2; signals.push('escalabilidad explícita'); }
  if (lower.includes('extensible') || lower.includes('evolucionar') || lower.includes('futuro')) { score += 1; signals.push('extensibilidad'); }
  if (lower.includes('interfaz') || lower.includes('adapter') || lower.includes('provider') || lower.includes('plugin')) { score += 2; signals.push('abstracciones/adaptadores'); }
  if (lower.includes('desacopl')) { score += 1; signals.push('desacoplamiento'); }
  if (lower.includes('config') || lower.includes('environment') || lower.includes('env')) { score += 1; signals.push('configurabilidad'); }

  return { score: Math.min(score, 10), detail: signals.join('; ') || 'sin señales claras' };
}

function scoreFunctionalPrecision(prompt: string): { score: number; detail: string } {
  let score = 3;
  const signals: string[] = [];
  const words = countWords(prompt);
  const lower = prompt.toLowerCase();

  if (words > 200) { score += 1; signals.push('longitud adecuada'); }
  if (words > 400) { score += 1; signals.push('buen nivel de detalle'); }
  if (lower.includes('flujo') || lower.includes('flow') || lower.includes('paso')) { score += 1; signals.push('flujos definidos'); }
  if (lower.includes('validación') || lower.includes('validar') || lower.includes('error')) { score += 1; signals.push('validación/errores'); }
  if (lower.includes('estado') || lower.includes('state')) { score += 1; signals.push('manejo de estado'); }
  if (/\d+\.\s+/.test(prompt)) { score += 1; signals.push('pasos enumerados'); }
  if (lower.includes('input') || lower.includes('output') || lower.includes('entrada') || lower.includes('salida')) { score += 1; signals.push('I/O definido'); }

  return { score: Math.min(score, 10), detail: signals.join('; ') || 'sin señales claras' };
}

function scoreTechnicalSpecificity(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let score = 2;
  const signals: string[] = [];

  const techTerms = ['typescript', 'react', 'vue', 'angular', 'node', 'express', 'fastify', 'prisma', 'postgres', 'mongo', 'redis', 'docker', 'vite', 'webpack', 'tailwind', 'zustand', 'redux', 'graphql', 'rest', 'api', 'jwt', 'oauth', 'websocket', 'ssr', 'ssg', 'csr'];
  const found = techTerms.filter(t => lower.includes(t));
  score += Math.min(found.length, 5);
  if (found.length > 0) signals.push(`Tecnologías: ${found.join(', ')}`);

  if (lower.includes('versión') || lower.includes('version') || /v\d+/.test(lower)) { score += 1; signals.push('versiones especificadas'); }

  return { score: Math.min(score, 10), detail: signals.join('; ') || 'sin tecnologías específicas' };
}

function scoreMethodologicalOrder(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let score = 4;
  const signals: string[] = [];

  // Check for numbered sections or phases
  if (/fase\s*\d|phase\s*\d|etapa\s*\d/i.test(prompt)) { score += 2; signals.push('fases definidas'); }
  if (/\d+\.\s+\*\*/.test(prompt)) { score += 1; signals.push('pasos numerados con énfasis'); }

  // Check order: structure before aesthetics
  const structIdx = lower.indexOf('estructura');
  const funcIdx = lower.indexOf('función') !== -1 ? lower.indexOf('función') : lower.indexOf('lógica');
  const aestheticIdx = lower.indexOf('estética') !== -1 ? lower.indexOf('estética') : lower.indexOf('diseño visual');

  if (structIdx !== -1 && funcIdx !== -1 && structIdx < funcIdx) { score += 1; signals.push('estructura antes de función'); }
  if (funcIdx !== -1 && aestheticIdx !== -1 && funcIdx < aestheticIdx) { score += 1; signals.push('función antes de estética'); }
  if (structIdx !== -1 && aestheticIdx !== -1 && structIdx < aestheticIdx) { score += 1; signals.push('estructura antes de estética'); }

  return { score: Math.min(score, 10), detail: signals.join('; ') || 'sin orden explícito' };
}

function scoreConstraintCoverage(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let score = 2;
  const covered: string[] = [];

  const constraintTypes = [
    { label: 'tamaño de archivos', keywords: ['líneas', 'archivo', '150', '200', 'máximo'] },
    { label: 'separación de concerns', keywords: ['separar', 'lógica', 'presentación', 'negocio'] },
    { label: 'tipado', keywords: ['tipo', 'typescript', 'tipado', 'interface', 'any'] },
    { label: 'testing', keywords: ['test', 'prueba', 'vitest', 'jest', 'coverage'] },
    { label: 'naming', keywords: ['nombre', 'convención', 'naming', 'camelCase', 'PascalCase'] },
    { label: 'error handling', keywords: ['error', 'excepción', 'try', 'catch', 'manejo'] },
  ];

  for (const ct of constraintTypes) {
    if (ct.keywords.some(k => lower.includes(k))) {
      score += 1.3;
      covered.push(ct.label);
    }
  }

  return { score: Math.min(Math.round(score), 10), detail: covered.length > 0 ? `Cubiertas: ${covered.join(', ')}` : 'sin restricciones explícitas' };
}

function scoreInternalConsistency(prompt: string): { score: number; detail: string } {
  let score = 7;
  const issues: string[] = [];
  const lower = prompt.toLowerCase();

  // Check for contradictions
  if ((lower.includes('simple') || lower.includes('sencillo')) && (lower.includes('complejo') || lower.includes('enterprise'))) {
    score -= 3;
    issues.push('contradice simple vs complejo');
  }
  if (lower.includes('no usar') && lower.includes('obligatorio usar')) {
    score -= 2;
    issues.push('instrucciones contradictorias');
  }
  if (lower.includes('monolito') && lower.includes('microservicio')) {
    score -= 2;
    issues.push('monolito vs microservicios');
  }

  return { score: Math.max(1, Math.min(score, 10)), detail: issues.length > 0 ? issues.join('; ') : 'sin contradicciones detectadas' };
}

function scoreFlowQuality(prompt: string): { score: number; detail: string } {
  let score = 2;
  const signals: string[] = [];
  const lower = prompt.toLowerCase();

  // Has flow/sequence section
  if (lower.includes('flujo') || lower.includes('flow') || lower.includes('secuencia') || lower.includes('proceso')) {
    score += 2;
    signals.push('flujo mencionado');
  }

  // Numbered steps
  const steps = (prompt.match(/^\d+\.\s+/gm) ?? []).length;
  if (steps >= 5) { score += 3; signals.push(`${steps} pasos definidos`); }
  else if (steps >= 3) { score += 2; signals.push(`${steps} pasos definidos`); }
  else if (steps >= 1) { score += 1; signals.push(`${steps} paso(s) definido(s)`); }

  // Flow arrows
  if (prompt.includes('→') || prompt.includes('->')) { score += 1; signals.push('flechas de flujo'); }

  // Error/edge cases in flow
  if (lower.includes('error') || lower.includes('fallback') || lower.includes('edge case')) { score += 1; signals.push('casos de error/borde'); }

  return { score: Math.min(score, 10), detail: signals.join('; ') || 'sin flujo definido' };
}

function scoreAmbiguityRisk(prompt: string): { score: number; detail: string } {
  let risk = 3;
  const issues: string[] = [];
  const lower = prompt.toLowerCase();

  const vagueTerms = ['algo', 'cosa', 'quizás', 'tal vez', 'etc', 'bonito', 'lindo', 'genial', 'fácil', 'rápido', 'simple', 'más o menos', 'lo que sea'];
  const found = vagueTerms.filter(t => lower.includes(t));
  risk += found.length;
  if (found.length > 0) issues.push(`términos vagos: ${found.join(', ')}`);

  if (countWords(prompt) < 30) { risk += 3; issues.push('texto muy corto'); }
  if (!prompt.includes('#') && !prompt.includes('-') && !prompt.includes('1.')) { risk += 1; issues.push('sin estructura'); }

  return { score: Math.min(risk, 10), detail: issues.length > 0 ? issues.join('; ') : 'bajo riesgo' };
}

function scoreMonolithismRisk(prompt: string): { score: number; detail: string } {
  const lower = prompt.toLowerCase();
  let risk = 3;
  const issues: string[] = [];

  if (!lower.includes('módulo') && !lower.includes('modular') && !lower.includes('feature') && !lower.includes('componente')) {
    risk += 2;
    issues.push('sin modularidad');
  }
  if (!lower.includes('separar') && !lower.includes('carpeta') && !lower.includes('folder')) {
    risk += 1;
    issues.push('sin separación de archivos');
  }
  if (lower.includes('todo en') || lower.includes('un archivo') || lower.includes('un solo')) {
    risk += 3;
    issues.push('solicita centralización');
  }

  return { score: Math.min(risk, 10), detail: issues.length > 0 ? issues.join('; ') : 'bajo riesgo' };
}

function scoreContradictionRisk(prompt: string): { score: number; detail: string } {
  let risk = 2;
  const issues: string[] = [];
  const lower = prompt.toLowerCase();

  const contradictions = [
    [['simple', 'sencillo', 'básico'], ['complejo', 'avanzado', 'enterprise', 'robusto']],
    [['rápido', 'veloz', 'ligero'], ['completo', 'exhaustivo', 'todas las funciones']],
    [['monolito', 'un archivo'], ['modular', 'microservicio', 'separar']],
  ];

  for (const [setA, setB] of contradictions) {
    const hasA = setA.some(t => lower.includes(t));
    const hasB = setB.some(t => lower.includes(t));
    if (hasA && hasB) {
      risk += 3;
      issues.push(`"${setA.find(t => lower.includes(t))}" vs "${setB.find(t => lower.includes(t))}"`);
    }
  }

  return { score: Math.min(risk, 10), detail: issues.length > 0 ? issues.join('; ') : 'sin contradicciones' };
}

// ── Observaciones, Checklist, Fortalezas/Debilidades ────────────────

function generateObservations(score: EvaluationScore): EvaluationObservation[] {
  const obs: EvaluationObservation[] = [];

  // Strengths
  if (score.clarity >= 7) obs.push({ category: 'strength', area: 'Claridad', message: 'Prompt bien estructurado con secciones claras.', impact: 'high' });
  if (score.completeness >= 7) obs.push({ category: 'strength', area: 'Completitud', message: 'Cubre la mayoría de aspectos necesarios.', impact: 'high' });
  if (score.modularity >= 7) obs.push({ category: 'strength', area: 'Modularidad', message: 'Clara estrategia de separación de responsabilidades.', impact: 'high' });
  if (score.flowQuality >= 7) obs.push({ category: 'strength', area: 'Flujo', message: 'Flujo bien definido con pasos claros.', impact: 'medium' });
  if (score.technicalSpecificity >= 7) obs.push({ category: 'strength', area: 'Especificidad técnica', message: 'Stack técnico bien definido.', impact: 'medium' });

  // Weaknesses
  if (score.clarity < 5) obs.push({ category: 'weakness', area: 'Claridad', message: 'El prompt carece de estructura. Agrega encabezados y listas.', impact: 'high' });
  if (score.completeness < 5) obs.push({ category: 'weakness', area: 'Completitud', message: 'Faltan secciones clave: objetivo, módulos, flujo o stack.', impact: 'high' });
  if (score.modularity < 5) obs.push({ category: 'weakness', area: 'Modularidad', message: 'No hay estrategia de modularidad definida.', impact: 'high' });
  if (score.functionalPrecision < 5) obs.push({ category: 'weakness', area: 'Precisión funcional', message: 'Descripción funcional vaga sin flujos concretos.', impact: 'medium' });
  if (score.technicalSpecificity < 4) obs.push({ category: 'weakness', area: 'Tech', message: 'Sin especificación técnica concreta.', impact: 'medium' });
  if (score.flowQuality < 4) obs.push({ category: 'weakness', area: 'Flujo', message: 'No se define un flujo de usuario o sistema.', impact: 'medium' });

  // Suggestions
  if (score.ambiguityRisk > 6) obs.push({ category: 'suggestion', area: 'Ambigüedad', message: 'Elimina términos vagos y sé más específico.', impact: 'high' });
  if (score.monolithismRisk > 5) obs.push({ category: 'suggestion', area: 'Monolitismo', message: 'Agrega restricciones de modularidad y separación de archivos.', impact: 'high' });
  if (score.contradictionRisk > 4) obs.push({ category: 'suggestion', area: 'Consistencia', message: 'Resuelve instrucciones que se contradicen entre sí.', impact: 'high' });
  if (score.methodologicalOrder < 5) obs.push({ category: 'suggestion', area: 'Orden', message: 'Define un orden de implementación: estructura → función → estética.', impact: 'medium' });
  if (score.constraintCoverage < 4) obs.push({ category: 'suggestion', area: 'Restricciones', message: 'Agrega restricciones explícitas sobre calidad, tamaño de archivos y testing.', impact: 'medium' });
  if (score.scalability < 5) obs.push({ category: 'suggestion', area: 'Escalabilidad', message: 'Menciona extensibilidad, interfaces y abstracciones.', impact: 'low' });

  return obs;
}

function generateChecklist(score: EvaluationScore): { label: string; passed: boolean; detail: string }[] {
  return [
    { label: 'Tiene objetivo claro', passed: score.clarity >= 6, detail: `Claridad: ${score.clarity}/10` },
    { label: 'Describe módulos/componentes', passed: score.modularity >= 5, detail: `Modularidad: ${score.modularity}/10` },
    { label: 'Define flujo principal', passed: score.flowQuality >= 5, detail: `Flujo: ${score.flowQuality}/10` },
    { label: 'Incluye stack técnico', passed: score.technicalSpecificity >= 4, detail: `Especificidad: ${score.technicalSpecificity}/10` },
    { label: 'Tiene estructura con secciones', passed: score.clarity >= 7, detail: `Claridad: ${score.clarity}/10` },
    { label: 'Menciona restricciones', passed: score.constraintCoverage >= 4, detail: `Cobertura: ${score.constraintCoverage}/10` },
    { label: 'Bajo riesgo de ambigüedad', passed: score.ambiguityRisk <= 4, detail: `Riesgo: ${score.ambiguityRisk}/10` },
    { label: 'Bajo riesgo de monolitismo', passed: score.monolithismRisk <= 4, detail: `Riesgo: ${score.monolithismRisk}/10` },
    { label: 'Sin contradicciones internas', passed: score.contradictionRisk <= 3, detail: `Riesgo: ${score.contradictionRisk}/10` },
    { label: 'Orden estructura→función→estética', passed: score.methodologicalOrder >= 6, detail: `Orden: ${score.methodologicalOrder}/10` },
    { label: 'Consistencia interna', passed: score.internalConsistency >= 6, detail: `Consistencia: ${score.internalConsistency}/10` },
    { label: 'Completitud de secciones', passed: score.completeness >= 7, detail: `Completitud: ${score.completeness}/10` },
  ];
}

function computeOverall(s: Omit<EvaluationScore, 'overall'>): number {
  const positives = [
    s.clarity, s.completeness, s.modularity, s.scalability,
    s.functionalPrecision, s.technicalSpecificity, s.methodologicalOrder,
    s.constraintCoverage, s.internalConsistency, s.flowQuality,
  ];
  const negatives = [s.ambiguityRisk, s.monolithismRisk, s.contradictionRisk];

  const avgPositive = positives.reduce((a, b) => a + b, 0) / positives.length;
  const avgNegative = negatives.reduce((a, b) => a + b, 0) / negatives.length;

  return Math.round(Math.max(1, Math.min(10, avgPositive - avgNegative * 0.25)) * 10) / 10;
}

// ── Entry point ─────────────────────────────────────────────────────

export function evaluatePromptV2(prompt: string): EvaluationResult {
  const clarity = scoreClarity(prompt);
  const completeness = scoreCompleteness(prompt);
  const modularity = scoreModularity(prompt);
  const scalability = scoreScalability(prompt);
  const fp = scoreFunctionalPrecision(prompt);
  const ts = scoreTechnicalSpecificity(prompt);
  const mo = scoreMethodologicalOrder(prompt);
  const cc = scoreConstraintCoverage(prompt);
  const ic = scoreInternalConsistency(prompt);
  const fq = scoreFlowQuality(prompt);
  const ar = scoreAmbiguityRisk(prompt);
  const mr = scoreMonolithismRisk(prompt);
  const cr = scoreContradictionRisk(prompt);

  const partial = {
    clarity: clarity.score,
    completeness: completeness.score,
    modularity: modularity.score,
    scalability: scalability.score,
    functionalPrecision: fp.score,
    technicalSpecificity: ts.score,
    methodologicalOrder: mo.score,
    constraintCoverage: cc.score,
    internalConsistency: ic.score,
    flowQuality: fq.score,
    ambiguityRisk: ar.score,
    monolithismRisk: mr.score,
    contradictionRisk: cr.score,
  };

  const scoreResult: EvaluationScore = {
    ...partial,
    overall: computeOverall(partial),
  };

  const observations = generateObservations(scoreResult);
  const checklist = generateChecklist(scoreResult);

  return {
    score: scoreResult,
    observations,
    checklist,
    strengths: observations.filter(o => o.category === 'strength').map(o => o.message),
    weaknesses: observations.filter(o => o.category === 'weakness').map(o => o.message),
    suggestions: observations.filter(o => o.category === 'suggestion').map(o => o.message),
  };
}
