import type { AnalysisResult, DesignStructure, SuggestedModule, CoreMechanic } from '@/types';
import { validateCoverage, generateMissingModules } from './coverage-validator';

// ── Forbidden placeholder names — HARD BLOCK ───────────────────────

const FORBIDDEN_MODULE_NAMES = [
  'core feature', 'funcionalidad principal', 'feature principal',
  'módulo principal', 'main feature', 'entidad principal',
];

function isForbiddenName(name: string): boolean {
  const lower = name.toLowerCase();
  return FORBIDDEN_MODULE_NAMES.some(f => lower.includes(f));
}

// ── Minimal infra modules (ONLY added at the end, not at the top) ──

const INFRA_MODULES: Record<string, SuggestedModule[]> = {
  'web-app': [
    { name: 'Auth', responsibility: 'Autenticación y autorización de usuarios', dependencies: [] },
  ],
  'mobile-app': [
    { name: 'Auth', responsibility: 'Autenticación y sesión del usuario', dependencies: [] },
  ],
  'api': [
    { name: 'Routes', responsibility: 'Definición de endpoints y rutas', dependencies: [] },
    { name: 'Middleware', responsibility: 'Auth, validación, logging', dependencies: [] },
  ],
  'cli': [
    { name: 'Commands', responsibility: 'Definición de comandos disponibles', dependencies: [] },
  ],
  'library': [
    { name: 'Core', responsibility: 'API pública principal', dependencies: [] },
  ],
  'fullstack': [
    { name: 'Auth', responsibility: 'Autenticación end-to-end', dependencies: [] },
  ],
  'other': [],
};

// ── Module generation from mechanics ───────────────────────────────

function generateModulesFromMechanics(mechanics: CoreMechanic[]): SuggestedModule[] {
  const modules: SuggestedModule[] = [];
  const usedNames = new Set<string>();

  for (const mech of mechanics) {
    const moduleName = mech.label
      .split(/[/]+/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');

    if (usedNames.has(moduleName.toLowerCase())) continue;
    usedNames.add(moduleName.toLowerCase());

    const responsibility = mech.subMechanics.length > 0
      ? `${mech.label}: ${mech.subMechanics.join(', ')}`
      : `Gestión y lógica de ${mech.label}`;

    const deps: string[] = [];
    // Mechanics that depend on others
    if (mech.category === 'reward' || mech.category === 'progress') {
      const validationMech = mechanics.find(m => m.category === 'validation');
      if (validationMech) deps.push(validationMech.label.charAt(0).toUpperCase() + validationMech.label.slice(1));
    }

    modules.push({ name: moduleName, responsibility, dependencies: deps });
  }

  return modules;
}

// ── Entity-derived modules ─────────────────────────────────────────

function generateModulesFromEntities(analysis: AnalysisResult, existingNames: Set<string>): SuggestedModule[] {
  const modules: SuggestedModule[] = [];

  if (analysis.intent.complexity === 'simple') return modules;

  for (const entity of analysis.entities) {
    const name = entity.name;
    if (existingNames.has(name.toLowerCase()) ||
        name === 'Configuración' || name === 'Sesión' ||
        name === 'Entidad Principal') continue;

    // Only add entity modules if they're not already covered by a mechanic module
    modules.push({
      name,
      responsibility: `Gestión CRUD y lógica de ${name}: ${entity.attributes.slice(0, 4).join(', ')}`,
      dependencies: [],
    });
    existingNames.add(name.toLowerCase());
  }

  return modules;
}

// ── Pattern-derived modules ────────────────────────────────────────

function generateModulesFromPatterns(patterns: string[], existingNames: Set<string>): SuggestedModule[] {
  const modules: SuggestedModule[] = [];
  const patternModules: Record<string, SuggestedModule> = {
    'realtime': { name: 'Tiempo Real', responsibility: 'Comunicación en tiempo real (WebSocket/SSE)', dependencies: [] },
    'notifications': { name: 'Notificaciones', responsibility: 'Sistema de notificaciones push y en-app', dependencies: [] },
    'search': { name: 'Búsqueda', responsibility: 'Búsqueda y filtrado avanzado', dependencies: [] },
    'file-upload': { name: 'Archivos', responsibility: 'Subida, almacenamiento y descarga de archivos', dependencies: [] },
    'export': { name: 'Exportación', responsibility: 'Exportación de datos a PDF, Excel, CSV', dependencies: [] },
    'charts': { name: 'Visualización', responsibility: 'Gráficos y visualización de datos', dependencies: [] },
  };

  for (const pattern of patterns) {
    const mod = patternModules[pattern];
    if (mod && !existingNames.has(mod.name.toLowerCase())) {
      modules.push(mod);
      existingNames.add(mod.name.toLowerCase());
    }
  }

  return modules;
}

// ── Flow generation from mechanics ─────────────────────────────────

function deriveFlowFromMechanics(analysis: AnalysisResult): string[] {
  const mechanics = analysis.mechanics;
  const steps: string[] = [];

  // DO NOT start with "abre app" or "login" — those are infra, not domain.
  // Start directly with the first functional action.

  // Generate steps from mechanics — ordered by logical flow
  const categoryOrder: string[] = ['control', 'interaction', 'validation', 'reward', 'progress', 'restriction'];
  const sortedMechanics = [...mechanics].sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });

  for (const mech of sortedMechanics) {
    // Generate 1-2 concrete flow steps per mechanic
    const mechSteps = generateFlowStepsForMechanic(mech);
    for (const step of mechSteps) {
      if (!steps.includes(step)) {
        steps.push(step);
      }
    }
  }

  // If we still have very few steps, add action-based steps
  if (steps.length < 3) {
    if (analysis.intent.secondaryActions.length > 0) {
      for (const action of analysis.intent.secondaryActions.slice(0, 3)) {
        steps.push(`${action.charAt(0).toUpperCase() + action.slice(1)} según el flujo del dominio`);
      }
    } else {
      steps.push(`Ejecuta la acción principal del sistema`);
    }
  }

  // Closing step
  steps.push('Sistema actualiza métricas, progreso y registra la actividad');

  return steps;
}

function generateFlowStepsForMechanic(mech: CoreMechanic): string[] {
  const steps: string[] = [];

  switch (mech.id) {
    case 'usage-control':
      steps.push('Sistema monitorea el tiempo de uso por aplicación');
      steps.push('Al alcanzar el límite, bloquea o notifica al usuario');
      break;
    case 'points-system':
      steps.push('Usuario completa acciones que generan puntos');
      steps.push('Sistema acredita puntos y actualiza saldo');
      break;
    case 'redemption':
      steps.push('Usuario consulta opciones de canje disponibles');
      steps.push('Valida saldo y ejecuta el canje');
      break;
    case 'task-validation':
      steps.push('Usuario registra o completa una tarea/actividad');
      steps.push('Sistema valida el cumplimiento según criterios definidos');
      break;
    case 'habit-tracking':
      steps.push('Usuario registra actividad o hábito del día');
      steps.push('Sistema actualiza streak y progreso del hábito');
      break;
    case 'booking-validation':
      steps.push('Usuario busca disponibilidad y agenda turno/cita');
      steps.push('Sistema confirma la reserva y programa recordatorio');
      break;
    case 'gamification':
      steps.push('Sistema evalúa logros y actualiza nivel del usuario');
      steps.push('Desbloquea recompensas según progreso acumulado');
      break;
    case 'progress-tracking':
      steps.push('Usuario consulta su progreso y estadísticas');
      break;
    case 'streak-system':
      steps.push('Sistema verifica y actualiza racha diaria del usuario');
      break;
    case 'level-unlock':
      steps.push('Sistema verifica requisitos y desbloquea nuevo contenido/nivel');
      break;
    case 'time-limits':
      steps.push('Sistema aplica límites de tiempo configurados');
      break;
    case 'sales-tracking':
      steps.push('Vendedor registra interacción con prospecto/cliente');
      steps.push('Sistema actualiza pipeline y calcula métricas de conversión');
      break;
    case 'commission-system':
      steps.push('Sistema calcula comisión basada en ventas cerradas');
      break;
    case 'exam-assessment':
      steps.push('Usuario responde evaluación/examen');
      steps.push('Sistema califica automáticamente y muestra resultados');
      break;
    case 'social-interaction':
      steps.push('Usuario interactúa con contenido del feed (like, comentar, compartir)');
      break;
    case 'messaging':
      steps.push('Usuario envía/recibe mensajes en tiempo real');
      break;
    case 'access-control':
      steps.push('Sistema valida permisos del usuario para la acción solicitada');
      break;
    case 'content-moderation':
      steps.push('Contenido pasa por revisión antes de ser publicado');
      break;
    case 'scheduling-rules':
      steps.push('Usuario consulta disponibilidad según reglas de horario');
      break;
    case 'purchase-restrictions':
      steps.push('Sistema verifica plan del usuario y habilita/restringe funciones');
      break;
    case 'inventory-management':
      steps.push('Sistema actualiza stock y alerta si hay bajo inventario');
      break;
    default:
      steps.push(`Ejecuta lógica de ${mech.label}`);
  }

  return steps;
}

// ── Fallback flow for when no mechanics are detected ───────────────

function deriveGenericFlow(analysis: AnalysisResult): string[] {
  const steps = [
    'Usuario accede a la aplicación',
    'Se autentica (si aplica)',
  ];

  // Use secondary actions to generate specific steps
  if (analysis.intent.secondaryActions.length > 0) {
    for (const action of analysis.intent.secondaryActions.slice(0, 4)) {
      steps.push(`${action.charAt(0).toUpperCase() + action.slice(1)} según el flujo del dominio`);
    }
  } else {
    steps.push(`Ejecuta la acción principal: ${analysis.intent.primaryAction}`);
  }

  steps.push('Recibe feedback del resultado');
  steps.push('Sistema registra la actividad');

  return steps;
}

// ── Tech decisions and constraints ─────────────────────────────────

function deriveTechDecisions(analysis: AnalysisResult): string[] {
  const decisions: string[] = [
    'Arquitectura modular por features/dominio',
    'Tipado fuerte con TypeScript',
    'Separación clara entre lógica de negocio y presentación',
  ];

  for (const constraint of analysis.constraints) {
    if (constraint.category === 'tech-stack' && constraint.source === 'explicit') {
      decisions.push(constraint.description);
    }
  }

  for (const tech of analysis.suggestedTechnologies) {
    // V2.3: Double-check relevance against raw input (safety net)
    const STOP = new Set(['para', 'como', 'sobre', 'desde', 'entre', 'hasta', 'cada', 'todo', 'toda', 'todos', 'estado', 'puede', 'debe', 'tiene', 'hacer', 'sistema', 'seguro', 'segura', 'salud', 'datos', 'interactivo']);
    const techWords = tech.toLowerCase().split(/[\s/(),&+]+/).filter(w => w.length > 3 && !STOP.has(w));
    const inputWords = new Set(
      analysis.rawInput.toLowerCase().split(/[\s,;.!?¿¡"'()\[\]{}:]+/).filter(w => w.length > 2)
    );
    const isRelevant = techWords.some(w => inputWords.has(w));
    if (isRelevant && !decisions.some(d => d.toLowerCase().includes(tech.toLowerCase()))) {
      decisions.push(tech);
    }
  }

  return decisions;
}

function deriveArchitectureConstraints(analysis: AnalysisResult, modules: SuggestedModule[]): string[] {
  const constraints: string[] = [
    'Cada módulo debe tener responsabilidad única (SRP)',
    'Separar lógica de negocio de la presentación',
    'Usar interfaces para desacoplar dependencias entre módulos',
  ];

  for (const c of analysis.constraints) {
    if (c.category === 'architecture' && c.priority === 'must') {
      constraints.push(c.description);
    }
  }

  // Add platform constraints
  for (const pc of analysis.platformConstraints) {
    constraints.push(pc);
  }

  if (modules.length > 6) {
    constraints.push('Agrupar módulos relacionados en features cohesivos');
  }

  if (analysis.intent.complexity === 'complex') {
    constraints.push('No concentrar lógica en archivos de más de 150 líneas');
    constraints.push('Documentar interfaces públicas de cada módulo');
  }

  return constraints;
}

// ── Main designer ──────────────────────────────────────────────────

export function designStructure(analysis: AnalysisResult, detailedMode: boolean): DesignStructure {
  const hasMechanics = analysis.mechanics.length > 0;

  // === PRIORITY ORDER: domain first, infra last ===

  // 1. Generate domain modules from mechanics (PRIMARY source)
  const mechanicModules = generateModulesFromMechanics(analysis.mechanics);

  // 2. Add entity-derived modules (if not already covered by mechanics)
  const usedNames = new Set(mechanicModules.map(m => m.name.toLowerCase()));
  const entityModules = generateModulesFromEntities(analysis, usedNames);

  // 3. Add pattern-detected modules
  for (const m of entityModules) usedNames.add(m.name.toLowerCase());
  const patternModules = generateModulesFromPatterns(analysis.detectedPatterns, usedNames);

  // 4. LAST: add infra modules (Auth, etc.) — only if not redundant
  const infraModules = (INFRA_MODULES[analysis.projectType] ?? [])
    .filter(m => !usedNames.has(m.name.toLowerCase()));

  // Combine: DOMAIN FIRST, infra last
  let modules = [...mechanicModules, ...entityModules, ...patternModules, ...infraModules];

  // 5. HARD BLOCK: remove any forbidden placeholder names
  modules = modules.filter(m => !isForbiddenName(m.name));

  // 6. Generate flow from mechanics (not from templates)
  let mainFlow = hasMechanics
    ? deriveFlowFromMechanics(analysis)
    : deriveGenericFlow(analysis);

  // 7. Validate coverage and auto-correct if needed
  const keyConcepts = analysis.keyConcepts;
  const entities = analysis.entities.map(e => {
    const attrs = detailedMode ? ` (${e.attributes.slice(0, 4).join(', ')})` : '';
    return `${e.name}${attrs}`;
  });

  let coverage = validateCoverage(keyConcepts, analysis.mechanics, modules, mainFlow, entities);

  // Auto-correct: if missing mechanics, add modules for them
  if (coverage.missingConcepts.length > 0) {
    const missingMechanics = analysis.mechanics.filter(m =>
      coverage.missingConcepts.includes(m.label)
    );
    if (missingMechanics.length > 0) {
      const extraModules = generateMissingModules(missingMechanics, modules);
      modules = [...modules, ...extraModules];
      coverage = validateCoverage(keyConcepts, analysis.mechanics, modules, mainFlow, entities);
    }
  }

  // 8. AUTO-REGENERATION GUARD: if output is still too generic, force rebuild
  if (hasMechanics && isOutputTooGeneric(modules, mainFlow, analysis)) {
    // Strip infra and rebuild from mechanics only
    modules = generateModulesFromMechanics(analysis.mechanics);
    modules = modules.filter(m => !isForbiddenName(m.name));

    // Rebuild flow from mechanics only
    mainFlow = deriveFlowFromMechanics(analysis);

    // Re-validate coverage
    coverage = validateCoverage(keyConcepts, analysis.mechanics, modules, mainFlow, entities);
    if (coverage.missingConcepts.length > 0) {
      const missingMechanics = analysis.mechanics.filter(m =>
        coverage.missingConcepts.includes(m.label)
      );
      const extraModules = generateMissingModules(missingMechanics, modules);
      modules = [...modules, ...extraModules];
      coverage = validateCoverage(keyConcepts, analysis.mechanics, modules, mainFlow, entities);
    }

    // Add infra at the very end
    const finalUsed = new Set(modules.map(m => m.name.toLowerCase()));
    const finalInfra = (INFRA_MODULES[analysis.projectType] ?? [])
      .filter(m => !finalUsed.has(m.name.toLowerCase()));
    modules = [...modules, ...finalInfra];
  }

  // 9. Build tech decisions and constraints
  const techDecisions = deriveTechDecisions(analysis);
  const architectureConstraints = deriveArchitectureConstraints(analysis, modules);

  const objective = {
    summary: analysis.intent.goal,
    targetUser: analysis.intent.targetUser,
    primaryAction: analysis.intent.primaryAction,
    constraints: analysis.constraints
      .filter(c => c.priority === 'must' || (detailedMode && c.priority === 'should'))
      .map(c => c.description),
  };

  // 10. Build system core description
  const systemCore = analysis.intent.systemType !== 'aplicación general'
    ? analysis.intent.systemType
    : (hasMechanics
        ? `sistema basado en ${analysis.mechanics.map(m => m.label).join(', ')}`
        : 'aplicación general');

  const mechanicsSummary = analysis.mechanics.map(m => {
    const subs = m.subMechanics.slice(0, 3).join(', ');
    return `${m.label} (${subs})`;
  });

  return {
    objective,
    modules,
    mainFlow,
    entities,
    techDecisions,
    architectureConstraints,
    systemCore,
    mechanicsSummary,
    coverageWarnings: coverage.warnings,
  };
}

// ── Genericness detection — triggers auto-regeneration ──────────────

function isOutputTooGeneric(
  modules: SuggestedModule[],
  mainFlow: string[],
  analysis: AnalysisResult,
): boolean {
  const moduleText = modules.map(m => `${m.name} ${m.responsibility}`).join(' ').toLowerCase();
  const flowText = mainFlow.join(' ').toLowerCase();

  // Check for forbidden placeholder names that slipped through
  const hasForbidden = modules.some(m => isForbiddenName(m.name));

  // Check for generic flow patterns
  const genericFlowPatterns = [
    'interactúa con el contenido',
    'navega a funcionalidad',
    'pantalla principal',
    'ejecuta la acción principal',
  ];
  const hasGenericFlow = genericFlowPatterns.some(p => flowText.includes(p));

  // Check domain keyword coverage in modules
  const domainKeywords = analysis.keyConcepts.filter(k => k.length > 3);
  const coveredInModules = domainKeywords.filter(k => moduleText.includes(k));
  const coverageRatio = domainKeywords.length > 0
    ? coveredInModules.length / domainKeywords.length
    : 1;

  // Generic if: has forbidden names, generic flow, or very low domain coverage
  return hasForbidden || hasGenericFlow || (analysis.mechanics.length >= 2 && coverageRatio < 0.2);
}
