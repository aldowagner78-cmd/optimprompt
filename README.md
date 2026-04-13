# OptimPrompt — Arquitecto de Prompts

Aplicación profesional para transformar ideas vagas en prompts de alta calidad, orientados a construir aplicaciones modulares, escalables e intuitivas.

## Metodología

La app sigue el principio **Estructura → Función → Estética**:

1. **Estructura**: Módulos, carpetas, tipos, interfaces
2. **Función**: Lógica de negocio, flujos, validaciones
3. **Estética**: Diseño visual, estilos, UX

## Funcionalidades (MVP)

- **Crear prompt desde idea**: Describe tu idea y el sistema genera un prompt profesional
- **Optimizar prompt existente**: Detecta ambigüedades, falta de modularidad y genera versiones mejoradas
- **Flujo guiado de diseño**: Objetivo, módulos, flujo principal, entidades, decisiones técnicas
- **Generación de variantes**: Prompt maestro + versión resumida, estricta y modular
- **Evaluación**: 7 métricas (claridad, completitud, modularidad, escalabilidad, precisión, riesgo de ambigüedad, riesgo de monolitismo)
- **Historial local**: Resultados guardados en LocalStorage

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Estado | Zustand |
| Routing | React Router 7 |
| Iconos | Lucide React |
| Persistencia | LocalStorage |
| Motor IA | Heurístico local (preparado para proveedores externos) |

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Estructura del Proyecto

```
src/
├── adapters/ai/          # Proveedores de IA intercambiables
│   ├── heuristic-provider.ts   # Motor heurístico local
│   └── index.ts                # Factory de proveedores
├── components/
│   ├── layout/            # AppLayout, Sidebar, PageHeader
│   └── ui/                # Button, Card, TextArea, Select, Badge, etc.
├── features/
│   ├── prompt-intake/     # IdeaForm, DesignPanel
│   ├── prompt-optimizer/  # OptimizeForm, OptimizeResultPanel
│   ├── prompt-result/     # ResultPanel
│   └── history/           # HistoryList
├── lib/                   # Lógica pura del motor
│   ├── text-analysis.ts        # Análisis de texto
│   ├── design-templates.ts     # Templates de módulos y decisiones técnicas
│   ├── prompt-builder.ts       # Construcción del prompt maestro y variantes
│   ├── prompt-evaluator.ts     # Evaluación con 7 métricas
│   └── prompt-optimizer.ts     # Detección de problemas y optimización
├── pages/                 # Páginas de la app
│   ├── DashboardPage.tsx
│   ├── CreatePage.tsx
│   ├── OptimizePage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── services/              # Servicios de infraestructura
│   └── history-storage.ts
├── stores/                # Estado global (Zustand)
│   ├── prompt-workflow-store.ts
│   ├── optimize-workflow-store.ts
│   └── history-store.ts
└── types/                 # Tipos e interfaces
    ├── prompt.ts
    ├── history.ts
    ├── ai-provider.ts
    └── index.ts
```

## Arquitectura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

### Principios clave

- **Modularidad por features**: Cada feature encapsula sus componentes, lógica y tipos
- **Adaptadores desacoplados**: La interfaz `AIProvider` permite intercambiar motores sin tocar la app
- **Lógica pura en `lib/`**: El motor de análisis, evaluación y generación es independiente de React
- **Estado mínimo**: Zustand con stores separados por flujo
- **Persistencia simple**: LocalStorage con capa de servicio desacoplada

## Cómo Escalar

### Agregar un nuevo proveedor de IA

1. Implementar la interfaz `AIProvider` en `src/adapters/ai/`
2. Registrar en `src/adapters/ai/index.ts`
3. La UI se actualiza automáticamente desde Settings

### Agregar una nueva funcionalidad

1. Crear carpeta en `src/features/nueva-feature/`
2. Crear componentes y hooks del feature
3. Agregar página en `src/pages/`
4. Agregar ruta en `App.tsx`
5. Agregar entrada en el Sidebar

## Licencia

MIT
