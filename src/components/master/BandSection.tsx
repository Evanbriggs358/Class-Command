import { useState } from 'react';
import { Band, Course, Status } from '../../types';
import { ScoredAssignment } from '../../lib/scoring';
import AssignmentRow from './AssignmentRow';

const bandMeta: Record<Band, { label: string; color: string }> = {
  doNow: { label: 'Do Now', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' },
  thisWeek: { label: 'This Week', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30' },
  onDeck: { label: 'On Deck', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
  later: { label: 'Later', color: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30' },
};

export default function BandSection({
  band,
  items,
  courses,
  onStatusChange,
  onScoreChange,
}: {
  band: Band;
  items: ScoredAssignment[];
  courses: Course[];
  onStatusChange: (id: string, status: Status) => void;
  onScoreChange?: (id: string, pointsEarned: number | undefined) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = bandMeta[band];
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  if (items.length === 0) return null;

  return (
    <section className="mb-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold ${meta.color} rounded-t-lg`}
      >
        <span className="text-xs">{collapsed ? '▶' : '▼'}</span>
        {meta.label}
        <span className="ml-auto text-xs font-normal opacity-70">{items.length}</span>
      </button>

      {!collapsed && (
        <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {items.map((s) => {
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
    </section>
  );
}
