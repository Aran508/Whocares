import { useMemo } from 'react';
import { LESSONS, lessonsOfModule, ownLessonsOfModule } from '../data/lessons';
import { MODULES } from '../data/modules';
import type { ProgressState } from '../types';
import { computeLevel } from './levels';
import { isLessonComplete, useProgress } from './progress';

export function computeStats(state: ProgressState) {
  const completedIds = LESSONS.filter((l) => isLessonComplete(state.lessons[l.id], state.settings)).map((l) => l.id);
  const completed = new Set(completedIds);
  const quizScores = Object.values(state.lessons).filter((l) => l.quiz).map((l) => l.quiz!.score);
  const quizAvg = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
  const seconds = state.activity.reduce((a, e) => a + (e.seconds ?? 0), 0);
  const passedExams = new Set(state.assessments.filter((a) => a.passed).map((a) => a.examId));
  const comprehensivePassed = passedExams.has('comprehensive');
  const level = computeLevel(completed.size, passedExams.size, comprehensivePassed);
  const perModule = MODULES.map((m) => {
    const own = ownLessonsOfModule(m.id);
    const all = lessonsOfModule(m.id);
    const done = all.filter((l) => completed.has(l.id)).length;
    return { module: m, total: all.length, ownTotal: own.length, done, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  });
  const byDept = new Map<string, { total: number; done: number }>();
  for (const l of LESSONS) {
    const d = MODULES.find((m) => m.id === l.moduleId)!.department;
    const cur = byDept.get(d) ?? { total: 0, done: 0 };
    cur.total++;
    if (completed.has(l.id)) cur.done++;
    byDept.set(d, cur);
  }
  return {
    totalLessons: LESSONS.length,
    totalCourses: MODULES.length,
    completed,
    completedCount: completed.size,
    overallPct: Math.round((completed.size / LESSONS.length) * 100),
    quizAvg,
    quizCount: quizScores.length,
    hours: seconds / 3600,
    passedExams: passedExams.size,
    comprehensivePassed,
    level,
    perModule,
    byDept: Array.from(byDept.entries()).map(([dept, v]) => ({ dept, ...v, pct: Math.round((v.done / v.total) * 100) })),
  };
}

export function useStats() {
  const { state } = useProgress();
  return useMemo(() => computeStats(state), [state]);
}
