export function daysUntil(dueAt: string, now: Date = new Date()): number {
  return (new Date(dueAt).getTime() - now.getTime()) / 86_400_000;
}

export function formatCountdown(dueAt: string, now: Date = new Date()): string {
  const days = daysUntil(dueAt, now);

  if (days < -1) return `${Math.abs(Math.floor(days))}d overdue`;
  if (days < 0) return 'overdue';
  if (days < 1 / 24) return 'due now';

  const hours = days * 24;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (days < 7) return `${Math.round(days)}d`;

  const weeks = Math.floor(days / 7);
  const remDays = Math.round(days - weeks * 7);
  if (remDays === 0) return `${weeks}w`;
  return `${weeks}w ${remDays}d`;
}

export function weekBucket(dueAt: string, now: Date = new Date()): string {
  const days = daysUntil(dueAt, now);
  if (days < 0) return 'Overdue';
  if (days <= 7) return 'This Week';
  if (days <= 14) return 'Next Week';
  const weeksOut = Math.ceil(days / 7);
  return `In ${weeksOut} weeks`;
}
