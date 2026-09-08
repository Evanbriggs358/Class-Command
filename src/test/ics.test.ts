import { describe, it, expect } from 'vitest';
import { parseIcs, mergeImportedAssignments } from '../lib/ics';
import { Assignment, Course } from '../types';

const FIXTURE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Instructure Inc//NONSGML Canvas//EN
BEGIN:VEVENT
DTSTART:20261015T235900Z
DTEND:20261015T235900Z
SUMMARY:Homework 3 [AERSP 201]
UID:event-assignment-12345@psu.instructure.com
END:VEVENT
BEGIN:VEVENT
DTSTART:20261020T235900Z
DTEND:20261020T235900Z
SUMMARY:Midterm Exam [CHEM 110]
UID:event-assignment-12346@psu.instructure.com
END:VEVENT
BEGIN:VEVENT
DTSTART:20261025T235900Z
DTEND:20261025T235900Z
SUMMARY:Essay 1 [ENGL 200]
UID:event-assignment-12347@psu.instructure.com
END:VEVENT
END:VCALENDAR`;

const courses: Course[] = [
  {
    id: 'c1', name: 'Aerospace Engineering Fundamentals', code: 'AERSP 201',
    color: '#3b82f6', effortMultiplier: 1.0, categories: [],
  },
  {
    id: 'c2', name: 'General Chemistry', code: 'CHEM 110',
    color: '#10b981', effortMultiplier: 1.0, categories: [],
  },
];

describe('ICS import', () => {
  it('parses a Canvas .ics feed and matches courses', () => {
    const result = parseIcs(FIXTURE_ICS, courses);
    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(1);

    const hw = result.matched.find((e) => e.uid === 'event-assignment-12345@psu.instructure.com');
    expect(hw).toBeDefined();
    expect(hw!.cleanTitle).toBe('Homework 3');
    expect(hw!.matchedCourseId).toBe('c1');
    expect(hw!.guessedType).toBe('problemSet');

    const exam = result.matched.find((e) => e.uid === 'event-assignment-12346@psu.instructure.com');
    expect(exam).toBeDefined();
    expect(exam!.cleanTitle).toBe('Midterm Exam');
    expect(exam!.matchedCourseId).toBe('c2');
    expect(exam!.guessedType).toBe('exam');

    const unmatched = result.unmatched[0];
    expect(unmatched.courseCode).toBe('ENGL 200');
  });

  it('re-import preserves status and notes', () => {
    const result1 = parseIcs(FIXTURE_ICS, courses);
    const initial = mergeImportedAssignments(result1.matched, []);
    expect(initial.length).toBe(2);

    const withEdits: Assignment[] = initial.map((a) => ({
      ...a,
      status: 'inProgress' as const,
      notes: 'My study notes',
      categoryId: 'some-cat',
      pointsPossible: 100,
    }));

    const UPDATED_ICS = FIXTURE_ICS.replace('20261015T235900Z', '20261018T235900Z');
    const result2 = parseIcs(UPDATED_ICS, courses);
    const merged = mergeImportedAssignments(result2.matched, withEdits);

    const hw = merged.find((a) => a.sourceUid === 'event-assignment-12345@psu.instructure.com')!;
    expect(hw.status).toBe('inProgress');
    expect(hw.notes).toBe('My study notes');
    expect(hw.categoryId).toBe('some-cat');
    expect(hw.pointsPossible).toBe(100);
    expect(hw.dueAt).toContain('2026-10-18');
  });

  it('flags items removed from Canvas on re-import', () => {
    const result1 = parseIcs(FIXTURE_ICS, courses);
    const initial = mergeImportedAssignments(result1.matched, []);
    expect(initial.length).toBe(2);

    const ICS_ONE_REMOVED = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Instructure Inc//NONSGML Canvas//EN
BEGIN:VEVENT
DTSTART:20261015T235900Z
DTEND:20261015T235900Z
SUMMARY:Homework 3 [AERSP 201]
UID:event-assignment-12345@psu.instructure.com
END:VEVENT
END:VCALENDAR`;

    const result2 = parseIcs(ICS_ONE_REMOVED, courses);
    const merged = mergeImportedAssignments(result2.matched, initial);

    const hw = merged.find((a) => a.sourceUid === 'event-assignment-12345@psu.instructure.com')!;
    expect(hw.removedFromCanvas).toBeFalsy();

    const exam = merged.find((a) => a.sourceUid === 'event-assignment-12346@psu.instructure.com')!;
    expect(exam.removedFromCanvas).toBe(true);
  });
});
