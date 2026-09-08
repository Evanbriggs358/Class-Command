import { useState } from 'react';
import { Course, GradeCategory } from '../../types';
import CategoryEditor from './CategoryEditor';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function CourseForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [effortMultiplier, setEffortMultiplier] = useState(initial?.effortMultiplier ?? 1.0);
  const [meetingTimes, setMeetingTimes] = useState(initial?.meetingTimes ?? '');
  const [categories, setCategories] = useState<GradeCategory[]>(initial?.categories ?? []);

  const totalWeight = categories.reduce((s, c) => s + c.weightPct, 0);
  const canSave = name.trim() && code.trim() && Math.abs(totalWeight - 100) < 0.01;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `course-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      color,
      effortMultiplier,
      meetingTimes: meetingTimes.trim() || undefined,
      categories,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Course Name</label>
          <input
            type="text"
            placeholder="Aerospace Engineering Fundamentals"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Code</label>
          <input
            type="text"
            placeholder="AERSP 201"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Color</label>
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Effort Multiplier</label>
          <input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={effortMultiplier}
            onChange={(e) => setEffortMultiplier(Number(e.target.value))}
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm tabular-nums dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Meeting Times</label>
          <input
            type="text"
            placeholder="MWF 9:05-9:55"
            value={meetingTimes}
            onChange={(e) => setMeetingTimes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <CategoryEditor categories={categories} onChange={setCategories} />

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {initial ? 'Update Course' : 'Add Course'}
        </button>
      </div>
    </div>
  );
}
