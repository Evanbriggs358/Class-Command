import { Assignment, Course } from '../../types';
import { effectiveStatus } from '../../lib/status';

export default function CategoryBreakdown({
  course,
  assignments,
}: {
  course: Course;
  assignments: Assignment[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category Breakdown</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {course.categories.map((cat) => {
          const items = assignments.filter((a) => a.categoryId === cat.id);
          const graded = items.filter((a) => a.pointsEarned != null);
          const remaining = items.filter((a) => effectiveStatus(a) !== 'done');
          const earned = graded.reduce((s, a) => s + (a.pointsEarned ?? 0), 0);
          const possible = graded.reduce((s, a) => s + (a.pointsPossible ?? 0), 0);
          const catPct = possible > 0 ? (earned / possible) * 100 : null;

          return (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.weightPct}%</span>
                  {cat.dropLowest ? (
                    <span className="text-xs text-gray-400">(drop {cat.dropLowest})</span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {graded.length} graded · {remaining.length} remaining
                  {cat.expectedCount ? ` · ${items.length}/${cat.expectedCount} items` : ''}
                </div>
              </div>
              <div className="text-right">
                {catPct !== null ? (
                  <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {catPct.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">--</span>
                )}
                {graded.length > 0 && (
                  <div className="text-xs tabular-nums text-gray-400">
                    {earned}/{possible} pts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
