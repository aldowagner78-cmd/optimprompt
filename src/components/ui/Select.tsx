import type { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-300">{label}</label>
      )}
      <select
        className={`
          w-full bg-surface-800 border border-surface-600 rounded-lg px-4 py-2.5
          text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50
          focus:border-primary-500 transition-colors cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
