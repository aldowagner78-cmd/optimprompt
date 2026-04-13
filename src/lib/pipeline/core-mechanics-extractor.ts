import type { CoreMechanic, MechanicCategory } from '@/types';

// ── Mechanic detection rules ────────────────────────────────────────
// Each rule maps patterns in the user's text to concrete mechanics.
// Categories: control, reward, validation, interaction, progress, restriction

interface MechanicRule {
  id: string;
  label: string;
  category: MechanicCategory;
  patterns: RegExp[];
  subMechanics: string[];
}

const MECHANIC_RULES: MechanicRule[] = [
  // ── Control ──────────────────────────────────────────────────────
  {
    id: 'usage-control',
    label: 'Control de uso / tiempo',
    category: 'control',
    patterns: [
      /control(?:ar)?\s+(?:de\s+)?(?:uso|tiempo|acceso|pantalla)/i,
      /limit(?:ar|e)\s+(?:el\s+)?(?:tiempo|uso|acceso|minutos|horas)/i,
      /bloque(?:ar|o)\s+(?:apps?|aplicacion|redes?|acceso)/i,
      /restringir\s+(?:el\s+)?(?:uso|acceso|tiempo)/i,
      /tiempo\s+(?:de\s+)?(?:uso|pantalla|screen[\s-]?time)/i,
      /screen[\s-]?time/i,
    ],
    subMechanics: ['temporizador activo', 'bloqueo por tiempo excedido', 'conteo de minutos por app', 'reglas de horario permitido'],
  },
  {
    id: 'content-moderation',
    label: 'Moderación de contenido',
    category: 'control',
    patterns: [
      /moder(?:ar|ación)\s+(?:de\s+)?contenido/i,
      /filtrar?\s+(?:contenido|publicacion|comentario)/i,
      /censur|aprobar\s+(?:publicacion|contenido|comentario)/i,
    ],
    subMechanics: ['revisión manual o automática', 'estados de aprobación', 'reglas de filtrado', 'reportes de usuarios'],
  },
  {
    id: 'access-control',
    label: 'Control de acceso / permisos',
    category: 'control',
    patterns: [
      /(?:control|gestión|manejo)\s+(?:de\s+)?(?:acceso|permisos|roles)/i,
      /rol(?:es)?\s+(?:y|de)\s+permisos/i,
      /(?:permiso|autorización)\s+(?:por|según|basad)/i,
    ],
    subMechanics: ['roles de usuario', 'niveles de acceso', 'permisos granulares', 'herencia de permisos'],
  },

  // ── Reward ───────────────────────────────────────────────────────
  {
    id: 'points-system',
    label: 'Sistema de puntos / créditos',
    category: 'reward',
    patterns: [
      /punt(?:o|os|uación)/i,
      /crédito|moneda\s+virtual/i,
      /(?:ganar|otorgar|acumular|sumar)\s+(?:puntos|créditos|monedas|tokens)/i,
      /recompensa|premio/i,
    ],
    subMechanics: ['saldo de puntos', 'historial de transacciones', 'reglas de acumulación', 'tipos de recompensa'],
  },
  {
    id: 'redemption',
    label: 'Canje / redención',
    category: 'reward',
    patterns: [
      /canje(?:ar)?/i,
      /redimir|canjear\s+(?:puntos|créditos|recompensas)/i,
      /intercambiar?\s+(?:puntos|créditos)/i,
      /(?:puntos|créditos)\s+(?:por|para)\s+/i,
    ],
    subMechanics: ['catálogo de canjes', 'costo por item', 'validación de saldo', 'historial de canjes'],
  },
  {
    id: 'gamification',
    label: 'Gamificación',
    category: 'reward',
    patterns: [
      /gamif/i,
      /logro|achievement|badge|insignia/i,
      /nivel(?:es)?\s+(?:de\s+)?(?:usuario|jugador)/i,
      /ranking|leaderboard|tabla\s+de\s+posiciones/i,
      /puntuación|score\s+(?:de|del)\s+usuario/i,
    ],
    subMechanics: ['logros desbloqueables', 'niveles de experiencia', 'ranking de usuarios', 'insignias'],
  },
  {
    id: 'commission-system',
    label: 'Sistema de comisiones',
    category: 'reward',
    patterns: [
      /comisi[oó]n/i,
      /porcentaje\s+(?:de\s+)?venta/i,
      /bonificaci[oó]n/i,
      /incentivo\s+(?:por|de)\s+venta/i,
    ],
    subMechanics: ['cálculo de comisión', 'reglas por tramo/nivel', 'liquidación periódica', 'historial de comisiones'],
  },

  // ── Validation ───────────────────────────────────────────────────
  {
    id: 'task-validation',
    label: 'Validación de tareas / actividades',
    category: 'validation',
    patterns: [
      /validar?\s+(?:tarea|actividad|cumplimiento|entrega)/i,
      /verificar?\s+(?:tarea|actividad|cumplimiento)/i,
      /comprobar?\s+(?:que|si)\s+(?:se\s+)?(?:hizo|completó|realizó)/i,
      /tarea(?:s)?\s+(?:realizad|complet|cumplid)/i,
    ],
    subMechanics: ['criterios de completitud', 'evidencia requerida', 'aprobación manual/auto', 'estados de tarea'],
  },
  {
    id: 'booking-validation',
    label: 'Reservas / turnos / citas',
    category: 'validation',
    patterns: [
      /reserva|turno|cita|appointment/i,
      /agendar|agend(?:a|amiento)/i,
      /(?:cancelar|confirmar|reprogramar)\s+(?:cita|turno|reserva)/i,
      /disponibilidad\s+(?:de\s+)?(?:horario|turno|profesional)/i,
    ],
    subMechanics: ['slots disponibles', 'confirmación/cancelación', 'recordatorios', 'penalización por no-show', 'reprogramación'],
  },
  {
    id: 'exam-assessment',
    label: 'Evaluación / exámenes',
    category: 'validation',
    patterns: [
      /examen|evaluaci[oó]n|quiz|test\s+(?:de|del)/i,
      /calificar|nota|puntaje\s+(?:de|del)\s+(?:examen|evaluación)/i,
      /preguntas?\s+(?:y\s+)?respuestas?/i,
    ],
    subMechanics: ['banco de preguntas', 'calificación automática', 'intentos permitidos', 'retroalimentación', 'nota mínima'],
  },

  // ── Interaction ──────────────────────────────────────────────────
  {
    id: 'habit-tracking',
    label: 'Seguimiento de hábitos',
    category: 'interaction',
    patterns: [
      /hábito|habit/i,
      /vida\s+saludable/i,
      /rutina\s+(?:diaria|semanal|saludable)/i,
      /(?:ejercicio|actividad)\s+(?:física|diaria)/i,
      /bienestar|salud\s+mental/i,
    ],
    subMechanics: ['registro diario', 'frecuencia objetivo', 'streak/rachas', 'categorías de hábitos', 'recordatorios'],
  },
  {
    id: 'social-interaction',
    label: 'Interacción social',
    category: 'interaction',
    patterns: [
      /red(?:es)?\s+social/i,
      /seguir|follow|like|comentar|compartir/i,
      /feed|timeline|muro/i,
      /amig(?:o|os)|contacto/i,
    ],
    subMechanics: ['perfil público', 'feed de actividad', 'sistema de seguimiento', 'reacciones/likes'],
  },
  {
    id: 'messaging',
    label: 'Mensajería / comunicación',
    category: 'interaction',
    patterns: [
      /mensaj|chat|conversaci[oó]n|inbox/i,
      /comunicar?\s+(?:entre|con)\s+usuario/i,
      /notificaci[oó]n\s+push/i,
    ],
    subMechanics: ['chat en tiempo real', 'notificaciones push', 'hilos de conversación', 'estados de lectura'],
  },
  {
    id: 'sales-tracking',
    label: 'Seguimiento de ventas',
    category: 'interaction',
    patterns: [
      /seguimiento\s+(?:de\s+)?ventas?/i,
      /pipeline\s+(?:de\s+)?ventas?/i,
      /embudo|funnel/i,
      /(?:gestión|manejo)\s+(?:de\s+)?(?:clientes|leads|prospectos)/i,
      /CRM/i,
    ],
    subMechanics: ['pipeline de estados', 'historial de contactos', 'proyección de cierre', 'métricas de conversión'],
  },

  // ── Progress ─────────────────────────────────────────────────────
  {
    id: 'progress-tracking',
    label: 'Progreso y métricas',
    category: 'progress',
    patterns: [
      /progres(?:o|ar|ión)/i,
      /m[eé]trica|estad[ií]stica|kpi/i,
      /(?:medir|rastrear|trackear)\s+(?:progreso|avance)/i,
      /dashboard|panel\s+(?:de\s+)?(?:control|métricas)/i,
    ],
    subMechanics: ['barra/porcentaje de avance', 'estadísticas semanales/mensuales', 'gráficos de progreso', 'metas cumplidas'],
  },
  {
    id: 'streak-system',
    label: 'Rachas / streaks',
    category: 'progress',
    patterns: [
      /streak|racha|consecutiv/i,
      /d[ií]as?\s+seguidos?/i,
      /mantener\s+(?:el\s+)?ritmo/i,
    ],
    subMechanics: ['conteo de días consecutivos', 'bonus por racha', 'penalización por romper racha', 'racha máxima'],
  },
  {
    id: 'level-unlock',
    label: 'Desbloqueo por niveles',
    category: 'progress',
    patterns: [
      /desbloque(?:ar|o)/i,
      /nivel(?:es)?\s+(?:de|por)\s+/i,
      /unlock/i,
      /contenido\s+(?:bloqueado|premium|exclusivo)/i,
    ],
    subMechanics: ['requisitos por nivel', 'contenido progresivo', 'preview de contenido bloqueado', 'notificación de desbloqueo'],
  },

  // ── Restriction ──────────────────────────────────────────────────
  {
    id: 'time-limits',
    label: 'Límites de tiempo',
    category: 'restriction',
    patterns: [
      /l[ií]mite\s+(?:de\s+)?(?:tiempo|minutos|horas|diario)/i,
      /m[aá]ximo\s+(?:de\s+)?(?:minutos|horas|tiempo)/i,
      /cuota\s+(?:diaria|semanal)/i,
      /cooldown/i,
    ],
    subMechanics: ['límite diario configurable', 'alertas previas al límite', 'extensión bajo condiciones', 'cooldown entre sesiones'],
  },
  {
    id: 'purchase-restrictions',
    label: 'Restricciones de compra / plan',
    category: 'restriction',
    patterns: [
      /plan\s+(?:gratuito|free|básico|premium|pro)/i,
      /suscripci[oó]n/i,
      /paywall|freemium/i,
      /funciones?\s+(?:limitad|restringid)/i,
    ],
    subMechanics: ['niveles de plan', 'features por plan', 'upgrade/downgrade', 'período de prueba'],
  },
  {
    id: 'scheduling-rules',
    label: 'Reglas de agenda / horario',
    category: 'restriction',
    patterns: [
      /horario|agenda|calendario/i,
      /disponib(?:le|ilidad)/i,
      /(?:días|horas)\s+(?:hábiles|laborales|disponibles)/i,
      /franja\s+horaria/i,
    ],
    subMechanics: ['horarios configurables', 'días no disponibles', 'duración de slots', 'zona horaria'],
  },
  {
    id: 'inventory-management',
    label: 'Gestión de inventario / stock',
    category: 'restriction',
    patterns: [
      /inventario|stock/i,
      /(?:cantidad|unidades)\s+disponibles?/i,
      /agotado|sin\s+stock/i,
    ],
    subMechanics: ['control de stock', 'alertas de bajo inventario', 'reservas de stock', 'historial de movimientos'],
  },
];

// ── Platform constraint inference ──────────────────────────────────

interface PlatformRule {
  patterns: RegExp[];
  constraints: string[];
}

const PLATFORM_RULES: PlatformRule[] = [
  {
    patterns: [/android/i, /iOS/i, /móvil|mobile|celular/i],
    constraints: [
      'Android e iOS tienen APIs distintas para control de apps (UsageStatsManager vs Screen Time API)',
      'Requiere permisos especiales del sistema operativo para monitoreo de uso',
      'Las notificaciones push requieren integración con FCM (Android) / APNs (iOS)',
      'El bloqueo de apps en background tiene restricciones por OS',
    ],
  },
  {
    patterns: [/web\s*app|navegador|browser/i, /PWA|progressive/i],
    constraints: [
      'Las PWA tienen limitaciones de acceso a APIs nativas del dispositivo',
      'Service Workers requieren HTTPS para funcionar',
      'El almacenamiento offline tiene límites de cuota por navegador',
    ],
  },
  {
    patterns: [/pago|payment|transacci[oó]n|factura/i, /stripe|mercadopago|paypal/i],
    constraints: [
      'El procesamiento de pagos requiere cumplir con PCI-DSS',
      'Las pasarelas de pago necesitan webhooks para confirmar transacciones',
      'Se necesita manejo de estados de pago (pendiente, completado, fallido, reembolsado)',
    ],
  },
  {
    patterns: [/salud|health|m[eé]dico|paciente|cl[ií]nica|hospital/i],
    constraints: [
      'Los datos médicos requieren cumplir con regulaciones de privacidad (HIPAA / ley local)',
      'El historial médico debe tener control de acceso estricto',
      'Se requiere auditoría de acceso a datos sensibles',
    ],
  },
  {
    patterns: [/e-?commerce|tienda|carrito|compra\s+online/i],
    constraints: [
      'El carrito de compras debe manejar concurrencia de stock',
      'Se requiere integración con pasarela de pagos',
      'Los precios deben manejar impuestos y moneda correctamente',
    ],
  },
  {
    patterns: [/tiempo\s+real|real[\s-]?time|websocket|chat/i],
    constraints: [
      'La comunicación en tiempo real requiere WebSocket o SSE',
      'Se necesita manejo de reconexión y estado offline',
      'La escalabilidad requiere considerar un broker de mensajes',
    ],
  },
];

// ── Key concept extraction ─────────────────────────────────────────
// Extracts concrete nouns/phrases that represent important user concepts

function extractKeyConcepts(input: string): string[] {
  const concepts: string[] = [];
  const lower = input.toLowerCase();

  // Split into meaningful phrases/clauses
  const clauses = input
    .split(/[.,;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // Extract noun phrases that represent functional concepts
  const conceptPatterns: RegExp[] = [
    /(?:sistema|módulo|función|funcionalidad|feature)\s+(?:de\s+)?(.{3,40}?)(?:\.|,|;|$)/gi,
    /(?:gestión|manejo|control|seguimiento|monitoreo)\s+(?:de\s+)?(.{3,30}?)(?:\.|,|;|$)/gi,
    /(?:crear|construir|desarrollar|implementar)\s+(?:un[ao]?\s+)?(.{3,40}?)(?:\.|,|;|$)/gi,
    /(?:que\s+permita|para\s+que|donde\s+el\s+usuario)\s+(.{5,50}?)(?:\.|,|;|$)/gi,
  ];

  for (const pattern of conceptPatterns) {
    let match;
    while ((match = pattern.exec(input)) !== null) {
      const concept = match[1].trim().toLowerCase();
      if (concept.length > 3 && concept.length < 50 && !concepts.includes(concept)) {
        concepts.push(concept);
      }
    }
  }

  // Also extract verb+object pairs from clauses
  for (const clause of clauses) {
    const verbObjectMatch = clause.match(/(?:poder\s+)?(\w+(?:ar|er|ir))\s+(.{3,35}?)(?:\.|,|;|y\s|$)/i);
    if (verbObjectMatch) {
      const concept = `${verbObjectMatch[1].toLowerCase()} ${verbObjectMatch[2].trim().toLowerCase()}`;
      if (!concepts.includes(concept) && concept.length < 50) {
        concepts.push(concept);
      }
    }
  }

  // Extract important standalone nouns mentioned in the input
  const domainNouns = [
    'puntos', 'canje', 'recompensa', 'bloqueo', 'límite', 'hábito', 'tarea',
    'turno', 'cita', 'reserva', 'comisión', 'venta', 'ranking', 'nivel',
    'progreso', 'streak', 'racha', 'notificación', 'recordatorio', 'permiso',
    'examen', 'curso', 'lección', 'pago', 'factura', 'inventario', 'stock',
    'producto', 'carrito', 'pedido', 'usuario', 'perfil', 'dashboard',
    'estadística', 'reporte', 'gráfico', 'chat', 'mensaje', 'feed',
    'calendario', 'agenda', 'horario', 'suscripción', 'plan',
    'monitoreo', 'seguimiento', 'control', 'automatización',
  ];

  for (const noun of domainNouns) {
    if (lower.includes(noun) && !concepts.some(c => c.includes(noun))) {
      concepts.push(noun);
    }
  }

  return concepts;
}

// ── System type detection ──────────────────────────────────────────

interface SystemTypeRule {
  type: string;
  patterns: RegExp[];
  weight: number;
}

const SYSTEM_TYPE_RULES: SystemTypeRule[] = [
  { type: 'sistema de control de uso', patterns: [/control.*uso|limitar.*tiempo|bloquear.*app|screen[\s-]?time/i], weight: 3 },
  { type: 'sistema de recompensas', patterns: [/recompensa|premio|punto.*canje|ganar.*punto|incentivo/i], weight: 3 },
  { type: 'sistema de gamificación', patterns: [/gamif|logro|badge|nivel.*experiencia|ranking|leaderboard/i], weight: 3 },
  { type: 'sistema de reservas', patterns: [/reserva|turno|cita|agendar|appointment/i], weight: 3 },
  { type: 'sistema de seguimiento de hábitos', patterns: [/hábito|rutina|vida\s+saludable|bienestar/i], weight: 3 },
  { type: 'sistema de ventas/CRM', patterns: [/venta|CRM|lead|prospecto|pipeline.*venta|comisi[oó]n/i], weight: 3 },
  { type: 'sistema de e-commerce', patterns: [/tienda|carrito|compra|e-?commerce|catálogo/i], weight: 3 },
  { type: 'sistema educativo', patterns: [/curso|lección|aprender|examen|progreso.*educativ|alumno/i], weight: 3 },
  { type: 'sistema de gestión de contenido', patterns: [/CMS|blog|artículo|publicar|editorial/i], weight: 2 },
  { type: 'sistema de monitoreo', patterns: [/monitor|dashboard|métrica|KPI|estadística/i], weight: 2 },
  { type: 'sistema de mensajería', patterns: [/chat|mensaj|conversación|inbox/i], weight: 2 },
  { type: 'sistema de automatización', patterns: [/automat|workflow|flujo\s+de\s+trabajo|trigger/i], weight: 2 },
  { type: 'marketplace', patterns: [/marketplace|vendedor.*comprador|plataforma.*venta/i], weight: 3 },
  { type: 'sistema de inventario', patterns: [/inventario|stock|almacén|bodega/i], weight: 2 },
  { type: 'sistema de gestión de proyectos', patterns: [/proyecto|kanban|sprint|tarea.*equipo/i], weight: 2 },
];

export function detectSystemType(input: string): string {
  let best = 'aplicación general';
  let bestScore = 0;

  for (const rule of SYSTEM_TYPE_RULES) {
    const score = rule.patterns.filter(p => p.test(input)).length * rule.weight;
    if (score > bestScore) {
      bestScore = score;
      best = rule.type;
    }
  }

  return best;
}

// ── Main extraction function ───────────────────────────────────────

export function extractCoreMechanics(input: string): CoreMechanic[] {
  const mechanics: CoreMechanic[] = [];

  for (const rule of MECHANIC_RULES) {
    // Find which pattern(s) matched and extract source fragment
    let sourceFragment = '';
    let matched = false;

    for (const pattern of rule.patterns) {
      const match = input.match(pattern);
      if (match) {
        matched = true;
        // Get surrounding context (up to 60 chars around the match)
        const start = Math.max(0, (match.index ?? 0) - 20);
        const end = Math.min(input.length, (match.index ?? 0) + match[0].length + 40);
        sourceFragment = input.slice(start, end).trim();
        break;
      }
    }

    if (matched) {
      mechanics.push({
        id: rule.id,
        label: rule.label,
        category: rule.category,
        subMechanics: rule.subMechanics,
        sourceFragment,
      });
    }
  }

  return mechanics;
}

export function extractPlatformConstraints(input: string): string[] {
  const constraints: string[] = [];

  for (const rule of PLATFORM_RULES) {
    if (rule.patterns.some(p => p.test(input))) {
      for (const c of rule.constraints) {
        if (!constraints.includes(c)) {
          constraints.push(c);
        }
      }
    }
  }

  return constraints;
}

export { extractKeyConcepts };
