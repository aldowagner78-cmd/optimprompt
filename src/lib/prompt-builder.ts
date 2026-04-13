import type { DesignStructure, PromptResult, PromptVariant } from '@/types';

export function buildMasterPrompt(design: DesignStructure): string {
  const lines: string[] = [];

  lines.push('# PROMPT MAESTRO PARA CONSTRUCCIÓN DE APLICACIÓN');
  lines.push('');

  // Objective
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push(`**Usuario final:** ${design.objective.targetUser}`);
  lines.push(`**Acción principal:** ${design.objective.primaryAction}`);
  lines.push('');

  // Constraints
  if (design.objective.constraints.length > 0) {
    lines.push('## RESTRICCIONES');
    design.objective.constraints.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  // Architecture
  lines.push('## ARQUITECTURA Y MÓDULOS');
  lines.push('');
  lines.push('La aplicación debe seguir una arquitectura modular con los siguientes módulos:');
  lines.push('');
  design.modules.forEach(m => {
    lines.push(`### ${m.name}`);
    lines.push(`- **Responsabilidad:** ${m.responsibility}`);
    if (m.dependencies.length > 0) {
      lines.push(`- **Dependencias:** ${m.dependencies.join(', ')}`);
    }
    lines.push('');
  });

  // Main flow
  lines.push('## FLUJO PRINCIPAL');
  lines.push('');
  design.mainFlow.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push('');

  // Entities
  if (design.entities.length > 0) {
    lines.push('## ENTIDADES CLAVE');
    design.entities.forEach(e => lines.push(`- ${e}`));
    lines.push('');
  }

  // Tech decisions
  lines.push('## DECISIONES TÉCNICAS');
  design.techDecisions.forEach(d => lines.push(`- ${d}`));
  lines.push('');

  // Architecture constraints
  lines.push('## REGLAS DE ARQUITECTURA');
  design.architectureConstraints.forEach(c => lines.push(`- ${c}`));
  lines.push('');

  // Order
  lines.push('## ORDEN DE IMPLEMENTACIÓN');
  lines.push('1. **Estructura:** Definir módulos, carpetas, tipos e interfaces');
  lines.push('2. **Función:** Implementar lógica de negocio y flujos');
  lines.push('3. **Estética:** Aplicar diseño visual, estilos y UX');

  return lines.join('\n');
}

function buildSummaryVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push(`Construye una aplicación: ${design.objective.summary}`);
  lines.push('');
  lines.push(`Módulos: ${design.modules.map(m => m.name).join(', ')}`);
  lines.push(`Flujo: ${design.mainFlow.join(' → ')}`);
  lines.push(`Tech: ${design.techDecisions.slice(0, 3).join(', ')}`);
  lines.push('');
  lines.push('Prioriza: estructura → función → estética. Arquitectura modular.');

  return {
    label: 'Versión Resumida',
    description: 'Prompt compacto con lo esencial, ideal para modelos con contexto limitado',
    content: lines.join('\n'),
  };
}

function buildStrictVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push('# INSTRUCCIONES ESTRICTAS DE IMPLEMENTACIÓN');
  lines.push('');
  lines.push('## REGLAS OBLIGATORIAS');
  lines.push('1. NO crear archivos de más de 150 líneas');
  lines.push('2. NO mezclar lógica de negocio con presentación');
  lines.push('3. NO usar any en TypeScript');
  lines.push('4. Cada módulo debe tener su propia carpeta');
  lines.push('5. Seguir el orden: estructura → función → estética');
  lines.push('');
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push('## MÓDULOS REQUERIDOS');
  design.modules.forEach(m => {
    lines.push(`- **${m.name}**: ${m.responsibility}`);
  });
  lines.push('');
  lines.push('## FLUJO PRINCIPAL');
  design.mainFlow.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  lines.push('## STACK');
  design.techDecisions.forEach(d => lines.push(`- ${d}`));

  return {
    label: 'Versión Estricta',
    description: 'Prompt con reglas rígidas para evitar malas prácticas',
    content: lines.join('\n'),
  };
}

function buildModularVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push('# PROMPT ORIENTADO A MODULARIDAD EXTREMA');
  lines.push('');
  lines.push('## PRINCIPIO RECTOR');
  lines.push('Cada parte del sistema debe ser independiente, reemplazable y testeable por separado.');
  lines.push('');
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push('## ARQUITECTURA POR FEATURES');
  lines.push('Cada feature debe contener:');
  lines.push('- components/ — Componentes de UI exclusivos del feature');
  lines.push('- hooks/ — Hooks específicos');
  lines.push('- services/ — Lógica de negocio del feature');
  lines.push('- types.ts — Tipos locales');
  lines.push('- index.ts — Barrel export');
  lines.push('');
  lines.push('## FEATURES');
  design.modules.forEach(m => {
    lines.push(`### ${m.name}`);
    lines.push(`Responsabilidad: ${m.responsibility}`);
    if (m.dependencies.length > 0) {
      lines.push(`Depende de: ${m.dependencies.join(', ')}`);
    }
    lines.push('');
  });
  lines.push('## REGLAS');
  lines.push('- Cero dependencias circulares entre features');
  lines.push('- Comunicación entre features solo a través de interfaces');
  lines.push('- Estado global mínimo; preferir estado local');
  lines.push('- Archivos de máximo 120 líneas');

  return {
    label: 'Versión Modularidad Extrema',
    description: 'Prompt enfocado en máxima separación y arquitectura por features',
    content: lines.join('\n'),
  };
}

export function generateAllVariants(design: DesignStructure, masterPrompt: string): PromptResult {
  return {
    masterPrompt,
    variants: [
      buildSummaryVariant(design),
      buildStrictVariant(design),
      buildModularVariant(design),
    ],
  };
}
