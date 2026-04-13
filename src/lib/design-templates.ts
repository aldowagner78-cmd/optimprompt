import type { DesignStructure, ProjectType, SuggestedModule } from '@/types';

const MODULE_TEMPLATES: Record<ProjectType, SuggestedModule[]> = {
  'web-app': [
    { name: 'Auth', responsibility: 'Autenticación y autorización de usuarios', dependencies: [] },
    { name: 'Layout', responsibility: 'Estructura visual principal, navegación y shell de la app', dependencies: [] },
    { name: 'Dashboard', responsibility: 'Panel principal con métricas y accesos rápidos', dependencies: ['Auth'] },
    { name: 'Core Feature', responsibility: 'Módulo central con la funcionalidad principal', dependencies: ['Auth'] },
    { name: 'Settings', responsibility: 'Configuración de usuario y preferencias', dependencies: ['Auth'] },
  ],
  'mobile-app': [
    { name: 'Auth', responsibility: 'Autenticación y sesión del usuario', dependencies: [] },
    { name: 'Navigation', responsibility: 'Navegación entre pantallas', dependencies: [] },
    { name: 'Home', responsibility: 'Pantalla principal', dependencies: ['Auth', 'Navigation'] },
    { name: 'Core Feature', responsibility: 'Funcionalidad principal de la app', dependencies: ['Auth'] },
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
    { name: 'Frontend - Core Feature', responsibility: 'Funcionalidad principal del frontend', dependencies: [] },
    { name: 'Backend - API', responsibility: 'Endpoints y controladores', dependencies: [] },
    { name: 'Backend - Services', responsibility: 'Lógica de negocio del servidor', dependencies: ['Backend - API'] },
    { name: 'Shared - Types', responsibility: 'Tipos compartidos entre frontend y backend', dependencies: [] },
    { name: 'Auth', responsibility: 'Autenticación end-to-end', dependencies: [] },
  ],
  'other': [
    { name: 'Core', responsibility: 'Funcionalidad principal', dependencies: [] },
    { name: 'Utils', responsibility: 'Utilidades de soporte', dependencies: [] },
    { name: 'Config', responsibility: 'Configuración del sistema', dependencies: [] },
  ],
};

export function getModuleTemplate(type: ProjectType): SuggestedModule[] {
  return MODULE_TEMPLATES[type] ?? MODULE_TEMPLATES['other'];
}

export function getDefaultTechDecisions(type: ProjectType): string[] {
  const common = [
    'Arquitectura modular por features/dominio',
    'Tipado fuerte con TypeScript',
    'Separación clara entre lógica de negocio y presentación',
  ];

  const specific: Record<ProjectType, string[]> = {
    'web-app': ['React + Vite', 'Estado con Zustand o similar', 'Estilos con Tailwind CSS'],
    'mobile-app': ['React Native o Flutter', 'Navegación declarativa', 'Estado local + global separado'],
    'api': ['Node.js + Express/Fastify', 'Validación con Zod', 'ORM con Prisma o similar'],
    'cli': ['Node.js', 'Parsing de argumentos con Commander/Yargs', 'Output formateado con chalk'],
    'library': ['Bundler moderno (tsup/rollup)', 'Testing con Vitest', 'Documentación con TypeDoc'],
    'fullstack': ['Monorepo o workspace', 'API tipada end-to-end', 'Deploy unificado'],
    'other': ['Stack apropiado al dominio'],
  };

  return [...common, ...(specific[type] ?? specific['other'])];
}

export function getDefaultFlow(type: ProjectType): string[] {
  const flows: Record<ProjectType, string[]> = {
    'web-app': [
      'Usuario accede a la app',
      'Se autentica (si aplica)',
      'Ve el dashboard/pantalla principal',
      'Ejecuta la acción principal',
      'Recibe feedback/resultado',
      'Puede configurar preferencias',
    ],
    'mobile-app': [
      'Usuario abre la app',
      'Onboarding / Login',
      'Pantalla principal',
      'Navega a funcionalidad core',
      'Interactúa con el contenido',
      'Recibe notificaciones/feedback',
    ],
    'api': [
      'Cliente envía request',
      'Middleware valida autenticación',
      'Router dirige al controller',
      'Controller delega al service',
      'Service ejecuta lógica de negocio',
      'Response con datos o error estructurado',
    ],
    'cli': [
      'Usuario ejecuta comando',
      'Se parsean argumentos',
      'Se valida input',
      'Se ejecuta la lógica',
      'Se muestra output formateado',
    ],
    'library': [
      'Developer importa la librería',
      'Usa la API pública',
      'La librería procesa internamente',
      'Retorna resultado tipado',
    ],
    'fullstack': [
      'Usuario accede al frontend',
      'Frontend hace request a la API',
      'API procesa y responde',
      'Frontend renderiza datos',
      'Usuario interactúa con la funcionalidad core',
    ],
    'other': [
      'Input del usuario',
      'Procesamiento principal',
      'Output/resultado',
    ],
  };

  return flows[type] ?? flows['other'];
}

export function getArchitectureConstraints(design: Partial<DesignStructure>): string[] {
  const constraints: string[] = [
    'No concentrar toda la lógica en un solo archivo',
    'Cada módulo debe tener responsabilidad única',
    'Separar lógica de negocio de la presentación',
    'Usar interfaces para desacoplar dependencias',
  ];

  if (design.modules && design.modules.length > 5) {
    constraints.push('Considerar agrupar módulos relacionados en features');
  }

  return constraints;
}
