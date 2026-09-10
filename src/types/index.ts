export type AssignmentType =
  | 'exam' | 'project' | 'lab' | 'essay'
  | 'problemSet' | 'quiz' | 'reading' | 'discussion' | 'other';

export type Status = 'notStarted' | 'inProgress' | 'done';

export type Band = 'doNow' | 'thisWeek' | 'onDeck' | 'later';

export interface GradeCategory {
  id: string;
  name: string;
  weightPct: number;
  expectedCount?: number;
  dropLowest?: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  categories: GradeCategory[];
  effortMultiplier: number;
  meetingTimes?: string;
  url?: string;
  archived?: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  categoryId?: string;
  title: string;
  type: AssignmentType;
  dueAt: string;
  pointsPossible?: number;
  pointsEarned?: number;
  status: Status;
  effortOverride?: number;
  pinned?: boolean;
  dismissed?: boolean;
  removedFromCanvas?: boolean;
  notes?: string;
  url?: string;
  source: 'ics' | 'manual' | 'import';
  sourceUid?: string;
}

export interface Settings {
  dailyCapacityHours: number;
  effortDefaults: Record<AssignmentType, number>;
}

export interface AppState {
  schemaVersion: number;
  courses: Course[];
  assignments: Assignment[];
  settings: Settings;
}
