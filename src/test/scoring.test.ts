import { describe, it, expect } from 'vitest';
import { gradeImpact, scoreAssignment, scoreAndSort, groupByBand } from '../lib/scoring';
import { Assignment, Course, Settings } from '../types';

const settings: Settings = {
  dailyCapacityHours: 4,
  effortDefaults: {
    exam: 6, project: 8, lab: 4, essay: 5,
    problemSet: 2, quiz: 1, reading: 1, discussion: 0.5, other: 2,
  },
};

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    name: 'Test Course',
    code: 'TEST 101',
    color: '#3b82f6',
    effortMultiplier: 1.0,
    categories: [],
    ...overrides,
  };
}

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'a1',
    courseId: 'c1',
    title: 'Test Assignment',
    type: 'problemSet',
    dueAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    status: 'notStarted',
    source: 'manual',
    ...overrides,
  };
}

const now = new Date('2026-10-15T12:00:00Z');

describe('gradeImpact', () => {
  it('1. 100-pt homework in a 20% category of 10 items → impact 2.0', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 20, expectedCount: 10 }],
    });
    const assignments = Array.from({ length: 10 }, (_, i) =>
      makeAssignment({ id: `a${i}`, categoryId: 'hw', pointsPossible: 100 }),
    );
    const { impactPct } = gradeImpact(assignments[0], course, assignments);
    expect(impactPct).toBeCloseTo(2.0);
  });

  it('2. 100-pt midterm in a 40% category of 2 items → impact 20.0', () => {
    const course = makeCourse({
      categories: [{ id: 'exam', name: 'Exams', weightPct: 40, expectedCount: 2 }],
    });
    const assignments = [
      makeAssignment({ id: 'a1', categoryId: 'exam', pointsPossible: 100 }),
      makeAssignment({ id: 'a2', categoryId: 'exam', pointsPossible: 100 }),
    ];
    const { impactPct } = gradeImpact(assignments[0], course, assignments);
    expect(impactPct).toBeCloseTo(20.0);
  });

  it('9. Empty category (knownTotal === 0) does not divide by zero', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 30, expectedCount: 5 }],
    });
    const a = makeAssignment({ categoryId: 'hw', pointsPossible: 0 });
    const { impactPct } = gradeImpact(a, course, [a]);
    expect(Number.isFinite(impactPct)).toBe(true);
  });

  it('no category → fallback impact 1.0 and flagged unweighted', () => {
    const course = makeCourse({ categories: [] });
    const a = makeAssignment({});
    const { impactPct, unweighted } = gradeImpact(a, course, [a]);
    expect(impactPct).toBe(1.0);
    expect(unweighted).toBe(true);
  });

  it('dropLowest reduces impact', () => {
    const course = makeCourse({
      categories: [{ id: 'q', name: 'Quizzes', weightPct: 15, expectedCount: 12, dropLowest: 2 }],
    });
    const assignments = Array.from({ length: 12 }, (_, i) =>
      makeAssignment({ id: `a${i}`, categoryId: 'q', pointsPossible: 25 }),
    );
    const { impactPct } = gradeImpact(assignments[0], course, assignments);
    const baseImpact = (25 / 300) * 15;
    const expected = baseImpact * (1 - 2 / 12);
    expect(impactPct).toBeCloseTo(expected);
  });
});

describe('scoreAssignment', () => {
  it('3. Same due date: midterm outranks homework', () => {
    const dueAt = new Date(now.getTime() + 5 * 86_400_000).toISOString();
    const course = makeCourse({
      categories: [
        { id: 'exam', name: 'Exams', weightPct: 40, expectedCount: 2 },
        { id: 'hw', name: 'HW', weightPct: 20, expectedCount: 10 },
      ],
    });
    const exams = [
      makeAssignment({ id: 'e1', categoryId: 'exam', type: 'exam', pointsPossible: 100, dueAt }),
      makeAssignment({ id: 'e2', categoryId: 'exam', type: 'exam', pointsPossible: 100, dueAt: new Date(now.getTime() + 60 * 86_400_000).toISOString() }),
    ];
    const hws = Array.from({ length: 10 }, (_, i) =>
      makeAssignment({ id: `h${i}`, categoryId: 'hw', type: 'problemSet', pointsPossible: 100, dueAt }),
    );
    const all = [...exams, ...hws];
    const midterm = scoreAssignment(exams[0], course, all, settings, now);
    const homework = scoreAssignment(hws[0], course, all, settings, now);
    expect(midterm.score).toBeGreaterThan(homework.score);
  });

  it('4. 8h project due in 2 days ranks above 1h quiz due tomorrow', () => {
    const course = makeCourse({
      categories: [
        { id: 'proj', name: 'Projects', weightPct: 55, expectedCount: 4 },
        { id: 'quiz', name: 'Quizzes', weightPct: 15, expectedCount: 10 },
      ],
    });
    const proj = makeAssignment({
      id: 'p1', categoryId: 'proj', type: 'project', pointsPossible: 300,
      dueAt: new Date(now.getTime() + 2 * 86_400_000).toISOString(),
    });
    const quiz = makeAssignment({
      id: 'q1', categoryId: 'quiz', type: 'quiz', pointsPossible: 30,
      dueAt: new Date(now.getTime() + 1 * 86_400_000).toISOString(),
    });
    const projAll = Array.from({ length: 4 }, (_, i) =>
      makeAssignment({ id: `p${i}`, categoryId: 'proj', type: 'project', pointsPossible: 300 }),
    );
    const quizAll = Array.from({ length: 10 }, (_, i) =>
      makeAssignment({ id: `q${i}`, categoryId: 'quiz', type: 'quiz', pointsPossible: 30 }),
    );
    const all = [...projAll, ...quizAll];
    const projScore = scoreAssignment(proj, course, all, settings, now);
    const quizScore = scoreAssignment(quiz, course, all, settings, now);
    expect(projScore.score).toBeGreaterThan(quizScore.score);
  });

  it('5. usableDays <= 0 lands in doNow regardless of due date', () => {
    const course = makeCourse({
      categories: [{ id: 'proj', name: 'Projects', weightPct: 50, expectedCount: 2 }],
    });
    const a = makeAssignment({
      categoryId: 'proj', type: 'project', pointsPossible: 200,
      dueAt: new Date(now.getTime() + 15 * 86_400_000).toISOString(),
      effortOverride: 80,
    });
    const scored = scoreAssignment(a, course, [a, makeAssignment({ id: 'a2', categoryId: 'proj', pointsPossible: 200 })], settings, now);
    expect(scored.usableDays).toBeLessThanOrEqual(0);
    expect(scored.band).toBe('doNow');
  });

  it('6. Overdue not done → doNow', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 20, expectedCount: 5 }],
    });
    const a = makeAssignment({
      categoryId: 'hw', pointsPossible: 100,
      dueAt: new Date(now.getTime() - 1 * 86_400_000).toISOString(),
      status: 'notStarted',
    });
    const scored = scoreAssignment(a, course, [a], settings, now);
    expect(scored.band).toBe('doNow');
  });

  it('7. Pinned beats everything', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 10, expectedCount: 20 }],
    });
    const pinned = makeAssignment({
      id: 'pinned', categoryId: 'hw', pointsPossible: 10, pinned: true,
      dueAt: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    });
    const urgent = makeAssignment({
      id: 'urgent', categoryId: 'hw', pointsPossible: 100,
      dueAt: new Date(now.getTime() + 0.5 * 86_400_000).toISOString(),
    });
    const all = [pinned, urgent];
    const pinnedScore = scoreAssignment(pinned, course, all, settings, now);
    const urgentScore = scoreAssignment(urgent, course, all, settings, now);
    expect(pinnedScore.score).toBe(Infinity);
    expect(pinnedScore.score).toBeGreaterThan(urgentScore.score);
  });
});

describe('scoreAndSort', () => {
  it('8. Done and dismissed appear in no band', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 20, expectedCount: 5 }],
    });
    const done = makeAssignment({
      id: 'done', categoryId: 'hw', pointsPossible: 100, status: 'done',
      dueAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    });
    const dismissed = makeAssignment({
      id: 'dismissed', categoryId: 'hw', pointsPossible: 100, dismissed: true,
      dueAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    });
    const active = makeAssignment({
      id: 'active', categoryId: 'hw', pointsPossible: 100,
      dueAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    });
    const scored = scoreAndSort([done, dismissed, active], [course], settings, now);
    expect(scored).toHaveLength(1);
    expect(scored[0].assignment.id).toBe('active');

    const bands = groupByBand(scored);
    const allBanded = [...bands.doNow, ...bands.thisWeek, ...bands.onDeck, ...bands.later];
    expect(allBanded.find((s) => s.assignment.id === 'done')).toBeUndefined();
    expect(allBanded.find((s) => s.assignment.id === 'dismissed')).toBeUndefined();
  });

  it('overdue items sort to top of doNow', () => {
    const course = makeCourse({
      categories: [{ id: 'hw', name: 'HW', weightPct: 20, expectedCount: 5 }],
    });
    const overdue = makeAssignment({
      id: 'overdue', categoryId: 'hw', pointsPossible: 100,
      dueAt: new Date(now.getTime() - 2 * 86_400_000).toISOString(),
    });
    const dueSoon = makeAssignment({
      id: 'soon', categoryId: 'hw', pointsPossible: 100,
      dueAt: new Date(now.getTime() + 1 * 86_400_000).toISOString(),
    });
    const scored = scoreAndSort([overdue, dueSoon], [course], settings, now);
    const bands = groupByBand(scored);
    expect(bands.doNow.length).toBeGreaterThanOrEqual(2);
    expect(bands.doNow[0].assignment.id).toBe('overdue');
  });
});
