import type { ParsedIntent } from './intent';
import type { ExtractedConstraint } from './constraint';
import type { ExtractedEntity } from './entity';
import type { ProjectType } from './prompt';
import type { CoreMechanic } from './mechanics';

export interface AnalysisResult {
  intent: ParsedIntent;
  constraints: ExtractedConstraint[];
  entities: ExtractedEntity[];
  projectType: ProjectType;
  confidence: number;
  keyPhrases: string[];
  suggestedTechnologies: string[];
  detectedPatterns: string[];
  mechanics: CoreMechanic[];
  platformConstraints: string[];
}
