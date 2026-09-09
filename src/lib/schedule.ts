import { Course, Settings } from '../types';
import { CalendarEvent } from '../components/master/DailyAgenda';
import { scoreAndSort, ScoredAssignment } from './scoring';
import { classDayBounds } from './meetings';

const WEEKDAY_START = 9;
const WEEKDAY_END = 21;
const WEEKEND_START = 11;
const WEEKEND_END = 17;

const LUNCH = { start: 12 * 60, end: 12 * 60 + 45, label: 'Lunch' };
const DINNER = { start: 18 * 60, end: 18 * 60 + 45, label: 'Dinner' };

const BREAK_MIN = 10;
const MAX_WORK_BLOCK_MIN = 60;

export interface TimeBlock {
  kind: 'event' | 'work' | 'free' | 'meal';
  startMin: number;
  endMin: number;
  title?: string;
  subtitle?: string;
  color?: string;
  courseColor?: string;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function getDayBounds(d: Date, courses?: Course[]): { start: number; end: number } {
  const weekend = isWeekend(d);
  let start = (weekend ? WEEKEND_START : WEEKDAY_START) * 60;
  let end = (weekend ? WEEKEND_END : WEEKDAY_END) * 60;

  if (courses) {
    const cb = classDayBounds(courses, d);
    if (cb) {
      const pad = 30;
      start = Math.min(start, Math.floor((cb.earliest - pad) / 60) * 60);
      end = Math.max(end, Math.ceil((cb.latest + pad) / 60) * 60);
    }
  }
  return { start, end };
}

export function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function parseMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function eventBlockColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('due')) return '#ef4444';
  if (t.includes('lec') || t.includes('rec')) return '#3b82f6';
  return '#8b5cf6';
}

interface TaskBudget {
  sa: ScoredAssignment;
  dailyBudgetMin: number;
  usedMin: number;
  course: Course | undefined;
}

export function buildDaySchedule(
  events: CalendarEvent[],
  scored: ScoredAssignment[],
  courses: Course[],
  targetDate: Date,
): TimeBlock[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const { start: dayStartMin, end: dayEndMin } = getDayBounds(targetDate, courses);

  const eventBlocks: TimeBlock[] = [];
  for (const ev of events) {
    if (ev.allDay) continue;
    if (!ev.startTime || !ev.endTime) continue;
    const s = Math.max(parseMinutes(ev.startTime), dayStartMin);
    const e = Math.min(parseMinutes(ev.endTime), dayEndMin);
    if (s >= e) continue;
    eventBlocks.push({
      kind: 'event',
      startMin: s,
      endMin: e,
      title: ev.title,
      subtitle: ev.location,
      color: eventBlockColor(ev.title),
    });
  }

  const overlapsEvent = (start: number, end: number) =>
    eventBlocks.some((eb) => eb.startMin <= start && eb.endMin >= end);

  const mealBlocks: TimeBlock[] = [];
  if (LUNCH.start >= dayStartMin && LUNCH.start < dayEndMin && !overlapsEvent(LUNCH.start, LUNCH.end)) {
    mealBlocks.push({ kind: 'meal', startMin: Math.max(LUNCH.start, dayStartMin), endMin: Math.min(LUNCH.end, dayEndMin), title: LUNCH.label });
  }
  if (!isWeekend(targetDate) && DINNER.start >= dayStartMin && DINNER.start < dayEndMin && !overlapsEvent(DINNER.start, DINNER.end)) {
    mealBlocks.push({ kind: 'meal', startMin: Math.max(DINNER.start, dayStartMin), endMin: Math.min(DINNER.end, dayEndMin), title: DINNER.label });
  }

  const fixedBlocks = [...eventBlocks, ...mealBlocks].sort((a, b) => a.startMin - b.startMin);

  const occupied: { start: number; end: number }[] = [];
  for (const fb of fixedBlocks) {
    const last = occupied[occupied.length - 1];
    if (last && fb.startMin < last.end) {
      last.end = Math.max(last.end, fb.endMin);
    } else {
      occupied.push({ start: fb.startMin, end: fb.endMin });
    }
  }

  const gaps: { start: number; end: number }[] = [];
  let cursor = dayStartMin;
  for (const occ of occupied) {
    if (cursor < occ.start) gaps.push({ start: cursor, end: occ.start });
    cursor = Math.max(cursor, occ.end);
  }
  if (cursor < dayEndMin) gaps.push({ start: cursor, end: dayEndMin });

  const budgets: TaskBudget[] = scored.map((sa) => {
    const daysLeft = Math.max(sa.daysUntilDue, 0.5);
    const totalEffortMin = Math.round(sa.effort * 60);
    const evenDaily = totalEffortMin / daysLeft;
    const type = sa.assignment.type;
    let dailyBudgetMin: number;
    if (type === 'exam' || type === 'quiz') {
      const studyWindow = type === 'exam' ? 21 : 7;
      const progress = Math.min(Math.max((studyWindow - daysLeft) / studyWindow, 0), 1);
      dailyBudgetMin = Math.round(evenDaily * (0.15 + 1.85 * progress * progress));
    } else {
      dailyBudgetMin = Math.round(evenDaily);
    }
    dailyBudgetMin = Math.max(Math.min(dailyBudgetMin, MAX_WORK_BLOCK_MIN), 0);
    return { sa, dailyBudgetMin, usedMin: 0, course: courseMap.get(sa.assignment.courseId) };
  });

  const workBlocks: TimeBlock[] = [];
  for (const gap of gaps) {
    let gapCursor = gap.start;
    let roundIdx = 0;
    let stuckCount = 0;
    while (gapCursor < gap.end && stuckCount < budgets.length) {
      const remaining = gap.end - gapCursor;
      if (remaining < 20) break;
      const tb = budgets[roundIdx % budgets.length];
      roundIdx++;
      const budgetLeft = tb.dailyBudgetMin - tb.usedMin;
      if (budgetLeft <= 0) { stuckCount++; continue; }
      const blockMin = Math.min(budgetLeft, MAX_WORK_BLOCK_MIN, remaining);
      if (blockMin < 15) { stuckCount++; continue; }
      stuckCount = 0;
      const effortLeft = Math.round(tb.sa.effort * 60) - tb.usedMin;
      const actualBlock = Math.min(blockMin, effortLeft);
      if (actualBlock < 15) { tb.usedMin = tb.dailyBudgetMin; continue; }
      workBlocks.push({
        kind: 'work', startMin: gapCursor, endMin: gapCursor + actualBlock,
        title: tb.sa.assignment.title,
        subtitle: `${tb.course?.code ?? ''} · ${tb.sa.impactPct.toFixed(1)}% of grade · ~${Math.round(tb.sa.effort * 10) / 10}h total`,
        courseColor: tb.course?.color ?? '#6b7280',
      });
      tb.usedMin += actualBlock;
      gapCursor += actualBlock;
      if (gapCursor < gap.end && gap.end - gapCursor >= BREAK_MIN + 15) gapCursor += BREAK_MIN;
    }
  }

  return [...fixedBlocks, ...workBlocks].sort((a, b) => a.startMin - b.startMin);
}

export function buildScheduleForDate(
  targetDate: Date,
  events: CalendarEvent[],
  assignments: import('../types').Assignment[],
  courses: Course[],
  settings: Settings,
): TimeBlock[] {
  const scored = scoreAndSort(assignments, courses, settings, targetDate);
  return buildDaySchedule(events, scored, courses, targetDate);
}
