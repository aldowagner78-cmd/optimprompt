import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button, TextArea } from '@/components/ui';

interface OptimizeFormProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export function OptimizeForm({ onSubmit, isLoading = false }: OptimizeFormProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="space-y-5">
      <TextArea
        label="Pega tu prompt existente"
        placeholder="Pega aquí el prompt que quieres optimizar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={10}
        helperText="El sistema detectará ambigüedades, falta de modularidad y problemas de estructura."
      />
      <Button
        onClick={() => onSubmit(prompt.trim())}
        disabled={!prompt.trim() || isLoading}
        size="lg"
        icon={<Wand2 className="w-5 h-5" />}
        className="w-full"
      >
        {isLoading ? 'Analizando...' : 'Optimizar Prompt'}
      </Button>
    </div>
  );
}
