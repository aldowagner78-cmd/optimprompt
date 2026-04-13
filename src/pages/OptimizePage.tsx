import { useOptimizeWorkflowStore } from '@/stores/optimize-workflow-store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { OptimizeForm } from '@/features/prompt-optimizer/OptimizeForm';
import { OptimizeResultPanel } from '@/features/prompt-optimizer/OptimizeResultPanel';
import { RotateCcw } from 'lucide-react';

export function OptimizePage() {
  const {
    stage,
    optimization,
    evaluation,
    isLoading,
    error,
    submitPrompt,
    reset,
  } = useOptimizeWorkflowStore();

  const handleSubmit = (prompt: string) => {
    submitPrompt(prompt);
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Optimizar Prompt Existente"
        description="Pega un prompt y el sistema lo analizará, detectará problemas y generará una versión mejorada."
        actions={
          stage !== 'idle' ? (
            <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="w-4 h-4" />}>
              Reiniciar
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Card className="mb-6 border-l-4 border-l-danger">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {stage === 'idle' && (
        <Card>
          <OptimizeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Card>
      )}

      {stage === 'analyzing' && <LoadingSpinner message="Analizando prompt..." />}

      {stage === 'result' && optimization && (
        <OptimizeResultPanel optimization={optimization} evaluation={evaluation} />
      )}
    </div>
  );
}
