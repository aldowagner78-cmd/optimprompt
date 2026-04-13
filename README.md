# OptimPrompt — Arquitecto de Prompts V2.1

Aplicación profesional para transformar ideas vagas en prompts de alta calidad, orientados a construir aplicaciones modulares, escalables e intuitivas.

**Live:** [https://aldowagner78-cmd.github.io/optimprompt/](https://aldowagner78-cmd.github.io/optimprompt/)

## Metodología

Principio rector: **Estructura → Función → Estética**

1. **Estructura**: Módulos, carpetas, tipos, interfaces
2. **Función**: Lógica de negocio, flujos, validaciones
3. **Estética**: Diseño visual, estilos, UX

## Funcionalidades (V2.1)

- **Crear prompt desde idea**: Describe tu idea y un pipeline de 11 módulos genera un prompt profesional
- **Extracción de mecánicas nucleares** (V2.1): Detecta automáticamente las mecánicas funcionales del dominio (control, recompensas, validación, interacción, progreso, restricción)
- **Validación de cobertura** (V2.1): Verifica que cada mecánica detectada tiene representación en los módulos generados, con auto-corrección
- **Optimizar prompt existente**: 11 reglas de detección de problemas + reconstrucción inteligente
- **Análisis profundo**: Parser de intención, extractor de restricciones (40+ patrones, 7 categorías), extractor de entidades (18 patrones con relaciones), clasificador de proyecto ponderado
- **Diseño estructural**: Genera módulos desde mecánicas del dominio (no desde plantillas genéricas)
- **Generación de variantes**: Prompt maestro + 4 variantes (resumida, estricta, modular, iterativa por fases)
- **Evaluación dimensional**: 16 métricas independientes (claridad, completitud, modularidad, escalabilidad, precisión, especificidad, coherencia, UX, testing, seguridad, rendimiento, mantenibilidad, documentación, cobertura funcional, especificidad de dominio, especificidad de mecánicas)
- **Historial local**: Resultados guardados en LocalStorage con comparación

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Estado | Zustand |
| Routing | React Router 7 (HashRouter) |
| Iconos | Lucide React |
| Persistencia | LocalStorage |
| Motor IA | Pipeline heurístico V2.1 (extensible a Ollama / WebLLM) |
| Deploy | GitHub Pages via GitHub Actions |

## Inicio Rápido

```bash
npm install
npm run dev       # Desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
```

## Estructura del Proyecto

```
src/
├── adapters/ai/               # Proveedores de IA intercambiables
│   ├── heuristic-provider.ts       # Motor principal — usa pipeline V2
│   ├── ollama-provider.ts          # Stub Ollama (LLM local)
│   ├── browser-local-provider.ts   # Stub WebLLM / Transformers.js
│   └── index.ts                    # Factory + registry + status
├── components/
│   ├── layout/                # AppLayout, Sidebar, PageHeader
│   └── ui/                    # Button, Card, TextArea, Select, Badge, etc.
├── features/
│   ├── prompt-intake/         # IdeaForm, DesignPanel
│   ├── prompt-optimizer/      # OptimizeForm, OptimizeResultPanel
│   ├── prompt-result/         # ResultPanel
│   └── history/               # HistoryList
├── lib/pipeline/              # Motor V2.1 — lógica pura (11 módulos)
│   ├── analyze.ts                  # Orquestador del pipeline
│   ├── intent-parser.ts            # Extrae goal, targetUser, actions, domain, complexity, systemType
│   ├── constraint-extractor.ts     # 40+ patrones, 7 categorías de restricciones
│   ├── entity-extractor.ts         # 18 patrones de entidades con relaciones
│   ├── project-classifier.ts       # Clasificación ponderada con confianza
│   ├── core-mechanics-extractor.ts # (V2.1) 25+ reglas de mecánicas en 6 categorías
│   ├── coverage-validator.ts       # (V2.1) Validación de cobertura funcional
│   ├── structure-designer.ts       # Genera diseño desde mecánicas del dominio
│   ├── prompt-assembler.ts         # Prompt maestro + 4 variantes
│   ├── prompt-refiner.ts           # 11 reglas de detección + reescritura
│   └── evaluator.ts               # 16 métricas independientes
├── pages/                     # Páginas — orquestadoras de features
├── services/                  # Infraestructura (history-storage)
├── stores/                    # Estado global (Zustand, 3 stores)
└── types/                     # Tipos V2 (prompt, intent, constraint, entity, analysis)
```

## Arquitectura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

### Principios clave

- **Pipeline modular**: 11 módulos independientes, cada uno testeable y reemplazable
- **Mecánicas-first** (V2.1): Los módulos se generan desde las mecánicas funcionales del dominio, no desde plantillas genéricas
- **Adaptadores desacoplados**: Interfaz `AIProvider` + factory con status por proveedor
- **Lógica pura**: El pipeline en `lib/pipeline/` no tiene dependencias de React ni estado
- **Estado encapsulado**: Stores exponen acciones de alto nivel (`submitIdea`, `submitPrompt`)
- **Persistencia simple**: LocalStorage con capa de servicio desacoplada

## Proveedores de IA

| Proveedor | Status | Descripción |
|-----------|--------|-------------|
| Motor Heurístico V2.1 | ✅ Activo | Pipeline local de 11 módulos, sin costo |
| Ollama (LLM Local) | 🔧 Stub | Requiere servidor Ollama en localhost:11434 |
| IA en Navegador | 📋 Planificado | WebLLM / Transformers.js (experimental) |

Para agregar un proveedor: implementar `AIProvider`, registrar en el factory, la UI se actualiza automáticamente.

## Deploy

GitHub Actions despliega automáticamente a GitHub Pages en cada push a `main`.
El workflow incluye generación de `404.html` para SPA routing con HashRouter.

## Licencia

MIT
