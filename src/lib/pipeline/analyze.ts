import type { AnalysisResult, ProjectType } from '@/types';
import { parseIntent } from './intent-parser';
import { extractConstraints } from './constraint-extractor';
import { extractEntities } from './entity-extractor';
import { classifyProject } from './project-classifier';
import { extractCoreMechanics, extractPlatformConstraints } from './core-mechanics-extractor';

const TECH_SUGGESTIONS: Record<string, string[]> = {
  'e-commerce': ['Pasarela de pagos (Stripe/MercadoPago)', 'Carrito con estado persistente', 'Catálogo con filtros y búsqueda'],
  'social': ['WebSocket para tiempo real', 'Feed con paginación infinita', 'Sistema de notificaciones'],
  'education': ['Reproductor de video/contenido', 'Sistema de progreso', 'Quiz engine'],
  'productivity': ['Drag & drop para tableros', 'Sincronización offline', 'Calendario interactivo'],
  'finance': ['Gráficos y reportes', 'Exportación a Excel/PDF', 'Auditoría de transacciones'],
  'health': ['Historial médico seguro', 'Agenda de citas', 'HIPAA/regulaciones de salud'],
  'content': ['Editor WYSIWYG', 'SEO optimization', 'Draft/publicación workflow'],
  'analytics': ['Gráficos interactivos (Chart.js/D3)', 'Exportación de datos', 'Filtros avanzados'],
  'devtools': ['Syntax highlighting', 'Terminal integrada', 'Git integration'],
};

const PATTERN_DETECTORS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /tiempo\s*real|real[\s-]*time|websocket|socket|sse/i, name: 'realtime' },
  { pattern: /notificaci[oó]n|alerta|aviso|notification/i, name: 'notifications' },
  { pattern: /buscar|búsqueda|search|filtrar|filtro/i, name: 'search' },
  { pattern: /subir|upload|archivo|file/i, name: 'file-upload' },
  { pattern: /exportar|descargar|download|pdf|excel|csv/i, name: 'export' },
  { pattern: /drag|arrastrar|ordenar|sortable/i, name: 'drag-and-drop' },
  { pattern: /offline|sin\s*conexión|PWA|service\s*worker/i, name: 'offline' },
  { pattern: /paginaci[oó]n|infinite\s*scroll|lazy\s*load/i, name: 'pagination' },
  { pattern: /gráfico|chart|estadística|visualizaci[oó]n/i, name: 'charts' },
  { pattern: /multi[\s-]*idioma|i18n|traducir|internacionaliz/i, name: 'i18n' },
];

export function analyzeInput(rawInput: string, hintProjectType?: ProjectType): AnalysisResult {
  const intent = parseIntent(rawInput);
  const constraints = extractConstraints(rawInput);
  const entities = extractEntities(rawInput);
  const { type: projectType, confidence } = classifyProject(rawInput, hintProjectType);

  // V2.1: Extract core mechanics and platform constraints
  const mechanics = extractCoreMechanics(rawInput);
  const platformConstraints = extractPlatformConstraints(rawInput);

  // Extract key phrases (improved)
  const keyPhrases = rawInput
    .split(/[.;,\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.split(/\s+/).length >= 3);

  // Detect patterns
  const detectedPatterns = PATTERN_DETECTORS
    .filter(d => d.pattern.test(rawInput))
    .map(d => d.name);

  // Suggest technologies based on domain
  const domainTechs = TECH_SUGGESTIONS[intent.domain] ?? [];
  const suggestedTechnologies = [...domainTechs];

  return {
    intent,
    constraints,
    entities,
    projectType,
    confidence,
    keyPhrases,
    suggestedTechnologies,
    detectedPatterns,
    mechanics,
    platformConstraints,
  };
}
