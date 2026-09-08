import { Assignment, Band, Course, Settings } from '../types';
import { effortHours } from './effort';
import { daysUntil } from './dates';
import { effectiveStatus } from './status';

const FALLBACK_IMPACT = 1.0;

export interface ScoredAssignment {
  assignment: Assignment;
  impactPct: number;
  effort: number;
  daysUntilDue: number;
  workDaysNeeded: number;
  usableDays: number;
  score: number;
  band: Band;
  reason: string;
  unweighted: boolean;
}

export function gradeImpact(
  a: Assignment,
  course: Course,
  allAssignments: Assignment[],
): { impactPct: number; unweighted: boolean } {
  const category = course.categories.find((c) => c.id === a.categoryId);
  if (!category) return { impactPct: FALLBACK_IMPACT, unweighted: true };

  const siblings = allAssignments.filter(
    (s) => s.courseId === a.courseId && s.categoryId === a.categoryId,
  );
  const knownTotal = siblings.reduce((sum, s) => sum + (s.pointsPossible ?? 0), 0);

  const denom =
    category.expectedCount && category.expectedCount > siblings.length
      ? (knownTotal / siblings.length) * category.expectedCount
      : knownTotal;

  if (denom <= 0) {
    return {
      impactPct: category.weightPct / Math.max(category.expectedCount ?? 1, 1),
      unweighted: false,
    };
  }

  let impactPct = ((a.pointsPossible ?? 0) / denom) * category.weightPct;

  if (category.dropLowest && category.dropLowest > 0 && category.expectedCount) {
    impactPct *= 1 - category.dropLowest / category.expectedCount;
  }

  return { impactPct, unweighted: false };
}

export function scoreAssignment(
  a: Assignment,
  course: Course,
  allAssignments: Assignment[],
  settings: Settings,
  now: Date = new Date(),
): ScoredAssignment {
  const { impactPct, unweighted } = gradeImpact(a, course, allAssignments);
  const effort = effortHours(a, course, settings);
  const daysUntilDue = daysUntil(a.dueAt, now);
  const workDaysNeeded = effort / settings.dailyCapacityHours;
  const usableDays = daysUntilDue - workDaysNeeded;

  const denom = Math.max(usableDays, 0.25);
  let score = a.pinned ? Infinity : impactPct / denom;

  const band = assignBand(a, daysUntilDue, usableDays);
  const reason = buildReason(a, course, impactPct, effort, usableDays, daysUntilDue);

  return {
    assignment: a,
    impactPct,
    effort,
    daysUntilDue,
    workDaysNeeded,
    usableDays,
    score,
    band,
    reason,
    unweighted,
  };
}

function assignBand(_a: Assignment, daysUntilDue: number, usableDays: number): Band {
  if (daysUntilDue < 0) return 'doNow';
  if (usableDays <= 0) return 'doNow';
  if (daysUntilDue <= 2) return 'doNow';
  if (daysUntilDue <= 7) return 'thisWeek';
  if (daysUntilDue <= 21) return 'onDeck';
  return 'later';
}

function buildReason(
  _a: Assignment,
  course: Course,
  impactPct: number,
  effort: number,
  usableDays: number,
  daysUntilDue: number,
): string {
  const parts: string[] = [];

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(Math.floor(daysUntilDue));
    parts.push(`OVERDUE by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`);
  }

  if (usableDays <= 0 && daysUntilDue >= 0) {
    parts.push(`You're already behind — ~${Math.round(effort * 10) / 10}h of work, ${Math.max(0, Math.round(daysUntilDue * 10) / 10)} days left`);
  }

  parts.push(`Worth ${impactPct.toFixed(1)}% of your ${course.code} grade`);
  parts.push(`~${Math.round(effort * 10) / 10}h of work`);

  if (usableDays > 0) {
    parts.push(`${Math.round(usableDays * 10) / 10} usable days left`);
  }

  return parts.join(' · ');
}

export function scoreAndSort(
  assignments: Assignment[],
  courses: Course[],
  settings: Settings,
  now: Date = new Date(),
): ScoredAssignment[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return assignments
    .filter((a) => effectiveStatus(a, now) !== 'done' && !a.dismissed)
    .map((a) => {
      const course = courseMap.get(a.courseId);
      if (!course) return null;
      return scoreAssignment(a, course, assignments, settings, now);
    })
    .filter((s): s is ScoredAssignment => s !== null)
    .sort((a, b) => b.score - a.score);
}

export function groupByBand(scored: ScoredAssignment[]): Record<Band, ScoredAssignment[]> {
  const bands: Record<Band, ScoredAssignment[]> = {
    doNow: [],
    thisWeek: [],
    onDeck: [],
    later: [],
  };
  for (const s of scored) {
    bands[s.band].push(s);
  }
  return bands;
}
