import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ActivityEvent, AssessmentResult, LessonProgress, ModuleId, ProgressState, Settings } from '../types';
import { localStorageAdapter, type StorageAdapter } from './storage';

export const DEFAULT_SETTINGS: Settings = { passMark: 80, examPassMark: 70, learnerName: '', compact: false };

export const emptyState = (): ProgressState => ({
  version: 1,
  lessons: {},
  bookmarks: [],
  history: [],
  activity: [],
  assessments: [],
  calcHistory: [],
  casesSolved: {},
  settings: { ...DEFAULT_SETTINGS },
});

export const isLessonComplete = (lp: LessonProgress | undefined, settings: Settings) =>
  !!lp && lp.studied && !!lp.quiz && lp.quiz.score >= settings.passMark;

const blankLesson = (): LessonProgress => ({ studied: false, attempts: 0, secondsSpent: 0 });

interface ProgressApi {
  state: ProgressState;
  isComplete: (lessonId: string) => boolean;
  visitLesson: (lessonId: string, moduleId: ModuleId) => void;
  addLessonTime: (lessonId: string, seconds: number) => void;
  setStudied: (lessonId: string, studied: boolean) => void;
  recordQuiz: (lessonId: string, correct: number, total: number, label: string) => void;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  log: (e: Omit<ActivityEvent, 'at'>) => void;
  recordAssessment: (r: Omit<AssessmentResult, 'at'>) => void;
  recordCalc: (calcId: string, title: string, summary: string) => void;
  recordCase: (caseId: string, correct: boolean) => void;
  updateSettings: (s: Partial<Settings>) => void;
  reset: () => void;
  importState: (s: ProgressState) => void;
}

const Ctx = createContext<ProgressApi | null>(null);

const MAX_ACTIVITY = 2000;

export function ProgressProvider({ children, adapter = localStorageAdapter }: { children: ReactNode; adapter?: StorageAdapter }) {
  const [state, setState] = useState<ProgressState>(() => {
    const loaded = adapter.load();
    if (!loaded) return emptyState();
    // merge to tolerate older saved shapes
    return { ...emptyState(), ...loaded, settings: { ...DEFAULT_SETTINGS, ...(loaded.settings || {}) } };
  });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    adapter.save(state);
  }, [state, adapter]);

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => setState((s) => fn(s)), []);

  const withLesson = (s: ProgressState, id: string, fn: (lp: LessonProgress) => LessonProgress): ProgressState => ({
    ...s,
    lessons: { ...s.lessons, [id]: fn(s.lessons[id] ?? blankLesson()) },
  });

  const pushActivity = (s: ProgressState, e: Omit<ActivityEvent, 'at'>): ProgressState => ({
    ...s,
    activity: [...s.activity, { ...e, at: Date.now() }].slice(-MAX_ACTIVITY),
  });

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      isComplete: (id) => isLessonComplete(state.lessons[id], state.settings),
      visitLesson: (id, moduleId) =>
        update((s) => ({
          ...s,
          currentModule: moduleId,
          history: [{ id, at: Date.now() }, ...s.history.filter((h) => h.id !== id)].slice(0, 30),
        })),
      addLessonTime: (id, seconds) =>
        update((s) => {
          if (seconds <= 0) return s;
          const next = withLesson(s, id, (lp) => ({ ...lp, secondsSpent: lp.secondsSpent + seconds }));
          return pushActivity(next, { kind: 'lesson', ref: id, label: id, seconds });
        }),
      setStudied: (id, studied) =>
        update((s) =>
          withLesson(s, id, (lp) => {
            const n = { ...lp, studied };
            if (isLessonComplete(n, s.settings) && !n.completedAt) n.completedAt = Date.now();
            if (!isLessonComplete(n, s.settings)) n.completedAt = undefined;
            return n;
          }),
        ),
      recordQuiz: (id, correct, total, label) =>
        update((s) => {
          const score = Math.round((correct / total) * 100);
          let next = withLesson(s, id, (lp) => {
            const best = !lp.quiz || score >= lp.quiz.score ? { score, correct, total, at: Date.now() } : lp.quiz;
            const n: LessonProgress = { ...lp, quiz: best, attempts: lp.attempts + 1 };
            if (isLessonComplete(n, s.settings) && !n.completedAt) n.completedAt = Date.now();
            return n;
          });
          next = pushActivity(next, { kind: 'quiz', ref: id, label: `${label}: ${score}%` });
          return next;
        }),
      toggleBookmark: (key) =>
        update((s) => ({
          ...s,
          bookmarks: s.bookmarks.includes(key) ? s.bookmarks.filter((b) => b !== key) : [key, ...s.bookmarks],
        })),
      isBookmarked: (key) => state.bookmarks.includes(key),
      log: (e) => update((s) => pushActivity(s, e)),
      recordAssessment: (r) =>
        update((s) =>
          pushActivity(
            { ...s, assessments: [...s.assessments, { ...r, at: Date.now() }] },
            { kind: 'assessment', ref: r.examId, label: `${r.title}: ${r.score}%` },
          ),
        ),
      recordCalc: (calcId, title, summary) =>
        update((s) =>
          pushActivity(
            { ...s, calcHistory: [{ calcId, title, summary, at: Date.now() }, ...s.calcHistory].slice(0, 200) },
            { kind: 'calculator', ref: calcId, label: title },
          ),
        ),
      recordCase: (caseId, correct) =>
        update((s) =>
          pushActivity(
            { ...s, casesSolved: { ...s.casesSolved, [caseId]: { correct, at: Date.now() } } },
            { kind: 'case', ref: caseId, label: caseId },
          ),
        ),
      updateSettings: (p) =>
        update((s) => {
          const settings = { ...s.settings, ...p };
          // re-evaluate completion against the new pass mark
          const lessons: ProgressState['lessons'] = {};
          for (const [id, lp] of Object.entries(s.lessons)) {
            const done = isLessonComplete(lp, settings);
            lessons[id] = { ...lp, completedAt: done ? lp.completedAt ?? Date.now() : undefined };
          }
          return { ...s, settings, lessons };
        }),
      reset: () => {
        adapter.clear();
        setState(emptyState());
      },
      importState: (s) => setState({ ...emptyState(), ...s, settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) } }),
    }),
    [state, update, adapter],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}
