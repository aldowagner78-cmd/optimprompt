import { ArrowRight, Layers, GitBranch, Box, Cpu, ShieldCheck } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { DesignStructure } from '@/types';

interface DesignPanelProps {
  design: DesignStructure;
  onGenerate: () => void;
  isLoading?: boolean;
}

export function DesignPanel({ design, onGenerate, isLoading = false }: DesignPanelProps) {
  return (
    <div className="space-y-6">
      {/* Objective */}
      <Card title="Objetivo Detectado" className="border-l-4 border-l-primary-500">
        <div className="space-y-3">
          <p className="text-surface-200">{design.objective.summary}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-surface-500">Usuario final:</span>
              <p className="text-surface-200">{design.objective.targetUser}</p>
            </div>
            <div>
              <span className="text-surface-500">Acción principal:</span>
              <p className="text-surface-200">{design.objective.primaryAction}</p>
            </div>
          </div>
          {design.objective.constraints.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {design.objective.constraints.map((c, i) => (
                <Badge key={i} label={c} color="blue" />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modules */}
      <Card title="Módulos Sugeridos">
        <div className="grid gap-3">
          {design.modules.map((mod, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-surface-800 rounded-lg">
              <Layers className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-surface-100">{mod.name}</p>
                <p className="text-sm text-surface-400">{mod.responsibility}</p>
                {mod.dependencies.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    <GitBranch className="w-3 h-3 text-surface-500 mt-0.5" />
                    <span className="text-xs text-surface-500">
                      Depende de: {mod.dependencies.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Flow */}
      <Card title="Flujo Principal">
        <div className="space-y-2">
          {design.mainFlow.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-300 text-xs flex items-center justify-center shrink-0 font-medium">
                {i + 1}
              </span>
              <span className="text-sm text-surface-200">{step}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Entities */}
        <Card title="Entidades Clave">
          <div className="flex flex-wrap gap-2">
            {design.entities.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 rounded-lg">
                <Box className="w-3.5 h-3.5 text-info" />
                <span className="text-sm text-surface-200">{e}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tech Decisions */}
        <Card title="Decisiones Técnicas">
          <ul className="space-y-1.5">
            {design.techDecisions.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Cpu className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-surface-300">{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Architecture Constraints */}
      <Card title="Restricciones de Arquitectura">
        <ul className="space-y-1.5">
          {design.architectureConstraints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <span className="text-surface-300">{c}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Generate */}
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        size="lg"
        icon={<ArrowRight className="w-5 h-5" />}
        className="w-full"
      >
        {isLoading ? 'Generando...' : 'Generar Prompt Final'}
      </Button>
    </div>
  );
}
