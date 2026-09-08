import { useMemo } from 'react';
import { Assignment, Course, Settings } from '../../types';
import { CalendarEvent } from '../master/DailyAgenda';
import { buildScheduleForDate, getDayBounds, fmtTime, TimeBlock } from '../../lib/schedule';

const HOUR_PX = 64;

function blockBg(block: TimeBlock): string {
  if (block.kind === 'event') return 'bg-blue-500/10 dark:bg-blue-500/15';
  if (block.kind === 'work') return 'bg-emerald-500/10 dark:bg-emerald-500/15';
  if (block.kind === 'meal') return 'bg-amber-500/10 dark:bg-amber-500/15';
  return '';
}

export default function ScheduleTab({
  events,
  assignments,
  courses,
  settings,
}: {
  events: CalendarEvent[];
  assignments: Assignment[];
  courses: Course[];
  settings: Settings;
}) {
  const now = new Date();
  const { start: dayStartMin, end: dayEndMin } = getDayBounds(now);
  const dayStartH = dayStartMin / 60;
  const dayEndH = dayEndMin / 60;

  const schedule = useMemo(() => {
    return buildScheduleForDate(now, events, assignments, courses, settings);
  }, [events, assignments, courses, settings]);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const label = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const allDayEvents = events.filter((ev) => ev.allDay);

  const hours: number[] = [];
  for (let h = dayStartH; h <= dayEndH; h++) hours.push(h);

  return (
    <div className="p-3 space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label}
            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              TODAY
            </span>
            <span className="ml-1.5 text-[10px] font-normal text-gray-400 dark:text-gray-500">
              {fmtTime(dayStartMin)} – {fmtTime(dayEndMin)}
            </span>
          </h3>
        </div>

        {allDayEvents.length > 0 && (
          <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            {allDayEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-500 dark:text-red-400">{ev.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="relative" style={{ height: (dayEndH - dayStartH) * HOUR_PX }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
              style={{ top: (h - dayStartH) * HOUR_PX }}
            >
              <span className="absolute -top-2 left-2 text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-1">
                {fmtTime(h * 60)}
              </span>
            </div>
          ))}

          {nowMin >= dayStartMin && nowMin <= dayEndMin && (
            <div
              className="absolute left-0 right-0 z-20 border-t-2 border-red-500"
              style={{ top: ((nowMin - dayStartMin) / 60) * HOUR_PX }}
            >
              <div className="absolute -top-1.5 left-1 h-3 w-3 rounded-full bg-red-500" />
            </div>
          )}

          {schedule.map((block, i) => {
            if (block.kind === 'free') return null;
            const top = ((block.startMin - dayStartMin) / 60) * HOUR_PX;
            const height = Math.max(((block.endMin - block.startMin) / 60) * HOUR_PX, 20);
            const isSmall = height < 40;

            return (
              <div
                key={i}
                className={`absolute left-12 right-3 z-10 rounded-lg border px-3 py-1.5 overflow-hidden ${blockBg(block)} ${
                  block.kind === 'event'
                    ? 'border-blue-300 dark:border-blue-700'
                    : block.kind === 'work'
                      ? 'border-emerald-300 dark:border-emerald-700'
                      : block.kind === 'meal'
                        ? 'border-amber-300 dark:border-amber-700'
                        : 'border-gray-200 dark:border-gray-700'
                }`}
                style={{ top, height }}
              >
                {block.kind === 'meal' ? (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{block.title}</p>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {block.courseColor && (
                        <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: block.courseColor }} />
                      )}
                      {block.color && !block.courseColor && (
                        <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: block.color }} />
                      )}
                      <p className={`font-medium truncate ${
                        block.kind === 'event'
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                      } ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
                        {block.title}
                      </p>
                    </div>
                    {!isSmall && block.subtitle && (
                      <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {fmtTime(block.startMin)} – {fmtTime(block.endMin)}
                        {block.subtitle && ` · ${block.subtitle}`}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
