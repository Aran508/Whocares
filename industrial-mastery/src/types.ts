// ---------------------------------------------------------------------------
// Core domain types for Industrial Mastery.
// Content (lessons, cases, templates, glossary) is pure data so that new
// material can be added without touching UI code.
// ---------------------------------------------------------------------------

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type ModuleId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export interface ModuleMeta {
  id: ModuleId;
  slug: string;
  title: string;
  short: string;
  department: string;
  description: string;
  outcome: string;
  icon: string; // lucide icon name (resolved in UI)
  /** Lessons that are authored in another module but are also part of this module's syllabus. */
  crossListed?: string[];
}

export interface Formula {
  expr: string;
  vars: string[];
  worked: string;
  calculatorId?: string;
}

export interface Worksheet {
  title: string;
  columns: string[];
  rows: string[][];
}

/** A hand-written calculation question: [question, correct, distractors, explanation] */
export type CalcQuestion = [string, string, string[], string];

/** Compact authoring format used in the content files. */
export interface LessonInput {
  t: string; // title
  id?: string; // explicit id (otherwise derived from title)
  ff?: string; // full form
  pr?: string; // pronunciation
  lv: 'B' | 'I' | 'A';
  d: string; // simple definition
  why: string;
  when: string;
  steps: string[];
  ex: string; // real manufacturing example
  hyd: string; // hydraulic cylinder example
  impl: string[];
  f?: Formula;
  ws?: Worksheet;
  mis: string[];
  beg: string;
  mgr: string;
  adv: string[];
  lim: string[];
  rel: string[];
  dg?: string; // diagram key
  cq?: CalcQuestion;
  tags?: string[];
}

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  order: number;
  title: string;
  fullForm?: string;
  pronunciation?: string;
  level: Level;
  definition: string;
  why: string;
  when: string;
  steps: string[];
  example: string;
  hydraulicExample: string;
  implementation: string[];
  formula?: Formula;
  worksheet: Worksheet;
  mistakes: string[];
  beginner: string;
  manager: string;
  advantages: string[];
  limitations: string[];
  related: string[];
  diagram: string;
  calcQuestion?: CalcQuestion;
  minutes: number;
  tags: string[];
}

export type QuestionType = 'mcq' | 'truefalse' | 'match' | 'diagram' | 'calc' | 'scenario';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[]; // for match: right-hand side shuffled options
  answer: number | number[]; // index (mcq/tf/diagram/calc/scenario) or mapping (match: left index -> option index)
  explanation: string;
  topic: string; // lesson id or topic tag used for weak-topic analysis
  moduleId?: ModuleId;
  diagram?: string;
  left?: string[]; // for match
}

export interface CaseStudy {
  id: string;
  title: string;
  department: string;
  level: Level;
  situation: string;
  problem: string;
  data: { label: string; value: string }[];
  investigation: string[];
  methods: string[];
  calculation?: string;
  corrective: string[];
  preventive: string[];
  outcome: string;
  decision: string;
  challenge: { question: string; options: string[]; answer: number; feedback: string };
  related: string[];
}

export interface TemplateDef {
  id: string;
  title: string;
  department: string;
  purpose: string;
  instructions: string[];
  columns: string[];
  rows: string[][];
}

export interface GlossaryTerm {
  term: string;
  fullForm?: string;
  pronunciation: string;
  meaning: string;
  department: string;
  example: string;
  related: string[];
  lessonId?: string;
}

// ---------------- Progress ----------------

export interface QuizAttempt {
  score: number; // 0..100
  correct: number;
  total: number;
  at: number;
}

export interface LessonProgress {
  studied: boolean; // learner confirmed they finished reading all sections
  quiz?: QuizAttempt; // best attempt
  attempts: number;
  completedAt?: number;
  secondsSpent: number;
}

export interface AssessmentResult {
  examId: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  at: number;
  passed: boolean;
  weakTopics: string[];
}

export interface ActivityEvent {
  at: number;
  kind: 'lesson' | 'quiz' | 'calculator' | 'assessment' | 'simulation' | 'case' | 'template';
  ref: string;
  label: string;
  seconds?: number;
}

export interface CalcHistoryEntry {
  calcId: string;
  title: string;
  summary: string;
  at: number;
}

export interface Settings {
  passMark: number; // % required on a lesson quiz for completion
  examPassMark: number;
  learnerName: string;
  compact: boolean;
}

export interface ProgressState {
  version: number;
  lessons: Record<string, LessonProgress>;
  bookmarks: string[]; // lesson ids or "case:xx", "calc:xx" ...
  history: { id: string; at: number }[]; // recently visited lessons
  activity: ActivityEvent[];
  assessments: AssessmentResult[];
  calcHistory: CalcHistoryEntry[];
  casesSolved: Record<string, { correct: boolean; at: number }>;
  currentModule?: ModuleId;
  settings: Settings;
}
