export interface ExtractedConstraint {
  category: 'architecture' | 'quality' | 'performance' | 'ux' | 'tech-stack' | 'process' | 'security';
  description: string;
  source: 'explicit' | 'inferred';
  priority: 'must' | 'should' | 'nice-to-have';
}
