export interface CalendarEvent {
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  allDay?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function eventColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('due')) return 'text-red-500 dark:text-red-400';
  if (t.includes('lec') || t.includes('rec')) return 'text-blue-500 dark:text-blue-400';
  return 'text-purple-500 dark:text-purple-400';
}

function eventDot(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('due')) return 'bg-red-500';
  if (t.includes('lec') || t.includes('rec')) return 'bg-blue-500';
  return 'bg-purple-500';
}

export default function DailyAgenda({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) return null;

  const now = new Date();
  const label = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2">
            <div className="mt-1.5 flex flex-col items-center">
              <div className={`h-2 w-2 rounded-full ${eventDot(ev.title)}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${eventColor(ev.title)}`}>
                {ev.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {ev.allDay
                  ? 'All day'
                  : ev.startTime && ev.endTime
                    ? `${formatTime(ev.startTime)} – ${formatTime(ev.endTime)}`
                    : ev.startTime
                      ? formatTime(ev.startTime)
                      : ''}
                {ev.location && ` · ${ev.location}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
