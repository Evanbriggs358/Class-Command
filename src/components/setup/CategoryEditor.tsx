import { GradeCategory } from '../../types';

export default function CategoryEditor({
  categories,
  onChange,
}: {
  categories: GradeCategory[];
  onChange: (cats: GradeCategory[]) => void;
}) {
  const totalWeight = categories.reduce((s, c) => s + c.weightPct, 0);
  const weightOk = Math.abs(totalWeight - 100) < 0.01;

  const update = (id: string, patch: Partial<GradeCategory>) => {
    onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const add = () => {
    onChange([
      ...categories,
      { id: `cat-${Date.now()}`, name: '', weightPct: 0, expectedCount: 1, dropLowest: 0 },
    ]);
  };

  const remove = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Grade Categories</label>
        <span className={`text-xs font-medium ${weightOk ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          Total: {totalWeight}%{!weightOk && ' (must be 100%)'}
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
          <input
            type="text"
            placeholder="Name"
            value={cat.name}
            onChange={(e) => update(cat.id, { name: e.target.value })}
            className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={cat.weightPct}
              onChange={(e) => update(cat.id, { weightPct: Number(e.target.value) })}
              className="w-14 rounded border border-gray-300 bg-white px-1.5 py-1 text-sm tabular-nums dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
          <input
            type="number"
            min={1}
            placeholder="#"
            title="Expected count"
            value={cat.expectedCount ?? ''}
            onChange={(e) => update(cat.id, { expectedCount: e.target.value ? Number(e.target.value) : undefined })}
            className="w-12 rounded border border-gray-300 bg-white px-1.5 py-1 text-sm tabular-nums dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            min={0}
            placeholder="Drop"
            title="Drop lowest"
            value={cat.dropLowest || ''}
            onChange={(e) => update(cat.id, { dropLowest: e.target.value ? Number(e.target.value) : 0 })}
            className="w-12 rounded border border-gray-300 bg-white px-1.5 py-1 text-sm tabular-nums dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            onClick={() => remove(cat.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400"
            title="Remove category"
          >
            &times;
          </button>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400"
      >
        + Add Category
      </button>
    </div>
  );
}
