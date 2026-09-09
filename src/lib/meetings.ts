import { Course } from '../types';
import { CalendarEvent } from '../components/master/DailyAgenda';

interface MeetingSlot {
  days: number[];
  startMin: number;
  endMin: number;
  label?: string;
}

const DAY_MAP: Record<string, number> = {
  U: 0, Su: 0, M: 1, T: 2, W: 3, R: 4, F: 5, S: 6, Sa: 6,
};

function parseDays(tok: string): number[] {
  const days: number[] = [];
  let i = 0;
  while (i < tok.length) {
    const two = tok.slice(i, i + 2);
    if (DAY_MAP[two] !== undefined) {
      days.push(DAY_MAP[two]);
      i += 2;
    } else if (DAY_MAP[tok[i]] !== undefined) {
      days.push(DAY_MAP[tok[i]]);
      i += 1;
    } else {
      i += 1;
    }
  }
  return days;
}

function parseTime(s: string): number {
  const clean = s.trim().replace(/–/g, '-');
  const [hStr, mStr] = clean.split(':');
  return parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10);
}

function parseSegment(seg: string): MeetingSlot | null {
  const s = seg.trim();
  const timeRe = /(\d{1,2}:\d{2})\s*[–\-]\s*(\d{1,2}:\d{2})/;
  const match = s.match(timeRe);
  if (!match) return null;

  const startMin = parseTime(match[1]);
  const endMin = parseTime(match[2]);
  const beforeTime = s.slice(0, match.index!).trim();

  const tokens = beforeTime.split(/\s+/);
  let dayTok = '';
  let label: string | undefined;

  for (const t of tokens) {
    if (/^[MTWRFSU][a-z]?(?:[MTWRFSU][a-z]?)*$/.test(t) && parseDays(t).length > 0) {
      dayTok = t;
    } else if (t.length > 0) {
      label = label ? `${label} ${t}` : t;
    }
  }

  if (!dayTok) return null;
  const days = parseDays(dayTok);
  if (days.length === 0) return null;

  return { days, startMin, endMin, label };
}

export function parseMeetingTimes(meetingTimes: string): MeetingSlot[] {
  return meetingTimes
    .split(',')
    .map(parseSegment)
    .filter((s): s is MeetingSlot => s !== null);
}

function toISO(date: Date, minuteOfDay: number): string {
  const d = new Date(date);
  d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
  return d.toISOString();
}

export function meetingsForDate(courses: Course[], date: Date): CalendarEvent[] {
  const dow = date.getDay();
  const events: CalendarEvent[] = [];

  for (const course of courses) {
    if (course.archived || !course.meetingTimes) continue;
    const slots = parseMeetingTimes(course.meetingTimes);
    for (const slot of slots) {
      if (!slot.days.includes(dow)) continue;
      const title = slot.label
        ? `${course.code} ${slot.label}`
        : course.code;
      events.push({
        title,
        startTime: toISO(date, slot.startMin),
        endTime: toISO(date, slot.endMin),
      });
    }
  }

  return events.sort(
    (a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime(),
  );
}

export function classDayBounds(courses: Course[], date: Date): { earliest: number; latest: number } | null {
  const meetings = meetingsForDate(courses, date);
  if (meetings.length === 0) return null;
  const mins = meetings.map(e => {
    const s = new Date(e.startTime!);
    const eEnd = new Date(e.endTime!);
    return { start: s.getHours() * 60 + s.getMinutes(), end: eEnd.getHours() * 60 + eEnd.getMinutes() };
  });
  return {
    earliest: Math.min(...mins.map(m => m.start)),
    latest: Math.max(...mins.map(m => m.end)),
  };
}
