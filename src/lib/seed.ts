import { AppState, Assignment, AssignmentType, Status } from '../types';

function a(
  id: string,
  courseId: string,
  categoryId: string,
  title: string,
  type: AssignmentType,
  dueAt: string,
  pointsPossible?: number,
  status: Status = 'notStarted',
): Assignment {
  return {
    id,
    courseId,
    categoryId,
    title,
    type,
    dueAt,
    status,
    source: 'manual',
    ...(pointsPossible != null ? { pointsPossible } : {}),
  };
}

export function createSeedData(): AppState {
  return {
    schemaVersion: 1,
    courses: [
      {
        id: 'arch100',
        name: 'Architecture and Ideas',
        code: 'ARCH 100',
        color: '#f59e0b',
        effortMultiplier: 0.8,
        meetingTimes: 'TR 9:05–10:20',
        categories: [
          { id: 'arch-exam', name: 'Exams', weightPct: 30, expectedCount: 3 },
          { id: 'arch-quiz', name: 'Quizzes', weightPct: 30, expectedCount: 7 },
          { id: 'arch-read', name: 'Reading Assignments', weightPct: 30, expectedCount: 3 },
          { id: 'arch-final', name: 'Final Exercise', weightPct: 5, expectedCount: 1 },
          { id: 'arch-attend', name: 'Attendance', weightPct: 5 },
        ],
      },
      {
        id: 'chem110',
        name: 'Chemical Principles I',
        code: 'CHEM 110',
        color: '#10b981',
        effortMultiplier: 1.2,
        meetingTimes: 'MWF 3:35–4:25, R rec 1:35–2:50',
        categories: [
          { id: 'chem-mt', name: 'Midterm Exams', weightPct: 40.5, expectedCount: 3 },
          { id: 'chem-case', name: 'Case Study', weightPct: 13.5, expectedCount: 1 },
          { id: 'chem-final', name: 'Final Exam', weightPct: 24, expectedCount: 1 },
          { id: 'chem-hw', name: 'Homework', weightPct: 5, expectedCount: 15 },
          { id: 'chem-tophat', name: 'Lecture Participation', weightPct: 5 },
          { id: 'chem-pla', name: 'Pre-lecture Assignments', weightPct: 5 },
          { id: 'chem-rec', name: 'Recitation', weightPct: 5 },
          { id: 'chem-skills', name: 'Skills Check', weightPct: 2, expectedCount: 1 },
        ],
      },
      {
        id: 'fdsc105',
        name: 'Food Facts and Fads',
        code: 'FDSC 105',
        color: '#f97316',
        effortMultiplier: 0.7,
        meetingTimes: 'MWF 10:10–11:00',
        categories: [
          { id: 'fdsc-exam', name: 'Exams', weightPct: 45, expectedCount: 4, dropLowest: 1 },
          { id: 'fdsc-hw', name: 'Homework', weightPct: 25, expectedCount: 9 },
          { id: 'fdsc-class', name: 'In-class Credit', weightPct: 30 },
        ],
      },
      {
        id: 'ldt110n',
        name: 'Making with Art and Learning Technologies',
        code: 'LDT 110N',
        color: '#8b5cf6',
        effortMultiplier: 0.8,
        meetingTimes: 'T 12:05–1:20 + online',
        categories: [
          { id: 'ldt-disc', name: 'Online Discussions', weightPct: 22.5, expectedCount: 14 },
          { id: 'ldt-part', name: 'In-person Participation', weightPct: 19.5, expectedCount: 15, dropLowest: 2 },
          { id: 'ldt-assign', name: 'Assignments', weightPct: 58, expectedCount: 6 },
        ],
      },
      {
        id: 'phys211',
        name: 'Mechanics',
        code: 'PHYS 211',
        color: '#3b82f6',
        effortMultiplier: 1.3,
        meetingTimes: 'MW 11:15–12:05, M lab 6:50–8:45, W rec 7:55–8:45',
        categories: [
          { id: 'phys-mt', name: 'Midterm Exams', weightPct: 45, expectedCount: 3 },
          { id: 'phys-final', name: 'Final Exam', weightPct: 20, expectedCount: 1 },
          { id: 'phys-rec', name: 'Recitation', weightPct: 10, expectedCount: 15 },
          { id: 'phys-lab', name: 'Laboratory', weightPct: 10, expectedCount: 9 },
          { id: 'phys-pc', name: 'Pre-Class', weightPct: 2, expectedCount: 14 },
          { id: 'phys-hw', name: 'Post-Class Homework', weightPct: 8, expectedCount: 12 },
          { id: 'phys-cp', name: 'Class Participation', weightPct: 3 },
          { id: 'phys-quiz', name: 'Quizzes', weightPct: 2, expectedCount: 2 },
        ],
      },
    ],

    assignments: [
      // ====== CHEM 110 — Homework (15 × 10 pts, Fridays 11:59 pm) ======
      a('c110-hw01', 'chem110', 'chem-hw', 'Homework 1', 'problemSet', '2026-08-28T23:59:00', 10),
      a('c110-hw02', 'chem110', 'chem-hw', 'Homework 2', 'problemSet', '2026-09-04T23:59:00', 10),
      a('c110-hw03', 'chem110', 'chem-hw', 'Homework 3', 'problemSet', '2026-09-11T23:59:00', 10),
      a('c110-hw04', 'chem110', 'chem-hw', 'Homework 4', 'problemSet', '2026-09-18T23:59:00', 10),
      a('c110-hw05', 'chem110', 'chem-hw', 'Homework 5', 'problemSet', '2026-09-25T23:59:00', 10),
      a('c110-hw06', 'chem110', 'chem-hw', 'Homework 6', 'problemSet', '2026-10-02T23:59:00', 10),
      a('c110-hw07', 'chem110', 'chem-hw', 'Homework 7', 'problemSet', '2026-10-09T23:59:00', 10),
      a('c110-hw08', 'chem110', 'chem-hw', 'Homework 8', 'problemSet', '2026-10-16T23:59:00', 10),
      a('c110-hw09', 'chem110', 'chem-hw', 'Homework 9', 'problemSet', '2026-10-23T23:59:00', 10),
      a('c110-hw10', 'chem110', 'chem-hw', 'Homework 10', 'problemSet', '2026-10-30T23:59:00', 10),
      a('c110-hw11', 'chem110', 'chem-hw', 'Homework 11', 'problemSet', '2026-11-06T23:59:00', 10),
      a('c110-hw12', 'chem110', 'chem-hw', 'Homework 12', 'problemSet', '2026-11-13T23:59:00', 10),
      a('c110-hw13', 'chem110', 'chem-hw', 'Homework 13', 'problemSet', '2026-11-20T23:59:00', 10),
      a('c110-hw14', 'chem110', 'chem-hw', 'Homework 14', 'problemSet', '2026-12-04T23:59:00', 10),
      a('c110-hw15', 'chem110', 'chem-hw', 'Homework 15', 'problemSet', '2026-12-11T23:59:00', 10),

      // ====== CHEM 110 — Exams ======
      a('c110-e1', 'chem110', 'chem-mt', 'Exam 1', 'exam', '2026-09-22T21:30:00', 100),
      a('c110-e2', 'chem110', 'chem-mt', 'Exam 2', 'exam', '2026-10-13T21:30:00', 100),
      a('c110-e3', 'chem110', 'chem-mt', 'Exam 3', 'exam', '2026-11-10T21:30:00', 100),
      a('c110-cs', 'chem110', 'chem-case', 'GLP-1 Case Study', 'project', '2026-12-04T18:00:00', 100),
      a('c110-fn', 'chem110', 'chem-final', 'Final Exam', 'exam', '2026-12-17T23:59:00', 100),

      // ====== FDSC 105 — Homework (5 pts each, best 5 of 9 count) ======
      a('f105-hw01', 'fdsc105', 'fdsc-hw', 'Making Cheese', 'project', '2026-09-04T23:59:00', 5),
      a('f105-hw02', 'fdsc105', 'fdsc-hw', 'Gathering Grass', 'project', '2026-09-09T23:59:00', 5),
      a('f105-hw03', 'fdsc105', 'fdsc-hw', 'Filled Dumplings', 'project', '2026-09-14T23:59:00', 5),
      a('f105-hw04', 'fdsc105', 'fdsc-hw', 'Making Ice Cream', 'project', '2026-10-05T23:59:00', 5),
      a('f105-hw05', 'fdsc105', 'fdsc-hw', 'Food and Disease', 'essay', '2026-11-09T23:59:00', 5),
      a('f105-hw06', 'fdsc105', 'fdsc-hw', 'The Poison Squad', 'essay', '2026-11-16T23:59:00', 5),
      a('f105-hw07', 'fdsc105', 'fdsc-hw', 'Best Meal Ever', 'essay', '2026-11-20T23:59:00', 5),
      a('f105-hw08', 'fdsc105', 'fdsc-hw', 'My Thanksgiving', 'essay', '2026-11-30T23:59:00', 5),
      a('f105-hw09', 'fdsc105', 'fdsc-hw', 'Fletcherize!', 'essay', '2026-12-12T23:59:00', 5),

      // ====== FDSC 105 — Exams (15 pts each, drop lowest) ======
      a('f105-e1', 'fdsc105', 'fdsc-exam', 'Exam 1', 'exam', '2026-09-16T11:00:00', 15),
      a('f105-e2', 'fdsc105', 'fdsc-exam', 'Exam 2', 'exam', '2026-10-09T11:00:00', 15),
      a('f105-e3', 'fdsc105', 'fdsc-exam', 'Exam 3', 'exam', '2026-11-09T11:00:00', 15),
      a('f105-e4', 'fdsc105', 'fdsc-exam', 'Exam 4', 'exam', '2026-12-16T11:00:00', 15),

      // ====== LDT 110N — Online Discussions ======
      a('l110-d01', 'ldt110n', 'ldt-disc', 'Discussion 1: Video Introduction', 'discussion', '2026-08-30T23:59:00', 3),
      a('l110-d02', 'ldt110n', 'ldt-disc', 'Discussion 2: What is Making?', 'discussion', '2026-08-30T23:59:00', 3),
      a('l110-d03', 'ldt110n', 'ldt-disc', 'Discussion 3: Interest-Driven Learning', 'discussion', '2026-09-06T23:59:00', 3),
      a('l110-d04', 'ldt110n', 'ldt-disc', 'Discussion 4: Hour of Code', 'discussion', '2026-09-13T23:59:00', 6),
      a('l110-d05', 'ldt110n', 'ldt-disc', 'Discussion 5: 3D Primitives', 'discussion', '2026-09-20T23:59:00', 3),
      a('l110-d06', 'ldt110n', 'ldt-disc', 'Discussion 6: STEAM & Maker Mindset', 'discussion', '2026-09-27T23:59:00', 3),
      a('l110-d07', 'ldt110n', 'ldt-disc', 'Discussion 7: Design & Creativity', 'discussion', '2026-10-04T23:59:00', 3),
      a('l110-d08', 'ldt110n', 'ldt-disc', 'Discussion 8: STEAM Robotics and Art', 'discussion', '2026-10-11T23:59:00', 3),
      a('l110-d09', 'ldt110n', 'ldt-disc', 'Discussion 9: Data Science', 'discussion', '2026-10-18T23:59:00', 3),
      a('l110-d10', 'ldt110n', 'ldt-disc', 'Discussion 10: Constructionism', 'discussion', '2026-10-25T23:59:00', 3),
      a('l110-d11', 'ldt110n', 'ldt-disc', 'Discussion 11: Making as Storytelling', 'discussion', '2026-11-01T23:59:00', 6),
      a('l110-d12', 'ldt110n', 'ldt-disc', 'Discussion 12: Social Learning', 'discussion', '2026-11-08T23:59:00', 3),
      a('l110-d13', 'ldt110n', 'ldt-disc', 'Discussion 13: Social Justice', 'discussion', '2026-11-15T23:59:00', 3),
      a('l110-d14', 'ldt110n', 'ldt-disc', 'Discussion 14: Constructivist Pedagogy', 'discussion', '2026-11-29T23:59:00', 3),

      // ====== LDT 110N — Major Assignments ======
      a('l110-a1', 'ldt110n', 'ldt-assign', 'Assignment 1: Maker Research Plan', 'essay', '2026-09-18T23:59:00', 13),
      a('l110-a2', 'ldt110n', 'ldt-assign', 'Assignment 2: Project Proposal', 'project', '2026-10-02T23:59:00', 25),
      a('l110-a3a', 'ldt110n', 'ldt-assign', 'Assignment 3a: Early-Stage Video', 'project', '2026-10-23T23:59:00', 20),
      a('l110-a3b', 'ldt110n', 'ldt-assign', 'Assignment 3b: Final Maker Project', 'project', '2026-11-20T23:59:00', 30),
      a('l110-a4a', 'ldt110n', 'ldt-assign', 'Assignment 4a: Lesson Plan', 'essay', '2026-12-01T23:59:00', 20),
      a('l110-a4b', 'ldt110n', 'ldt-assign', 'Assignment 4b: Teaching', 'other', '2026-12-08T23:59:00', 8),

      // ====== PHYS 211 — Expert TA: Getting Started + Post-Class Homework ======
      a('p211-start', 'phys211', 'phys-hw', 'Getting Started with Expert TA', 'other', '2026-08-26T23:59:00', 100, 'done'),
      a('p211-hw01', 'phys211', 'phys-hw', 'HW01: Mathematics and Units', 'problemSet', '2026-08-27T23:59:00', 100, 'done'),
      a('p211-hw02', 'phys211', 'phys-hw', 'HW02: 1D Motion', 'problemSet', '2026-09-03T23:59:00', 100, 'done'),
      a('p211-hw03', 'phys211', 'phys-hw', 'HW03: Vectors', 'problemSet', '2026-09-10T23:59:00', 100, 'inProgress'),
      a('p211-hw04', 'phys211', 'phys-hw', 'HW 04', 'problemSet', '2026-09-24T23:59:00', 100),
      a('p211-hw05', 'phys211', 'phys-hw', 'HW 05', 'problemSet', '2026-10-01T23:59:00', 100),
      a('p211-hw06', 'phys211', 'phys-hw', 'HW 06', 'problemSet', '2026-10-08T23:59:00', 100),
      a('p211-hw07', 'phys211', 'phys-hw', 'HW 07', 'problemSet', '2026-10-22T23:59:00', 100),
      a('p211-hw08', 'phys211', 'phys-hw', 'HW 08', 'problemSet', '2026-10-29T23:59:00', 100),
      a('p211-hw09', 'phys211', 'phys-hw', 'HW 09', 'problemSet', '2026-11-05T23:59:00', 100),
      a('p211-hw10', 'phys211', 'phys-hw', 'HW 10', 'problemSet', '2026-11-19T23:59:00', 100),
      a('p211-hw11', 'phys211', 'phys-hw', 'HW 11', 'problemSet', '2026-12-03T23:59:00', 100),
      a('p211-hw12', 'phys211', 'phys-hw', 'HW 12', 'problemSet', '2026-12-10T23:59:00', 100),

      // ====== PHYS 211 — Expert TA: Pre-Class ======
      a('p211-pc01', 'phys211', 'phys-pc', 'PreClass 01', 'reading', '2026-09-01T23:59:00', 100, 'done'),
      a('p211-pc02', 'phys211', 'phys-pc', 'PreClass 02', 'reading', '2026-09-09T07:30:00', 100),
      a('p211-pc03', 'phys211', 'phys-pc', 'PreClass 03', 'reading', '2026-09-13T23:59:00', 100),
      a('p211-pc04', 'phys211', 'phys-pc', 'PreClass 04', 'reading', '2026-09-20T23:59:00', 100),
      a('p211-pc05', 'phys211', 'phys-pc', 'PreClass 05', 'reading', '2026-09-27T23:59:00', 100),
      a('p211-pc06', 'phys211', 'phys-pc', 'PreClass 06', 'reading', '2026-10-04T23:59:00', 100),
      a('p211-pc07', 'phys211', 'phys-pc', 'PreClass 07', 'reading', '2026-10-11T23:59:00', 100),
      a('p211-pc08', 'phys211', 'phys-pc', 'PreClass 08', 'reading', '2026-10-18T23:59:00', 100),
      a('p211-pc09', 'phys211', 'phys-pc', 'PreClass 09', 'reading', '2026-10-25T23:59:00', 100),
      a('p211-pc10', 'phys211', 'phys-pc', 'PreClass 10', 'reading', '2026-11-01T23:59:00', 100),
      a('p211-pc11', 'phys211', 'phys-pc', 'PreClass 11', 'reading', '2026-11-08T23:59:00', 100),
      a('p211-pc12', 'phys211', 'phys-pc', 'PreClass 12', 'reading', '2026-11-15T23:59:00', 100),
      a('p211-pc13', 'phys211', 'phys-pc', 'PreClass 13', 'reading', '2026-11-29T23:59:00', 100),
      a('p211-pc14', 'phys211', 'phys-pc', 'PreClass 14', 'reading', '2026-12-06T23:59:00', 100),

      // ====== PHYS 211 — Expert TA: Practice / Review (ungraded) ======
      a('p211-pmt1', 'phys211', 'phys-mt', 'Practice for Midterm 1', 'other', '2026-09-17T23:59:00', 0),
      a('p211-pmt1-hw', 'phys211', 'phys-mt', 'HW Problems for Midterm 1 (Practice)', 'other', '2026-09-17T23:59:00', 0),
      a('p211-pmt3', 'phys211', 'phys-mt', 'Practice for MT3', 'other', '2026-11-12T23:59:00', 0),
      a('p211-pmt3-hw', 'phys211', 'phys-mt', '(Practice) HW Problems for MT3', 'other', '2026-11-14T23:59:00', 0),
      a('p211-pfnl', 'phys211', 'phys-final', 'Practice for Final', 'other', '2026-12-18T23:59:00', 0),

      // ====== PHYS 211 — Exams ======
      a('p211-mt1', 'phys211', 'phys-mt', 'Midterm 1', 'exam', '2026-09-17T23:30:00', 150),
      a('p211-mt2', 'phys211', 'phys-mt', 'Midterm 2', 'exam', '2026-10-15T23:59:00', 150),
      a('p211-mt3', 'phys211', 'phys-mt', 'Midterm 3', 'exam', '2026-11-12T18:15:00', 150),
      a('p211-fn', 'phys211', 'phys-final', 'Final Exam', 'exam', '2026-12-17T23:59:00', 200),

      // ====== PHYS 211 — Quizzes ======
      a('p211-preq', 'phys211', 'phys-quiz', 'Conceptual Pre-Quiz', 'quiz', '2026-08-28T16:45:00', 1, 'done'),
      a('p211-postq', 'phys211', 'phys-quiz', 'Conceptual Post-Quiz', 'quiz', '2026-12-11T23:30:00', 1),

      // ====== PHYS 211 — Recitations (15 × 150 pts) ======
      a('p211-r01', 'phys211', 'phys-rec', 'Recit 01', 'problemSet', '2026-08-27T23:59:00', 150),
      a('p211-r02', 'phys211', 'phys-rec', 'Recit 02', 'problemSet', '2026-09-03T23:59:00', 150),
      a('p211-r03', 'phys211', 'phys-rec', 'Recit 03', 'problemSet', '2026-09-10T23:59:00', 150),
      a('p211-r04', 'phys211', 'phys-rec', 'Recit 04', 'problemSet', '2026-09-15T23:59:00', 150),
      a('p211-r05', 'phys211', 'phys-rec', 'Recit 05', 'problemSet', '2026-09-24T23:59:00', 150),
      a('p211-r06', 'phys211', 'phys-rec', 'Recit 06', 'problemSet', '2026-10-01T23:59:00', 150),
      a('p211-r07', 'phys211', 'phys-rec', 'Recit 07', 'problemSet', '2026-10-08T23:59:00', 150),
      a('p211-r08', 'phys211', 'phys-rec', 'Recit 08', 'problemSet', '2026-10-13T23:59:00', 150),
      a('p211-r09', 'phys211', 'phys-rec', 'Recit 09', 'problemSet', '2026-10-22T23:59:00', 150),
      a('p211-r10', 'phys211', 'phys-rec', 'Recit 10', 'problemSet', '2026-10-29T23:59:00', 150),
      a('p211-r11', 'phys211', 'phys-rec', 'Recit 11', 'problemSet', '2026-11-05T23:59:00', 150),
      a('p211-r12', 'phys211', 'phys-rec', 'Recit 12', 'problemSet', '2026-11-10T23:59:00', 150),
      a('p211-r13', 'phys211', 'phys-rec', 'Recit 13', 'problemSet', '2026-11-19T23:59:00', 150),
      a('p211-r14', 'phys211', 'phys-rec', 'Recit 14', 'problemSet', '2026-12-03T23:59:00', 150),
      a('p211-r15', 'phys211', 'phys-rec', 'Recit 15', 'problemSet', '2026-12-08T23:59:00', 150),

      // ====== PHYS 211 — Labs (9 × 150 pts) ======
      a('p211-lab01', 'phys211', 'phys-lab', 'Lab 01', 'lab', '2026-09-03T23:59:00', 150),
      a('p211-lab02', 'phys211', 'phys-lab', 'Lab 02', 'lab', '2026-09-24T23:59:00', 150),
      a('p211-lab03', 'phys211', 'phys-lab', 'Lab 03', 'lab', '2026-10-01T23:59:00', 150),
      a('p211-lab04', 'phys211', 'phys-lab', 'Lab 04', 'lab', '2026-10-08T23:59:00', 150),
      a('p211-lab05', 'phys211', 'phys-lab', 'Lab 05', 'lab', '2026-10-22T23:59:00', 150),
      a('p211-lab06', 'phys211', 'phys-lab', 'Lab 06', 'lab', '2026-10-29T23:59:00', 150),
      a('p211-lab07', 'phys211', 'phys-lab', 'Lab 07', 'lab', '2026-11-05T23:59:00', 150),
      a('p211-lab08', 'phys211', 'phys-lab', 'Lab 08', 'lab', '2026-11-19T23:59:00', 150),
      a('p211-lab09', 'phys211', 'phys-lab', 'Lab 09', 'lab', '2026-12-03T23:59:00', 150),

      // ====== ARCH 100 — Quizzes (6 × 60 pts + 1 Film Quiz 25 pts) ======
      a('a100-q1', 'arch100', 'arch-quiz', 'Quiz 1 (1.1-1.3)', 'quiz', '2026-09-08T08:00:00', 60),
      a('a100-q2', 'arch100', 'arch-quiz', 'Quiz 2 (1.4-1.6)', 'quiz', '2026-09-17T08:00:00', 60),
      a('a100-q3', 'arch100', 'arch-quiz', 'Quiz 3 (2.1-2.3)', 'quiz', '2026-10-08T08:00:00', 60),
      a('a100-q4', 'arch100', 'arch-quiz', 'Quiz 4 (2.4-2.6)', 'quiz', '2026-10-20T08:00:00', 60),
      a('a100-q5', 'arch100', 'arch-quiz', 'Quiz 5 (3.1-3.3)', 'quiz', '2026-11-10T08:00:00', 60),
      a('a100-q6', 'arch100', 'arch-quiz', 'Quiz 6 (3.4-3.6)', 'quiz', '2026-11-19T08:00:00', 60),
      a('a100-fq', 'arch100', 'arch-quiz', 'Film Quiz', 'quiz', '2026-12-12T08:00:00', 25),

      // ====== ARCH 100 — Reading Activities (3 × 20 pts) ======
      a('a100-r1', 'arch100', 'arch-read', 'Reading Activity Unit 1', 'reading', '2026-09-20T23:59:00', 20),
      a('a100-r2', 'arch100', 'arch-read', 'Reading Activity Unit 2', 'reading', '2026-10-25T23:59:00', 20),
      a('a100-r3', 'arch100', 'arch-read', 'Reading Activity Unit 3', 'reading', '2026-12-02T23:59:00', 20),

      // ====== ARCH 100 — Exams (3 × 100 pts) ======
      a('a100-e1', 'arch100', 'arch-exam', 'Exam 1 (1.1-1.8)', 'exam', '2026-09-28T23:30:00', 100),
      a('a100-e2', 'arch100', 'arch-exam', 'Exam 2 (2.1-2.8)', 'exam', '2026-11-02T23:30:00', 100),
      a('a100-e3', 'arch100', 'arch-exam', 'Exam 3 (3.1-3.8)', 'exam', '2026-12-07T23:30:00', 100),
    ],

    settings: {
      dailyCapacityHours: 5,
      effortDefaults: {
        exam: 8,
        project: 6,
        lab: 3,
        essay: 4,
        problemSet: 2,
        quiz: 1,
        reading: 0.5,
        discussion: 1,
        other: 2,
      },
    },
  };
}
