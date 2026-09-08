import { useState, useEffect, useCallback } from 'react';
import { useStore, useDispatch } from '../../state/store';
import { useDarkMode } from '../../lib/useDarkMode';
import { CalendarEvent } from '../master/DailyAgenda';
import TabBar, { TabId } from './TabBar';
import MasterList from '../master/MasterList';
import CalendarTab from '../calendar/CalendarTab';
import ScheduleTab from '../schedule/ScheduleTab';
import SetupTab from '../setup/SetupTab';
import CourseTab from '../course/CourseTab';

const CAL_KEY = 'class-command-calendar';

function loadCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(CAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function Shell() {
  const state = useStore();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TabId>('master');
  const [dark, toggleDark] = useDarkMode();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(loadCalendarEvents);

  const hasCourses = state.courses.length > 0;

  const syncCalendar = useCallback((events: CalendarEvent[]) => {
    setCalendarEvents(events);
    localStorage.setItem(CAL_KEY, JSON.stringify(events));
    return `Loaded ${events.length} calendar events`;
  }, []);

  useEffect(() => {
    (window as any).__classCommand = {
      syncGrades(scores: { id: string; pointsEarned: number; status?: string }[]) {
        dispatch({ type: 'BATCH_SCORES', scores: scores as any });
        return `Synced ${scores.length} scores`;
      },
      syncCalendar,
      getAssignmentIds() {
        return state.assignments.map((a) => ({ id: a.id, title: a.title, courseId: a.courseId }));
      },
    };
  }, [dispatch, state.assignments, syncCalendar]);

  const renderTab = () => {
    if (activeTab === 'master') {
      return (
        <MasterList
          assignments={state.assignments}
          courses={state.courses}
          settings={state.settings}
          onStatusChange={(id, status) => dispatch({ type: 'SET_STATUS', id, status })}
          onScoreChange={(id, pointsEarned) => dispatch({ type: 'SET_SCORE', id, pointsEarned })}
        />
      );
    }
    if (activeTab === 'calendar') {
      return (
        <CalendarTab
          events={calendarEvents}
          assignments={state.assignments}
          courses={state.courses}
          settings={state.settings}
        />
      );
    }
    if (activeTab === 'schedule') {
      return (
        <ScheduleTab
          events={calendarEvents}
          assignments={state.assignments}
          courses={state.courses}
          settings={state.settings}
        />
      );
    }
    if (activeTab === 'setup') {
      return <SetupTab />;
    }
    if (activeTab.startsWith('course-')) {
      const courseId = activeTab.slice(7);
      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return null;
      return <CourseTab course={course} />;
    }
    return null;
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Class Command</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">What should I work on right now?</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {!hasCourses && (
              <button
                onClick={() => dispatch({ type: 'LOAD_SEED' })}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 active:bg-indigo-800"
              >
                Load Demo Data
              </button>
            )}
          </div>
        </div>
      </header>

      <TabBar courses={state.courses} activeTab={activeTab} onTabChange={setActiveTab} />

      <main>{renderTab()}</main>
    </div>
  );
}
