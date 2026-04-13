# OptimPrompt — Arquitecto de Prompts V2

Aplicación profesional para transformar ideas vagas en prompts de alta calidad, orientados a construir aplicaciones modulares, escalables e intuitivas.

**Live:** [https://aldowagner78-cmd.github.io/optimprompt/](https://aldowagner78-cmd.github.io/optimprompt/)

## Metodología

Principio rector: **Estructura → Función → Estética**

1. **Estructura**: Módulos, carpetas, tipos, interfaces
2. **Función**: Lógica de negocio, flujos, validaciones
3. **Estética**: Diseño visual, estilos, UX

## Funcionalidades (V2)

- **Crear prompt desde idea**: Describe tu idea y un pipeline de 9 módulos genera un prompt profesional
- **Optimizar prompt existente**: 11 reglas de detección de problemas + reconstrucción inteligente
- **Análisis profundo**: Parser de intención, extractor de restricciones (40+ patrones, 7 categorías), extractor de entidades (18 patrones con relaciones), clasificador de proyecto ponderado
- **Diseño estructural**: Genera automáticamente objetivo, módulos, flujo principal, entidades y decisiones técnicas
- **Generación de variantes**: Prompt maestro + 4 variantes (resumida, estricta, modular, creativa)
- **Evaluación dimensional**: 13 métricas independientes (claridad, completitud, modularidad, escalabilidad, precisión, especificidad, coherencia, UX, testing, seguridad, rendimiento, mantenibilidad, documentación)
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
| Motor IA | Pipeline heurístico V2 (extensible a Ollama / WebLLM) |
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
├── lib/pipeline/              # Motor V2 — lógica pura (9 módulos)
│   ├── analyze.ts                  # Orquestador del pipeline
│   ├── intent-parser.ts            # Extrae goal, targetUser, actions, domain, complexity
│   ├── constraint-extractor.ts     # 40+ patrones, 7 categorías de restricciones
│   ├── entity-extractor.ts         # 18 patrones de entidades con relaciones
│   ├── project-classifier.ts       # Clasificación ponderada con confianza
│   ├── structure-designer.ts       # Genera diseño a partir del análisis
│   ├── prompt-assembler.ts         # Prompt maestro + 4 variantes
│   ├── prompt-refiner.ts           # 11 reglas de detección + reescritura
│   └── evaluator.ts               # 13 métricas independientes
├── pages/                     # Páginas — orquestadoras de features
├── services/                  # Infraestructura (history-storage)
├── stores/                    # Estado global (Zustand, 3 stores)
└── types/                     # Tipos V2 (prompt, intent, constraint, entity, analysis)
```

## Arquitectura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

### Principios clave

- **Pipeline modular**: 9 módulos independientes, cada uno testeable y reemplazable
- **Adaptadores desacoplados**: Interfaz `AIProvider` + factory con status por proveedor
- **Lógica pura**: El pipeline en `lib/pipeline/` no tiene dependencias de React ni estado
- **Estado encapsulado**: Stores exponen acciones de alto nivel (`submitIdea`, `submitPrompt`)
- **Persistencia simple**: LocalStorage con capa de servicio desacoplada

## Proveedores de IA

| Proveedor | Status | Descripción |
|-----------|--------|-------------|
| Motor Heurístico V2 | ✅ Activo | Pipeline local de 9 módulos, sin costo |
| Ollama (LLM Local) | 🔧 Stub | Requiere servidor Ollama en localhost:11434 |
| IA en Navegador | 📋 Planificado | WebLLM / Transformers.js (experimental) |

Para agregar un proveedor: implementar `AIProvider`, registrar en el factory, la UI se actualiza automáticamente.

## Deploy

GitHub Actions despliega automáticamente a GitHub Pages en cada push a `main`.
El workflow incluye generación de `404.html` para SPA routing con HashRouter.

## Licencia

MIT
