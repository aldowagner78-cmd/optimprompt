import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export function TextArea({ label, helperText, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-300">{label}</label>
      )}
      <textarea
        className={`
          w-full bg-surface-800 border border-surface-600 rounded-lg px-4 py-3
          text-surface-100 placeholder:text-surface-500
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          resize-y min-h-[120px] transition-colors
          ${className}
        `}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-surface-500">{helperText}</p>
      )}
    </div>
  );
}
