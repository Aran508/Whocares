import { LESSONS } from '../data/lessons';
import { MODULES, moduleById } from '../data/modules';
import { GLOSSARY } from '../data/glossary';
import { CALCULATORS } from '../calculators/defs';
import { TEMPLATES } from '../data/templates';
import { CASE_STUDIES } from '../data/caseStudies';
import { SIMULATIONS } from '../simulations/registry';
import { ROBOT_LABS } from '../robotics/registry';

export type ResultType = 'Course' | 'Lesson' | 'Glossary' | 'Calculator' | 'Template' | 'Case study' | 'Simulation' | 'Robotics lab';

export interface SearchItem {
  type: ResultType;
  title: string;
  to: string;
  text: string;
  department: string;
  level?: string;
  methodology?: string;
}

const METHOD_RE = /(lean|six sigma|tpm|kaizen|5s|kanban|smed|fmea|8d|dmaic|pdca|a3|vsm|spc|toc|jit|poka|apqp|hoshin|agile|waterfall)/i;

export const SEARCH_INDEX: SearchItem[] = [
  ...MODULES.map((m) => ({ type: 'Course' as const, title: m.title, to: `/modules/${m.slug}`, text: `${m.description} ${m.outcome}`, department: m.department })),
  ...LESSONS.map((l) => ({
    type: 'Lesson' as const, title: l.title, to: `/lessons/${l.id}`, text: `${l.fullForm ?? ''} ${l.definition} ${l.why} ${l.example} ${l.hydraulicExample} ${l.related.join(' ')}`, department: moduleById(l.moduleId)!.department, level: l.level,
    methodology: (l.title.match(METHOD_RE)?.[1] ?? l.related.join(' ').match(METHOD_RE)?.[1])?.toUpperCase(),
  })),
  ...GLOSSARY.map((g) => ({ type: 'Glossary' as const, title: g.term, to: `/glossary?q=${encodeURIComponent(g.term)}`, text: `${g.fullForm ?? ''} ${g.meaning} ${g.example}`, department: g.department })),
  ...CALCULATORS.map((c) => ({ type: 'Calculator' as const, title: c.title, to: `/calculators/${c.id}`, text: `${c.description} ${c.formula}`, department: c.category === 'Quality' ? 'Quality' : c.category === 'Maintenance' ? 'Maintenance' : c.category === 'Inventory' ? 'Supply Chain' : c.category === 'Finance' ? 'Management' : 'Production' })),
  ...TEMPLATES.map((t) => ({ type: 'Template' as const, title: t.title, to: `/templates/${t.id}`, text: `${t.purpose} ${t.columns.join(' ')}`, department: t.department })),
  ...CASE_STUDIES.map((c) => ({ type: 'Case study' as const, title: c.title, to: `/cases/${c.id}`, text: `${c.situation} ${c.problem} ${c.methods.join(' ')}`, department: c.department, level: c.level })),
  ...SIMULATIONS.map((s) => ({ type: 'Simulation' as const, title: s.title, to: `/simulations/${s.id}`, text: s.description, department: s.department })),
  ...ROBOT_LABS.map((s) => ({ type: 'Robotics lab' as const, title: s.title, to: `/robotics/${s.id}`, text: s.description, department: 'Engineering' })),
];

export function search(q: string, filters: { type?: string; level?: string; department?: string; methodology?: string }) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const out: { item: SearchItem; score: number }[] = [];
  for (const item of SEARCH_INDEX) {
    if (filters.type && filters.type !== 'All' && item.type !== filters.type) continue;
    if (filters.level && filters.level !== 'All' && item.level !== filters.level) continue;
    if (filters.department && filters.department !== 'All' && item.department !== filters.department) continue;
    if (filters.methodology && filters.methodology !== 'All' && item.methodology !== filters.methodology) continue;
    if (!terms.length) {
      out.push({ item, score: 0 });
      continue;
    }
    const t = item.title.toLowerCase();
    const x = item.text.toLowerCase();
    let score = 0;
    let all = true;
    for (const term of terms) {
      if (t === term) score += 20;
      else if (t.startsWith(term)) score += 10;
      else if (t.includes(term)) score += 6;
      else if (x.includes(term)) score += 1;
      else all = false;
    }
    if (all && score > 0) out.push({ item, score: score + (item.type === 'Lesson' ? 1 : 0) });
  }
  return out.sort((a, b) => b.score - a.score).map((o) => o.item);
}

export const SEARCH_TYPES: ResultType[] = ['Course', 'Lesson', 'Glossary', 'Calculator', 'Template', 'Case study', 'Simulation', 'Robotics lab'];
export const SEARCH_DEPARTMENTS = Array.from(new Set(SEARCH_INDEX.map((s) => s.department))).sort();
export const SEARCH_METHODS = Array.from(new Set(SEARCH_INDEX.map((s) => s.methodology).filter(Boolean) as string[])).sort();
