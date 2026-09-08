import { useState } from 'react';
import { useStore, useDispatch } from '../../state/store';
import { Assignment, AssignmentType, Course } from '../../types';
import CourseForm from './CourseForm';
import AssignmentForm from './AssignmentForm';
import IcsImport from './IcsImport';
import { exportState, parseImport } from '../../lib/storage';

export default function SetupTab() {
  const state = useStore();
  const dispatch = useDispatch();

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const handleDeleteCourse = (id: string) => {
    const course = state.courses.find((c) => c.id === id);
    const count = state.assignments.filter((a) => a.courseId === id).length;
    if (!confirm(`Delete "${course?.name}"${count > 0 ? ` and its ${count} assignment${count > 1 ? 's' : ''}` : ''}? This cannot be undone.`)) return;
    dispatch({ type: 'DELETE_COURSE', id });
  };

  const handleDeleteAssignment = (id: string) => {
    const a = state.assignments.find((x) => x.id === id);
    if (!confirm(`Delete "${a?.title}"? This cannot be undone.`)) return;
    dispatch({ type: 'DELETE_ASSIGNMENT', id });
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = parseImport(text);
      if ('error' in result) {
        alert(result.error);
        return;
      }
      if (!confirm('Replace all current data with the imported data? This cannot be undone.')) return;
      dispatch({ type: 'IMPORT_STATE', state: result.state });
    };
    input.click();
  };

  return (
    <div className="space-y-6 p-4">
      {/* Courses */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Courses</h2>
          <button
            onClick={() => { setShowCourseForm(true); setEditingCourse(null); }}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            + Add Course
          </button>
        </div>

        {(showCourseForm || editingCourse) && (
          <div className="mb-3">
            <CourseForm
              initial={editingCourse ?? undefined}
              onSave={(course) => {
                dispatch(editingCourse ? { type: 'UPDATE_COURSE', course } : { type: 'ADD_COURSE', course });
                setShowCourseForm(false);
                setEditingCourse(null);
              }}
              onCancel={() => { setShowCourseForm(false); setEditingCourse(null); }}
            />
          </div>
        )}

        <div className="space-y-2">
          {state.courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.code}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{c.name}</span>
                <span className="text-xs text-gray-400">({c.categories.length} categories, x{c.effortMultiplier})</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingCourse(c)} className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950">
                  Edit
                </button>
                <button onClick={() => handleDeleteCourse(c.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {state.courses.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">No courses yet.</p>
          )}
        </div>
      </section>

      {/* Assignments */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assignments</h2>
          {state.courses.length > 0 && (
            <button
              onClick={() => { setShowAssignmentForm(true); setEditingAssignment(null); }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              + Add Assignment
            </button>
          )}
        </div>

        {(showAssignmentForm || editingAssignment) && (
          <div className="mb-3">
            <AssignmentForm
              courses={state.courses}
              initial={editingAssignment ?? undefined}
              onSave={(a) => {
                dispatch(editingAssignment ? { type: 'UPDATE_ASSIGNMENT', assignment: a } : { type: 'ADD_ASSIGNMENT', assignment: a });
                setShowAssignmentForm(false);
                setEditingAssignment(null);
              }}
              onCancel={() => { setShowAssignmentForm(false); setEditingAssignment(null); }}
            />
          </div>
        )}

        <div className="space-y-1">
          {state.assignments.slice(0, 20).map((a) => {
            const course = state.courses.find((c) => c.id === a.courseId);
            return (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-1.5 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{a.title}</span>
                  <span className="ml-2 text-xs text-gray-400">{course?.code} · {a.status}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingAssignment(a)} className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteAssignment(a.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {state.assignments.length > 20 && (
            <p className="text-center text-xs text-gray-400">...and {state.assignments.length - 20} more</p>
          )}
        </div>
      </section>

      {/* ICS Import */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">ICS Import</h2>
        <IcsImport />
      </section>

      {/* Settings */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Daily Study Capacity (hours)
            </label>
            <input
              type="number"
              min={0.5}
              max={16}
              step={0.5}
              value={state.settings.dailyCapacityHours}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_SETTINGS',
                  settings: { ...state.settings, dailyCapacityHours: Number(e.target.value) },
                })
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Default Effort (hours per type)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.entries(state.settings.effortDefaults) as [AssignmentType, number][]).map(([type, hours]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={hours}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_SETTINGS',
                        settings: {
                          ...state.settings,
                          effortDefaults: { ...state.settings.effortDefaults, [type]: Number(e.target.value) },
                        },
                      })
                    }
                    className="w-14 rounded border border-gray-300 px-1.5 py-1 text-xs tabular-nums dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Export / Import */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Data</h2>
        <div className="flex gap-3">
          <button
            onClick={() => exportState(state)}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Export JSON
          </button>
          <button
            onClick={handleImport}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Import JSON
          </button>
        </div>
      </section>
    </div>
  );
}
