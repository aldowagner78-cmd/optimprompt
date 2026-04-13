import type { EvaluationResult, EvaluationScore } from '@/types';
import { countWords } from './text-analysis';

function scoreClarity(prompt: string): number {
  let score = 5;
  if (prompt.includes('## ') || prompt.includes('# ')) score += 2;
  if (prompt.includes('1.') || prompt.includes('- ')) score += 1;
  if (countWords(prompt) > 100) score += 1;
  if (countWords(prompt) > 500) score += 1;
  return Math.min(score, 10);
}

function scoreCompleteness(prompt: string): number {
  let score = 3;
  const sections = ['objetivo', 'módulo', 'flujo', 'arquitectura', 'stack', 'tech', 'restricción', 'regla'];
  sections.forEach(s => {
    if (prompt.toLowerCase().includes(s)) score += 0.8;
  });
  return Math.min(Math.round(score), 10);
}

function scoreModularity(prompt: string): number {
  const lower = prompt.toLowerCase();
  let score = 4;
  if (lower.includes('modular') || lower.includes('módulo')) score += 2;
  if (lower.includes('feature') || lower.includes('componente')) score += 1;
  if (lower.includes('separar') || lower.includes('independiente')) score += 1;
  if (lower.includes('responsabilidad')) score += 1;
  if (lower.includes('todo en un archivo') || lower.includes('un solo archivo')) score -= 3;
  return Math.max(1, Math.min(score, 10));
}

function scoreScalability(prompt: string): number {
  const lower = prompt.toLowerCase();
  let score = 4;
  if (lower.includes('escal')) score += 2;
  if (lower.includes('extensible') || lower.includes('evolucionar')) score += 1;
  if (lower.includes('interfaz') || lower.includes('adapter') || lower.includes('provider')) score += 2;
  if (lower.includes('desacopl')) score += 1;
  return Math.min(score, 10);
}

function scoreFunctionalPrecision(prompt: string): number {
  let score = 4;
  if (countWords(prompt) > 200) score += 2;
  if (prompt.includes('flujo') || prompt.includes('flow')) score += 1;
  if (prompt.includes('validación') || prompt.includes('error')) score += 1;
  if (prompt.includes('estado') || prompt.includes('state')) score += 1;
  return Math.min(score, 10);
}

function scoreAmbiguityRisk(prompt: string): number {
  let risk = 5;
  const vagueTerms = ['algo', 'cosa', 'quizás', 'tal vez', 'etc', 'bonito', 'lindo', 'genial'];
  vagueTerms.forEach(t => {
    if (prompt.toLowerCase().includes(t)) risk += 1;
  });
  if (countWords(prompt) < 50) risk += 2;
  if (!prompt.includes('#') && !prompt.includes('-')) risk += 1;
  return Math.min(risk, 10);
}

function scoreMonolithismRisk(prompt: string): number {
  const lower = prompt.toLowerCase();
  let risk = 4;
  if (!lower.includes('módulo') && !lower.includes('modular') && !lower.includes('feature')) risk += 2;
  if (!lower.includes('separar') && !lower.includes('carpeta')) risk += 1;
  if (lower.includes('todo en') || lower.includes('un archivo')) risk += 3;
  if (lower.includes('app.tsx') || lower.includes('index.js')) risk += 1;
  return Math.min(risk, 10);
}

function computeOverall(score: Omit<EvaluationScore, 'overall'>): number {
  const positive = (score.clarity + score.completeness + score.modularity + score.scalability + score.functionalPrecision) / 5;
  const negative = (score.ambiguityRisk + score.monolithismRisk) / 2;
  return Math.round(Math.max(1, Math.min(10, positive - (negative * 0.3))) * 10) / 10;
}

function generateObservations(score: EvaluationScore): string[] {
  const obs: string[] = [];

  if (score.clarity < 5) obs.push('El prompt carece de estructura clara. Agrega encabezados y listas.');
  if (score.completeness < 5) obs.push('Faltan secciones importantes: objetivo, módulos, flujo o stack técnico.');
  if (score.modularity < 5) obs.push('No se menciona modularidad. Agrega indicaciones sobre separación de responsabilidades.');
  if (score.scalability < 5) obs.push('No hay indicaciones de escalabilidad o extensibilidad.');
  if (score.functionalPrecision < 5) obs.push('La descripción funcional es vaga. Detalla flujos y validaciones.');
  if (score.ambiguityRisk > 6) obs.push('Alto riesgo de ambigüedad. Elimina términos vagos y sé más específico.');
  if (score.monolithismRisk > 6) obs.push('Alto riesgo de generar código monolítico. Agrega restricciones de modularidad.');
  if (score.overall >= 7) obs.push('El prompt tiene buena calidad general.');

  return obs;
}

function generateChecklist(score: EvaluationScore): { label: string; passed: boolean }[] {
  return [
    { label: 'Tiene objetivo claro', passed: score.clarity >= 6 },
    { label: 'Describe módulos o componentes', passed: score.modularity >= 5 },
    { label: 'Define flujo principal', passed: score.functionalPrecision >= 5 },
    { label: 'Incluye stack técnico', passed: score.completeness >= 5 },
    { label: 'Tiene estructura con encabezados', passed: score.clarity >= 7 },
    { label: 'Menciona restricciones de arquitectura', passed: score.scalability >= 5 },
    { label: 'Bajo riesgo de ambigüedad', passed: score.ambiguityRisk <= 5 },
    { label: 'Bajo riesgo de monolitismo', passed: score.monolithismRisk <= 4 },
    { label: 'Orden estructura → función → estética', passed: score.completeness >= 6 },
  ];
}

export function evaluatePrompt(prompt: string): EvaluationResult {
  const partialScore = {
    clarity: scoreClarity(prompt),
    completeness: scoreCompleteness(prompt),
    modularity: scoreModularity(prompt),
    scalability: scoreScalability(prompt),
    functionalPrecision: scoreFunctionalPrecision(prompt),
    ambiguityRisk: scoreAmbiguityRisk(prompt),
    monolithismRisk: scoreMonolithismRisk(prompt),
  };

  const score: EvaluationScore = {
    ...partialScore,
    overall: computeOverall(partialScore),
  };

  return {
    score,
    observations: generateObservations(score),
    checklist: generateChecklist(score),
  };
}
