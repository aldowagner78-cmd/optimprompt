import { usePromptWorkflowStore } from '@/stores/prompt-workflow-store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { IdeaForm } from '@/features/prompt-intake/IdeaForm';
import { DesignPanel } from '@/features/prompt-intake/DesignPanel';
import { ResultPanel } from '@/features/prompt-result/ResultPanel';
import { RotateCcw } from 'lucide-react';

export function CreatePage() {
  const {
    stage,
    design,
    result,
    evaluation,
    isLoading,
    error,
    setIdea,
    generatePrompt,
    reset,
  } = usePromptWorkflowStore();

  const handleIdeaSubmit = async (idea: Parameters<typeof setIdea>[0]) => {
    setIdea(idea);
    // Trigger analysis immediately
    usePromptWorkflowStore.getState().analyzeIdea();
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Crear Prompt desde Idea"
        description="Describe tu idea y el sistema analizará, estructurará y generará un prompt profesional."
        actions={
          stage !== 'idle' ? (
            <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="w-4 h-4" />}>
              Reiniciar
            </Button>
          ) : undefined
        }
      />

      {/* Progress indicator */}
      {stage !== 'idle' && (
        <div className="flex items-center gap-2 mb-6">
          {['Idea', 'Diseño', 'Resultado'].map((label, i) => {
            const stages = ['analyzing', 'design', 'result'];
            const stageIdx = stages.indexOf(stage === 'generating' ? 'result' : stage);
            const isActive = i <= stageIdx;
            const isCurrent = i === stageIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${isActive ? 'bg-primary-500' : 'bg-surface-700'}`} />}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                  ${isCurrent ? 'bg-primary-600/20 text-primary-300 border border-primary-700/50'
                    : isActive ? 'text-primary-400' : 'text-surface-600'}
                `}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                    ${isCurrent ? 'bg-primary-600 text-white' : isActive ? 'bg-primary-800 text-primary-300' : 'bg-surface-800 text-surface-600'}
                  `}>{i + 1}</span>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <Card className="mb-6 border-l-4 border-l-danger">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {/* Stage: idle */}
      {stage === 'idle' && (
        <Card>
          <IdeaForm onSubmit={handleIdeaSubmit} />
        </Card>
      )}

      {/* Stage: analyzing */}
      {stage === 'analyzing' && <LoadingSpinner message="Analizando tu idea..." />}

      {/* Stage: design */}
      {stage === 'design' && design && (
        <DesignPanel design={design} onGenerate={generatePrompt} isLoading={isLoading} />
      )}

      {/* Stage: generating */}
      {stage === 'generating' && <LoadingSpinner message="Generando prompt optimizado..." />}

      {/* Stage: result */}
      {stage === 'result' && result && (
        <ResultPanel result={result} evaluation={evaluation} />
      )}
    </div>
  );
}
