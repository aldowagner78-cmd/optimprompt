import type { ExtractedConstraint } from '@/types';

interface ConstraintPattern {
  pattern: RegExp;
  category: ExtractedConstraint['category'];
  priority: ExtractedConstraint['priority'];
  description: string;
}

const EXPLICIT_PATTERNS: ConstraintPattern[] = [
  // Architecture
  { pattern: /modular/i, category: 'architecture', priority: 'must', description: 'Arquitectura modular requerida' },
  { pattern: /microservicio/i, category: 'architecture', priority: 'must', description: 'Arquitectura de microservicios' },
  { pattern: /monorepo/i, category: 'architecture', priority: 'must', description: 'Estructura monorepo' },
  { pattern: /serverless/i, category: 'architecture', priority: 'should', description: 'Arquitectura serverless' },
  { pattern: /feature[- ]?based/i, category: 'architecture', priority: 'should', description: 'Organización por features' },
  { pattern: /clean\s*architecture/i, category: 'architecture', priority: 'must', description: 'Clean Architecture' },
  { pattern: /hexagonal/i, category: 'architecture', priority: 'must', description: 'Arquitectura hexagonal' },

  // Quality
  { pattern: /test(?:eable|able|ing|s)/i, category: 'quality', priority: 'must', description: 'Código testeable requerido' },
  { pattern: /tipado?\s*(?:fuerte|estricto)/i, category: 'quality', priority: 'must', description: 'Tipado fuerte/estricto' },
  { pattern: /typescript/i, category: 'quality', priority: 'must', description: 'Uso de TypeScript' },
  { pattern: /código\s*limpio|clean\s*code/i, category: 'quality', priority: 'should', description: 'Principios de código limpio' },
  { pattern: /SOLID/i, category: 'quality', priority: 'should', description: 'Principios SOLID' },
  { pattern: /no\s*(?:usar\s*)?any/i, category: 'quality', priority: 'must', description: 'Evitar tipo any' },

  // Performance
  { pattern: /rendimiento|performance/i, category: 'performance', priority: 'should', description: 'Optimización de rendimiento' },
  { pattern: /rápid[oa]|fast/i, category: 'performance', priority: 'should', description: 'Velocidad de respuesta prioritaria' },
  { pattern: /cach[eé]/i, category: 'performance', priority: 'should', description: 'Implementar caché' },
  { pattern: /lazy\s*load/i, category: 'performance', priority: 'nice-to-have', description: 'Carga diferida de componentes' },
  { pattern: /optimiz/i, category: 'performance', priority: 'should', description: 'Optimización general requerida' },

  // UX
  { pattern: /responsiv[eo]/i, category: 'ux', priority: 'must', description: 'Diseño responsive' },
  { pattern: /accesib/i, category: 'ux', priority: 'should', description: 'Accesibilidad (a11y)' },
  { pattern: /dark\s*mode|modo\s*oscuro/i, category: 'ux', priority: 'nice-to-have', description: 'Modo oscuro' },
  { pattern: /i18n|internacionaliza/i, category: 'ux', priority: 'nice-to-have', description: 'Internacionalización' },
  { pattern: /mobile\s*first/i, category: 'ux', priority: 'should', description: 'Mobile-first' },

  // Tech-stack
  { pattern: /react/i, category: 'tech-stack', priority: 'must', description: 'React como framework UI' },
  { pattern: /vue/i, category: 'tech-stack', priority: 'must', description: 'Vue.js como framework UI' },
  { pattern: /angular/i, category: 'tech-stack', priority: 'must', description: 'Angular como framework' },
  { pattern: /next\.?js/i, category: 'tech-stack', priority: 'must', description: 'Next.js como framework' },
  { pattern: /node\.?js/i, category: 'tech-stack', priority: 'must', description: 'Node.js en backend' },
  { pattern: /tailwind/i, category: 'tech-stack', priority: 'should', description: 'Tailwind CSS para estilos' },
  { pattern: /postgres|mysql|mongo|sqlite/i, category: 'tech-stack', priority: 'must', description: 'Base de datos específica requerida' },
  { pattern: /prisma|drizzle|sequelize/i, category: 'tech-stack', priority: 'should', description: 'ORM específico' },

  // Process
  { pattern: /CI\/?CD/i, category: 'process', priority: 'should', description: 'Pipeline CI/CD' },
  { pattern: /docker/i, category: 'process', priority: 'should', description: 'Containerización con Docker' },
  { pattern: /git\s*(?:flow|hub)/i, category: 'process', priority: 'nice-to-have', description: 'Flujo de trabajo Git' },
  { pattern: /agile|scrum|kanban/i, category: 'process', priority: 'nice-to-have', description: 'Metodología ágil' },

  // Security
  { pattern: /segur(?:o|idad)|security/i, category: 'security', priority: 'must', description: 'Seguridad como requisito' },
  { pattern: /autenticaci[oó]n|auth/i, category: 'security', priority: 'must', description: 'Sistema de autenticación' },
  { pattern: /autorizaci[oó]n|rbac|roles?/i, category: 'security', priority: 'should', description: 'Control de acceso por roles' },
  { pattern: /encript|encrypt|cifr/i, category: 'security', priority: 'must', description: 'Encriptación de datos' },
  { pattern: /oauth|jwt|token/i, category: 'security', priority: 'should', description: 'Autenticación basada en tokens' },
];

const INFERRED_RULES: Array<{
  condition: (input: string) => boolean;
  constraint: Omit<ExtractedConstraint, 'source'>;
}> = [
  {
    condition: (input) => /usuario|login|registr/i.test(input),
    constraint: { category: 'security', priority: 'should', description: 'Manejo seguro de credenciales de usuario' },
  },
  {
    condition: (input) => /dato|data|base\s*de\s*datos|almacen/i.test(input),
    constraint: { category: 'architecture', priority: 'should', description: 'Capa de persistencia de datos' },
  },
  {
    condition: (input) => /API|endpoint|backend/i.test(input),
    constraint: { category: 'architecture', priority: 'should', description: 'Separación frontend/backend con API definida' },
  },
  {
    condition: (input) => /equipo|colabor|multi/i.test(input),
    constraint: { category: 'quality', priority: 'should', description: 'Código mantenible para trabajo en equipo' },
  },
  {
    condition: (input) => input.split(/\s+/).length > 100,
    constraint: { category: 'architecture', priority: 'should', description: 'Modularización por la complejidad del proyecto' },
  },
];

export function extractConstraints(input: string): ExtractedConstraint[] {
  const constraints: ExtractedConstraint[] = [];
  const seen = new Set<string>();

  // Explicit patterns
  for (const { pattern, category, priority, description } of EXPLICIT_PATTERNS) {
    if (pattern.test(input) && !seen.has(description)) {
      seen.add(description);
      constraints.push({ category, description, source: 'explicit', priority });
    }
  }

  // Inferred rules
  for (const { condition, constraint } of INFERRED_RULES) {
    if (condition(input) && !seen.has(constraint.description)) {
      seen.add(constraint.description);
      constraints.push({ ...constraint, source: 'inferred' });
    }
  }

  return constraints;
}
