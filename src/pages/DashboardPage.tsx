import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { PenLine, Wand2, History, ArrowRight } from 'lucide-react';

const actions = [
  {
    title: 'Crear Prompt desde Idea',
    description: 'Describe tu idea y el sistema generará un prompt profesional, modular y escalable.',
    icon: <PenLine className="w-6 h-6" />,
    to: '/create',
    color: 'text-primary-400',
  },
  {
    title: 'Optimizar Prompt Existente',
    description: 'Pega un prompt y el sistema detectará ambigüedades, problemas de modularidad y mejorará la calidad.',
    icon: <Wand2 className="w-6 h-6" />,
    to: '/optimize',
    color: 'text-emerald-400',
  },
  {
    title: 'Ver Historial',
    description: 'Revisa y compara tus resultados anteriores.',
    icon: <History className="w-6 h-6" />,
    to: '/history',
    color: 'text-amber-400',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Optimizador de Prompts"
        description="Transforma ideas vagas en prompts profesionales para construir aplicaciones modulares, escalables e intuitivas."
      />

      {/* Methodology */}
      <Card className="mb-8 bg-gradient-to-r from-primary-950/50 to-surface-900 border-primary-800/30">
        <div className="text-center">
          <p className="text-sm font-medium text-primary-300 mb-3">Metodología: Estructura → Función → Estética</p>
          <div className="flex items-center justify-center gap-2 text-sm text-surface-400">
            <span className="px-3 py-1 bg-surface-800 rounded-lg">1. Arquitectura</span>
            <ArrowRight className="w-4 h-4" />
            <span className="px-3 py-1 bg-surface-800 rounded-lg">2. Lógica</span>
            <ArrowRight className="w-4 h-4" />
            <span className="px-3 py-1 bg-surface-800 rounded-lg">3. Diseño Visual</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-6">
        {actions.map(action => (
          <Card key={action.to} className="hover:border-surface-600 transition-all cursor-pointer group">
            <button onClick={() => navigate(action.to)} className="text-left w-full cursor-pointer">
              <div className={`mb-4 ${action.color}`}>{action.icon}</div>
              <h3 className="font-semibold text-surface-100 mb-2 group-hover:text-primary-300 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-surface-400 leading-relaxed">{action.description}</p>
            </button>
          </Card>
        ))}
      </div>

      {/* Quick info */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          { label: 'Motor', value: 'Heurístico Local' },
          { label: 'Evaluación', value: '7 métricas' },
          { label: 'Variantes', value: '3 estilos' },
          { label: 'Historial', value: 'LocalStorage' },
        ].map(item => (
          <div key={item.label} className="text-center p-4 bg-surface-900 rounded-xl border border-surface-800">
            <p className="text-xs text-surface-500 mb-1">{item.label}</p>
            <p className="text-sm font-medium text-surface-200">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
