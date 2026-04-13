export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'api'
  | 'cli'
  | 'library'
  | 'fullstack'
  | 'other';

export interface PromptIdea {
  rawInput: string;
  projectType: ProjectType;
  detailedMode: boolean;
}

export interface DetectedObjective {
  summary: string;
  targetUser: string;
  primaryAction: string;
  constraints: string[];
}

export interface SuggestedModule {
  name: string;
  responsibility: string;
  dependencies: string[];
}

export interface DesignStructure {
  objective: DetectedObjective;
  modules: SuggestedModule[];
  mainFlow: string[];
  entities: string[];
  techDecisions: string[];
  architectureConstraints: string[];
}

export interface PromptVariant {
  label: string;
  description: string;
  content: string;
}

export interface PromptResult {
  masterPrompt: string;
  variants: PromptVariant[];
}

export interface EvaluationScore {
  clarity: number;
  completeness: number;
  modularity: number;
  scalability: number;
  functionalPrecision: number;
  ambiguityRisk: number;
  monolithismRisk: number;
  overall: number;
}

export interface EvaluationResult {
  score: EvaluationScore;
  observations: string[];
  checklist: { label: string; passed: boolean }[];
}

export interface OptimizationObservation {
  type: 'ambiguity' | 'modularity' | 'monolith-risk' | 'order-issue' | 'missing-detail';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface OptimizationResult {
  originalPrompt: string;
  observations: OptimizationObservation[];
  optimizedPrompt: string;
}
