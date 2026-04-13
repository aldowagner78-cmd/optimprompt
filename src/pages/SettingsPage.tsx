import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { getAvailableProviders, type ProviderStatus } from '@/adapters/ai';
import { Cpu, Database } from 'lucide-react';

const statusBadge: Record<ProviderStatus, { label: string; color: 'green' | 'yellow' | 'gray' }> = {
  available: { label: 'Activo', color: 'green' },
  'not-configured': { label: 'No configurado', color: 'yellow' },
  planned: { label: 'Próximamente', color: 'gray' },
};

export function SettingsPage() {
  const providers = getAvailableProviders();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Configuración"
        description="Configura el motor de IA y las preferencias de la aplicación."
      />

      {/* AI Provider */}
      <Card title="Motor de IA" className="mb-6">
        <div className="space-y-4">
          {providers.map(p => {
            const badge = statusBadge[p.status];
            return (
              <div key={p.type} className="flex items-center justify-between p-4 bg-surface-800 rounded-lg border border-surface-700">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="font-medium text-surface-100">{p.name}</p>
                    <p className="text-xs text-surface-500">{p.description}</p>
                  </div>
                </div>
                <Badge label={badge.label} color={badge.color} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data */}
      <Card title="Almacenamiento">
        <div className="flex items-center gap-3 p-4 bg-surface-800 rounded-lg">
          <Database className="w-5 h-5 text-info" />
          <div>
            <p className="font-medium text-surface-100">LocalStorage</p>
            <p className="text-xs text-surface-500">
              Los datos se almacenan localmente en tu navegador. No se envía información a servidores externos.
            </p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card title="Acerca de" className="mt-6">
        <div className="space-y-2 text-sm text-surface-400">
          <p><span className="text-surface-200">Versión:</span> 2.0.0</p>
          <p><span className="text-surface-200">Metodología:</span> Estructura → Función → Estética</p>
          <p><span className="text-surface-200">Motor actual:</span> Pipeline heurístico V2 (13 métricas, 4 variantes)</p>
        </div>
      </Card>
    </div>
  );
}
