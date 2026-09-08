import { useState, useMemo } from 'react';
import { Assignment, Course, Settings } from '../../types';
import { effectiveStatus } from '../../lib/status';
import { CalendarEvent } from '../master/DailyAgenda';
import { buildScheduleForDate, getDayBounds, fmtTime, TimeBlock } from '../../lib/schedule';

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function blockBg(block: TimeBlock): string {
  if (block.kind === 'event') return 'bg-blue-500/10 dark:bg-blue-500/15';
  if (block.kind === 'work') return 'bg-emerald-500/10 dark:bg-emerald-500/15';
  if (block.kind === 'meal') return 'bg-amber-500/10 dark:bg-amber-500/15';
  return '';
}

function blockTextColor(block: TimeBlock): string {
  if (block.kind === 'event') return 'text-blue-700 dark:text-blue-300';
  if (block.kind === 'work') return 'text-emerald-700 dark:text-emerald-300';
  if (block.kind === 'meal') return 'text-amber-600 dark:text-amber-400';
  return '';
}

export default function CalendarTab({
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
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const dueDates = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of assignments) {
      if (a.dismissed) continue;
      const d = new Date(a.dueAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const course = courseMap.get(a.courseId);
      const colors = map.get(key) ?? [];
      colors.push(course?.color ?? '#6b7280');
      map.set(key, colors);
    }
    return map;
  }, [assignments, courses]);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ date: new Date(year, month + 1, d), inMonth: false });
      }
    }
    return days;
  }, [viewMonth]);

  const selectedEvents = useMemo(() => {
    if (isSameDay(selectedDate, today)) return events;
    return [];
  }, [selectedDate, events]);

  const selectedSchedule = useMemo(() => {
    return buildScheduleForDate(selectedDate, selectedEvents, assignments, courses, settings);
  }, [selectedDate, selectedEvents, assignments, courses, settings]);

  const selectedAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        if (effectiveStatus(a, today) === 'done' && !isSameDay(new Date(a.dueAt), selectedDate)) return false;
        return isSameDay(new Date(a.dueAt), selectedDate);
      })
      .map((a) => ({
        ...a,
        courseName: courseMap.get(a.courseId)?.code ?? '',
        courseColor: courseMap.get(a.courseId)?.color ?? '#6b7280',
      }))
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [selectedDate, assignments, courses]);

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const selectedLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const isToday = isSameDay(selectedDate, today);
  const { start: dayStartMin, end: dayEndMin } = getDayBounds(selectedDate);

  return (
    <div className="space-y-3 p-3">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <button onClick={prevMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 px-2 pt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-2 pb-2">
          {calendarDays.map(({ date, inMonth }, i) => {
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const dots = dueDates.get(key) ?? [];
            const isSelected = isSameDay(date, selectedDate);
            const isTodayCell = isSameDay(date, today);

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(date);
                  if (!isSameMonth(date, viewMonth)) {
                    setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                className={`relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : isTodayCell
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : inMonth
                        ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                {date.getDate()}
                {dots.length > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {dots.slice(0, 3).map((color, j) => (
                      <div
                        key={j}
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: isSelected ? 'white' : color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {selectedLabel}
            {isToday && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                TODAY
              </span>
            )}
            <span className="ml-1.5 text-[10px] font-normal text-gray-400 dark:text-gray-500">
              {fmtTime(dayStartMin)} – {fmtTime(dayEndMin)}
            </span>
          </h3>
        </div>

        {selectedAssignments.length > 0 && (
          <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Due</p>
            {selectedAssignments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.courseColor }} />
                <span className="text-xs text-gray-700 dark:text-gray-300">{a.title}</span>
                <span className="ml-auto text-[10px] text-gray-400">{a.courseName}</span>
              </div>
            ))}
          </div>
        )}

        {selectedSchedule.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No scheduled work for this day
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {selectedSchedule.map((block, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2 ${blockBg(block)}`}>
                <div className="w-16 flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                  {fmtTime(block.startMin)}
                </div>
                <div className={`h-full w-0.5 self-stretch rounded ${
                  block.kind === 'event' ? 'bg-blue-400' : block.kind === 'work' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {block.courseColor && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: block.courseColor }} />
                    )}
                    {block.color && !block.courseColor && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: block.color }} />
                    )}
                    <p className={`text-xs font-medium truncate ${blockTextColor(block)}`}>
                      {block.title}
                    </p>
                  </div>
                  {block.subtitle && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {fmtTime(block.startMin)} – {fmtTime(block.endMin)} · {block.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
