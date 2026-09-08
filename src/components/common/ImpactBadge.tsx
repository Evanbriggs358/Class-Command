export default function ImpactBadge({ impactPct }: { impactPct: number }) {
  const bg = impactPct >= 10
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    : impactPct >= 5
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium tabular-nums ${bg}`}>
      {impactPct.toFixed(1)}%
    </span>
  );
}
