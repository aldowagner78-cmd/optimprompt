import { Card, CopyBlock, Badge, ScoreMeter } from '@/components/ui';
import type { EvaluationResult, OptimizationResult } from '@/types';
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface OptimizeResultPanelProps {
  optimization: OptimizationResult;
  evaluation: EvaluationResult | null;
}

const severityColor = {
  low: 'yellow' as const,
  medium: 'yellow' as const,
  high: 'red' as const,
};

const typeLabel: Record<string, string> = {
  'ambiguity': 'Ambigüedad',
  'modularity': 'Modularidad',
  'monolith-risk': 'Riesgo Monolítico',
  'order-issue': 'Orden Incorrecto',
  'missing-detail': 'Detalle Faltante',
  'inconsistency': 'Inconsistencia',
  'vague-scope': 'Alcance Vago',
  'missing-flow': 'Flujo Faltante',
  'weak-constraint': 'Restricción Débil',
};

export function OptimizeResultPanel({ optimization, evaluation }: OptimizeResultPanelProps) {
  return (
    <div className="space-y-6">
      {/* Intent preserved */}
      {optimization.preservedIntent && (
        <Card title="Intención Detectada" className="border-l-4 border-l-primary-500">
          <p className="text-sm text-surface-200">{optimization.preservedIntent}</p>
        </Card>
      )}

      {/* Observations */}
      {optimization.observations.length > 0 && (
        <Card title="Problemas Detectados" className="border-l-4 border-l-warning">
          <div className="space-y-3">
            {optimization.observations.map((obs, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-800 rounded-lg">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                  obs.severity === 'high' ? 'text-danger' : 'text-warning'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={typeLabel[obs.type] ?? obs.type} color={severityColor[obs.severity]} />
                    <Badge label={obs.severity.toUpperCase()} color={severityColor[obs.severity]} />
                  </div>
                  <p className="text-sm text-surface-300">{obs.message}</p>
                  {obs.fix && (
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-info mt-0.5 shrink-0" />
                      <p className="text-xs text-info">{obs.fix}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Changes summary */}
      {optimization.changesSummary.length > 0 && (
        <Card title="Cambios Realizados">
          <ul className="space-y-1.5">
            {optimization.changesSummary.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                <ArrowRight className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                {change}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Prompt Original">
          <CopyBlock content={optimization.originalPrompt} />
        </Card>
        <Card title="Prompt Optimizado" className="border-l-4 border-l-success">
          <CopyBlock content={optimization.optimizedPrompt} />
        </Card>
      </div>

      {/* Evaluation */}
      {evaluation && (
        <Card title="Evaluación del Prompt Optimizado">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ScoreMeter label="Claridad" value={evaluation.score.clarity} />
            <ScoreMeter label="Completitud" value={evaluation.score.completeness} />
            <ScoreMeter label="Modularidad" value={evaluation.score.modularity} />
            <ScoreMeter label="Escalabilidad" value={evaluation.score.scalability} />
            <ScoreMeter label="Precisión Funcional" value={evaluation.score.functionalPrecision} />
            <ScoreMeter label="Especificidad Técnica" value={evaluation.score.technicalSpecificity} />
            <ScoreMeter label="Orden Metodológico" value={evaluation.score.methodologicalOrder} />
            <ScoreMeter label="Cobertura de Restricciones" value={evaluation.score.constraintCoverage} />
            <ScoreMeter label="Consistencia Interna" value={evaluation.score.internalConsistency} />
            <ScoreMeter label="Calidad del Flujo" value={evaluation.score.flowQuality} />
            <ScoreMeter label="Riesgo de Ambigüedad" value={evaluation.score.ambiguityRisk} inverted />
            <ScoreMeter label="Riesgo de Monolitismo" value={evaluation.score.monolithismRisk} inverted />
            <ScoreMeter label="Riesgo de Contradicción" value={evaluation.score.contradictionRisk} inverted />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-surface-400 text-sm">Score General:</span>
              <Badge
                label={`${evaluation.score.overall}/10`}
                color={evaluation.score.overall >= 7 ? 'green' : evaluation.score.overall >= 4 ? 'yellow' : 'red'}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {evaluation.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" title={item.detail}>
                  {item.passed
                    ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    : <XCircle className="w-4 h-4 text-danger shrink-0" />
                  }
                  <span className={item.passed ? 'text-surface-200' : 'text-surface-400'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
