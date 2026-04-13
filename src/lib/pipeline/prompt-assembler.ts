import type { DesignStructure, PromptResult, PromptVariant } from '@/types';

function buildMasterPrompt(design: DesignStructure): string {
  const lines: string[] = [];

  lines.push('# PROMPT MAESTRO PARA CONSTRUCCIÓN DE APLICACIÓN');
  lines.push('');

  // Objective
  lines.push('## 1. OBJETIVO');
  lines.push('');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push(`**Usuario final:** ${design.objective.targetUser}`);
  lines.push(`**Acción principal:** ${design.objective.primaryAction}`);
  if (design.systemCore) {
    lines.push(`**Sistema central:** ${design.systemCore}`);
  }
  lines.push('');

  // Mechanics summary (V2.1)
  if (design.mechanicsSummary.length > 0) {
    lines.push('## 2. MECÁNICAS NUCLEARES DEL SISTEMA');
    lines.push('');
    lines.push('El sistema se basa en las siguientes mecánicas funcionales:');
    lines.push('');
    design.mechanicsSummary.forEach(m => lines.push(`- ${m}`));
    lines.push('');
  }

  // Constraints
  if (design.objective.constraints.length > 0) {
    lines.push(`## ${design.mechanicsSummary.length > 0 ? '3' : '2'}. RESTRICCIONES Y REQUISITOS`);
    lines.push('');
    design.objective.constraints.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  // Architecture
  const archSection = design.mechanicsSummary.length > 0 ? '4' : '3';
  lines.push(`## ${archSection}. ARQUITECTURA Y MÓDULOS`);
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
  const flowSection = parseInt(archSection) + 1;
  lines.push(`## ${flowSection}. FLUJO PRINCIPAL`);
  lines.push('');
  design.mainFlow.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push('');

  // Entities
  if (design.entities.length > 0) {
    lines.push(`## ${flowSection + 1}. ENTIDADES CLAVE`);
    lines.push('');
    design.entities.forEach(e => lines.push(`- ${e}`));
    lines.push('');
  }

  // Tech decisions
  lines.push(`## ${flowSection + 2}. DECISIONES TÉCNICAS`);
  lines.push('');
  design.techDecisions.forEach(d => lines.push(`- ${d}`));
  lines.push('');

  // Architecture constraints
  lines.push(`## ${flowSection + 3}. REGLAS DE ARQUITECTURA`);
  lines.push('');
  design.architectureConstraints.forEach(c => lines.push(`- ${c}`));
  lines.push('');

  // Implementation order
  lines.push(`## ${flowSection + 4}. ORDEN DE IMPLEMENTACIÓN`);
  lines.push('');
  lines.push('1. **Estructura:** Definir módulos, carpetas, tipos e interfaces');
  lines.push('2. **Función:** Implementar lógica de negocio y flujos principales');
  lines.push('3. **Integración:** Conectar módulos y verificar flujos end-to-end');
  lines.push('4. **Estética:** Aplicar diseño visual, estilos y UX');
  lines.push('5. **Calidad:** Tests, validación y refinamiento');

  return lines.join('\n');
}

function buildSummaryVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push(`Construye: ${design.objective.summary}`);
  if (design.systemCore) {
    lines.push(`**Sistema:** ${design.systemCore}`);
  }
  lines.push('');
  if (design.mechanicsSummary.length > 0) {
    lines.push(`**Mecánicas:** ${design.mechanicsSummary.join('; ')}`);
  }
  lines.push(`**Módulos:** ${design.modules.map(m => m.name).join(', ')}`);
  lines.push(`**Flujo:** ${design.mainFlow.join(' → ')}`);
  lines.push(`**Entidades:** ${design.entities.join(', ')}`);
  lines.push(`**Tech:** ${design.techDecisions.slice(0, 4).join(', ')}`);
  lines.push('');
  if (design.objective.constraints.length > 0) {
    lines.push(`**Restricciones clave:** ${design.objective.constraints.slice(0, 3).join('; ')}`);
    lines.push('');
  }
  lines.push('**Orden:** estructura → función → integración → estética → calidad');

  return {
    label: 'Versión Resumida',
    description: 'Prompt compacto ideal para modelos con contexto limitado',
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
  lines.push('4. Cada módulo debe tener su propia carpeta con barrel export');
  lines.push('5. Seguir el orden: estructura → función → integración → estética');
  lines.push('6. Interfaces para toda comunicación entre módulos');
  lines.push('7. Un solo nivel de abstracción por función');
  lines.push('8. Tests unitarios para lógica de negocio');
  lines.push('');
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  if (design.systemCore) {
    lines.push(`**Sistema central:** ${design.systemCore}`);
  }
  lines.push('');
  if (design.mechanicsSummary.length > 0) {
    lines.push('## MECÁNICAS DEL SISTEMA');
    design.mechanicsSummary.forEach(m => lines.push(`- ${m}`));
    lines.push('');
  }
  lines.push('## MÓDULOS REQUERIDOS');
  design.modules.forEach(m => {
    lines.push(`- **${m.name}**: ${m.responsibility}`);
  });
  lines.push('');
  lines.push('## FLUJO PRINCIPAL');
  design.mainFlow.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  lines.push('## DECISIONES TÉCNICAS');
  design.techDecisions.forEach(d => lines.push(`- ${d}`));
  lines.push('');
  lines.push('## RESTRICCIONES DE ARQUITECTURA');
  design.architectureConstraints.forEach(c => lines.push(`- ${c}`));

  return {
    label: 'Versión Estricta',
    description: 'Prompt con reglas rígidas para evitar malas prácticas',
    content: lines.join('\n'),
  };
}

function buildModularVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push('# PROMPT ORIENTADO A MODULARIDAD');
  lines.push('');
  lines.push('## PRINCIPIO RECTOR');
  lines.push('Cada parte del sistema debe ser independiente, reemplazable y testeable por separado.');
  lines.push('');
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push('## ESTRUCTURA POR FEATURES');
  lines.push('Cada feature debe contener:');
  lines.push('- `components/` — Componentes de UI exclusivos');
  lines.push('- `hooks/` — Hooks específicos');
  lines.push('- `services/` — Lógica de negocio');
  lines.push('- `types.ts` — Tipos locales');
  lines.push('- `index.ts` — Barrel export');
  lines.push('');
  lines.push('## FEATURES');
  design.modules.forEach(m => {
    lines.push(`### ${m.name}`);
    lines.push(`- **Responsabilidad:** ${m.responsibility}`);
    if (m.dependencies.length > 0) {
      lines.push(`- **Depende de:** ${m.dependencies.join(', ')}`);
    }
    lines.push('');
  });
  lines.push('## REGLAS DE MODULARIDAD');
  lines.push('- Cero dependencias circulares entre features');
  lines.push('- Comunicación entre features solo a través de interfaces');
  lines.push('- Estado global mínimo; preferir estado local');
  lines.push('- Archivos de máximo 120 líneas');
  lines.push('- Cada módulo exporta solo lo necesario');
  lines.push('');
  lines.push('## ENTIDADES');
  design.entities.forEach(e => lines.push(`- ${e}`));

  return {
    label: 'Versión Modularidad Extrema',
    description: 'Prompt enfocado en máxima separación y arquitectura por features',
    content: lines.join('\n'),
  };
}

function buildIterativeVariant(design: DesignStructure): PromptVariant {
  const lines: string[] = [];
  lines.push('# PROMPT ITERATIVO POR FASES');
  lines.push('');
  lines.push('## OBJETIVO');
  lines.push(design.objective.summary);
  lines.push('');
  lines.push('## FASE 1 — FUNDACIÓN');
  lines.push('Implementa SOLO la estructura base:');
  lines.push('- Definir tipos e interfaces de todas las entidades');
  lines.push('- Crear carpetas para cada módulo');
  lines.push('- Configurar el proyecto (tsconfig, bundler, linter)');
  lines.push('- Implementar barrel exports vacíos');
  lines.push('');
  lines.push('## FASE 2 — CORE');
  if (design.mechanicsSummary.length > 0) {
    lines.push('Implementa las mecánicas centrales del sistema:');
    design.mechanicsSummary.forEach(m => lines.push(`- ${m}`));
    lines.push('');
    lines.push('Módulos de esta fase:');
  } else {
    lines.push('Implementa la funcionalidad mínima viable:');
  }
  const coreModules = design.modules.slice(0, Math.ceil(design.modules.length / 2));
  coreModules.forEach(m => lines.push(`- ${m.name}: ${m.responsibility}`));
  lines.push('');
  lines.push('## FASE 3 — EXTENSIÓN');
  lines.push('Agrega módulos secundarios:');
  const extModules = design.modules.slice(Math.ceil(design.modules.length / 2));
  extModules.forEach(m => lines.push(`- ${m.name}: ${m.responsibility}`));
  lines.push('');
  lines.push('## FASE 4 — INTEGRACIÓN Y PULIDO');
  lines.push('- Conectar todos los módulos');
  lines.push('- Implementar flujo completo: ' + design.mainFlow.join(' → '));
  lines.push('- Aplicar estilos y UX');
  lines.push('- Validar con tests');
  lines.push('');
  lines.push('## STACK');
  design.techDecisions.forEach(d => lines.push(`- ${d}`));

  return {
    label: 'Versión Iterativa por Fases',
    description: 'Prompt dividido en fases incrementales para desarrollo paso a paso',
    content: lines.join('\n'),
  };
}

export function assemblePrompt(design: DesignStructure): PromptResult {
  const masterPrompt = buildMasterPrompt(design);

  return {
    masterPrompt,
    variants: [
      buildSummaryVariant(design),
      buildStrictVariant(design),
      buildModularVariant(design),
      buildIterativeVariant(design),
    ],
  };
}
