export type MechanicCategory =
  | 'control'
  | 'reward'
  | 'validation'
  | 'interaction'
  | 'progress'
  | 'restriction';

export interface CoreMechanic {
  id: string;
  label: string;
  category: MechanicCategory;
  subMechanics: string[];
  sourceFragment: string;
}

export interface FunctionalCoverage {
  detectedConcepts: string[];
  coveredConcepts: string[];
  missingConcepts: string[];
  warnings: string[];
  score: number;
}
