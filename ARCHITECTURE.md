# Arquitectura — OptimPrompt V2

## Visión General

OptimPrompt sigue una **arquitectura modular por features** con pipeline de procesamiento desacoplado, diseñada para evolucionar sin romper la base existente.

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
│  AI Provider (factory + status) | History Storage│
├─────────────────────────────────────────────────┤
│            Pipeline V2 (Pure Logic)              │
│  intent-parser | constraint-extractor            │
│  entity-extractor | project-classifier           │
│  structure-designer | prompt-assembler            │
│  prompt-refiner | evaluator | analyze (orchestr.) │
├─────────────────────────────────────────────────┤
│                    Types                         │
│  prompt | intent | constraint | entity | analysis │
│  history | ai-provider                           │
└─────────────────────────────────────────────────┘
```

## Capas

### 1. Types (`src/types/`)

Tipos e interfaces centrales. No contienen lógica. Son el contrato entre capas.

- `PromptIdea`: Input del usuario (idea textual)
- `DesignStructure`: Resultado del análisis estructural
- `PromptResult`: Prompt maestro + 4 variantes
- `EvaluationScore`: 13 métricas + overall score
- `OptimizationResult`: Observaciones + prompt mejorado + changesSummary + preservedIntent
- `AIProvider`: Interfaz que deben implementar todos los motores de IA
- `ParsedIntent`: Intención parseada (goal, targetUser, actions, domain, complexity)
- `ExtractedConstraint`: Restricción extraída (7 categorías)
- `ExtractedEntity`: Entidad extraída con relaciones
- `AnalysisResult`: Resultado completo del pipeline de análisis
- `HistoryEntry`: Entrada del historial

### 2. Pipeline V2 (`src/lib/pipeline/`)

Motor central — 9 módulos de lógica pura, sin dependencias de React ni estado.

| Módulo | Función |
|--------|---------|
| **intent-parser** | Extrae goal, targetUser, actions, domain, complexity del texto |
| **constraint-extractor** | 40+ patrones regex en 7 categorías (técnicas, rendimiento, seguridad, UX, negocio, infraestructura, compatibilidad) |
| **entity-extractor** | 18 patrones de entidades con detección de relaciones |
| **project-classifier** | Clasificación ponderada del tipo de proyecto con score de confianza |
| **structure-designer** | Genera diseño (módulos, flujos, entidades, decisiones) a partir del análisis |
| **prompt-assembler** | Construye prompt maestro + 4 variantes (resumida, estricta, modular, creativa) |
| **prompt-refiner** | 11 reglas de detección de problemas + reescritura inteligente |
| **evaluator** | 13 métricas dimensionales independientes |
| **analyze** | Orquestador que conecta los módulos en secuencia |

### 3. Adapters (`src/adapters/`)

Implementaciones intercambiables de proveedores con metadata de status.

- **HeuristicProvider**: Motor principal — consume el pipeline V2 completo
- **OllamaProvider**: Stub para integración con servidor Ollama local
- **BrowserLocalProvider**: Stub para inferencia en navegador (WebLLM/Transformers.js)
- **Factory**: `getAIProvider()` / `setAIProvider()` / `getAvailableProviders()` con `ProviderStatus`

Cada proveedor reporta: type, name, description, status (`available` | `not-configured` | `planned`).

### 4. Services (`src/services/`)

Servicios de infraestructura.

- **history-storage**: CRUD sobre LocalStorage con límite de entradas

### 5. Stores (`src/stores/`)

Estado global con Zustand. Un store por flujo principal. Las acciones de alto nivel encapsulan la lógica de negocio.

- **prompt-workflow-store**: `submitIdea()` → análisis → diseño → generación → evaluación
- **optimize-workflow-store**: `submitPrompt()` → análisis → optimización → evaluación
- **history-store**: Gestión del historial

### 6. Components (`src/components/`)

- **ui/**: Primitivos reutilizables (Button, Card, TextArea, Select, Badge, ScoreMeter, CopyBlock, LoadingSpinner)
- **layout/**: AppLayout, Sidebar, PageHeader

### 7. Features (`src/features/`)

Componentes de dominio agrupados por funcionalidad:

- **prompt-intake**: IdeaForm + DesignPanel (flujo de creación)
- **prompt-optimizer**: OptimizeForm + OptimizeResultPanel (flujo de optimización)
- **prompt-result**: ResultPanel (visualización del resultado final)
- **history**: HistoryList

### 8. Pages (`src/pages/`)

Orquestadores de features. Cada página conecta stores con features. No contienen lógica de negocio directa — delegan en acciones del store.

## Flujo Principal: Crear Prompt

```
Usuario escribe idea
       │
       ▼
  IdeaForm (prompt-intake)
       │
       ▼
  store.submitIdea(idea)  ──────────────────────┐
       │                                         │
       ▼                                         │
  HeuristicProvider.analyzeIdea()                │
       │                                         │
       ├─→ intent-parser.parseIntent()           │
       ├─→ constraint-extractor.extract()        │ Pipeline V2
       ├─→ entity-extractor.extract()            │
       ├─→ project-classifier.classify()         │
       └─→ analyze() [orchestrator]              │
       │                                         │
       ▼                                         │
  structure-designer.designStructure()           │
       │                                         │
       ▼                                    ─────┘
  DesignPanel muestra: objetivo, módulos, flujo, entidades
       │
       ▼
  store.generatePrompt()
       │
       ▼
  prompt-assembler.assemble()
       │
       ▼
  ResultPanel: prompt maestro + 4 variantes + evaluación (13 métricas)
       │
       ▼
  Se guarda automáticamente en historial (LocalStorage)
```

## Flujo: Optimizar Prompt

```
Usuario pega prompt existente
       │
       ▼
  store.submitPrompt(prompt)
       │
       ▼
  prompt-refiner.refine()
       │ 11 reglas de detección
       │ Reescritura inteligente
       ▼
  evaluator.evaluate() [antes y después]
       │ 13 métricas comparadas
       ▼
  OptimizeResultPanel: antes/después + changesSummary + preservedIntent
```

## Decisiones Técnicas

| Decisión | Justificación |
|----------|--------------|
| **Pipeline modular** | Cada módulo es independiente, testeable y reemplazable |
| **Zustand** | Más simple que Redux, stores separados por flujo |
| **Tailwind CSS 4** | Utilidades, zero-runtime, integración Vite nativa |
| **HashRouter** | Compatibilidad con GitHub Pages (paths estáticos) |
| **Factory + Status** | Los proveedores se registran con metadata de disponibilidad |
| **Acciones encapsuladas** | `submitIdea`/`submitPrompt` evitan orquestación en Pages |
| **LocalStorage** | Suficiente para V2, migrable a IndexedDB si crece |

## Deploy

- Rama: `main`
- CI: GitHub Actions (`.github/workflows/deploy.yml`)
- Target: GitHub Pages
- SPA fallback: `404.html` copiado del `index.html` en build
- Router: HashRouter para evitar problemas de rutas
