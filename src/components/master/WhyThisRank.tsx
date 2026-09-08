import { ScoredAssignment } from '../../lib/scoring';

export default function WhyThisRank({ scored }: { scored: ScoredAssignment }) {
  return (
    <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>Grade impact: <span className="font-medium text-gray-900 dark:text-gray-200">{scored.impactPct.toFixed(1)}%</span></div>
        <div>Effort: <span className="font-medium text-gray-900 dark:text-gray-200">~{Math.round(scored.effort * 10) / 10}h</span></div>
        <div>Due in: <span className="font-medium text-gray-900 dark:text-gray-200">{scored.daysUntilDue < 0 ? 'overdue' : `${Math.round(scored.daysUntilDue * 10) / 10}d`}</span></div>
        <div>Usable days: <span className="font-medium text-gray-900 dark:text-gray-200">{Math.round(scored.usableDays * 10) / 10}</span></div>
      </div>
      <p className="mt-1 border-t border-gray-200 pt-1 dark:border-gray-700">{scored.reason}</p>
      {scored.unweighted && (
        <p className="text-orange-600 dark:text-orange-400">No grade category assigned — using fallback weight</p>
      )}
    </div>
  );
}
