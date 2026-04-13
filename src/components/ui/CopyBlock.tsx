import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyBlockProps {
  content: string;
  label?: string;
}

export function CopyBlock({ content, label }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div className="relative group">
      {label && <p className="text-xs text-surface-500 mb-1">{label}</p>}
      <pre className="bg-surface-800 border border-surface-700 rounded-lg p-4 text-sm text-surface-200 overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-surface-700 hover:bg-surface-600
          text-surface-400 hover:text-surface-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        title="Copiar"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
