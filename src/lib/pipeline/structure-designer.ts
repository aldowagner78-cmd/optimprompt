import type { AnalysisResult, DesignStructure, SuggestedModule } from '@/types';

const BASE_MODULES: Record<string, SuggestedModule[]> = {
  'web-app': [
    { name: 'Auth', responsibility: 'Autenticación y autorización de usuarios', dependencies: [] },
    { name: 'Layout', responsibility: 'Estructura visual principal, navegación y shell', dependencies: [] },
    { name: 'Dashboard', responsibility: 'Panel principal con métricas y accesos rápidos', dependencies: ['Auth'] },
    { name: 'Settings', responsibility: 'Configuración de usuario y preferencias', dependencies: ['Auth'] },
  ],
  'mobile-app': [
    { name: 'Auth', responsibility: 'Autenticación y sesión del usuario', dependencies: [] },
    { name: 'Navigation', responsibility: 'Navegación entre pantallas', dependencies: [] },
    { name: 'Home', responsibility: 'Pantalla principal', dependencies: ['Auth', 'Navigation'] },
    { name: 'Profile', responsibility: 'Perfil y configuración del usuario', dependencies: ['Auth'] },
  ],
  'api': [
    { name: 'Routes', responsibility: 'Definición de endpoints y rutas', dependencies: [] },
    { name: 'Controllers', responsibility: 'Lógica de los endpoints', dependencies: ['Services'] },
    { name: 'Services', responsibility: 'Lógica de negocio', dependencies: ['Data'] },
    { name: 'Data', responsibility: 'Acceso a datos y repositorios', dependencies: [] },
    { name: 'Middleware', responsibility: 'Auth, validación, logging', dependencies: [] },
  ],
  'cli': [
    { name: 'Commands', responsibility: 'Definición de comandos disponibles', dependencies: [] },
    { name: 'Core', responsibility: 'Lógica principal del CLI', dependencies: [] },
    { name: 'Output', responsibility: 'Formateo y presentación de resultados', dependencies: [] },
    { name: 'Config', responsibility: 'Manejo de configuración y argumentos', dependencies: [] },
  ],
  'library': [
    { name: 'Core', responsibility: 'API pública principal', dependencies: [] },
    { name: 'Utils', responsibility: 'Utilidades internas', dependencies: [] },
    { name: 'Types', responsibility: 'Tipos e interfaces exportados', dependencies: [] },
    { name: 'Adapters', responsibility: 'Integraciones y adaptadores', dependencies: ['Core'] },
  ],
  'fullstack': [
    { name: 'Frontend - Layout', responsibility: 'Shell visual y navegación', dependencies: [] },
    { name: 'Frontend - Core', responsibility: 'Funcionalidad principal del frontend', dependencies: [] },
    { name: 'Backend - API', responsibility: 'Endpoints y controladores', dependencies: [] },
    { name: 'Backend - Services', responsibility: 'Lógica de negocio del servidor', dependencies: ['Backend - API'] },
    { name: 'Shared - Types', responsibility: 'Tipos compartidos', dependencies: [] },
    { name: 'Auth', responsibility: 'Autenticación end-to-end', dependencies: [] },
  ],
  'other': [
    { name: 'Core', responsibility: 'Funcionalidad principal', dependencies: [] },
    { name: 'Utils', responsibility: 'Utilidades de soporte', dependencies: [] },
    { name: 'Config', responsibility: 'Configuración del sistema', dependencies: [] },
  ],
};

function deriveModulesFromAnalysis(analysis: AnalysisResult): SuggestedModule[] {
  const base = BASE_MODULES[analysis.projectType] ?? BASE_MODULES['other'];
  const extraModules: SuggestedModule[] = [];

  // Add entity-derived modules for complex projects
  if (analysis.intent.complexity !== 'simple') {
    for (const entity of analysis.entities) {
      const alreadyExists = base.some(m => m.name.toLowerCase().includes(entity.name.toLowerCase()));
      if (!alreadyExists && entity.name !== 'Configuración' && entity.name !== 'Sesión') {
        extraModules.push({
          name: entity.name,
          responsibility: `Gestión CRUD y lógica de ${entity.name}`,
          dependencies: base.length > 0 ? [base[0].name] : [],
        });
      }
    }
  }

  // Add modules based on detected patterns
  if (analysis.detectedPatterns.includes('realtime') && !base.some(m => m.name.includes('Realtime'))) {
    extraModules.push({ name: 'Realtime', responsibility: 'Comunicación en tiempo real (WebSocket/SSE)', dependencies: [] });
  }
  if (analysis.detectedPatterns.includes('notifications') && !base.some(m => m.name.includes('Notification'))) {
    extraModules.push({ name: 'Notifications', responsibility: 'Sistema de notificaciones', dependencies: ['Auth'] });
  }
  if (analysis.detectedPatterns.includes('search') && !base.some(m => m.name.includes('Search'))) {
    extraModules.push({ name: 'Search', responsibility: 'Búsqueda y filtrado avanzado', dependencies: [] });
  }

  return [...base, ...extraModules];
}

function deriveTechDecisions(analysis: AnalysisResult): string[] {
  const decisions: string[] = [
    'Arquitectura modular por features/dominio',
    'Tipado fuerte con TypeScript',
    'Separación clara entre lógica de negocio y presentación',
  ];

  // Add constraint-derived decisions
  for (const constraint of analysis.constraints) {
    if (constraint.category === 'tech-stack' && constraint.source === 'explicit') {
      decisions.push(constraint.description);
    }
  }

  // Add technology suggestions
  for (const tech of analysis.suggestedTechnologies) {
    if (!decisions.some(d => d.toLowerCase().includes(tech.toLowerCase()))) {
      decisions.push(tech);
    }
  }

  return decisions;
}

function deriveMainFlow(analysis: AnalysisResult): string[] {
  const flows: Record<string, string[]> = {
    'web-app': [
      'Usuario accede a la aplicación',
      'Se autentica (si aplica)',
      'Ve el dashboard/pantalla principal',
      'Ejecuta la acción principal',
      'Recibe feedback/resultado',
    ],
    'mobile-app': [
      'Usuario abre la app',
      'Onboarding / Login',
      'Pantalla principal',
      'Navega a funcionalidad core',
      'Interactúa con el contenido',
    ],
    'api': [
      'Cliente envía request al endpoint',
      'Middleware valida autenticación y datos',
      'Controller recibe y delega al service',
      'Service ejecuta lógica de negocio',
      'Response con datos estructurados o error',
    ],
    'cli': [
      'Usuario ejecuta comando con argumentos',
      'Se parsean y validan argumentos',
      'Se ejecuta la lógica principal',
      'Se muestra output formateado',
    ],
    'library': [
      'Developer importa la librería',
      'Usa la API pública documentada',
      'La librería procesa internamente',
      'Retorna resultado tipado',
    ],
    'fullstack': [
      'Usuario accede al frontend',
      'Frontend envía request a la API',
      'API procesa con lógica de negocio',
      'Response renderizada en frontend',
      'Usuario interactúa con funcionalidad core',
    ],
    'other': [
      'Input del sistema/usuario',
      'Procesamiento principal',
      'Output / resultado',
    ],
  };

  const baseFlow = flows[analysis.projectType] ?? flows['other'];

  // Enrich flow with domain-specific actions from intent
  if (analysis.intent.secondaryActions.length > 0) {
    const additionalSteps = analysis.intent.secondaryActions
      .slice(0, 3)
      .map(action => `${action.charAt(0).toUpperCase() + action.slice(1)} según el flujo del dominio`);
    return [...baseFlow, ...additionalSteps];
  }

  return baseFlow;
}

function deriveArchitectureConstraints(analysis: AnalysisResult, modules: SuggestedModule[]): string[] {
  const constraints: string[] = [
    'Cada módulo debe tener responsabilidad única (SRP)',
    'Separar lógica de negocio de la presentación',
    'Usar interfaces para desacoplar dependencias entre módulos',
  ];

  // Add analysis-derived constraints
  for (const c of analysis.constraints) {
    if (c.category === 'architecture' && c.priority === 'must') {
      constraints.push(c.description);
    }
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

export function designStructure(analysis: AnalysisResult, detailedMode: boolean): DesignStructure {
  const modules = deriveModulesFromAnalysis(analysis);
  const mainFlow = deriveMainFlow(analysis);
  const techDecisions = deriveTechDecisions(analysis);

  const objective = {
    summary: analysis.intent.goal,
    targetUser: analysis.intent.targetUser,
    primaryAction: analysis.intent.primaryAction,
    constraints: analysis.constraints
      .filter(c => c.priority === 'must' || (detailedMode && c.priority === 'should'))
      .map(c => c.description),
  };

  const entities = analysis.entities.map(e => {
    const attrs = detailedMode ? ` (${e.attributes.slice(0, 4).join(', ')})` : '';
    return `${e.name}${attrs}`;
  });

  const architectureConstraints = deriveArchitectureConstraints(analysis, modules);

  return {
    objective,
    modules,
    mainFlow,
    entities,
    techDecisions,
    architectureConstraints,
  };
}
