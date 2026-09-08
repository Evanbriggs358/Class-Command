import { Status } from '../../types';

const icons: Record<Status, string> = {
  notStarted: '○',
  inProgress: '◐',
  done: '●',
};

const next: Record<Status, Status> = {
  notStarted: 'inProgress',
  inProgress: 'done',
  done: 'notStarted',
};

const colors: Record<Status, string> = {
  notStarted: 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
  inProgress: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
  done: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
};

export default function StatusToggle({
  status,
  onChange,
}: {
  status: Status;
  onChange: (s: Status) => void;
}) {
  return (
    <button
      onClick={() => onChange(next[status])}
      className={`text-lg leading-none select-none ${colors[status]}`}
      aria-label={`Status: ${status}. Click to change.`}
    >
      {icons[status]}
    </button>
  );
}
