import { useState } from 'react';
import { Assignment, Course } from '../../types';
import { useStore, useDispatch } from '../../state/store';
import { scoreAndSort } from '../../lib/scoring';
import { effectiveStatus } from '../../lib/status';
import CourseGrade from './CourseGrade';
import CategoryBreakdown from './CategoryBreakdown';
import AssignmentRow from '../master/AssignmentRow';

function CompletedRow({ a, onScoreChange }: {
  a: Assignment;
  onScoreChange: (id: string, pointsEarned: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);

  const handleScoreInput = (raw: string) => {
    setEditing(false);
    const trimmed = raw.trim();
    if (trimmed === '') {
      onScoreChange(a.id, undefined);
    } else {
      const n = Number(trimmed);
      if (!isNaN(n) && n >= 0) onScoreChange(a.id, n);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <span className="text-green-500 text-sm">●</span>
      <span className="min-w-0 flex-1 truncate text-sm text-gray-500 dark:text-gray-400">{a.title}</span>
      {a.pointsPossible != null && a.pointsPossible > 0 && (
        editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={a.pointsPossible}
              step="any"
              autoFocus
              defaultValue={a.pointsEarned ?? ''}
              onBlur={(e) => handleScoreInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="w-14 rounded border border-gray-300 px-1.5 py-0.5 text-xs tabular-nums dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <span className="text-xs text-gray-400">/ {a.pointsPossible}</span>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs tabular-nums text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {a.pointsEarned != null
              ? <span className="text-green-600 dark:text-green-400">{a.pointsEarned}/{a.pointsPossible}</span>
              : `--/${a.pointsPossible}`}
          </button>
        )
      )}
    </div>
  );
}

export default function CourseTab({ course }: { course: Course }) {
  const state = useStore();
  const dispatch = useDispatch();
  const [showCompleted, setShowCompleted] = useState(false);

  const courseAssignments = state.assignments.filter((a) => a.courseId === course.id);
  const scored = scoreAndSort(courseAssignments, [course], state.settings);
  const completed = courseAssignments
    .filter((a) => effectiveStatus(a) === 'done')
    .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime());

  return (
    <div className="space-y-3 p-3">
      <CourseGrade course={course} assignments={courseAssignments} />
      <CategoryBreakdown course={course} assignments={courseAssignments} />

      {scored.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upcoming</h3>
          </div>
          {scored.map((s) => (
            <AssignmentRow
              key={s.assignment.id}
              scored={s}
              course={course}
              onStatusChange={(id, status) => dispatch({ type: 'SET_STATUS', id, status })}
              onScoreChange={(id, pointsEarned) => dispatch({ type: 'SET_SCORE', id, pointsEarned })}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex w-full items-center justify-between px-4 py-2 text-left"
          >
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Completed ({completed.length})
            </h3>
            <span className="text-xs text-gray-400">{showCompleted ? '▲' : '▼'}</span>
          </button>
          {showCompleted && (
            <div className="border-t border-gray-100 py-1 dark:border-gray-800">
              {completed.map((a) => (
                <CompletedRow
                  key={a.id}
                  a={a}
                  onScoreChange={(id, pointsEarned) => dispatch({ type: 'SET_SCORE', id, pointsEarned })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
