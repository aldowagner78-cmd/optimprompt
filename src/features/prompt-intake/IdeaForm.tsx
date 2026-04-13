import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, TextArea, Select } from '@/components/ui';
import type { ProjectType, PromptIdea } from '@/types';

interface IdeaFormProps {
  onSubmit: (idea: PromptIdea) => void;
  isLoading?: boolean;
}

const projectTypeOptions = [
  { value: 'web-app', label: 'Aplicación Web' },
  { value: 'mobile-app', label: 'App Móvil' },
  { value: 'api', label: 'API / Backend' },
  { value: 'cli', label: 'CLI / Terminal' },
  { value: 'library', label: 'Librería / SDK' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'other', label: 'Otro / Auto-detectar' },
];

export function IdeaForm({ onSubmit, isLoading = false }: IdeaFormProps) {
  const [rawInput, setRawInput] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('other');
  const [detailedMode, setDetailedMode] = useState(true);

  const handleSubmit = () => {
    if (!rawInput.trim()) return;
    onSubmit({ rawInput: rawInput.trim(), projectType, detailedMode });
  };

  return (
    <div className="space-y-5">
      <TextArea
        label="Describe tu idea de aplicación"
        placeholder="Ej: Quiero una app para gestionar tareas de equipo con tableros kanban, asignación de usuarios, etiquetas y fechas límite..."
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        rows={6}
        helperText="Cuanto más detalle aportes, mejor será el prompt generado."
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo de proyecto"
          options={projectTypeOptions}
          value={projectType}
          onChange={(e) => setProjectType(e.target.value as ProjectType)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Modo</label>
          <div className="flex gap-2">
            <button
              onClick={() => setDetailedMode(false)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${!detailedMode
                  ? 'bg-primary-600/15 text-primary-300 border border-primary-700/50'
                  : 'bg-surface-800 text-surface-400 border border-surface-600 hover:text-surface-200'
                }`}
            >
              Breve
            </button>
            <button
              onClick={() => setDetailedMode(true)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${detailedMode
                  ? 'bg-primary-600/15 text-primary-300 border border-primary-700/50'
                  : 'bg-surface-800 text-surface-400 border border-surface-600 hover:text-surface-200'
                }`}
            >
              Detallado
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!rawInput.trim() || isLoading}
        size="lg"
        icon={<Sparkles className="w-5 h-5" />}
        className="w-full"
      >
        {isLoading ? 'Analizando...' : 'Analizar Idea'}
      </Button>
    </div>
  );
}
