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
  technicalSpecificity: number;
  methodologicalOrder: number;
  constraintCoverage: number;
  internalConsistency: number;
  flowQuality: number;
  ambiguityRisk: number;
  monolithismRisk: number;
  contradictionRisk: number;
  overall: number;
}

export interface EvaluationRule {
  id: string;
  label: string;
  category: 'structure' | 'content' | 'quality' | 'risk';
  evaluate: (prompt: string) => { passed: boolean; score: number; detail: string };
}

export interface EvaluationObservation {
  category: 'strength' | 'weakness' | 'suggestion';
  area: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface EvaluationResult {
  score: EvaluationScore;
  observations: EvaluationObservation[];
  checklist: { label: string; passed: boolean; detail: string }[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface OptimizationObservation {
  type: 'ambiguity' | 'modularity' | 'monolith-risk' | 'order-issue' | 'missing-detail' | 'inconsistency' | 'vague-scope' | 'missing-flow' | 'weak-constraint';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: string;
  fix?: string;
}

export interface OptimizationResult {
  originalPrompt: string;
  observations: OptimizationObservation[];
  optimizedPrompt: string;
  changesSummary: string[];
  preservedIntent: string;
}
