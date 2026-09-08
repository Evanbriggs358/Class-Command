import ICAL from 'ical.js';
import { Assignment, AssignmentType, Course } from '../types';

export interface ParsedEvent {
  uid: string;
  title: string;
  courseCode: string | null;
  cleanTitle: string;
  dueAt: string;
  guessedType: AssignmentType;
  matchedCourseId: string | null;
}

export interface IcsImportResult {
  matched: ParsedEvent[];
  unmatched: ParsedEvent[];
}

const BRACKET_RE = /\s*\[([^\]]+)\]\s*$/;

function extractCourseCode(summary: string): { cleanTitle: string; courseCode: string | null } {
  const match = summary.match(BRACKET_RE);
  if (match) {
    return { cleanTitle: summary.replace(BRACKET_RE, '').trim(), courseCode: match[1].trim() };
  }
  return { cleanTitle: summary.trim(), courseCode: null };
}

function guessType(title: string): AssignmentType {
  const lower = title.toLowerCase();
  if (/\b(final\s*exam|midterm|exam)\b/.test(lower)) return 'exam';
  if (/\bquiz\b/.test(lower)) return 'quiz';
  if (/\blab\b/.test(lower)) return 'lab';
  if (/\b(essay|paper)\b/.test(lower)) return 'essay';
  if (/\bproject\b/.test(lower)) return 'project';
  if (/\b(hw|homework|problem\s*set|pset)\b/.test(lower)) return 'problemSet';
  if (/\bread(ing)?\b/.test(lower)) return 'reading';
  if (/\b(discussion|post)\b/.test(lower)) return 'discussion';
  return 'other';
}

function matchCourse(courseCode: string | null, courses: Course[]): string | null {
  if (!courseCode) return null;
  const norm = courseCode.replace(/\s+/g, '').toLowerCase();

  for (const c of courses) {
    if (c.code.replace(/\s+/g, '').toLowerCase() === norm) return c.id;
  }

  for (const c of courses) {
    const codeNorm = c.code.replace(/\s+/g, '').toLowerCase();
    if (norm.includes(codeNorm) || codeNorm.includes(norm)) return c.id;
  }

  for (const c of courses) {
    const nameWords = c.name.toLowerCase().split(/\s+/);
    const codeWords = courseCode.toLowerCase().split(/\s+/);
    const overlap = codeWords.filter((w) => nameWords.includes(w));
    if (overlap.length >= 2) return c.id;
  }

  return null;
}

export function parseIcs(icsText: string, courses: Course[]): IcsImportResult {
  const jcal = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents('vevent');

  const matched: ParsedEvent[] = [];
  const unmatched: ParsedEvent[] = [];

  for (const vevent of events) {
    const event = new ICAL.Event(vevent);
    const summary = event.summary || '';
    const uid = vevent.getFirstPropertyValue('uid')?.toString() || `uid-${Date.now()}-${Math.random()}`;
    const dtstart = event.startDate;

    if (!dtstart) continue;

    const { cleanTitle, courseCode } = extractCourseCode(summary);
    const matchedCourseId = matchCourse(courseCode, courses);
    const guessedType = guessType(cleanTitle);
    const dueAt = dtstart.toJSDate().toISOString();

    const parsed: ParsedEvent = {
      uid,
      title: cleanTitle,
      courseCode,
      cleanTitle,
      dueAt,
      guessedType,
      matchedCourseId,
    };

    if (matchedCourseId) {
      matched.push(parsed);
    } else {
      unmatched.push(parsed);
    }
  }

  return { matched, unmatched };
}

export function mergeImportedAssignments(
  parsed: ParsedEvent[],
  existing: Assignment[],
): Assignment[] {
  const result = [...existing];
  const uidMap = new Map<string, number>();
  for (let i = 0; i < result.length; i++) {
    if (result[i].sourceUid) {
      uidMap.set(result[i].sourceUid!, i);
    }
  }

  const importedUids = new Set(parsed.filter((p) => p.matchedCourseId).map((p) => p.uid));

  for (const p of parsed) {
    if (!p.matchedCourseId) continue;

    const existingIdx = uidMap.get(p.uid);
    if (existingIdx !== undefined) {
      const old = result[existingIdx];
      result[existingIdx] = {
        ...old,
        title: p.cleanTitle,
        dueAt: p.dueAt,
        removedFromCanvas: false,
      };
    } else {
      result.push({
        id: `ics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        courseId: p.matchedCourseId,
        title: p.cleanTitle,
        type: p.guessedType,
        dueAt: p.dueAt,
        status: 'notStarted',
        source: 'ics',
        sourceUid: p.uid,
      });
    }
  }

  for (let i = 0; i < result.length; i++) {
    const a = result[i];
    if (a.source === 'ics' && a.sourceUid && !importedUids.has(a.sourceUid)) {
      result[i] = { ...a, removedFromCanvas: true };
    }
  }

  return result;
}
