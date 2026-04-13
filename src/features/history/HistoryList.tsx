import { useEffect } from 'react';
import { useHistoryStore } from '@/stores/history-store';
import { Card, Badge, Button } from '@/components/ui';
import { Trash2, Clock } from 'lucide-react';

export function HistoryList() {
  const { entries, load, remove, clear } = useHistoryStore();
  useEffect(() => {
    load();
  }, [load]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-12 h-12 text-surface-600 mx-auto mb-4" />
        <p className="text-surface-400">No hay sesiones guardadas aún.</p>
        <p className="text-sm text-surface-600 mt-1">Crea o optimiza un prompt para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="danger" size="sm" onClick={clear}>
          Limpiar historial
        </Button>
      </div>

      {entries.map(entry => (
        <Card key={entry.id} className="hover:border-surface-600 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  label={entry.type === 'create' ? 'Creación' : 'Optimización'}
                  color={entry.type === 'create' ? 'blue' : 'green'}
                />
                <span className="text-xs text-surface-500">
                  {new Date(entry.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-surface-200 truncate">{entry.inputSummary}</p>
              {entry.evaluation && (
                <div className="mt-2">
                  <Badge
                    label={`Score: ${entry.evaluation.score.overall}/10`}
                    color={entry.evaluation.score.overall >= 7 ? 'green' : entry.evaluation.score.overall >= 4 ? 'yellow' : 'red'}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(entry.id)}
                icon={<Trash2 className="w-4 h-4" />}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
