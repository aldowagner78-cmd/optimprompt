import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PenLine,
  Wand2,
  History,
  Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/create', label: 'Crear Prompt', icon: <PenLine className="w-5 h-5" /> },
  { to: '/optimize', label: 'Optimizar', icon: <Wand2 className="w-5 h-5" /> },
  { to: '/history', label: 'Historial', icon: <History className="w-5 h-5" /> },
  { to: '/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 border-r border-surface-700 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-700">
        <h1 className="text-xl font-bold text-surface-50 tracking-tight">
          Optim<span className="text-primary-400">Prompt</span>
        </h1>
        <p className="text-xs text-surface-500 mt-0.5">Arquitecto de Prompts</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-primary-600/15 text-primary-300 border border-primary-700/50'
                : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }
            `}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-surface-700">
        <p className="text-xs text-surface-600">Motor: Pipeline V2 (Local)</p>
      </div>
    </aside>
  );
}
