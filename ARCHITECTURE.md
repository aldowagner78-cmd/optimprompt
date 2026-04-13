# Arquitectura — OptimPrompt

## Visión General

OptimPrompt sigue una **arquitectura modular por features** con capas desacopladas, diseñada para evolucionar sin romper la base existente.

```
┌─────────────────────────────────────────────────┐
│                    Pages                         │
│  Dashboard | Create | Optimize | History | Settings │
├─────────────────────────────────────────────────┤
│                  Features                        │
│  prompt-intake | prompt-optimizer | prompt-result │
│  history                                         │
├─────────────────────────────────────────────────┤
│               Stores (Zustand)                   │
│  prompt-workflow | optimize-workflow | history    │
├─────────────────────────────────────────────────┤
│              Adapters / Services                 │
│  AI Provider (interface) | History Storage       │
├─────────────────────────────────────────────────┤
│                 Lib (Pure Logic)                  │
│  text-analysis | design-templates | prompt-builder│
│  prompt-evaluator | prompt-optimizer              │
├─────────────────────────────────────────────────┤
│                    Types                         │
│  prompt | history | ai-provider                  │
└─────────────────────────────────────────────────┘
```

## Capas

### 1. Types (`src/types/`)

Tipos e interfaces centrales. No contienen lógica. Son el contrato entre capas.

- `PromptIdea`: Input del usuario
- `DesignStructure`: Resultado del análisis estructural
- `PromptResult`: Prompt maestro + variantes
- `EvaluationResult`: Scores y checklist
- `OptimizationResult`: Observaciones + prompt mejorado
- `AIProvider`: Interfaz que deben implementar todos los motores de IA
- `HistoryEntry`: Entrada del historial

### 2. Lib (`src/lib/`)

Lógica pura del motor, sin dependencias de React ni de estado.

- **text-analysis**: Detección de tipo de proyecto, extracción de frases clave
- **design-templates**: Templates de módulos, flujos, decisiones técnicas por tipo de proyecto
- **prompt-builder**: Construcción del prompt maestro y sus 3 variantes
- **prompt-evaluator**: Evaluación heurística con 7 métricas
- **prompt-optimizer**: Detección de problemas y reconstrucción del prompt

### 3. Adapters (`src/adapters/`)

Implementaciones intercambiables de proveedores.

- **HeuristicProvider**: Motor local que usa la lógica de `lib/` para analizar, generar, optimizar y evaluar
- **Factory**: `getAIProvider()` / `setAIProvider()` para intercambiar proveedores

**Para agregar un proveedor externo** (ej: Ollama, API local):
1. Crear una clase que implemente `AIProvider`
2. Registrarla en el factory
3. La UI mostrará automáticamente las opciones disponibles

### 4. Services (`src/services/`)

Servicios de infraestructura (persistencia, etc).

- **history-storage**: CRUD sobre LocalStorage con límite de 50 entradas

### 5. Stores (`src/stores/`)

Estado global con Zustand. Un store por flujo principal.

- **prompt-workflow-store**: Flujo completo idea → análisis → diseño → generación → evaluación
- **optimize-workflow-store**: Flujo optimización de prompts existentes
- **history-store**: Gestión del historial

### 6. Components (`src/components/`)

- **ui/**: Componentes primitivos reutilizables (Button, Card, TextArea, Select, Badge, ScoreMeter, CopyBlock, LoadingSpinner)
- **layout/**: AppLayout, Sidebar, PageHeader

### 7. Features (`src/features/`)

Componentes de dominio agrupados por funcionalidad:

- **prompt-intake**: IdeaForm + DesignPanel (flujo de creación)
- **prompt-optimizer**: OptimizeForm + OptimizeResultPanel (flujo de optimización)
- **prompt-result**: ResultPanel (visualización del resultado final)
- **history**: HistoryList

### 8. Pages (`src/pages/`)

Orquestadores de features. Cada página conecta stores con features.

## Flujo Principal: Crear Prompt

```
Usuario escribe idea
       │
       ▼
  IdeaForm (prompt-intake)
       │
       ▼
  store.analyzeIdea()
       │
       ▼
  HeuristicProvider.analyzeIdea()
       │ Usa: text-analysis, design-templates
       ▼
  DesignPanel muestra: objetivo, módulos, flujo, entidades
       │
       ▼
  store.generatePrompt()
       │
       ▼
  HeuristicProvider.generatePrompt()
       │ Usa: prompt-builder
       ▼
  ResultPanel: prompt maestro + 3 variantes + evaluación + checklist
       │
       ▼
  Se guarda automáticamente en historial (LocalStorage)
```

## Decisiones Técnicas

| Decisión | Justificación |
|----------|--------------|
| **Zustand** sobre Redux | Más simple, menos boilerplate, stores independientes |
| **Tailwind CSS 4** | Utilidades, consistencia, zero-runtime, integración Vite nativa |
| **Lucide React** | Iconos limpios, tree-shakeable, consistentes |
| **UUID v4** | IDs de historial sin colisiones |
| **LocalStorage** | Suficiente para MVP, migrable a IndexedDB si crece |
| **Motor heurístico** | Funciona sin APIs externas, base para integrar IA real |
| **Interface AIProvider** | Desacopla totalmente la app del motor, permite swap fácil |

## Escalabilidad

La arquitectura está preparada para:

- Múltiples proveedores de IA simultáneos
- Migración a IndexedDB o backend
- Nuevos tipos de prompts (no solo apps)
- Testing unitario de la capa `lib/` (lógica pura)
- Internacionalización
- Temas / personalización visual
