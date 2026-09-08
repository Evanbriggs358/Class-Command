import { useState } from 'react';
import { Assignment, AssignmentType, Course, Status } from '../../types';

const TYPES: { value: AssignmentType; label: string }[] = [
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'lab', label: 'Lab' },
  { value: 'essay', label: 'Essay' },
  { value: 'problemSet', label: 'Problem Set' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'reading', label: 'Reading' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'other', label: 'Other' },
];

export default function AssignmentForm({
  courses,
  initial,
  onSave,
  onCancel,
}: {
  courses: Course[];
  initial?: Assignment;
  onSave: (a: Assignment) => void;
  onCancel: () => void;
}) {
  const [courseId, setCourseId] = useState(initial?.courseId ?? courses[0]?.id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<AssignmentType>(initial?.type ?? 'other');
  const [dueAt, setDueAt] = useState(initial?.dueAt ? initial.dueAt.slice(0, 16) : '');
  const [pointsPossible, setPointsPossible] = useState<string>(initial?.pointsPossible?.toString() ?? '');
  const [pointsEarned, setPointsEarned] = useState<string>(initial?.pointsEarned?.toString() ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [status, setStatus] = useState<Status>(initial?.status ?? 'notStarted');
  const [effortOverride, setEffortOverride] = useState<string>(initial?.effortOverride?.toString() ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const selectedCourse = courses.find((c) => c.id === courseId);
  const canSave = title.trim() && courseId && dueAt;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `assign-${Date.now()}`,
      courseId,
      categoryId: categoryId || undefined,
      title: title.trim(),
      type,
      dueAt: new Date(dueAt).toISOString(),
      pointsPossible: pointsPossible ? Number(pointsPossible) : undefined,
      pointsEarned: pointsEarned ? Number(pointsEarned) : undefined,
      status,
      effortOverride: effortOverride ? Number(effortOverride) : undefined,
      notes: notes.trim() || undefined,
      source: initial?.source ?? 'manual',
      sourceUid: initial?.sourceUid,
      pinned: initial?.pinned,
      dismissed: initial?.dismissed,
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            placeholder="Problem Set 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Course</label>
          <select
            value={courseId}
            onChange={(e) => { setCourseId(e.target.value); setCategoryId(''); }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">-- None --</option>
            {selectedCourse?.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.weightPct}%)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssignmentType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Due Date & Time</label>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Points Possible</label>
          <input
            type="number"
            min={0}
            placeholder="100"
            value={pointsPossible}
            onChange={(e) => setPointsPossible(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Points Earned</label>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="--"
            value={pointsEarned}
            onChange={(e) => setPointsEarned(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="notStarted">Not Started</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Effort Override (hours)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="Auto"
            value={effortOverride}
            onChange={(e) => setEffortOverride(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {initial ? 'Update' : 'Add Assignment'}
        </button>
      </div>
    </div>
  );
}
