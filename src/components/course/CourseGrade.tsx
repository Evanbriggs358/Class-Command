import { Assignment, Course } from '../../types';

export default function CourseGrade({
  course,
  assignments,
}: {
  course: Course;
  assignments: Assignment[];
}) {
  const graded = assignments.filter((a) => a.pointsEarned != null && a.pointsPossible);
  let weightedEarned = 0;
  let weightedPossible = 0;

  for (const cat of course.categories) {
    const catGraded = graded.filter((a) => a.categoryId === cat.id);
    if (catGraded.length === 0) continue;
    const earned = catGraded.reduce((s, a) => s + (a.pointsEarned ?? 0), 0);
    const possible = catGraded.reduce((s, a) => s + (a.pointsPossible ?? 0), 0);
    if (possible > 0) {
      weightedEarned += (earned / possible) * cat.weightPct;
      weightedPossible += cat.weightPct;
    }
  }

  const pct = weightedPossible > 0 ? (weightedEarned / weightedPossible) * 100 : null;
  const totalGradeAtStake = course.categories.reduce((s, c) => s + c.weightPct, 0);
  const pointsStillAvailable = totalGradeAtStake - weightedPossible;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-baseline gap-3">
        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: course.color }} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.code}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{course.name}</span>
      </div>
      {course.meetingTimes && (
        <p className="mt-1 text-xs text-gray-400">{course.meetingTimes}</p>
      )}
      <div className="mt-3 flex items-baseline gap-4">
        {pct !== null ? (
          <>
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {pct.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              current grade ({weightedPossible.toFixed(0)}% graded)
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400">No grades recorded yet</span>
        )}
      </div>
      {pointsStillAvailable > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {pointsStillAvailable.toFixed(0)}% of final grade still on the table
        </p>
      )}
    </div>
  );
}
