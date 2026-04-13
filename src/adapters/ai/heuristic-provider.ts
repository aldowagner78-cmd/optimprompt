import type {
  AIProvider,
  DesignStructure,
  EvaluationResult,
  OptimizationResult,
  PromptIdea,
  PromptResult,
} from '@/types';
import { getArchitectureConstraints, getDefaultFlow, getDefaultTechDecisions, getModuleTemplate } from '@/lib/design-templates';
import { buildMasterPrompt, generateAllVariants } from '@/lib/prompt-builder';
import { evaluatePrompt } from '@/lib/prompt-evaluator';
import { optimizePrompt } from '@/lib/prompt-optimizer';
import { detectProjectType, extractKeyPhrases } from '@/lib/text-analysis';

export class HeuristicProvider implements AIProvider {
  readonly name = 'Heuristic Engine (Local)';

  async analyzeIdea(idea: PromptIdea): Promise<DesignStructure> {
    const projectType = idea.projectType !== 'other'
      ? idea.projectType
      : detectProjectType(idea.rawInput);

    const phrases = extractKeyPhrases(idea.rawInput);
    const mainPhrase = phrases[0] ?? idea.rawInput;

    const modules = getModuleTemplate(projectType);
    const mainFlow = getDefaultFlow(projectType);
    const techDecisions = getDefaultTechDecisions(projectType);

    const objective = {
      summary: mainPhrase,
      targetUser: 'Usuario final de la aplicación',
      primaryAction: phrases[1] ?? 'Interactuar con la funcionalidad principal',
      constraints: idea.detailedMode
        ? ['Modularidad extrema', 'Tipado fuerte', 'Código limpio', 'No archivos > 150 líneas']
        : ['Modularidad', 'Tipado fuerte'],
    };

    const entities = this.extractEntities(idea.rawInput);

    const design: DesignStructure = {
      objective,
      modules,
      mainFlow,
      entities,
      techDecisions,
      architectureConstraints: [],
    };

    design.architectureConstraints = getArchitectureConstraints(design);

    return design;
  }

  async generatePrompt(design: DesignStructure): Promise<PromptResult> {
    const masterPrompt = buildMasterPrompt(design);
    return generateAllVariants(design, masterPrompt);
  }

  async optimizePrompt(prompt: string): Promise<OptimizationResult> {
    return optimizePrompt(prompt);
  }

  async evaluatePrompt(prompt: string): Promise<EvaluationResult> {
    return evaluatePrompt(prompt);
  }

  private extractEntities(input: string): string[] {
    const entities: string[] = [];
    const lower = input.toLowerCase();

    const entityKeywords = [
      'usuario', 'producto', 'pedido', 'tarea', 'proyecto', 'mensaje',
      'archivo', 'categoría', 'configuración', 'perfil', 'comentario',
      'notificación', 'sesión', 'reporte', 'dashboard', 'prompt',
    ];

    entityKeywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        entities.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    if (entities.length === 0) {
      entities.push('Entidad principal', 'Configuración');
    }

    return entities;
  }
}
