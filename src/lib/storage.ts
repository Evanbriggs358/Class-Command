import { AppState, Settings, AssignmentType } from '../types';

const STORAGE_KEY = 'classCommand.state.v1';
const BACKUP_PREFIX = 'classCommand.backup.';

const DEFAULT_SETTINGS: Settings = {
  dailyCapacityHours: 4,
  effortDefaults: {
    exam: 6,
    project: 8,
    lab: 4,
    essay: 5,
    problemSet: 2,
    quiz: 1,
    reading: 1,
    discussion: 0.5,
    other: 2,
  } as Record<AssignmentType, number>,
};

function emptyState(): AppState {
  return {
    schemaVersion: 1,
    courses: [],
    assignments: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

const COURSE_URLS: Record<string, string> = {
  arch100: 'https://psu.instructure.com',
  chem110: 'https://psu.instructure.com',
  fdsc105: 'https://psu.instructure.com',
  ldt110n: 'https://psu.instructure.com',
  phys211: 'https://www.theexpertta.com',
};

function migrate(state: AppState): AppState {
  if (!state.schemaVersion || state.schemaVersion < 1) {
    state.schemaVersion = 1;
  }
  if (state.schemaVersion < 2) {
    for (const c of state.courses) {
      if (!c.url && COURSE_URLS[c.id]) {
        c.url = COURSE_URLS[c.id];
      }
    }
    state.schemaVersion = 2;
  }
  return state;
}

function isValidShape(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.schemaVersion === 'number' &&
    Array.isArray(obj.courses) &&
    Array.isArray(obj.assignments) &&
    obj.settings !== null &&
    typeof obj.settings === 'object'
  );
}

export function loadState(): { state: AppState; warning?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: emptyState() };

    const parsed = JSON.parse(raw);
    if (!isValidShape(parsed)) {
      localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, raw);
      return {
        state: emptyState(),
        warning: 'Saved data was corrupted and has been backed up. Starting fresh.',
      };
    }

    return { state: migrate(parsed) };
  } catch {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, raw);
    }
    return {
      state: emptyState(),
      warning: 'Could not read saved data. A backup was created. Starting fresh.',
    };
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveState(state: AppState): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 300);
}

export function exportState(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `class-command-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): { state: AppState } | { error: string } {
  try {
    const parsed = JSON.parse(text);
    if (!isValidShape(parsed)) {
      return { error: 'Invalid file format. Expected a Class Command export.' };
    }
    return { state: migrate(parsed) };
  } catch {
    return { error: 'Could not parse the file. Make sure it is valid JSON.' };
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
