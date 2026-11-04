import type { Lesson, LessonInput, ModuleId, Level } from '../../types';
import { MODULES } from '../modules';
import { slugify } from '../../lib/rng';
import { lessons as A } from './a-fundamentals';
import { lessons as B } from './b-production';
import { lessons as C } from './c-lean';
import { lessons as D } from './d-quality';
import { lessons as E } from './e-problem-solving';
import { lessons as F } from './f-industrial-engineering';
import { lessons as G } from './g-maintenance';
import { lessons as H } from './h-supply-chain';
import { lessons as I } from './i-documentation';
import { lessons as J } from './j-npd';
import { lessons as K } from './k-project';
import { lessons as L } from './l-safety';
import { lessons as M } from './m-advanced';

const SOURCES: Record<ModuleId, LessonInput[]> = { A, B, C, D, E, F, G, H, I, J, K, L, M };

const LEVEL: Record<LessonInput['lv'], Level> = { B: 'Beginner', I: 'Intermediate', A: 'Advanced' };

const OWNERS = ['Production Engineer', 'Shift Supervisor', 'Quality Engineer', 'Maintenance Lead', 'Production Manager', 'Industrial Engineer'];
const STATUS = ['Done', 'Done', 'In progress', 'Open', 'Open', 'Open', 'Open', 'Open'];

function wordCount(i: LessonInput) {
  const all = [i.d, i.why, i.when, i.ex, i.hyd, i.beg, i.mgr, ...i.steps, ...i.impl, ...i.mis, ...i.adv, ...i.lim].join(' ');
  return all.split(/\s+/).length;
}

function build(): Lesson[] {
  const out: Lesson[] = [];
  for (const m of MODULES) {
    SOURCES[m.id].forEach((i, idx) => {
      const id = i.id ?? slugify(i.t);
      out.push({
        id,
        moduleId: m.id,
        order: idx + 1,
        title: i.t,
        fullForm: i.ff,
        pronunciation: i.pr,
        level: LEVEL[i.lv],
        definition: i.d,
        why: i.why,
        when: i.when,
        steps: i.steps,
        example: i.ex,
        hydraulicExample: i.hyd,
        implementation: i.impl,
        formula: i.f,
        worksheet: i.ws ?? {
          title: `${i.t} — implementation worksheet`,
          columns: ['#', 'Step / activity', 'Owner', 'Target', 'Status', 'Evidence / remarks'],
          rows: i.steps.map((s, k) => [String(k + 1), s, OWNERS[k % OWNERS.length], `Week ${k + 1}`, STATUS[k] ?? 'Open', k < 2 ? 'Recorded on shop-floor board' : '']),
        },
        mistakes: i.mis,
        beginner: i.beg,
        manager: i.mgr,
        advantages: i.adv,
        limitations: i.lim,
        related: i.rel,
        diagram: i.dg ?? 'steps',
        calcQuestion: i.cq,
        minutes: Math.max(6, Math.round(wordCount(i) / 110) + 4),
        tags: i.tags ?? [],
      });
    });
  }
  return out;
}

export const LESSONS: Lesson[] = build();

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
export const lessonById = (id: string) => BY_ID.get(id);

/** Lessons of a module including cross-listed lessons authored in other modules. */
export function lessonsOfModule(moduleId: string): Lesson[] {
  const m = MODULES.find((x) => x.id === moduleId);
  const own = LESSONS.filter((l) => l.moduleId === moduleId);
  const cross = (m?.crossListed ?? []).map((id) => BY_ID.get(id)).filter(Boolean) as Lesson[];
  return [...own, ...cross];
}

export const ownLessonsOfModule = (moduleId: string) => LESSONS.filter((l) => l.moduleId === moduleId);

/** Resolve a "related" label to a lesson when possible (by id or by title). */
export function resolveRelated(label: string): Lesson | undefined {
  const s = slugify(label);
  return BY_ID.get(s) ?? LESSONS.find((l) => slugify(l.title) === s || l.title.toLowerCase().includes(label.toLowerCase()));
}

export function nextLesson(id: string): Lesson | undefined {
  const l = BY_ID.get(id);
  if (!l) return undefined;
  const list = ownLessonsOfModule(l.moduleId);
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0 && i < list.length - 1) return list[i + 1];
  const mi = MODULES.findIndex((m) => m.id === l.moduleId);
  const nm = MODULES[mi + 1];
  return nm ? ownLessonsOfModule(nm.id)[0] : undefined;
}

export function prevLesson(id: string): Lesson | undefined {
  const l = BY_ID.get(id);
  if (!l) return undefined;
  const list = ownLessonsOfModule(l.moduleId);
  const i = list.findIndex((x) => x.id === id);
  if (i > 0) return list[i - 1];
  const mi = MODULES.findIndex((m) => m.id === l.moduleId);
  const pm = MODULES[mi - 1];
  if (!pm) return undefined;
  const pl = ownLessonsOfModule(pm.id);
  return pl[pl.length - 1];
}
