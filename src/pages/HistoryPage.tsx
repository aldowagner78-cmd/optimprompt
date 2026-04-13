import { PageHeader } from '@/components/layout/PageHeader';
import { HistoryList } from '@/features/history/HistoryList';

export function HistoryPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Historial"
        description="Revisa y compara tus prompts generados y optimizados anteriormente."
      />
      <HistoryList />
    </div>
  );
}
