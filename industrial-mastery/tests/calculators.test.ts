import { CALCULATORS, calcById } from '../src/calculators/defs';
import { runCalc, validate, invNorm, type CalcResult } from '../src/calculators/engine';

const run = (id: string, raw: Record<string, string | number>, units: Record<string, number> = {}) => {
  const def = calcById(id)!;
  const s: Record<string, string> = {};
  for (const i of def.inputs) s[i.key] = String(raw[i.key] ?? i.default);
  const { values, errors } = validate(def, s, units);
  if (Object.keys(errors).length) return { errors };
  return runCalc(def, values) as CalcResult & { error?: string };
};
const head = (x: any) => x.headline?.value;
const extra = (x: any, label: string) => x.extra?.find((e: any) => e.label === label)?.value;

describe('calculators', () => {
  it('has 33 calculators with unique ids, defaults compute without error', () => {
    expect(CALCULATORS.length).toBe(33);
    expect(new Set(CALCULATORS.map((c) => c.id)).size).toBe(33);
    for (const c of CALCULATORS) {
      const res: any = run(c.id, {});
      expect(res.errors, c.id).toBeUndefined();
      expect(res.error, c.id).toBeUndefined();
      expect(res.steps.length, c.id).toBeGreaterThan(0);
    }
  });
  it('cycle time', () => expect(head(run('cycle-time', { time: 480, units: 120 }))).toBe('4 min/unit'));
  it('cycle time with hours unit', () => expect(head(run('cycle-time', { time: 8, units: 120 }, { time: 1 }))).toBe('4 min/unit'));
  it('takt time', () => expect(head(run('takt-time', { shift: 450, breaks: 0, shifts: 1, demand: 900 }))).toBe('30 s/unit'));
  it('capacity', () => { const x = run('capacity', { time: 900, eff: 90, tpu: 9, demand: 110 }); expect(head(x)).toBe('90 units'); expect(extra(x, 'Load vs demand')).toBe('122.2%'); });
  it('efficiency', () => expect(head(run('efficiency', { actual: 66, worked: 450, std: 6 }))).toBe('88%'));
  it('OEE', () => { const x = run('oee', { planned: 420, down: 60, ict: 1, total: 300, rej: 15 }); expect(extra(x, 'Availability')).toBe('85.7%'); expect(extra(x, 'Performance')).toBe('83.3%'); expect(extra(x, 'Quality')).toBe('95%'); expect(head(x)).toBe('67.9%'); });
  it('OEE rejects impossible performance', () => expect((run('oee', { planned: 100, down: 0, ict: 2, total: 100, rej: 0 }) as any).error).toMatch(/Performance/));
  it('utilization', () => expect(head(run('utilization', { avail: 480, run: 384 }))).toBe('80%'));
  it('labour productivity', () => expect(head(run('labour-productivity', { out: 1500, workers: 10, hours: 30 }))).toBe('5 units/labour-hour'));
  it('line balancing', () => { const x = run('line-balancing', { list: '50, 60, 40, 50', takt: 0 }); expect(head(x)).toBe('83.3%'); });
  it('line balancing min stations', () => { const x = run('line-balancing', { list: '60,68,55,62,55', takt: 70 }); expect(head(x)).toBe('88.2%'); expect(extra(x, 'Min. stations at takt')).toBe('5'); });
  it('bottleneck', () => { const x = run('bottleneck', { list: 'A: 120\nB: 200\nC: 144\nD: 90' }); expect(head(x)).toBe('B — 18 units/h'); });
  it('bottleneck parallel machines', () => { const x = run('bottleneck', { list: 'A: 120\nB: 200 x 2\nC: 144' }); expect(head(x)).toBe('C — 25 units/h'); });
  it("lead time (Little's law)", () => expect(head(run('lead-time', { wip: 600, tp: 50, va: 90, day: 16 }))).toBe('12 working days'));
  it('downtime', () => expect(head(run('downtime', { planned: 450, down: 54, stops: 6, ct: 4 }))).toBe('12%'));
  it('changeover', () => expect(head(run('changeover', { internal: 70, per: 10, conv: 50, ct: 5 }))).toBe('350 min/week'));
  it('rejection', () => expect(head(run('rejection', { rej: 48, total: 1600, cost: 0 }))).toBe('3%'));
  it('ppm', () => expect(head(run('ppm', { def: 5, total: 20000 }))).toBe('250'));
  it('fpy & rty', () => { const x = run('fpy', { in: 200, pass: 188, steps: '98, 95, 97' }); expect(head(x)).toBe('94%'); expect(extra(x, 'Rolled throughput yield')).toBe('90.3%'); });
  it('dpmo / sigma', () => { const x = run('defect-rate', { def: 45, units: 1500, opp: 10 }); expect(extra(x, 'DPMO')).toBe('3,000'); expect(head(x)).toBe('4.25σ'); });
  it('sigma reference 3.4 DPMO ≈ 6σ', () => { expect(invNorm(1 - 3.4e-6) + 1.5).toBeCloseTo(6, 1); });
  it('cp', () => expect(head(run('cp', { usl: 10.05, lsl: 9.95, sd: 0.01 }))).toBe('1.667'));
  it('cpk', () => { const x = run('cpk', { usl: 52, lsl: 48, mean: 50, sd: 0.5 }); expect(head(x)).toBe('1.333'); });
  it('cpk off-centre', () => { const x = run('cpk', { usl: 10.05, lsl: 9.95, mean: 10.02, sd: 0.01 }); expect(head(x)).toBe('1'); expect(extra(x, 'Cp')).toBe('1.667'); });
  it('pareto', () => { const x = run('pareto', { list: 'A: 50\nB: 30\nC: 15\nD: 5' }); expect(head(x)).toBe('A, B'); expect(extra(x, 'Share of total')).toBe('80%'); });
  it('copq', () => { const x = run('copq', { scrap: 40000, rework: 25000, reinsp: 0, warranty: 60000, returns: 0, penalty: 0, sales: 1000000 }); expect(head(x)).toBe('₹125,000'); });
  it('mtbf', () => expect(head(run('mtbf', { op: 600, f: 5 }))).toBe('120 h'));
  it('mttr', () => expect(head(run('mttr', { t: 8, nr: 4 }))).toBe('2 h'));
  it('availability', () => expect(head(run('availability', { mtbf: 95, mttr: 5 }))).toBe('95%'));
  it('maintenance cost', () => expect(head(run('maintenance-cost', { lh: 10, rate: 100, spares: 1000, contr: 0, dh: 2, dc: 500 }))).toBe('₹3,000'));
  it('eoq', () => expect(head(run('eoq', { d: 2000, s: 100, c: 50, h: 20 }))).toBe('200 units'));
  it('safety stock 95%', () => expect(head(run('safety-stock', { sl: '95', sd: 20, l: 9 }))).toBe('99 units'));
  it('rop', () => expect(head(run('rop', { d: 30, l: 5, ss: 50, stock: 500 }))).toBe('200 units'));
  it('inventory turnover', () => expect(head(run('inventory-turnover', { cogs: 48, open: 8, close: 8 }))).toBe('6 turns/yr'));
  it('abc', () => { const x = run('abc', { list: 'X: 700\nY: 200\nZ: 60\nW: 40', a: 80, b: 95 }); expect(head(x)).toBe('X, Y'); });
  it('roi', () => expect(head(run('roi', { inv: 500000, ben: 400000, yrs: 2 }))).toBe('60%'));
  it('payback', () => expect(head(run('payback', { inv: 2200000, sav: 1800000 }))).toBe('1.22 years'));
  it('cost savings', () => expect(head(run('cost-savings', { old: 100, new: 90, vol: 1000, once: 0 }))).toBe('₹10,000'));
  it('productivity improvement', () => expect(head(run('productivity-improvement', { o1: 9600, i1: 48000, o2: 11000, i2: 50000 }))).toBe('+10%'));
  it('validation catches bad input', () => { const x: any = run('mtbf', { op: 'abc', f: 2 }); expect(x.errors.op).toBeTruthy(); const y: any = run('mtbf', { op: 10, f: 0 }); expect(y.errors.f).toBeTruthy(); });
});
