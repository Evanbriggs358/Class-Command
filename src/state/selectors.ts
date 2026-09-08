import { AppState, Assignment, Band, Course } from '../types';
import { scoreAndSort, groupByBand, ScoredAssignment } from '../lib/scoring';

export function getScoredAssignments(
  state: AppState,
  opts?: { courseId?: string; hideCompleted?: boolean; next7Days?: boolean },
  now: Date = new Date(),
): ScoredAssignment[] {
  let assignments = state.assignments;

  if (opts?.courseId) {
    assignments = assignments.filter((a) => a.courseId === opts.courseId);
  }

  const scored = scoreAndSort(assignments, state.courses, state.settings, now);

  if (opts?.next7Days) {
    return scored.filter((s) => s.daysUntilDue <= 7);
  }

  return scored;
}

export function getScoredByBand(
  state: AppState,
  opts?: { courseId?: string; next7Days?: boolean },
  now?: Date,
): Record<Band, ScoredAssignment[]> {
  return groupByBand(getScoredAssignments(state, opts, now));
}

export function getCourseGrade(
  course: Course,
  assignments: Assignment[],
): { pct: number | null; gradedWeight: number; totalWeight: number } {
  let weightedEarned = 0;
  let weightedPossible = 0;

  const graded = assignments.filter((a) => a.pointsEarned != null && a.pointsPossible);

  for (const cat of course.categories) {
    const catGraded = graded.filter((a) => a.categoryId === cat.id);
    if (catGraded.length === 0) continue;
    const earned = catGraded.reduce((s, a) => s + (a.pointsEarned ?? 0), 0);
    const possible = catGraded.reduce((s, a) => s + (a.pointsPossible ?? 0), 0);
    if (possible > 0) {
      weightedEarned += (earned / possible) * cat.weightPct;
      weightedPossible += cat.weightPct;
    }
  }

  const totalWeight = course.categories.reduce((s, c) => s + c.weightPct, 0);

  return {
    pct: weightedPossible > 0 ? (weightedEarned / weightedPossible) * 100 : null,
    gradedWeight: weightedPossible,
    totalWeight,
  };
}

export function getAssignmentsNeedingWeights(state: AppState): Assignment[] {
  return state.assignments.filter(
    (a) => a.source === 'ics' && (!a.categoryId || a.pointsPossible == null),
  );
}
