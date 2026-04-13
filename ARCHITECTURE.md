# Arquitectura — OptimPrompt V2.1

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
│            Pipeline V2.1 (Pure Logic)             │
│  intent-parser | constraint-extractor            │
│  entity-extractor | project-classifier           │
│  core-mechanics-extractor | coverage-validator   │
│  structure-designer | prompt-assembler            │
│  prompt-refiner | evaluator | analyze (orchestr.) │
├─────────────────────────────────────────────────┤
│                    Types                         │
│  prompt | intent | constraint | entity | analysis │
│  history | ai-provider | mechanics                │
└─────────────────────────────────────────────────┘
```

## Capas

### 1. Types (`src/types/`)

Tipos e interfaces centrales. No contienen lógica. Son el contrato entre capas.

- `PromptIdea`: Input del usuario (idea textual)
- `DesignStructure`: Resultado del análisis estructural
- `PromptResult`: Prompt maestro + 4 variantes
- `EvaluationScore`: 16 métricas + overall score
- `OptimizationResult`: Observaciones + prompt mejorado + changesSummary + preservedIntent
- `AIProvider`: Interfaz que deben implementar todos los motores de IA
- `ParsedIntent`: Intención parseada (goal, targetUser, actions, domain, complexity, systemType, dominantVerb, expectedOutcome)
- `ExtractedConstraint`: Restricción extraída (7 categorías)
- `ExtractedEntity`: Entidad extraída con relaciones
- `AnalysisResult`: Resultado completo del pipeline de análisis (incluye mechanics[] y platformConstraints[])
- `CoreMechanic`: Mecánica funcional detectada (id, label, category, subMechanics)
- `FunctionalCoverage`: Resultado de validación de cobertura
- `HistoryEntry`: Entrada del historial

### 2. Pipeline V2 (`src/lib/pipeline/`)

Motor central — 11 módulos de lógica pura, sin dependencias de React ni estado.

| Módulo | Función |
|--------|--------|
| **intent-parser** | Extrae goal, targetUser, actions, domain, complexity, systemType del texto |
| **constraint-extractor** | 40+ patrones regex en 7 categorías |
| **entity-extractor** | 18 patrones de entidades con detección de relaciones |
| **project-classifier** | Clasificación ponderada del tipo de proyecto con score de confianza |
| **core-mechanics-extractor** | (V2.1) 25+ reglas en 6 categorías (control, recompensa, validación, interacción, progreso, restricción) |
| **coverage-validator** | (V2.1) Valida cobertura de mecánicas en el diseño, genera módulos faltantes |
| **structure-designer** | Genera diseño (módulos desde mecánicas del dominio, flujos, entidades) |
| **prompt-assembler** | Construye prompt maestro + 4 variantes con mecánicas integradas |
| **prompt-refiner** | 11 reglas de detección de problemas + reescritura inteligente |
| **evaluator** | 16 métricas dimensionales independientes |
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
       ├─→ constraint-extractor.extract()        │ Pipeline V2.1
       ├─→ entity-extractor.extract()            │
       ├─→ project-classifier.classify()         │
       ├─→ core-mechanics-extractor.extract()    │ (V2.1)
       └─→ analyze() [orchestrator]              │
       │                                         │
       ▼                                         │
  structure-designer.designStructure()           │
  + coverage-validator.validateCoverage()        │ (V2.1)
       │                                         │
       ▼                                    ─────┘
  DesignPanel muestra: objetivo, núcleo del sistema, mecánicas, módulos, flujo, entidades
       │
       ▼
  store.generatePrompt()
       │
       ▼
  prompt-assembler.assemble()
       │
       ▼
  ResultPanel: prompt maestro + 4 variantes + evaluación (16 métricas)
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
       │ 16 métricas comparadas
       ▼
  OptimizeResultPanel: antes/después + changesSummary + preservedIntent
```

## Decisiones Técnicas

| Decisión | Justificación |
|----------|--------------|
| **Pipeline modular** | Cada módulo es independiente, testeable y reemplazable |
| **Mecánicas-first (V2.1)** | Módulos se generan desde mecánicas del dominio, no plantillas genéricas |
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
