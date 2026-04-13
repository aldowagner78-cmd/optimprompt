import { Card, CopyBlock, Badge, ScoreMeter } from '@/components/ui';
import type { EvaluationResult, OptimizationResult } from '@/types';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface OptimizeResultPanelProps {
  optimization: OptimizationResult;
  evaluation: EvaluationResult | null;
}

const severityColor = {
  low: 'yellow' as const,
  medium: 'yellow' as const,
  high: 'red' as const,
};

const typeLabel = {
  'ambiguity': 'Ambigüedad',
  'modularity': 'Modularidad',
  'monolith-risk': 'Riesgo Monolítico',
  'order-issue': 'Orden Incorrecto',
  'missing-detail': 'Detalle Faltante',
};

export function OptimizeResultPanel({ optimization, evaluation }: OptimizeResultPanelProps) {
  return (
    <div className="space-y-6">
      {/* Observations */}
      {optimization.observations.length > 0 && (
        <Card title="Observaciones Detectadas" className="border-l-4 border-l-warning">
          <div className="space-y-3">
            {optimization.observations.map((obs, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-800 rounded-lg">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                  obs.severity === 'high' ? 'text-danger' : 'text-warning'
                }`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={typeLabel[obs.type]} color={severityColor[obs.severity]} />
                    <Badge label={obs.severity.toUpperCase()} color={severityColor[obs.severity]} />
                  </div>
                  <p className="text-sm text-surface-300">{obs.message}</p>
                </div>
              </div>
            ))}
          </div>
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
            <ScoreMeter label="Riesgo de Ambigüedad" value={evaluation.score.ambiguityRisk} inverted />
            <ScoreMeter label="Riesgo de Monolitismo" value={evaluation.score.monolithismRisk} inverted />
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
                <div key={i} className="flex items-center gap-2 text-sm">
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
