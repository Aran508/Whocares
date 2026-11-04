import type { ModuleId, Question } from '../types';
import { LESSONS, lessonsOfModule, ownLessonsOfModule } from '../data/lessons';
import { MODULES } from '../data/modules';
import { GLOSSARY } from '../data/glossary';
import { CASE_STUDIES } from '../data/caseStudies';
import { buildLessonQuiz } from './quiz';
import { hashString, mulberry32, pick, shuffle } from './rng';

export interface ExamDef {
  id: string;
  title: string;
  description: string;
  kind: 'module' | 'comprehensive' | 'case' | 'calc';
  moduleId?: ModuleId;
  count: number;
}

export const EXAMS: ExamDef[] = [
  ...MODULES.map<ExamDef>((m) => ({ id: `module-${m.id}`, title: `Module ${m.id} test — ${m.title}`, description: `15 questions on ${m.short}: multiple choice, true/false, scenarios, calculations, diagram identification and term matching.`, kind: 'module', moduleId: m.id, count: 15 })),
  { id: 'comprehensive', title: 'Comprehensive examination', description: '40 questions across all 13 modules. Required for Level 6 — Advanced Plant Management.', kind: 'comprehensive', count: 40 },
  { id: 'case-assessment', title: 'Practical industrial case assessment', description: '10 scenario decisions drawn from the case-study library.', kind: 'case', count: 10 },
  { id: 'calc-drill', title: 'Calculation drill', description: '10 calculation problems with new numbers every attempt — takt, OEE, Cpk, EOQ, MTBF and more.', kind: 'calc', count: 10 },
];

export const examById = (id: string) => EXAMS.find((e) => e.id === id);

const r2 = (n: number, dp = 1) => Number(n.toFixed(dp));
const fmtN = (n: number, dp = 1) => r2(n, dp).toLocaleString('en-US', { maximumFractionDigits: dp });

type CalcGen = (rand: () => number) => { prompt: string; correct: string; wrong: string[]; explanation: string; topic: string; moduleId: ModuleId };
const ri = (rand: () => number, a: number, b: number) => Math.floor(a + rand() * (b - a + 1));

/** Distinct numeric distractors around the correct value. */
function distract(correct: number, rand: () => number, dp: number, unit = '', extra: number[] = []): string[] {
  const set = new Set<string>();
  const c = fmtN(correct, dp) + unit;
  const cands = [...extra, correct * 1.25, correct * 0.8, correct * 1.5, correct * 0.5, correct + 10, correct * 2];
  for (const x of shuffle(cands, rand)) {
    const s = fmtN(x, dp) + unit;
    if (s !== c && x > 0) set.add(s);
    if (set.size === 3) break;
  }
  return Array.from(set);
}

export const CALC_GENERATORS: CalcGen[] = [
  (rand) => {
    const avail = ri(rand, 4, 9) * 50, demand = ri(rand, 3, 12) * 25;
    const takt = (avail * 60) / demand;
    return { prompt: `Net available time is ${avail} min per shift and customer demand is ${demand} units per shift. What is the takt time?`, correct: `${fmtN(takt)} s`, wrong: distract(takt, rand, 1, ' s', [avail / demand]), explanation: `Takt = ${avail} × 60 ÷ ${demand} = ${fmtN(takt)} s.`, topic: 'takt-time', moduleId: 'B' };
  },
  (rand) => {
    const A = ri(rand, 80, 95), P = ri(rand, 75, 95), Q = ri(rand, 92, 99);
    const oee = (A * P * Q) / 10000;
    return { prompt: `Availability ${A}%, Performance ${P}%, Quality ${Q}%. What is the OEE?`, correct: `${fmtN(oee)}%`, wrong: distract(oee, rand, 1, '%', [(A + P + Q) / 3, Math.min(A, P, Q)]), explanation: `OEE = ${A}% × ${P}% × ${Q}% = ${fmtN(oee)}%.`, topic: 'oee', moduleId: 'B' };
  },
  (rand) => {
    const t = ri(rand, 6, 9) * 60, u = ri(rand, 8, 30) * 4;
    const ct = t / u;
    return { prompt: `A station produced ${u} units in ${t} minutes of net production time. What is the cycle time?`, correct: `${fmtN(ct, 2)} min`, wrong: distract(ct, rand, 2, ' min', [u / t]), explanation: `Cycle time = ${t} ÷ ${u} = ${fmtN(ct, 2)} min/unit.`, topic: 'cycle-time', moduleId: 'B' };
  },
  (rand) => {
    const op = ri(rand, 30, 120) * 10, f = ri(rand, 2, 8);
    return { prompt: `A machine operated ${op} hours and had ${f} failures. What is the MTBF?`, correct: `${fmtN(op / f)} h`, wrong: distract(op / f, rand, 1, ' h', [op * f / 100]), explanation: `MTBF = ${op} ÷ ${f} = ${fmtN(op / f)} h.`, topic: 'mtbf', moduleId: 'G' };
  },
  (rand) => {
    const mtbf = ri(rand, 40, 200), mttr = ri(rand, 2, 10);
    const a = (mtbf / (mtbf + mttr)) * 100;
    return { prompt: `MTBF = ${mtbf} h and MTTR = ${mttr} h. What is the availability?`, correct: `${fmtN(a)}%`, wrong: distract(a, rand, 1, '%', [((mtbf - mttr) / mtbf) * 100, (mttr / mtbf) * 100]), explanation: `A = ${mtbf} ÷ (${mtbf} + ${mttr}) = ${fmtN(a)}%.`, topic: 'equipment-availability', moduleId: 'G' };
  },
  (rand) => {
    const d = ri(rand, 2, 20) * 500, s = ri(rand, 5, 30) * 100, h = ri(rand, 2, 20) * 10;
    const eoq = Math.sqrt((2 * d * s) / h);
    return { prompt: `Annual demand ${d.toLocaleString()} units, ordering cost ₹${s} per order, holding cost ₹${h} per unit per year. What is the EOQ (nearest unit)?`, correct: `${Math.round(eoq)}`, wrong: distract(Math.round(eoq), rand, 0, '', [Math.round(Math.sqrt((d * s) / h)), Math.round((2 * d * s) / h / 100)]), explanation: `EOQ = √(2 × ${d} × ${s} ÷ ${h}) = ${fmtN(eoq, 1)} ≈ ${Math.round(eoq)}.`, topic: 'eoq', moduleId: 'H' };
  },
  (rand) => {
    const d = ri(rand, 10, 80), l = ri(rand, 3, 15), ss = ri(rand, 2, 20) * 10;
    const rop = d * l + ss;
    return { prompt: `Daily demand ${d}, lead time ${l} days, safety stock ${ss}. What is the reorder point?`, correct: `${rop}`, wrong: distract(rop, rand, 0, '', [d * l, d * l - ss, d + l + ss]), explanation: `ROP = ${d} × ${l} + ${ss} = ${rop}.`, topic: 'reorder-point', moduleId: 'H' };
  },
  (rand) => {
    const def = ri(rand, 2, 30), tot = ri(rand, 5, 60) * 1000;
    const ppm = (def / tot) * 1e6;
    return { prompt: `${def} defective parts were found in ${tot.toLocaleString()} delivered. What is the PPM?`, correct: fmtN(ppm, 0), wrong: distract(ppm, rand, 0, '', [(def / tot) * 100, ppm / 10]), explanation: `PPM = ${def} ÷ ${tot} × 1,000,000 = ${fmtN(ppm, 0)}.`, topic: 'ppm', moduleId: 'D' };
  },
  (rand) => {
    const mean = 50, sd = ri(rand, 3, 8) / 10, usl = 50 + ri(rand, 15, 35) / 10, lsl = 50 - ri(rand, 15, 35) / 10;
    const cpk = Math.min((usl - mean) / (3 * sd), (mean - lsl) / (3 * sd));
    const cp = (usl - lsl) / (6 * sd);
    return { prompt: `USL ${usl.toFixed(1)}, LSL ${lsl.toFixed(1)}, mean ${mean}, σ ${sd.toFixed(1)}. What is Cpk?`, correct: fmtN(cpk, 2), wrong: distract(cpk, rand, 2, '', [cp, Math.max((usl - mean) / (3 * sd), (mean - lsl) / (3 * sd))]), explanation: `Cpu = (${usl.toFixed(1)} − 50) ÷ ${fmtN(3 * sd, 2)}; Cpl = (50 − ${lsl.toFixed(1)}) ÷ ${fmtN(3 * sd, 2)}; Cpk = minimum = ${fmtN(cpk, 2)}.`, topic: 'cp-and-cpk', moduleId: 'D' };
  },
  (rand) => {
    const st = Array.from({ length: 4 }, () => ri(rand, 30, 70));
    const sum = st.reduce((a, b) => a + b, 0), mx = Math.max(...st);
    const eff = (sum / (st.length * mx)) * 100;
    return { prompt: `Four stations take ${st.join(', ')} seconds. What is the line efficiency?`, correct: `${fmtN(eff)}%`, wrong: distract(eff, rand, 1, '%', [(Math.min(...st) / mx) * 100]), explanation: `Σ = ${sum} s; 4 × ${mx} = ${4 * mx}; efficiency = ${sum} ÷ ${4 * mx} = ${fmtN(eff)}%.`, topic: 'line-balancing', moduleId: 'B' };
  },
  (rand) => {
    const wip = ri(rand, 10, 60) * 10, tp = ri(rand, 2, 12) * 5;
    return { prompt: `A process holds ${wip} units of WIP and completes ${tp} units per day. Using Little's Law, what is the lead time?`, correct: `${fmtN(wip / tp)} days`, wrong: distract(wip / tp, rand, 1, ' days', [wip * tp / 100]), explanation: `Lead time = WIP ÷ throughput = ${wip} ÷ ${tp} = ${fmtN(wip / tp)} days.`, topic: 'lead-time', moduleId: 'B' };
  },
  (rand) => {
    const inv = ri(rand, 5, 50) * 100000, sav = ri(rand, 2, 30) * 100000;
    const pb = inv / sav;
    return { prompt: `An improvement costs ₹${(inv / 100000).toFixed(0)} lakh and saves ₹${(sav / 100000).toFixed(0)} lakh per year. What is the payback period?`, correct: `${fmtN(pb, 2)} years`, wrong: distract(pb, rand, 2, ' years', [sav / inv]), explanation: `Payback = ${inv / 100000} ÷ ${sav / 100000} = ${fmtN(pb, 2)} years.`, topic: 'return-on-investment-roi', moduleId: 'M' };
  },
  (rand) => {
    const s = ri(rand, 4, 10), o = ri(rand, 2, 7), d = ri(rand, 2, 8);
    return { prompt: `In an FMEA, Severity = ${s}, Occurrence = ${o}, Detection = ${d}. What is the RPN?`, correct: `${s * o * d}`, wrong: distract(s * o * d, rand, 0, '', [s + o + d, s * o]), explanation: `RPN = ${s} × ${o} × ${d} = ${s * o * d}.`, topic: 'fmea', moduleId: 'D' };
  },
];

function calcQuestion(rand: () => number, i: number, prefix: string): Question {
  const g = CALC_GENERATORS[Math.floor(rand() * CALC_GENERATORS.length)](rand);
  const opts = shuffle([g.correct, ...g.wrong.slice(0, 3)], rand);
  return { id: `${prefix}-calc-${i}`, type: 'calc', prompt: g.prompt, options: opts, answer: opts.indexOf(g.correct), explanation: g.explanation, topic: g.topic, moduleId: g.moduleId };
}

const DIAGRAMS: { key: string; name: string; topic: string; moduleId: ModuleId }[] = [
  { key: 'fishbone', name: 'Fishbone (Ishikawa) diagram', topic: 'fishbone-diagram', moduleId: 'E' },
  { key: 'pareto', name: 'Pareto chart', topic: 'pareto-analysis', moduleId: 'D' },
  { key: 'control-chart', name: 'Control chart (X̄ chart)', topic: 'control-charts', moduleId: 'D' },
  { key: 'vsm', name: 'Value stream map', topic: 'value-stream-mapping-vsm', moduleId: 'C' },
  { key: 'gantt', name: 'Gantt chart', topic: 'gantt-chart', moduleId: 'K' },
  { key: 'yamazumi', name: 'Yamazumi chart', topic: 'yamazumi-chart', moduleId: 'F' },
  { key: 'risk-matrix', name: 'Risk matrix', topic: 'risk-assessment', moduleId: 'L' },
  { key: 'pdca', name: 'PDCA cycle', topic: 'pdca-cycle', moduleId: 'E' },
  { key: 'kanban-loop', name: 'Kanban loop', topic: 'kanban', moduleId: 'C' },
  { key: 'sawtooth', name: 'Inventory sawtooth with reorder point', topic: 'reorder-point', moduleId: 'H' },
  { key: 'oee-waterfall', name: 'OEE loss waterfall', topic: 'oee', moduleId: 'B' },
  { key: 'hierarchy-controls', name: 'Hierarchy of controls', topic: 'hierarchy-of-controls', moduleId: 'L' },
  { key: 'tps-house', name: 'Toyota Production System house', topic: 'toyota-production-system-tps', moduleId: 'C' },
  { key: 'cpm', name: 'Critical path network', topic: 'critical-path-method-cpm', moduleId: 'K' },
  { key: 'bathtub', name: 'Bathtub (failure-rate) curve', topic: 'equipment-reliability', moduleId: 'G' },
  { key: 'capability', name: 'Process capability distributions', topic: 'process-capability', moduleId: 'D' },
];

function diagramQuestion(rand: () => number, i: number, prefix: string, moduleId?: ModuleId): Question {
  const pool = moduleId ? DIAGRAMS.filter((d) => d.moduleId === moduleId) : DIAGRAMS;
  const d = (pool.length ? pool : DIAGRAMS)[Math.floor(rand() * (pool.length || DIAGRAMS.length))];
  const distractors = pick(DIAGRAMS.filter((x) => x.key !== d.key), 3, rand).map((x) => x.name);
  const opts = shuffle([d.name, ...distractors], rand);
  return { id: `${prefix}-diag-${i}`, type: 'diagram', prompt: 'Identify the industrial tool shown in this diagram.', diagram: d.key, options: opts, answer: opts.indexOf(d.name), explanation: `This is a ${d.name}.`, topic: d.topic, moduleId: d.moduleId };
}

function matchQuestion(rand: () => number, i: number, prefix: string, moduleId?: ModuleId): Question {
  const dept = moduleId ? MODULES.find((m) => m.id === moduleId)!.department : undefined;
  let pool = GLOSSARY.filter((g) => g.meaning.length < 140 && (!dept || g.department === dept));
  if (pool.length < 4) pool = GLOSSARY.filter((g) => g.meaning.length < 140);
  const terms = pick(pool, 4, rand);
  const meanings = shuffle(terms.map((t) => t.meaning), rand);
  return {
    id: `${prefix}-match-${i}`, type: 'match', prompt: 'Match each term to its meaning.', left: terms.map((t) => t.term), options: meanings,
    answer: terms.map((t) => meanings.indexOf(t.meaning)), explanation: terms.map((t) => `${t.term}: ${t.meaning}`).join(' '), topic: terms[0].lessonId ?? terms[0].term, moduleId,
  };
}

function lessonQuestions(lessonIds: string[], n: number, rand: () => number, seed: string): Question[] {
  const all: Question[] = [];
  for (const id of lessonIds) {
    const l = LESSONS.find((x) => x.id === id)!;
    all.push(...buildLessonQuiz(l, lessonsOfModule(l.moduleId), seed));
  }
  // one question per lesson first for coverage
  const byLesson = new Map<string, Question[]>();
  for (const q of all) byLesson.set(q.topic, [...(byLesson.get(q.topic) ?? []), q]);
  const out: Question[] = [];
  const lessons = shuffle(Array.from(byLesson.keys()), rand);
  let round = 0;
  while (out.length < n && round < 5) {
    for (const lid of lessons) {
      if (out.length >= n) break;
      const qs = byLesson.get(lid)!;
      const q = shuffle(qs, rand)[round % qs.length];
      if (!out.find((x) => x.id === q.id)) out.push(q);
    }
    round++;
  }
  return out;
}

export function buildExam(examId: string, attempt: number): Question[] {
  const e = examById(examId);
  if (!e) return [];
  const seed = `${examId}#${attempt}`;
  const rand = mulberry32(hashString(seed));
  const uid = (qs: Question[]) => qs.map((q, i) => ({ ...q, id: `${examId}-${attempt}-${i}-${q.id}` }));

  if (e.kind === 'module') {
    const ids = ownLessonsOfModule(e.moduleId!).map((l) => l.id);
    return uid(shuffle([...lessonQuestions(ids, 11, rand, seed), calcQuestion(rand, 0, seed), calcQuestion(rand, 1, seed), diagramQuestion(rand, 0, seed, e.moduleId), matchQuestion(rand, 0, seed, e.moduleId)], rand));
  }
  if (e.kind === 'comprehensive') {
    const perModule = MODULES.flatMap((m) => pick(ownLessonsOfModule(m.id).map((l) => l.id), 3, rand));
    const lq = lessonQuestions(perModule, 28, rand, seed);
    const extra = [0, 1, 2, 3].map((i) => calcQuestion(rand, i, seed)).concat([0, 1, 2, 3].map((i) => diagramQuestion(rand, i, seed))).concat([0, 1, 2, 3].map((i) => matchQuestion(rand, i, seed)));
    return uid(shuffle([...lq, ...extra], rand));
  }
  if (e.kind === 'case') {
    return uid(
      pick(CASE_STUDIES, e.count, rand).map((c, i) => ({
        id: `case-${i}`, type: 'scenario' as const, prompt: `${c.title}: ${c.problem} — ${c.challenge.question}`, options: c.challenge.options, answer: c.challenge.answer, explanation: c.challenge.feedback, topic: c.related[0] ?? c.id,
      })),
    );
  }
  return uid(Array.from({ length: e.count }, (_, i) => calcQuestion(rand, i, seed)));
}
