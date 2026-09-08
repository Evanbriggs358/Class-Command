import { formatCountdown } from '../../lib/dates';

export default function Countdown({ dueAt }: { dueAt: string }) {
  const text = formatCountdown(dueAt);
  const days = (new Date(dueAt).getTime() - Date.now()) / 86_400_000;
  const color = days < 0
    ? 'text-red-600 dark:text-red-400'
    : days <= 2
      ? 'text-orange-600 dark:text-orange-400'
      : 'text-gray-500 dark:text-gray-400';
  return <span className={`text-xs font-medium tabular-nums ${color}`}>{text}</span>;
}
