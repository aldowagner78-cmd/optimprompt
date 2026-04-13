import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { getAvailableProviders } from '@/adapters/ai';
import { Cpu, Database, Info } from 'lucide-react';

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
          {providers.map(p => (
            <div key={p.type} className="flex items-center justify-between p-4 bg-surface-800 rounded-lg border border-surface-700">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="font-medium text-surface-100">{p.name}</p>
                  <p className="text-xs text-surface-500">Procesamiento local sin costo</p>
                </div>
              </div>
              <Badge label="Activo" color="green" />
            </div>
          ))}

          <div className="p-4 bg-surface-800/50 rounded-lg border border-dashed border-surface-700">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-surface-500" />
              <div>
                <p className="text-sm text-surface-400">Próximamente: proveedores de IA externos</p>
                <p className="text-xs text-surface-600 mt-0.5">
                  La arquitectura está preparada para integraciones con proveedores de IA locales o remotos.
                </p>
              </div>
            </div>
          </div>
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
          <p><span className="text-surface-200">Versión:</span> 1.0.0 MVP</p>
          <p><span className="text-surface-200">Metodología:</span> Estructura → Función → Estética</p>
          <p><span className="text-surface-200">Motor actual:</span> Heurístico (local, sin costo)</p>
        </div>
      </Card>
    </div>
  );
}
