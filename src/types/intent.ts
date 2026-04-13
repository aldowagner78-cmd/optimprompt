export interface ParsedIntent {
  goal: string;
  targetUser: string;
  primaryAction: string;
  secondaryActions: string[];
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex';
}
