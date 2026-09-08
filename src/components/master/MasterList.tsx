import { useState } from 'react';
import { Band, Assignment, Course, Settings, Status } from '../../types';
import { scoreAndSort, groupByBand, ScoredAssignment, scoreAssignment } from '../../lib/scoring';
import BandSection from './BandSection';
import EmptyState from '../common/EmptyState';

const BAND_ORDER: Band[] = ['doNow', 'thisWeek', 'onDeck', 'later'];

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

  let filtered = assignments;

  if (courseFilter !== 'all') {
    filtered = filtered.filter((a) => a.courseId === courseFilter);
  }

  let scored: ScoredAssignment[];
  if (hideCompleted) {
    scored = scoreAndSort(filtered, courses, settings);
  } else {
    const courseMap = new Map(courses.map((c) => [c.id, c]));
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
        {BAND_ORDER.map((band) => (
          <BandSection
            key={band}
            band={band}
            items={bands[band]}
            courses={courses}
            onStatusChange={onStatusChange}
            onScoreChange={onScoreChange}
          />
        ))}
      </div>
    </div>
  );
}
