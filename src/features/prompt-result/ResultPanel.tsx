import { useState } from 'react';
import { Card, CopyBlock, ScoreMeter, Badge } from '@/components/ui';
import type { EvaluationResult, PromptResult } from '@/types';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';

interface ResultPanelProps {
  result: PromptResult;
  evaluation: EvaluationResult | null;
}

export function ResultPanel({ result, evaluation }: ResultPanelProps) {
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Master Prompt */}
      <Card title="Prompt Maestro" subtitle="El prompt principal optimizado para generar tu aplicación">
        <CopyBlock content={result.masterPrompt} />
      </Card>

      {/* Variants */}
      <Card title="Variantes">
        <div className="space-y-3">
          {result.variants.map((variant, i) => (
            <div key={i} className="border border-surface-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedVariant(expandedVariant === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-800 transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="font-medium text-surface-100">{variant.label}</p>
                  <p className="text-xs text-surface-500">{variant.description}</p>
                </div>
                {expandedVariant === i
                  ? <ChevronUp className="w-4 h-4 text-surface-400" />
                  : <ChevronDown className="w-4 h-4 text-surface-400" />
                }
              </button>
              {expandedVariant === i && (
                <div className="px-4 pb-4">
                  <CopyBlock content={variant.content} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Evaluation */}
      {evaluation && (
        <>
          {/* Diagnosis: Strengths / Weaknesses / Suggestions */}
          <div className="grid grid-cols-3 gap-4">
            {evaluation.strengths.length > 0 && (
              <Card title="Fortalezas">
                <ul className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <ThumbsUp className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {evaluation.weaknesses.length > 0 && (
              <Card title="Debilidades">
                <ul className="space-y-2">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <ThumbsDown className="w-3.5 h-3.5 text-danger mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {evaluation.suggestions.length > 0 && (
              <Card title="Sugerencias">
                <ul className="space-y-2">
                  {evaluation.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Score metrics */}
          <Card title="Evaluación de Calidad">
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
            <div className="mt-4 pt-4 border-t border-surface-700 flex items-center gap-3">
              <span className="text-surface-400 text-sm">Score General:</span>
              <Badge
                label={`${evaluation.score.overall}/10`}
                color={evaluation.score.overall >= 7 ? 'green' : evaluation.score.overall >= 4 ? 'yellow' : 'red'}
              />
            </div>
          </Card>

          {/* Checklist */}
          <Card title="Checklist de Calidad">
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
          </Card>
        </>
      )}
    </div>
  );
}
