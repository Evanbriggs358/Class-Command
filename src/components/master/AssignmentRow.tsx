import { useState } from 'react';
import { ScoredAssignment } from '../../lib/scoring';
import { Course, Status } from '../../types';
import StatusToggle from '../common/StatusToggle';
import Countdown from '../common/Countdown';
import ImpactBadge from '../common/ImpactBadge';
import WhyThisRank from './WhyThisRank';

export default function AssignmentRow({
  scored,
  course,
  onStatusChange,
  onScoreChange,
}: {
  scored: ScoredAssignment;
  course: Course;
  onStatusChange: (id: string, status: Status) => void;
  onScoreChange?: (id: string, pointsEarned: number | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const a = scored.assignment;

  const handleScoreInput = (raw: string) => {
    if (!onScoreChange) return;
    const trimmed = raw.trim();
    if (trimmed === '') {
      onScoreChange(a.id, undefined);
    } else {
      const n = Number(trimmed);
      if (!isNaN(n) && n >= 0) onScoreChange(a.id, n);
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <StatusToggle status={a.status} onChange={(s) => onStatusChange(a.id, s)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: course.color }}
            />
            <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {a.title}
            </span>
            {a.pinned && <span className="text-xs">📌</span>}
            {a.removedFromCanvas && (
              <span className="rounded bg-yellow-100 px-1 text-[10px] font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                removed from Canvas
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {course.code} · {scored.reason.split(' · ').slice(0, 2).join(' · ')}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {a.pointsEarned != null && a.pointsPossible ? (
            <span className="text-xs font-medium tabular-nums text-green-600 dark:text-green-400">
              {a.pointsEarned}/{a.pointsPossible}
            </span>
          ) : null}
          <ImpactBadge impactPct={scored.impactPct} />
          <Countdown dueAt={a.dueAt} />
        </div>
      </div>

      {expanded && (() => {
        const link = a.url || course.url;
        return (
          <div className="px-3 pb-3 space-y-2">
            <WhyThisRank scored={scored} />
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {a.url ? 'Open assignment on Canvas' : 'Open ' + course.code + ' on Canvas'}
              </a>
            )}
            {a.pointsPossible != null && a.pointsPossible > 0 && onScoreChange && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Score</label>
                <input
                  type="number"
                  min={0}
                  max={a.pointsPossible}
                  step="any"
                  placeholder="--"
                  defaultValue={a.pointsEarned ?? ''}
                  onBlur={(e) => handleScoreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm tabular-nums dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">/ {a.pointsPossible}</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
