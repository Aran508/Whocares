import { EXAMS, buildExam, CALC_GENERATORS } from '../src/lib/exams';
import { lessonById, resolveRelated, LESSONS } from '../src/data/lessons';
import { GLOSSARY } from '../src/data/glossary';
import { CASE_STUDIES } from '../src/data/caseStudies';
import { TEMPLATES } from '../src/data/templates';
import { analyseLine, oee, simulateInventory, applyLean, LEAN_BASELINE, playHour, SHIFT_EVENTS } from '../src/simulations/logic';
import { forward, inverse, astar, guidePath, followGuidePath, key, heatInput, weldQuality, weldCycle, boxesPerLayer, palletPlan, moveTime } from '../src/robotics/logic';
import { computeLevel } from '../src/lib/levels';
import { mulberry32 } from '../src/lib/rng';
import { search } from '../src/lib/search';
import { SIMULATIONS } from '../src/simulations/registry';

describe('content volume', () => {
  it('meets curriculum requirements', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(300);
    expect(CASE_STUDIES.length).toBeGreaterThanOrEqual(25);
    expect(TEMPLATES.length).toBe(30);
    expect(new Set(GLOSSARY.map((g) => g.term.toLowerCase())).size).toBe(GLOSSARY.length);
    for (const w of ['Heijunka', 'Hoshin Kanri', 'Gemba', 'Genchi Genbutsu', 'Jidoka', 'Muda', 'Mura', 'Muri', 'Poka-Yoke', 'Kaizen', 'Ishikawa', 'FMEA', 'Metrology', 'Ergonomics', 'Interoperability', 'Traceability', 'Standardization', 'Optimization', 'Synchronization', 'Reconciliation', 'Reliability', 'Capability', 'Variability', 'Productivity', 'Accountability', 'Operational Excellence'])
      expect(GLOSSARY.find((g) => g.term === w), w).toBeTruthy();
  });
  it('case studies and simulations reference real lessons', () => {
    for (const c of CASE_STUDIES) for (const r of c.related) expect(lessonById(r), `${c.id} → ${r}`).toBeTruthy();
    for (const s of SIMULATIONS) for (const r of s.lessonIds) expect(lessonById(r), `${s.id} → ${r}`).toBeTruthy();
  });
  it('template rows match columns', () => {
    for (const t of TEMPLATES) for (const r of t.rows) expect(r.length, t.id).toBe(t.columns.length);
  });
  it('most related labels resolve to lessons', () => {
    const all = LESSONS.flatMap((l) => l.related);
    const ok = all.filter((r) => resolveRelated(r)).length;
    expect(ok / all.length).toBeGreaterThan(0.8);
  });
  it('lesson calculator links exist', async () => {
    const { calcById } = await import('../src/calculators/defs');
    for (const l of LESSONS) if (l.formula?.calculatorId) expect(calcById(l.formula.calculatorId), l.id).toBeTruthy();
  });
});

describe('assessments', () => {
  it('every exam builds valid questions', () => {
    for (const e of EXAMS) {
      for (const attempt of [0, 1, 2]) {
        const qs = buildExam(e.id, attempt);
        expect(qs.length, e.id).toBe(e.count);
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
        for (const q of qs) {
          if (q.type === 'match') {
            expect((q.answer as number[]).every((a) => a >= 0 && a < q.options.length)).toBe(true);
            expect(new Set(q.answer as number[]).size).toBe(q.left!.length);
          } else {
            expect(q.options[q.answer as number], `${e.id} ${q.prompt}`).toBeTruthy();
            expect(q.options.length).toBeGreaterThanOrEqual(2);
          }
          if (q.type === 'diagram') expect(lessonById(q.topic), q.topic).toBeTruthy();
        }
      }
    }
  });
  it('calc generators produce 4 distinct options', () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 300; i++) {
      const g = CALC_GENERATORS[i % CALC_GENERATORS.length](rand);
      const opts = [g.correct, ...g.wrong];
      expect(new Set(opts).size, g.prompt).toBe(opts.length);
      expect(opts.length, g.prompt).toBe(4);
      expect(lessonById(g.topic), g.topic).toBeTruthy();
    }
  });
});

describe('levels', () => {
  it('progress through levels', () => {
    expect(computeLevel(0, 0, false).current.level).toBe(1);
    expect(computeLevel(10, 0, false).current.level).toBe(2);
    expect(computeLevel(40, 1, false).current.level).toBe(2);
    expect(computeLevel(40, 2, false).current.level).toBe(3);
    expect(computeLevel(300, 20, false).current.level).toBe(5);
    expect(computeLevel(300, 20, true).current.level).toBe(6);
    expect(computeLevel(0, 0, false).progressToNext).toBe(0);
    expect(computeLevel(5, 0, false).progressToNext).toBe(50);
  });
});

describe('simulations', () => {
  it('line balancing finds bottleneck and efficiency', () => {
    const a = analyseLine([{ name: 'A', time: 50, operators: 1 }, { name: 'B', time: 60, operators: 1 }, { name: 'C', time: 40, operators: 1 }, { name: 'D', time: 50, operators: 1 }], 70);
    expect(a.bottleneck).toBe('B');
    expect(a.efficiency).toBeCloseTo(83.33, 1);
    expect(a.throughputPerHour).toBeCloseTo(60, 5);
    const b = analyseLine([{ name: 'A', time: 50, operators: 1 }, { name: 'B', time: 100, operators: 2 }], 0);
    expect(b.cycle).toBe(50);
  });
  it('oee', () => {
    const r = oee(420, 60, 1, 300, 15);
    expect(r.oee).toBeCloseTo(0.679, 3);
  });
  it('inventory: generous ROP avoids stockouts, zero ROP causes them', () => {
    const base = { days: 60, demandMean: 40, demandSd: 0, leadTime: 5, orderQty: 400, initial: 400, seed: 1, maxStock: 2000 };
    expect(simulateInventory({ ...base, rop: 250 }).stockoutDays).toBe(0);
    expect(simulateInventory({ ...base, rop: 0 }).stockoutDays).toBeGreaterThan(0);
  });
  it('lean improvements improve metrics', () => {
    const m = applyLean(['cell', 'kanban', 'balance']);
    expect(m.leadTimeDays).toBeLessThan(LEAN_BASELINE.leadTimeDays);
    expect(m.outputPerShift).toBeGreaterThan(LEAN_BASELINE.outputPerShift);
  });
  it('daily production: every event plays', () => {
    let bonus = 0;
    SHIFT_EVENTS.forEach((e, i) => { const r = playHour(i + 1, i, 0, bonus); bonus = r.bonus; expect(r.rec.actual).toBeGreaterThanOrEqual(0); expect(e.options[0].good).toBe(true); });
  });
});

describe('robotics', () => {
  it('FK/IK round trip', () => {
    for (const [x, y] of [[-215, 40], [205, 70], [-215, 100], [205, 130], [0, 250]]) {
      const s = inverse(x, y, -90) ?? inverse(x, y, -90, false);
      expect(s, `${x},${y}`).toBeTruthy();
      const f = forward(s!);
      expect(f.tcp.x).toBeCloseTo(x, 4);
      expect(f.tcp.y).toBeCloseTo(y, 4);
    }
    expect(inverse(1000, 0, 0)).toBeNull();
  });
  it('move time uses slowest joint', () => {
    expect(moveTime({ j1: 0, j2: 0, j3: 0 }, { j1: 90, j2: 45, j3: 10 }, 90, 0)).toBe(1);
  });
  it('A* routes around obstacles, AGV gets blocked', () => {
    const blocked = new Set([key({ x: 2, y: 0 }), key({ x: 2, y: 1 })]);
    const p = astar(5, 4, blocked, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(p).toBeTruthy();
    expect(p!.some((c) => blocked.has(key(c)))).toBe(false);
    expect(p!.length - 1).toBe(8);
    const g = guidePath({ x: 0, y: 0 }, { x: 4, y: 0 }, 0);
    const f = followGuidePath(g, blocked);
    expect(f.blockedAt).toEqual({ x: 2, y: 0 });
  });
  it('welding heat input and quality', () => {
    expect(heatInput({ current: 220, voltage: 26, travel: 360, gas: 18 })).toBeCloseTo(0.953, 3);
    expect(weldQuality({ current: 220, voltage: 26, travel: 360, gas: 18 }).ok).toBe(true);
    expect(weldQuality({ current: 220, voltage: 26, travel: 360, gas: 10 }).issues.join(' ')).toMatch(/Porosity/);
    expect(weldQuality({ current: 200, voltage: 24, travel: 600, gas: 18 }).issues.join(' ')).toMatch(/Lack of fusion/);
    expect(weldCycle([{ id: 'a', name: 'a', length: 360 }], 360, 45, 3, 4).cycle).toBe(60 + 3 + 45);
  });
  it('palletising', () => {
    expect(boxesPerLayer(1200, 800, 400, 300)).toBe(8);
    expect(boxesPerLayer(1200, 800, 600, 400)).toBe(4);
    const p = palletPlan({ palletL: 1200, palletW: 800, maxH: 1000, boxL: 400, boxW: 300, boxH: 250, pickSec: 6, humanNearby: true, collaborativeFactor: 0.5 });
    expect(p.total).toBe(32);
    expect(p.pickTime).toBe(12);
  });
});

describe('search', () => {
  it('finds lessons, glossary and calculators', () => {
    const r = search('takt', {});
    expect(r.some((x) => x.type === 'Lesson' && x.title === 'Takt Time')).toBe(true);
    expect(r.some((x) => x.type === 'Calculator')).toBe(true);
    expect(search('heijunka', { type: 'Glossary' }).length).toBeGreaterThan(0);
    expect(search('', { type: 'Lesson', level: 'Advanced' }).every((x) => x.level === 'Advanced')).toBe(true);
  });
});
