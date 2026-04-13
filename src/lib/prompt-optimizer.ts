import type { OptimizationObservation, OptimizationResult } from '@/types';
import { countWords } from './text-analysis';

function detectObservations(prompt: string): OptimizationObservation[] {
  const lower = prompt.toLowerCase();
  const obs: OptimizationObservation[] = [];

  // Ambiguity checks
  const vagueTerms = ['algo así', 'más o menos', 'quizás', 'cosa', 'lo que sea', 'etc.', 'bonito'];
  vagueTerms.forEach(term => {
    if (lower.includes(term)) {
      obs.push({
        type: 'ambiguity',
        severity: 'medium',
        message: `Término vago detectado: "${term}". Reemplázalo con una descripción precisa.`,
      });
    }
  });

  // Modularity checks
  if (!lower.includes('módulo') && !lower.includes('modular') && !lower.includes('componente') && !lower.includes('feature')) {
    obs.push({
      type: 'modularity',
      severity: 'high',
      message: 'No se menciona modularidad. Un prompt profesional debe indicar cómo separar responsabilidades.',
    });
  }

  // Monolith risk
  if (lower.includes('todo en un archivo') || lower.includes('un solo archivo') || lower.includes('app.tsx')) {
    obs.push({
      type: 'monolith-risk',
      severity: 'high',
      message: 'Riesgo de código monolítico. Agrega restricciones para dividir el código en módulos.',
    });
  }

  // Order issue (mentions design/aesthetic before structure)
  const structureIdx = Math.min(
    lower.indexOf('estructura') === -1 ? Infinity : lower.indexOf('estructura'),
    lower.indexOf('arquitectura') === -1 ? Infinity : lower.indexOf('arquitectura'),
    lower.indexOf('módulo') === -1 ? Infinity : lower.indexOf('módulo'),
  );
  const aestheticIdx = Math.min(
    lower.indexOf('estilo') === -1 ? Infinity : lower.indexOf('estilo'),
    lower.indexOf('diseño visual') === -1 ? Infinity : lower.indexOf('diseño visual'),
    lower.indexOf('colores') === -1 ? Infinity : lower.indexOf('colores'),
    lower.indexOf('bonito') === -1 ? Infinity : lower.indexOf('bonito'),
  );

  if (aestheticIdx < structureIdx && aestheticIdx !== Infinity) {
    obs.push({
      type: 'order-issue',
      severity: 'medium',
      message: 'La estética se menciona antes que la estructura. Prioriza: estructura → función → estética.',
    });
  }

  // Missing details
  if (countWords(prompt) < 30) {
    obs.push({
      type: 'missing-detail',
      severity: 'high',
      message: 'El prompt es demasiado corto. Agrega objetivo, módulos, flujo y restricciones.',
    });
  }

  if (!lower.includes('flujo') && !lower.includes('flow') && !lower.includes('paso')) {
    obs.push({
      type: 'missing-detail',
      severity: 'medium',
      message: 'No se describe el flujo principal del usuario.',
    });
  }

  if (!lower.includes('typescript') && !lower.includes('stack') && !lower.includes('react') && !lower.includes('tech')) {
    obs.push({
      type: 'missing-detail',
      severity: 'low',
      message: 'No se especifica stack técnico. Considera agregarlo para mejores resultados.',
    });
  }

  return obs;
}

function rebuildPrompt(original: string, observations: OptimizationObservation[]): string {
  const lines: string[] = [];
  const hasStructure = original.toLowerCase().includes('estructura') || original.toLowerCase().includes('arquitectura');
  const hasModularity = original.toLowerCase().includes('modular') || original.toLowerCase().includes('módulo');

  lines.push('# PROMPT OPTIMIZADO');
  lines.push('');

  // Add objective section if missing clear structure
  if (!original.includes('##') && !original.includes('# ')) {
    lines.push('## OBJETIVO');
    lines.push(original.trim());
    lines.push('');
  } else {
    lines.push(original.trim());
    lines.push('');
  }

  // Add missing sections based on observations
  const hasMissingModularity = observations.some(o => o.type === 'modularity');
  if (hasMissingModularity || !hasModularity) {
    lines.push('## REGLAS DE MODULARIDAD');
    lines.push('- Cada módulo debe tener responsabilidad única');
    lines.push('- No crear archivos de más de 150 líneas');
    lines.push('- Separar lógica de negocio de la presentación');
    lines.push('- Usar arquitectura por features');
    lines.push('');
  }

  if (!hasStructure) {
    lines.push('## ORDEN DE IMPLEMENTACIÓN');
    lines.push('1. **Estructura:** Módulos, carpetas, tipos e interfaces');
    lines.push('2. **Función:** Lógica de negocio, flujos, validaciones');
    lines.push('3. **Estética:** Diseño visual, estilos, UX');
    lines.push('');
  }

  const hasMissingFlow = observations.some(o => o.message.includes('flujo'));
  if (hasMissingFlow) {
    lines.push('## FLUJO PRINCIPAL');
    lines.push('(Define aquí el flujo paso a paso del usuario principal)');
    lines.push('');
  }

  return lines.join('\n');
}

export function optimizePrompt(prompt: string): OptimizationResult {
  const observations = detectObservations(prompt);
  const optimizedPrompt = rebuildPrompt(prompt, observations);

  return {
    originalPrompt: prompt,
    observations,
    optimizedPrompt,
  };
}
