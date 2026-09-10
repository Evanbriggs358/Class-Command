import { useState, useMemo } from 'react';
import { Band, Assignment, Course, Settings, Status } from '../../types';
import { scoreAndSort, groupByBand, ScoredAssignment, scoreAssignment } from '../../lib/scoring';
import BandSection from './BandSection';
import AssignmentRow from './AssignmentRow';
import EmptyState from '../common/EmptyState';

type SortMode = 'optimal' | 'dueDate' | 'impact' | 'course';

const SORT_LABELS: Record<SortMode, string> = {
  optimal: 'Optimal',
  dueDate: 'Due date',
  impact: 'Grade impact',
  course: 'By course',
};

const BAND_ORDER: Band[] = ['doNow', 'thisWeek', 'onDeck', 'later'];

function sortScored(scored: ScoredAssignment[], mode: SortMode): ScoredAssignment[] {
  const copy = [...scored];
  switch (mode) {
    case 'dueDate':
      return copy.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    case 'impact':
      return copy.sort((a, b) => b.impactPct - a.impactPct);
    case 'course':
      return copy.sort((a, b) =>
        a.assignment.courseId.localeCompare(b.assignment.courseId) ||
        a.daysUntilDue - b.daysUntilDue,
      );
    default:
      return copy;
  }
}

export default function MasterList({
  assignments,
  courses,
  settings,
  onStatusChange,
  onScoreChange,
}: {
  assignments: Assignment[];
  courses: Course[];
  settings: Settings;
  onStatusChange: (id: string, status: Status) => void;
  onScoreChange: (id: string, pointsEarned: number | undefined) => void;
}) {
  const [hideCompleted, setHideCompleted] = useState(true);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [next7Days, setNext7Days] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('optimal');

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  let filtered = assignments;

  if (courseFilter !== 'all') {
    filtered = filtered.filter((a) => a.courseId === courseFilter);
  }

  let scored: ScoredAssignment[];
  if (hideCompleted) {
    scored = scoreAndSort(filtered, courses, settings);
  } else {
    scored = filtered
      .filter((a) => !a.dismissed)
      .map((a) => {
        const course = courseMap.get(a.courseId);
        if (!course) return null;
        return scoreAssignment(a, course, filtered, settings);
      })
      .filter((s): s is ScoredAssignment => s !== null)
      .sort((a, b) => b.score - a.score);
  }

  if (next7Days) {
    scored = scored.filter((s) => s.daysUntilDue <= 7);
  }

  const bands = groupByBand(scored);
  const sorted = sortMode !== 'optimal' ? sortScored(scored, sortMode) : scored;

  const courseGroups = useMemo(() => {
    if (sortMode !== 'course') return null;
    const groups: { course: Course; items: ScoredAssignment[] }[] = [];
    const map = new Map<string, ScoredAssignment[]>();
    for (const s of sorted) {
      const list = map.get(s.assignment.courseId);
      if (list) list.push(s);
      else map.set(s.assignment.courseId, [s]);
    }
    for (const [id, items] of map) {
      const course = courseMap.get(id);
      if (course) groups.push({ course, items });
    }
    return groups;
  }, [sortMode, sorted, courseMap]);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Hide completed
        </label>

        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={next7Days}
            onChange={(e) => setNext7Days(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Next 7 days
        </label>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="ml-auto rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="all">All courses</option>
          {courses.filter((c) => !c.archived).map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1 p-2">
        {scored.length === 0 && <EmptyState message="No upcoming assignments. Add courses in Setup to get started." />}

        {sortMode === 'optimal' &&
          BAND_ORDER.map((band) => (
            <BandSection
              key={band}
              band={band}
              items={bands[band]}
              courses={courses}
              onStatusChange={onStatusChange}
              onScoreChange={onScoreChange}
            />
          ))}

        {sortMode === 'course' &&
          courseGroups?.map(({ course, items }) => (
            <section key={course.id} className="mb-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30 rounded-t-lg">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: course.color }} />
                {course.code}
                <span className="ml-auto text-xs font-normal opacity-70">{items.length}</span>
              </div>
              <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                {items.map((s) => (
                  <AssignmentRow
                    key={s.assignment.id}
                    scored={s}
                    course={course}
                    onStatusChange={onStatusChange}
                    onScoreChange={onScoreChange}
                  />
                ))}
              </div>
            </section>
          ))}

        {(sortMode === 'dueDate' || sortMode === 'impact') && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {sorted.map((s) => {
              const course = courseMap.get(s.assignment.courseId);
              if (!course) return null;
              return (
                <AssignmentRow
                  key={s.assignment.id}
                  scored={s}
                  course={course}
                  onStatusChange={onStatusChange}
                  onScoreChange={onScoreChange}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
