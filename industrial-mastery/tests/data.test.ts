import { LESSONS, lessonsOfModule } from '../src/data/lessons';
import { MODULES } from '../src/data/modules';
import { buildLessonQuiz } from '../src/lib/quiz';

describe('lesson data integrity', () => {
  it('has unique lesson ids', () => {
    const ids = LESSONS.map((l) => l.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });
  it('every cross-listed id exists', () => {
    for (const m of MODULES) for (const id of m.crossListed ?? []) expect(LESSONS.find((l) => l.id === id), id).toBeTruthy();
  });
  it('every lesson has substantive content', () => {
    for (const l of LESSONS) {
      expect(l.steps.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.mistakes.length, l.id).toBeGreaterThanOrEqual(1);
      expect(l.definition.length, l.id).toBeGreaterThan(40);
      expect(l.manager.length, l.id).toBeGreaterThan(40);
      expect(l.related.length, l.id).toBeGreaterThan(0);
    }
  });
  it('every lesson quiz has 5 valid questions', () => {
    for (const m of MODULES) {
      const sib = lessonsOfModule(m.id);
      for (const l of sib.filter((x) => x.moduleId === m.id)) {
        const q = buildLessonQuiz(l, sib);
        expect(q.length).toBe(5);
        for (const x of q) {
          expect(typeof x.answer).toBe('number');
          expect(x.options[x.answer as number], `${l.id} ${x.id}`).toBeTruthy();
          expect(new Set(x.options).size, `${l.id} ${x.id} duplicate options`).toBe(x.options.length);
        }
      }
    }
  });
  it('prints stats', () => {
    console.log('lessons', LESSONS.length, MODULES.map((m) => `${m.id}:${lessonsOfModule(m.id).length}`).join(' '));
    console.log('diagrams', Array.from(new Set(LESSONS.map((l) => l.diagram))).sort().join(','));
  });
});
