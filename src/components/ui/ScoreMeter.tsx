interface ScoreMeterProps {
  label: string;
  value: number;
  max?: number;
  inverted?: boolean;
}

function getColor(value: number, inverted: boolean): string {
  const effective = inverted ? 10 - value : value;
  if (effective >= 7) return 'bg-emerald-500';
  if (effective >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

export function ScoreMeter({ label, value, max = 10, inverted = false }: ScoreMeterProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-surface-300">{label}</span>
        <span className="text-surface-100 font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(value, inverted)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
