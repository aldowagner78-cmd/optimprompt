import type { ExtractedEntity } from '@/types';

interface EntityPattern {
  keywords: string[];
  name: string;
  description: string;
  defaultAttributes: string[];
}

const ENTITY_PATTERNS: EntityPattern[] = [
  { keywords: ['usuario', 'user', 'persona', 'cuenta'], name: 'Usuario', description: 'Entidad de usuario del sistema', defaultAttributes: ['id', 'nombre', 'email', 'rol', 'fechaCreación'] },
  { keywords: ['producto', 'item', 'artículo'], name: 'Producto', description: 'Producto o artículo del catálogo', defaultAttributes: ['id', 'nombre', 'descripción', 'precio', 'categoría', 'stock'] },
  { keywords: ['pedido', 'orden', 'order', 'compra'], name: 'Pedido', description: 'Pedido o transacción de compra', defaultAttributes: ['id', 'usuario', 'productos', 'total', 'estado', 'fecha'] },
  { keywords: ['tarea', 'task', 'actividad', 'to-do', 'todo'], name: 'Tarea', description: 'Tarea o actividad asignable', defaultAttributes: ['id', 'título', 'descripción', 'estado', 'asignado', 'prioridad', 'fechaLímite'] },
  { keywords: ['proyecto', 'project'], name: 'Proyecto', description: 'Proyecto contenedor de tareas o trabajo', defaultAttributes: ['id', 'nombre', 'descripción', 'miembros', 'estado', 'fechaInicio'] },
  { keywords: ['mensaje', 'message', 'chat', 'conversación'], name: 'Mensaje', description: 'Mensaje o comunicación entre usuarios', defaultAttributes: ['id', 'remitente', 'destinatario', 'contenido', 'fecha', 'leído'] },
  { keywords: ['archivo', 'file', 'documento', 'adjunto'], name: 'Archivo', description: 'Archivo subido o documento', defaultAttributes: ['id', 'nombre', 'tipo', 'tamaño', 'url', 'propietario'] },
  { keywords: ['categoría', 'category', 'etiqueta', 'tag', 'label'], name: 'Categoría', description: 'Categoría o etiqueta de clasificación', defaultAttributes: ['id', 'nombre', 'color', 'descripción'] },
  { keywords: ['configuración', 'config', 'setting', 'preferencia'], name: 'Configuración', description: 'Configuración del sistema o usuario', defaultAttributes: ['clave', 'valor', 'tipo', 'ámbito'] },
  { keywords: ['notificación', 'notification', 'alerta', 'aviso'], name: 'Notificación', description: 'Notificación o alerta del sistema', defaultAttributes: ['id', 'tipo', 'mensaje', 'leída', 'fecha', 'destinatario'] },
  { keywords: ['comentario', 'comment', 'reseña', 'review'], name: 'Comentario', description: 'Comentario o retroalimentación', defaultAttributes: ['id', 'autor', 'contenido', 'fecha', 'entidadRelacionada'] },
  { keywords: ['reporte', 'report', 'informe', 'estadística'], name: 'Reporte', description: 'Reporte o informe de datos', defaultAttributes: ['id', 'tipo', 'período', 'datos', 'fechaGeneración'] },
  { keywords: ['sesión', 'session', 'login'], name: 'Sesión', description: 'Sesión de usuario activa', defaultAttributes: ['id', 'usuario', 'token', 'inicio', 'expiración', 'dispositivo'] },
  { keywords: ['pago', 'payment', 'transacción', 'factura', 'invoice'], name: 'Pago', description: 'Transacción de pago', defaultAttributes: ['id', 'monto', 'método', 'estado', 'fecha', 'referencia'] },
  { keywords: ['curso', 'lección', 'clase', 'material'], name: 'Curso', description: 'Curso o material educativo', defaultAttributes: ['id', 'título', 'descripción', 'contenido', 'duración', 'instructor'] },
  { keywords: ['evento', 'event', 'cita', 'appointment'], name: 'Evento', description: 'Evento o cita agendada', defaultAttributes: ['id', 'título', 'fecha', 'hora', 'ubicación', 'participantes'] },
  { keywords: ['dashboard', 'panel', 'tablero'], name: 'Dashboard', description: 'Panel de visualización de datos', defaultAttributes: ['id', 'widgets', 'layout', 'filtros', 'propietario'] },
  { keywords: ['prompt'], name: 'Prompt', description: 'Prompt de instrucciones', defaultAttributes: ['id', 'contenido', 'tipo', 'versión', 'evaluación'] },
  { keywords: ['punto', 'puntos', 'crédito', 'créditos'], name: 'Punto', description: 'Unidad de puntos/créditos del sistema de recompensas', defaultAttributes: ['id', 'usuario', 'cantidad', 'tipo', 'fecha', 'origen'] },
  { keywords: ['hábito', 'hábitos', 'rutina'], name: 'Hábito', description: 'Hábito o rutina a seguir', defaultAttributes: ['id', 'nombre', 'frecuencia', 'categoría', 'estado', 'streak'] },
  { keywords: ['recompensa', 'premio', 'canje'], name: 'Recompensa', description: 'Recompensa canjeable por puntos', defaultAttributes: ['id', 'nombre', 'costo', 'descripción', 'disponibilidad', 'tipo'] },
  { keywords: ['progreso', 'avance', 'estadística'], name: 'Progreso', description: 'Registro de progreso del usuario', defaultAttributes: ['id', 'usuario', 'métrica', 'valor', 'fecha', 'período'] },
  { keywords: ['límite', 'restricción', 'regla'], name: 'Regla', description: 'Regla o restricción configurable del sistema', defaultAttributes: ['id', 'tipo', 'valor', 'condición', 'acción', 'activa'] },
];

function detectRelations(entities: ExtractedEntity[]): ExtractedEntity[] {
  const entityNames = new Set(entities.map(e => e.name));

  return entities.map(entity => {
    const relations: string[] = [];

    // Common relationship patterns
    if (entity.name === 'Pedido' && entityNames.has('Usuario')) relations.push('pertenece a Usuario');
    if (entity.name === 'Pedido' && entityNames.has('Producto')) relations.push('contiene Producto(s)');
    if (entity.name === 'Tarea' && entityNames.has('Proyecto')) relations.push('pertenece a Proyecto');
    if (entity.name === 'Tarea' && entityNames.has('Usuario')) relations.push('asignada a Usuario');
    if (entity.name === 'Mensaje' && entityNames.has('Usuario')) relations.push('enviado por Usuario');
    if (entity.name === 'Comentario' && entityNames.has('Usuario')) relations.push('escrito por Usuario');
    if (entity.name === 'Archivo' && entityNames.has('Usuario')) relations.push('subido por Usuario');
    if (entity.name === 'Notificación' && entityNames.has('Usuario')) relations.push('dirigida a Usuario');
    if (entity.name === 'Pago' && entityNames.has('Pedido')) relations.push('asociado a Pedido');
    if (entity.name === 'Sesión' && entityNames.has('Usuario')) relations.push('pertenece a Usuario');
    if (entity.name === 'Curso' && entityNames.has('Usuario')) relations.push('instructor es Usuario');
    if (entity.name === 'Evento' && entityNames.has('Usuario')) relations.push('participantes son Usuario(s)');
    if (entity.name === 'Producto' && entityNames.has('Categoría')) relations.push('clasificado en Categoría');
    if (entity.name === 'Dashboard' && entityNames.has('Reporte')) relations.push('contiene Reporte(s)');

    return { ...entity, relations: [...entity.relations, ...relations] };
  });
}

export function extractEntities(input: string): ExtractedEntity[] {
  const lower = input.toLowerCase();
  const matched: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const pattern of ENTITY_PATTERNS) {
    if (pattern.keywords.some(k => lower.includes(k)) && !seen.has(pattern.name)) {
      seen.add(pattern.name);
      matched.push({
        name: pattern.name,
        description: pattern.description,
        attributes: [...pattern.defaultAttributes],
        relations: [],
      });
    }
  }

  return detectRelations(matched);
}
