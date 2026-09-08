import { Assignment, Course, Settings, AssignmentType } from '../types';

export const EFFORT_DEFAULTS: Record<AssignmentType, number> = {
  exam: 6,
  project: 8,
  lab: 4,
  essay: 5,
  problemSet: 2,
  quiz: 1,
  reading: 1,
  discussion: 0.5,
  other: 2,
};

export function effortHours(
  a: Assignment,
  course: Course,
  settings: Settings,
): number {
  return a.effortOverride ?? settings.effortDefaults[a.type] * course.effortMultiplier;
}
