import { Course } from '../../types';

export type TabId = 'master' | 'calendar' | 'schedule' | 'setup' | `course-${string}`;

export default function TabBar({
  courses,
  activeTab,
  onTabChange,
}: {
  courses: Course[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 dark:border-gray-700 dark:bg-gray-950">
      <TabButton active={activeTab === 'master'} onClick={() => onTabChange('master')}>
        Tasks
      </TabButton>
      <TabButton active={activeTab === 'calendar'} onClick={() => onTabChange('calendar')}>
        Calendar
      </TabButton>
      <TabButton active={activeTab === 'schedule'} onClick={() => onTabChange('schedule')}>
        Schedule
      </TabButton>
      {courses
        .filter((c) => !c.archived)
        .map((c) => (
          <TabButton
            key={c.id}
            active={activeTab === `course-${c.id}`}
            onClick={() => onTabChange(`course-${c.id}`)}
          >
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.code}
          </TabButton>
        ))}
      <TabButton active={activeTab === 'setup'} onClick={() => onTabChange('setup')}>
        Setup
      </TabButton>
    </nav>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-colors ${
        active
          ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
