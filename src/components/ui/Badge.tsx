interface BadgeProps {
  label: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-primary-900/50 text-primary-300 border-primary-700',
  green: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  yellow: 'bg-amber-900/50 text-amber-300 border-amber-700',
  red: 'bg-red-900/50 text-red-300 border-red-700',
  gray: 'bg-surface-800 text-surface-300 border-surface-600',
};

export function Badge({ label, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      border ${colorClasses[color]} ${className}
    `}>
      {label}
    </span>
  );
}
