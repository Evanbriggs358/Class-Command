import { useState, useCallback } from 'react';
import { useStore, useDispatch } from '../../state/store';
import { parseIcs, mergeImportedAssignments, ParsedEvent } from '../../lib/ics';

export default function IcsImport() {
  const state = useStore();
  const dispatch = useDispatch();
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<{ matched: ParsedEvent[]; unmatched: ParsedEvent[] } | null>(null);
  const [unmatchedAssignments, setUnmatchedAssignments] = useState<(ParsedEvent & { assignedCourseId?: string })[]>([]);

  const processFile = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = parseIcs(text, state.courses);
    setResult(parsed);
    setUnmatchedAssignments(parsed.unmatched.map((u) => ({ ...u })));
  }, [state.courses]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.ics') || file.type === 'text/calendar')) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) processFile(file);
    };
    input.click();
  }, [processFile]);

  const assignUnmatched = (uid: string, courseId: string) => {
    setUnmatchedAssignments((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, assignedCourseId: courseId, matchedCourseId: courseId } : u)),
    );
  };

  const handleImport = () => {
    if (!result) return;
    const allToImport = [
      ...result.matched,
      ...unmatchedAssignments.filter((u) => u.assignedCourseId),
    ];
    const merged = mergeImportedAssignments(allToImport, state.assignments);
    dispatch({ type: 'IMPORT_STATE', state: { ...state, assignments: merged } });

    const needsWeights = allToImport.filter((a) => {
      const existing = state.assignments.find((e) => e.sourceUid === a.uid);
      return !existing?.categoryId;
    });

    setResult(null);
    setUnmatchedAssignments([]);

    if (needsWeights.length > 0) {
      alert(`Imported! ${needsWeights.length} item${needsWeights.length > 1 ? 's' : ''} need grade categories and points assigned.`);
    }
  };

  if (result) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Import Preview</h3>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          {result.matched.length} matched · {unmatchedAssignments.length} unmatched
        </p>

        {result.matched.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-medium text-green-700 dark:text-green-400">Matched</h4>
            <div className="max-h-40 space-y-0.5 overflow-y-auto">
              {result.matched.map((e) => {
                const course = state.courses.find((c) => c.id === e.matchedCourseId);
                return (
                  <div key={e.uid} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: course?.color }} />
                    <span className="truncate">{e.cleanTitle}</span>
                    <span className="text-gray-400">{course?.code}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {unmatchedAssignments.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-medium text-orange-700 dark:text-orange-400">
              Unmatched — assign a course or skip
            </h4>
            <div className="space-y-1.5">
              {unmatchedAssignments.map((u) => (
                <div key={u.uid} className="flex items-center gap-2 rounded-lg bg-orange-50 p-2 dark:bg-orange-950/20">
                  <span className="min-w-0 flex-1 truncate text-xs text-gray-800 dark:text-gray-200">
                    {u.cleanTitle}
                    {u.courseCode && <span className="ml-1 text-gray-400">[{u.courseCode}]</span>}
                  </span>
                  <select
                    value={u.assignedCourseId ?? ''}
                    onChange={(e) => assignUnmatched(u.uid, e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Skip</option>
                    {state.courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setResult(null); setUnmatchedAssignments([]); }}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Import {result.matched.length + unmatchedAssignments.filter((u) => u.assignedCourseId).length} Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={handleFileSelect}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging
          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/20'
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
      }`}
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Drop a .ics file here or click to browse
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Canvas: Calendar &rarr; Calendar Feed &rarr; download the .ics file
      </p>
    </div>
  );
}
