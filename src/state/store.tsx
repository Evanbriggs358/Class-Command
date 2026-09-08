import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { AppState, Assignment, Course, Settings, Status } from '../types';
import { loadState, saveState } from '../lib/storage';
import { createSeedData } from '../lib/seed';

type Action =
  | { type: 'SET_STATUS'; id: string; status: Status }
  | { type: 'SET_SCORE'; id: string; pointsEarned: number | undefined }
  | { type: 'ADD_ASSIGNMENT'; assignment: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; assignment: Assignment }
  | { type: 'DELETE_ASSIGNMENT'; id: string }
  | { type: 'ADD_COURSE'; course: Course }
  | { type: 'UPDATE_COURSE'; course: Course }
  | { type: 'DELETE_COURSE'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Settings }
  | { type: 'LOAD_SEED' }
  | { type: 'IMPORT_STATE'; state: AppState }
  | { type: 'MERGE_ASSIGNMENTS'; assignments: Assignment[] }
  | { type: 'BATCH_SCORES'; scores: { id: string; pointsEarned: number; status?: Status }[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.id ? { ...a, status: action.status } : a,
        ),
      };

    case 'SET_SCORE':
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.id ? { ...a, pointsEarned: action.pointsEarned } : a,
        ),
      };

    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.assignment] };

    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.assignment.id ? action.assignment : a,
        ),
      };

    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter((a) => a.id !== action.id),
      };

    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.course] };

    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.course.id ? action.course : c,
        ),
      };

    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.id),
        assignments: state.assignments.filter((a) => a.courseId !== action.id),
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings };

    case 'LOAD_SEED':
      return createSeedData();

    case 'IMPORT_STATE':
      return action.state;

    case 'MERGE_ASSIGNMENTS': {
      const existing = new Map(state.assignments.map((a) => [a.id, a]));
      for (const a of action.assignments) {
        existing.set(a.id, a);
      }
      return { ...state, assignments: Array.from(existing.values()) };
    }

    case 'BATCH_SCORES': {
      const scoreMap = new Map(action.scores.map((s) => [s.id, s]));
      return {
        ...state,
        assignments: state.assignments.map((a) => {
          const update = scoreMap.get(a.id);
          if (!update) return a;
          return {
            ...a,
            pointsEarned: update.pointsEarned,
            ...(update.status ? { status: update.status } : {}),
          };
        }),
      };
    }

    default:
      return state;
  }
}

const StoreContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { state: initial, warning } = loadState();
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (warning) {
      console.warn('[Class Command]', warning);
    }
  }, [warning]);

  return (
    <StoreContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
}

export function useStore(): AppState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useDispatch must be used within StoreProvider');
  return ctx;
}
