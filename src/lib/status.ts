import { Assignment, Status } from '../types';

export function effectiveStatus(a: Assignment, now: Date = new Date()): Status {
  if (a.status === 'done') return 'done';
  if (new Date(a.dueAt) < now) return 'done';
  return a.status;
}
