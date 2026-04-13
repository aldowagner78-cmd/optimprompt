import type { AnalysisResult, DesignStructure, SuggestedModule, CoreMechanic } from '@/types';
import { validateCoverage, generateMissingModules } from './coverage-validator';
import { extractKeyConcepts } from './core-mechanics-extractor';

// ── Minimal base modules (only infra, not domain) ──────────────────

const INFRA_MODULES: Record<string, SuggestedModule[]> = {
  'web-app': [
    { name: 'Auth', responsibility: 'Autenticación y autorización de usuarios', dependencies: [] },
    { name: 'Layout', responsibility: 'Estructura visual principal, navegación y shell', dependencies: [] },
  ],
  'mobile-app': [
    { name: 'Auth', responsibility: 'Autenticación y sesión del usuario', dependencies: [] },
    { name: 'Navigation', responsibility: 'Navegación entre pantallas', dependencies: [] },
  ],
  'api': [
    { name: 'Routes', responsibility: 'Definición de endpoints y rutas', dependencies: [] },
    { name: 'Middleware', responsibility: 'Auth, validación, logging', dependencies: [] },
  ],
  'cli': [
    { name: 'Commands', responsibility: 'Definición de comandos disponibles', dependencies: [] },
    { name: 'Output', responsibility: 'Formateo y presentación de resultados', dependencies: [] },
  ],
  'library': [
    { name: 'Core', responsibility: 'API pública principal', dependencies: [] },
    { name: 'Types', responsibility: 'Tipos e interfaces exportados', dependencies: [] },
  ],
  'fullstack': [
    { name: 'Frontend - Layout', responsibility: 'Shell visual y navegación', dependencies: [] },
    { name: 'Backend - API', responsibility: 'Endpoints y controladores', dependencies: [] },
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

  // Start with auth/entry
  if (analysis.projectType === 'mobile-app') {
    steps.push('Usuario abre la aplicación');
    steps.push('Se autentica o registra');
  } else if (analysis.projectType === 'api') {
    steps.push('Cliente envía request autenticado');
  } else {
    steps.push('Usuario accede a la aplicación');
    steps.push('Se autentica (si aplica)');
  }

  // Generate steps from mechanics — ordered by category
  const categoryOrder: string[] = ['interaction', 'control', 'validation', 'reward', 'progress', 'restriction'];
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

  // If we still have very few steps, add generic completion
  if (steps.length < 4) {
    steps.push(`Ejecuta la acción principal: ${analysis.intent.primaryAction}`);
    steps.push('Recibe feedback del resultado');
  }

  // Add closing step
  steps.push('Sistema registra la actividad y actualiza métricas');

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
    if (!decisions.some(d => d.toLowerCase().includes(tech.toLowerCase()))) {
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

  // 1. Start with minimal infra modules
  const infraModules = INFRA_MODULES[analysis.projectType] ?? [];

  // 2. Generate domain modules from mechanics (primary source)
  const mechanicModules = generateModulesFromMechanics(analysis.mechanics);

  // 3. Combine infra + mechanic modules
  let modules = [...infraModules, ...mechanicModules];
  const usedNames = new Set(modules.map(m => m.name.toLowerCase()));

  // 4. Add entity-derived modules (if not already covered by mechanics)
  const entityModules = generateModulesFromEntities(analysis, usedNames);
  modules = [...modules, ...entityModules];

  // 5. Add pattern-detected modules
  const patternModules = generateModulesFromPatterns(analysis.detectedPatterns, usedNames);
  modules = [...modules, ...patternModules];

  // 6. Generate flow from mechanics (not from templates)
  const mainFlow = hasMechanics
    ? deriveFlowFromMechanics(analysis)
    : deriveGenericFlow(analysis);

  // 7. Validate coverage and auto-correct if needed
  const keyConcepts = extractKeyConcepts(analysis.intent.goal);
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
      // Re-validate after correction
      coverage = validateCoverage(keyConcepts, analysis.mechanics, modules, mainFlow, entities);
    }
  }

  // 8. Build tech decisions and constraints
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

  // 9. Build system core description
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
