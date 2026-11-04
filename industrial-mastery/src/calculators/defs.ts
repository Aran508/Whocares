import { CalcError, invNorm, p, parseLabelledList, r, TIME_HOUR, TIME_MIN, TIME_SEC, type CalculatorDef } from './engine';

const n = (v: number | string) => Number(v);
const nz = (v: number, name: string) => {
  if (v === 0) throw new CalcError(`${name} cannot be zero`);
  return v;
};

export const CALCULATORS: CalculatorDef[] = [
  // ------------------------------------------------------------- PRODUCTION
  {
    id: 'cycle-time', title: 'Cycle Time Calculator', category: 'Production', lessonId: 'cycle-time',
    description: 'Actual time per unit at an operation, from production time and output.',
    formula: 'Cycle time = Net production time ÷ Units produced',
    assumptions: ['Net production time excludes planned breaks and unplanned stops you want to analyse separately.', 'Units counted at the output of the operation.', 'Cycle time is NOT takt time (demand-based) or lead time (total flow time).'],
    example: '420 min of running time produced 105 cylinders → cycle time = 4 min/unit.',
    inputs: [
      { key: 'time', label: 'Net production time', default: 420, units: TIME_MIN, min: 0 },
      { key: 'units', label: 'Units produced', default: 105, unit: 'units', min: 1 },
    ],
    compute: (v) => {
      const t = n(v.time), u = nz(n(v.units), 'Units');
      const ct = t / u;
      return {
        headline: { label: 'Cycle time', value: `${r(ct, 3)} min/unit` },
        extra: [{ label: 'In seconds', value: `${r(ct * 60, 1)} s/unit` }, { label: 'Rate', value: `${r(60 / ct, 2)} units/hour` }],
        steps: [`Net production time = ${r(t)} min`, `Cycle time = ${r(t)} ÷ ${r(u, 0)} = ${r(ct, 3)} min`, `= ${r(ct, 3)} × 60 = ${r(ct * 60, 1)} s`, `Hourly rate = 60 ÷ ${r(ct, 3)} = ${r(60 / ct, 2)} units/h`],
        interpretation: `The operation completes one unit every ${r(ct * 60, 1)} seconds. Compare this with the takt time: if cycle time is greater than takt, this operation cannot meet demand without overtime or improvement.`,
        status: 'neutral',
      };
    },
  },
  {
    id: 'takt-time', title: 'Takt Time Calculator', category: 'Production', lessonId: 'takt-time',
    description: 'Pace of production required to meet customer demand.',
    formula: 'Takt time = Net available production time ÷ Customer demand',
    assumptions: ['Net available time = shift time − planned breaks/meetings (not unplanned downtime).', 'Demand is for the same period as the available time.'],
    example: '2 shifts × 480 min − 2 × 30 min breaks = 900 min; demand 450 units → takt = 2 min (120 s).',
    inputs: [
      { key: 'shift', label: 'Shift length', default: 480, units: TIME_MIN, min: 1 },
      { key: 'breaks', label: 'Planned breaks per shift', default: 30, units: TIME_MIN, min: 0 },
      { key: 'shifts', label: 'Shifts per day', default: 2, unit: 'shifts', min: 1, integer: true },
      { key: 'demand', label: 'Customer demand per day', default: 450, unit: 'units', min: 1 },
    ],
    compute: (v) => {
      const avail = (n(v.shift) - n(v.breaks)) * n(v.shifts);
      if (avail <= 0) throw new CalcError('Breaks must be shorter than the shift');
      const takt = avail / n(v.demand);
      return {
        headline: { label: 'Takt time', value: `${r(takt * 60, 1)} s/unit` },
        extra: [{ label: 'In minutes', value: `${r(takt, 3)} min/unit` }, { label: 'Net available time', value: `${r(avail)} min/day` }, { label: 'Required rate', value: `${r(60 / takt, 2)} units/h` }],
        steps: [`Net available per shift = ${r(n(v.shift))} − ${r(n(v.breaks))} = ${r(n(v.shift) - n(v.breaks))} min`, `Net available per day = ${r(n(v.shift) - n(v.breaks))} × ${n(v.shifts)} = ${r(avail)} min`, `Takt = ${r(avail)} ÷ ${r(n(v.demand), 0)} = ${r(takt, 3)} min = ${r(takt * 60, 1)} s`],
        interpretation: `To meet demand, one unit must leave the line every ${r(takt * 60, 1)} s. Every station's cycle time must be at or below this value; design to about 85–95% of takt to absorb variation.`,
      };
    },
  },
  {
    id: 'capacity', title: 'Production Capacity Calculator', category: 'Production', lessonId: 'capacity-planning',
    description: 'How many units a resource can produce, and its load against demand.',
    formula: 'Capacity = Available time × Efficiency ÷ Time per unit;  Load % = Demand ÷ Capacity × 100',
    assumptions: ['Efficiency/availability factor covers expected losses (breakdowns, setups, speed).', 'Time per unit is the standard time at this resource.'],
    example: '900 min × 90% ÷ 9 min = 90 cylinders/day; demand 110 → load 122%.',
    inputs: [
      { key: 'time', label: 'Available time per period', default: 900, units: TIME_MIN, min: 0 },
      { key: 'eff', label: 'Efficiency / availability factor', default: 90, unit: '%', min: 1, max: 100 },
      { key: 'tpu', label: 'Standard time per unit', default: 9, units: TIME_MIN, min: 0.0001 },
      { key: 'demand', label: 'Demand in the same period', default: 110, unit: 'units', min: 0 },
    ],
    compute: (v) => {
      const eff = n(v.eff) / 100;
      const cap = (n(v.time) * eff) / n(v.tpu);
      const load = cap > 0 ? (n(v.demand) / cap) * 100 : Infinity;
      return {
        headline: { label: 'Capacity', value: `${r(cap, 1)} units` },
        extra: [{ label: 'Load vs demand', value: p(load) }, { label: 'Gap', value: `${r(cap - n(v.demand), 1)} units` }],
        steps: [`Effective time = ${r(n(v.time))} × ${r(eff, 2)} = ${r(n(v.time) * eff)} min`, `Capacity = ${r(n(v.time) * eff)} ÷ ${r(n(v.tpu), 3)} = ${r(cap, 2)} units`, `Load = ${r(n(v.demand))} ÷ ${r(cap, 2)} × 100 = ${p(load)}`],
        interpretation: load > 100 ? `Overloaded by ${p(load - 100)}. Options: recover OEE losses, overtime/extra shift, method improvement, outsourcing, or investment — in that order of cost.` : load > 85 ? 'Load is high (85–100%). There is little buffer for variation; protect this resource as a potential bottleneck.' : 'Load is comfortable. Spare capacity can absorb variation or new business.',
        status: load > 100 ? 'bad' : load > 85 ? 'warn' : 'good',
      };
    },
  },
  {
    id: 'efficiency', title: 'Production Efficiency Calculator', category: 'Production', lessonId: 'production-efficiency',
    description: 'Actual output compared with standard output for the time worked.',
    formula: 'Efficiency % = Actual output ÷ Standard output × 100;  Standard output = Time worked ÷ Standard time',
    assumptions: ['Standard time is correct and includes allowances.', 'Actual output counts good units only.'],
    example: 'Worked 450 min, standard time 6 min → standard output 75; actual 66 → efficiency 88%.',
    inputs: [
      { key: 'actual', label: 'Actual good output', default: 66, unit: 'units', min: 0 },
      { key: 'worked', label: 'Time worked', default: 450, units: TIME_MIN, min: 0.0001 },
      { key: 'std', label: 'Standard time per unit', default: 6, units: TIME_MIN, min: 0.0001 },
    ],
    compute: (v) => {
      const so = n(v.worked) / n(v.std);
      const e = (n(v.actual) / so) * 100;
      return {
        headline: { label: 'Production efficiency', value: p(e) },
        extra: [{ label: 'Standard output', value: `${r(so, 1)} units` }, { label: 'Earned standard hours', value: `${r((n(v.actual) * n(v.std)) / 60, 2)} h` }],
        steps: [`Standard output = ${r(n(v.worked))} ÷ ${r(n(v.std), 3)} = ${r(so, 2)} units`, `Efficiency = ${r(n(v.actual))} ÷ ${r(so, 2)} × 100 = ${p(e)}`],
        interpretation: e > 120 ? 'Above 120% usually means the standard time is too loose — review the standard.' : e >= 90 ? 'Good efficiency against standard.' : e >= 75 ? 'Below standard: check waiting, material, method and skill losses.' : 'Well below standard: investigate major losses or an incorrect standard.',
        status: e > 120 ? 'warn' : e >= 90 ? 'good' : e >= 75 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'oee', title: 'OEE Calculator', category: 'Production', lessonId: 'oee',
    description: 'Overall Equipment Effectiveness = Availability × Performance × Quality.',
    formula: 'A = Run time ÷ Planned time;  P = (Ideal CT × Total count) ÷ Run time;  Q = Good ÷ Total;  OEE = A × P × Q',
    assumptions: ['Planned production time excludes planned breaks and planned no-production time.', 'Ideal cycle time is the fastest theoretical cycle, not a standard with allowances.', 'Total count includes rejected units.'],
    example: 'Planned 420 min, downtime 60 min, ideal CT 1 min, 300 units, 15 rejects → OEE 67.9%.',
    inputs: [
      { key: 'planned', label: 'Planned production time', default: 420, units: TIME_MIN, min: 0.0001 },
      { key: 'down', label: 'Downtime (stops)', default: 60, units: TIME_MIN, min: 0 },
      { key: 'ict', label: 'Ideal cycle time', default: 1, units: TIME_MIN, min: 0.0001 },
      { key: 'total', label: 'Total units produced', default: 300, unit: 'units', min: 0 },
      { key: 'rej', label: 'Rejected units', default: 15, unit: 'units', min: 0 },
    ],
    compute: (v) => {
      const planned = n(v.planned), down = n(v.down), run = planned - down;
      if (run <= 0) throw new CalcError('Downtime must be less than planned production time');
      const total = n(v.total), rej = n(v.rej);
      if (rej > total) throw new CalcError('Rejected units cannot exceed total units');
      const A = run / planned;
      const P = total > 0 ? (n(v.ict) * total) / run : 0;
      if (P > 1.0001) throw new CalcError(`Performance would be ${p(P * 100)} (> 100%). Check the ideal cycle time — it must be the fastest possible cycle.`);
      const Q = total > 0 ? (total - rej) / total : 0;
      const oee = A * P * Q * 100;
      return {
        headline: { label: 'OEE', value: p(oee) },
        extra: [{ label: 'Availability', value: p(A * 100) }, { label: 'Performance', value: p(P * 100) }, { label: 'Quality', value: p(Q * 100) }, { label: 'Fully productive time', value: `${r((n(v.ict) * (total - rej)), 1)} min` }],
        steps: [`Run time = ${r(planned)} − ${r(down)} = ${r(run)} min`, `Availability = ${r(run)} ÷ ${r(planned)} = ${p(A * 100)}`, `Performance = (${r(n(v.ict), 3)} × ${r(total, 0)}) ÷ ${r(run)} = ${p(P * 100)}`, `Quality = (${r(total, 0)} − ${r(rej, 0)}) ÷ ${r(total, 0)} = ${p(Q * 100)}`, `OEE = ${r(A, 4)} × ${r(P, 4)} × ${r(Q, 4)} = ${p(oee)}`],
        interpretation: `${oee >= 85 ? 'World-class level (≥ 85%).' : oee >= 60 ? 'Typical level (60–85%) — significant hidden capacity remains.' : 'Low OEE (< 60%) — large losses.'} The weakest factor is ${[['Availability', A], ['Performance', P], ['Quality', Q]].sort((a, b) => (a[1] as number) - (b[1] as number))[0][0]}; start improvement there.`,
        status: oee >= 85 ? 'good' : oee >= 60 ? 'warn' : 'bad',
        chart: [{ label: 'Availability', value: A * 100 }, { label: 'Performance', value: P * 100 }, { label: 'Quality', value: Q * 100 }, { label: 'OEE', value: oee }],
      };
    },
  },
  {
    id: 'utilization', title: 'Machine Utilization Calculator', category: 'Production', lessonId: 'machine-utilization',
    description: 'Share of available time a machine actually operates.',
    formula: 'Utilization % = Actual operating time ÷ Available time × 100',
    assumptions: ['Available time = scheduled time the machine could run.'],
    example: '360 min running of 450 min available → 80%.',
    inputs: [
      { key: 'avail', label: 'Available time', default: 450, units: TIME_MIN, min: 0.0001 },
      { key: 'run', label: 'Actual operating time', default: 360, units: TIME_MIN, min: 0 },
    ],
    compute: (v) => {
      const u = (n(v.run) / n(v.avail)) * 100;
      if (u > 100) throw new CalcError('Operating time cannot exceed available time');
      return {
        headline: { label: 'Utilization', value: p(u) },
        extra: [{ label: 'Idle time', value: `${r(n(v.avail) - n(v.run))} min` }],
        steps: [`Utilization = ${r(n(v.run))} ÷ ${r(n(v.avail))} × 100 = ${p(u)}`],
        interpretation: 'High utilization matters on the bottleneck. On non-bottlenecks, running only to look busy creates WIP. Use OEE to see speed and quality losses too.',
        status: u >= 85 ? 'good' : u >= 65 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'labour-productivity', title: 'Labour Productivity Calculator', category: 'Production', lessonId: 'labour-productivity',
    description: 'Output per labour hour.',
    formula: 'Labour productivity = Output ÷ (Workers × Hours per worker)',
    assumptions: ['Labour hours include all direct workers assigned to the output.'],
    example: '2,400 units by 20 workers × 30 h = 600 h → 4 units per labour hour.',
    inputs: [
      { key: 'out', label: 'Output', default: 2400, unit: 'units', min: 0 },
      { key: 'workers', label: 'Number of workers', default: 20, unit: 'people', min: 1 },
      { key: 'hours', label: 'Hours per worker', default: 30, units: TIME_HOUR, min: 0.0001 },
    ],
    compute: (v) => {
      const lh = n(v.workers) * n(v.hours);
      const lp = n(v.out) / lh;
      return {
        headline: { label: 'Labour productivity', value: `${r(lp, 3)} units/labour-hour` },
        extra: [{ label: 'Total labour hours', value: `${r(lh)} h` }, { label: 'Labour time per unit', value: `${r(60 / lp, 2)} min` }],
        steps: [`Labour hours = ${r(n(v.workers), 0)} × ${r(n(v.hours))} = ${r(lh)} h`, `Productivity = ${r(n(v.out))} ÷ ${r(lh)} = ${r(lp, 3)} units/h`],
        interpretation: 'Compare with previous periods on the same product mix. Improve by removing waiting, searching and walking — not by raising pace.',
      };
    },
  },
  {
    id: 'line-balancing', title: 'Line Balancing Calculator', category: 'Production', lessonId: 'line-balancing',
    description: 'Line efficiency, balance loss and bottleneck from station times.',
    formula: 'Line efficiency = Σ station times ÷ (Stations × Bottleneck time) × 100;  Min. stations = ⌈Σ times ÷ Takt⌉',
    assumptions: ['One operator per station.', 'Station times are average cycle times in seconds.', 'Takt is optional (enter 0 to skip).'],
    example: 'Stations 60, 68, 55, 62, 55 s, takt 70 s → efficiency 88.2%, theoretical min. 5 stations.',
    inputs: [
      { key: 'list', label: 'Station times (seconds)', type: 'list', default: 'Cutting: 60\nFacing: 68\nChamfering: 55\nWelding: 62\nAssembly: 55', help: 'One per line as "name: seconds", or comma-separated numbers.' },
      { key: 'takt', label: 'Takt time (0 = not used)', default: 70, units: TIME_SEC, min: 0 },
    ],
    compute: (v) => {
      const st = parseLabelledList(String(v.list), 2);
      const sum = st.reduce((a, b) => a + b.value, 0);
      const bn = st.reduce((a, b) => (b.value > a.value ? b : a));
      if (bn.value === 0) throw new CalcError('Station times must be greater than zero');
      const eff = (sum / (st.length * bn.value)) * 100;
      const takt = n(v.takt);
      const idle = st.map((s) => ({ ...s, idle: bn.value - s.value }));
      const steps = [`Σ station times = ${st.map((s) => r(s.value)).join(' + ')} = ${r(sum)} s`, `Bottleneck = ${bn.label} (${r(bn.value)} s)`, `Efficiency = ${r(sum)} ÷ (${st.length} × ${r(bn.value)}) × 100 = ${p(eff)}`, `Balance loss = ${p(100 - eff)}; idle per cycle = ${r(st.length * bn.value - sum)} s`];
      const extra = [{ label: 'Bottleneck', value: `${bn.label} — ${r(bn.value)} s` }, { label: 'Balance loss', value: p(100 - eff) }, { label: 'Line output', value: `${r(3600 / bn.value, 1)} units/h` }];
      if (takt > 0) {
        const minSt = Math.ceil(sum / takt - 1e-9);
        steps.push(`Theoretical min. stations = ⌈${r(sum)} ÷ ${r(takt)}⌉ = ${minSt}`);
        extra.push({ label: 'Min. stations at takt', value: String(minSt) });
        const over = st.filter((s) => s.value > takt);
        if (over.length) steps.push(`Stations above takt: ${over.map((o) => `${o.label} (${r(o.value)} s)`).join(', ')}`);
      }
      return {
        headline: { label: 'Line efficiency', value: p(eff) },
        extra,
        steps,
        interpretation: `${bn.label} limits output to ${r(3600 / bn.value, 1)} units/h. ${takt > 0 && bn.value > takt ? `It exceeds takt (${r(takt)} s) — move work elements away from it or improve its method.` : ''} Shift work from the bottleneck to stations with the most idle time (${idle.sort((a, b) => b.idle - a.idle)[0].label}).`,
        status: eff >= 90 ? 'good' : eff >= 75 ? 'warn' : 'bad',
        chart: st.map((s) => ({ label: s.label, value: s.value, color: s.label === bn.label ? '#d63a3a' : '#2a6fdb' })),
      };
    },
  },
  {
    id: 'bottleneck', title: 'Bottleneck Calculator', category: 'Production', lessonId: 'bottleneck-analysis',
    description: 'Identify the constraint and system throughput from step capacities.',
    formula: 'Capacity per step = Parallel machines × 3600 ÷ Cycle time (s);  System output = min(step capacities)',
    assumptions: ['Steps are in series.', 'Enter effective cycle time per machine (seconds); use "name: seconds" or "name: seconds x machines".'],
    example: 'Cutting 180 s, Honing 600 s, Welding 400 s, Assembly 300 s, Test 360 s → Honing limits to 6/h.',
    inputs: [
      { key: 'list', label: 'Process steps (cycle time in seconds per machine)', type: 'list', default: 'Cutting: 180\nHoning: 600\nWelding: 400\nAssembly: 300\nTesting: 360', help: 'Optionally add parallel machines: "Honing: 600 x 2".' },
    ],
    compute: (v) => {
      const lines = String(v.list).split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      if (lines.length < 2) throw new CalcError('Enter at least 2 steps');
      const steps = lines.map((line) => {
        const m = line.match(/^(.*?):\s*([\d.]+)\s*(?:[x×*]\s*(\d+))?\s*$/i);
        if (!m) throw new CalcError(`Line "${line}" must be "name: seconds" or "name: seconds x machines"`);
        const ct = Number(m[2]), mc = m[3] ? Number(m[3]) : 1;
        if (!(ct > 0) || !(mc > 0)) throw new CalcError(`Invalid values on line "${line}"`);
        return { label: m[1].trim() || 'Step', ct, mc, cap: (mc * 3600) / ct };
      });
      const bn = steps.reduce((a, b) => (b.cap < a.cap ? b : a));
      return {
        headline: { label: 'Bottleneck', value: `${bn.label} — ${r(bn.cap, 2)} units/h` },
        extra: [{ label: 'System throughput', value: `${r(bn.cap, 2)} units/h` }, { label: 'Per 8-hour shift', value: `${r(bn.cap * 8, 1)} units` }],
        steps: steps.map((s) => `${s.label}: ${s.mc} × 3600 ÷ ${r(s.ct)} = ${r(s.cap, 2)} units/h${s === bn ? '  ← lowest' : ''}`),
        interpretation: `${bn.label} sets the pace of the whole process. Exploit it first (no idle time, no defects reaching it, staggered breaks), then elevate (extra shift/machine). Improving other steps will not raise output until ${bn.label} improves.`,
        status: 'warn',
        chart: steps.map((s) => ({ label: s.label, value: s.cap, color: s === bn ? '#d63a3a' : '#2a6fdb' })),
      };
    },
  },
  {
    id: 'lead-time', title: 'Lead Time Calculator', category: 'Production', lessonId: 'lead-time',
    description: "Lead time from WIP and throughput (Little's Law) and value-added ratio.",
    formula: "Lead time = WIP ÷ Throughput rate;  Value-added ratio = Value-added time ÷ Lead time × 100",
    assumptions: ["Little's Law holds for a stable process (average values).", 'Throughput is per working day; value-added time per unit.', 'Working day length used to convert VA ratio.'],
    example: 'WIP 600 units, throughput 50/day → 12 days; VA time 90 min with 16 h days → VA ratio 0.78%.',
    inputs: [
      { key: 'wip', label: 'Work-in-progress (WIP)', default: 600, unit: 'units', min: 0 },
      { key: 'tp', label: 'Throughput', default: 50, unit: 'units/day', min: 0.0001 },
      { key: 'va', label: 'Value-added time per unit', default: 90, units: TIME_MIN, min: 0 },
      { key: 'day', label: 'Working hours per day', default: 16, unit: 'h', min: 1, max: 24 },
    ],
    compute: (v) => {
      const lt = n(v.wip) / n(v.tp);
      const ltMin = lt * n(v.day) * 60;
      const ratio = ltMin > 0 ? (n(v.va) / ltMin) * 100 : 0;
      return {
        headline: { label: 'Lead time', value: `${r(lt, 2)} working days` },
        extra: [{ label: 'Lead time (minutes)', value: r(ltMin, 0) }, { label: 'Value-added ratio', value: p(ratio, 2) }],
        steps: [`Lead time = ${r(n(v.wip))} ÷ ${r(n(v.tp))} = ${r(lt, 2)} days`, `In minutes = ${r(lt, 2)} × ${r(n(v.day))} h × 60 = ${r(ltMin, 0)} min`, `VA ratio = ${r(n(v.va))} ÷ ${r(ltMin, 0)} × 100 = ${p(ratio, 2)}`],
        interpretation: 'Most lead time is waiting. Reducing WIP (smaller batches, FIFO limits, pull) reduces lead time proportionally.',
        status: ratio > 10 ? 'good' : ratio > 2 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'downtime', title: 'Downtime Calculator', category: 'Production', lessonId: 'downtime-analysis',
    description: 'Downtime %, availability and average stop duration.',
    formula: 'Downtime % = Downtime ÷ Planned time × 100;  Availability = (Planned − Downtime) ÷ Planned',
    assumptions: ['Downtime = unplanned stops during planned production time.'],
    example: '54 min downtime in 450 min with 6 stops → 12% downtime, 9 min average stop.',
    inputs: [
      { key: 'planned', label: 'Planned production time', default: 450, units: TIME_MIN, min: 0.0001 },
      { key: 'down', label: 'Total downtime', default: 54, units: TIME_MIN, min: 0 },
      { key: 'stops', label: 'Number of stops', default: 6, unit: 'stops', min: 0, integer: true },
      { key: 'ct', label: 'Cycle time (to estimate lost units)', default: 4, units: TIME_MIN, min: 0.0001 },
    ],
    compute: (v) => {
      const d = n(v.down), pl = n(v.planned);
      if (d > pl) throw new CalcError('Downtime cannot exceed planned time');
      const pc = (d / pl) * 100;
      const avg = n(v.stops) > 0 ? d / n(v.stops) : 0;
      return {
        headline: { label: 'Downtime', value: p(pc) },
        extra: [{ label: 'Availability', value: p(100 - pc) }, { label: 'Average stop', value: `${r(avg)} min` }, { label: 'Units lost (≈)', value: r(d / n(v.ct), 1) }],
        steps: [`Downtime % = ${r(d)} ÷ ${r(pl)} × 100 = ${p(pc)}`, `Availability = 100 − ${r(pc)} = ${p(100 - pc)}`, `Average stop = ${r(d)} ÷ ${n(v.stops)} = ${r(avg)} min`, `Lost units ≈ ${r(d)} ÷ ${r(n(v.ct), 3)} = ${r(d / n(v.ct), 1)}`],
        interpretation: avg < 5 && n(v.stops) > 5 ? 'Many short stops — typical of minor stoppages (jams, sensors). Use observation and quick fixes.' : 'Analyse stop reasons with a Pareto chart and attack the largest category first.',
        status: pc <= 5 ? 'good' : pc <= 12 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'changeover', title: 'Changeover Time Calculator', category: 'Production', lessonId: 'changeover-time',
    description: 'Weekly time lost to changeovers and the effect of SMED.',
    formula: 'Weekly loss = Internal changeover time × Changeovers per week;  After SMED = (Internal − Converted) × Changeovers',
    assumptions: ['Only internal time (machine stopped) causes lost production.', 'Converted % = share of internal activities moved to external.'],
    example: '70 min internal, 10 changeovers/week, 50% converted → loss falls from 700 to 350 min/week.',
    inputs: [
      { key: 'internal', label: 'Internal changeover time', default: 70, units: TIME_MIN, min: 0 },
      { key: 'per', label: 'Changeovers per week', default: 10, unit: 'per week', min: 0 },
      { key: 'conv', label: 'Internal time converted to external (SMED)', default: 50, unit: '%', min: 0, max: 100 },
      { key: 'ct', label: 'Cycle time', default: 5, units: TIME_MIN, min: 0.0001 },
    ],
    compute: (v) => {
      const before = n(v.internal) * n(v.per);
      const newInt = n(v.internal) * (1 - n(v.conv) / 100);
      const after = newInt * n(v.per);
      return {
        headline: { label: 'Time recovered', value: `${r(before - after)} min/week` },
        extra: [{ label: 'Loss before', value: `${r(before)} min/week` }, { label: 'Loss after', value: `${r(after)} min/week` }, { label: 'New changeover', value: `${r(newInt)} min` }, { label: 'Extra units possible', value: r((before - after) / n(v.ct), 0) }],
        steps: [`Before = ${r(n(v.internal))} × ${r(n(v.per))} = ${r(before)} min`, `New internal time = ${r(n(v.internal))} × (1 − ${r(n(v.conv))}%) = ${r(newInt)} min`, `After = ${r(newInt)} × ${r(n(v.per))} = ${r(after)} min`, `Recovered = ${r(before - after)} min ≈ ${r((before - after) / n(v.ct), 0)} units`],
        interpretation: 'Use recovered time either to produce more (if this is the bottleneck) or to change over more often with smaller batches, which reduces inventory and lead time.',
        status: 'neutral',
      };
    },
  },
  // ------------------------------------------------------------- QUALITY
  {
    id: 'rejection', title: 'Rejection Percentage Calculator', category: 'Quality', lessonId: 'rejection-analysis',
    description: 'Share of rejected parts in total inspected.',
    formula: 'Rejection % = Rejected quantity ÷ Total quantity × 100',
    assumptions: ['Total quantity = all units inspected (good + rejected).'],
    example: '96 rejected of 3,000 → 3.2%.',
    inputs: [
      { key: 'rej', label: 'Rejected quantity', default: 96, unit: 'units', min: 0 },
      { key: 'total', label: 'Total quantity inspected', default: 3000, unit: 'units', min: 1 },
      { key: 'cost', label: 'Cost per rejected unit (optional)', default: 0, unit: '₹', min: 0 },
    ],
    compute: (v) => {
      if (n(v.rej) > n(v.total)) throw new CalcError('Rejected cannot exceed total');
      const rp = (n(v.rej) / n(v.total)) * 100;
      const extra = [{ label: 'Good units', value: r(n(v.total) - n(v.rej), 0) }, { label: 'Yield', value: p(100 - rp, 2) }];
      if (n(v.cost) > 0) extra.push({ label: 'Rejection cost', value: `₹${r(n(v.rej) * n(v.cost), 0)}` });
      return {
        headline: { label: 'Rejection', value: p(rp, 2) },
        extra,
        steps: [`Rejection % = ${r(n(v.rej), 0)} ÷ ${r(n(v.total), 0)} × 100 = ${p(rp, 2)}`, ...(n(v.cost) > 0 ? [`Cost = ${r(n(v.rej), 0)} × ₹${r(n(v.cost))} = ₹${r(n(v.rej) * n(v.cost), 0)}`] : [])],
        interpretation: 'Break rejections down by defect type (Pareto) and attack the top contributors with root-cause analysis.',
        status: rp <= 1 ? 'good' : rp <= 3 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'ppm', title: 'PPM Calculator', category: 'Quality', lessonId: 'ppm',
    description: 'Defective parts per million.',
    formula: 'PPM = Defective quantity ÷ Total quantity × 1,000,000',
    assumptions: ['Count defective parts (not defects).'],
    example: '12 defective of 48,000 → 250 PPM.',
    inputs: [
      { key: 'def', label: 'Defective quantity', default: 12, unit: 'units', min: 0 },
      { key: 'total', label: 'Total quantity', default: 48000, unit: 'units', min: 1 },
    ],
    compute: (v) => {
      if (n(v.def) > n(v.total)) throw new CalcError('Defective cannot exceed total');
      const ppm = (n(v.def) / n(v.total)) * 1e6;
      return {
        headline: { label: 'PPM', value: r(ppm, 1) },
        extra: [{ label: 'As percentage', value: p((ppm / 1e6) * 100, 4) }],
        steps: [`PPM = ${r(n(v.def), 0)} ÷ ${r(n(v.total), 0)} × 1,000,000 = ${r(ppm, 1)}`],
        interpretation: ppm <= 100 ? 'Excellent level for most industrial customers.' : ppm <= 500 ? 'Acceptable for many customers but improvement expected.' : 'High PPM — customer escalation likely; run 8D on top defects.',
        status: ppm <= 100 ? 'good' : ppm <= 500 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'fpy', title: 'First Pass Yield Calculator', category: 'Quality',  lessonId: 'rejection-analysis',
    description: 'Units right first time, plus rolled throughput yield across steps.',
    formula: 'FPY = Units passing first time ÷ Units entering × 100;  RTY = FPY₁ × FPY₂ × … × FPYₙ',
    assumptions: ['Reworked units are NOT counted as first-pass good.', 'Step yields for RTY are optional (comma-separated %).'],
    example: '200 enter, 188 pass first time → FPY 94%. Steps 98%, 95%, 97% → RTY 90.3%.',
    inputs: [
      { key: 'in', label: 'Units entering', default: 200, unit: 'units', min: 1 },
      { key: 'pass', label: 'Units passing first time', default: 188, unit: 'units', min: 0 },
      { key: 'steps', label: 'Step FPYs for RTY (%)', type: 'list', default: '98, 95, 97', help: 'Comma-separated percentages.' },
    ],
    compute: (v) => {
      if (n(v.pass) > n(v.in)) throw new CalcError('Passing units cannot exceed units entering');
      const fpy = (n(v.pass) / n(v.in)) * 100;
      const st = parseLabelledList(String(v.steps), 1);
      if (st.some((s) => s.value > 100)) throw new CalcError('Step yields must be ≤ 100%');
      const rty = st.reduce((a, b) => a * (b.value / 100), 1) * 100;
      return {
        headline: { label: 'First pass yield', value: p(fpy) },
        extra: [{ label: 'Rolled throughput yield', value: p(rty) }],
        steps: [`FPY = ${r(n(v.pass), 0)} ÷ ${r(n(v.in), 0)} × 100 = ${p(fpy)}`, `RTY = ${st.map((s) => `${r(s.value)}%`).join(' × ')} = ${p(rty)}`],
        interpretation: 'RTY is always lower than each individual step yield: it shows the probability a unit passes ALL steps without rework. A "hidden factory" of rework sits in the gap.',
        status: fpy >= 98 ? 'good' : fpy >= 93 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'defect-rate', title: 'Defect Rate Calculator (DPU / DPMO / Sigma)', category: 'Quality', lessonId: 'six-sigma',
    description: 'Defects per unit, defects per million opportunities and sigma level.',
    formula: 'DPU = Defects ÷ Units;  DPMO = Defects ÷ (Units × Opportunities) × 10⁶;  Sigma = Z(1 − DPMO/10⁶) + 1.5',
    assumptions: ['Opportunities = number of independent chances for a defect per unit.', 'Sigma level uses the conventional 1.5σ long-term shift.'],
    example: '45 defects in 1,500 units with 10 opportunities each → DPMO 3,000 → ≈ 4.25σ.',
    inputs: [
      { key: 'def', label: 'Number of defects', default: 45, unit: 'defects', min: 0 },
      { key: 'units', label: 'Units inspected', default: 1500, unit: 'units', min: 1 },
      { key: 'opp', label: 'Opportunities per unit', default: 10, unit: 'opps', min: 1 },
    ],
    compute: (v) => {
      const dpu = n(v.def) / n(v.units);
      const dpmo = (n(v.def) / (n(v.units) * n(v.opp))) * 1e6;
      if (dpmo >= 1e6) throw new CalcError('Defects exceed total opportunities');
      const sigma = dpmo <= 0 ? 6 + 0 : invNorm(1 - dpmo / 1e6) + 1.5;
      return {
        headline: { label: 'Sigma level', value: dpmo <= 0 ? '> 6σ' : `${r(sigma, 2)}σ` },
        extra: [{ label: 'DPU', value: r(dpu, 4) }, { label: 'DPMO', value: r(dpmo, 1) }, { label: 'Defect rate', value: p(dpu * 100, 2) }],
        steps: [`DPU = ${r(n(v.def), 0)} ÷ ${r(n(v.units), 0)} = ${r(dpu, 4)}`, `DPMO = ${r(n(v.def), 0)} ÷ (${r(n(v.units), 0)} × ${r(n(v.opp), 0)}) × 10⁶ = ${r(dpmo, 1)}`, `Sigma = Z(${r(1 - dpmo / 1e6, 6)}) + 1.5 = ${r(sigma - 1.5, 3)} + 1.5 = ${r(sigma, 2)}`],
        interpretation: `${sigma >= 6 ? 'Six Sigma performance.' : sigma >= 4 ? 'Good industrial level; further gains need variation reduction.' : 'Below 4σ — significant defect costs; structured improvement (DMAIC) recommended.'} (6σ = 3.4 DPMO, 4σ ≈ 6,210 DPMO, 3σ ≈ 66,807 DPMO.)`,
        status: sigma >= 4.5 ? 'good' : sigma >= 3.5 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'cp', title: 'Cp Calculator', category: 'Quality', lessonId: 'cp-and-cpk',
    description: 'Potential process capability: tolerance width vs process spread.',
    formula: 'Cp = (USL − LSL) ÷ (6 × σ)',
    assumptions: ['Process is stable (in statistical control).', 'Data approximately normal.', 'σ = within-subgroup standard deviation.'],
    example: 'USL 10.05, LSL 9.95, σ 0.01 → Cp = 0.10 ÷ 0.06 = 1.67.',
    inputs: [
      { key: 'usl', label: 'Upper specification limit (USL)', default: 10.05 },
      { key: 'lsl', label: 'Lower specification limit (LSL)', default: 9.95 },
      { key: 'sd', label: 'Standard deviation (σ)', default: 0.01, min: 0.0000001 },
    ],
    compute: (v) => {
      const tol = n(v.usl) - n(v.lsl);
      if (tol <= 0) throw new CalcError('USL must be greater than LSL');
      const cp = tol / (6 * n(v.sd));
      return {
        headline: { label: 'Cp', value: r(cp, 3) },
        extra: [{ label: 'Tolerance width', value: r(tol, 6) }, { label: 'Process spread (6σ)', value: r(6 * n(v.sd), 6) }],
        steps: [`Tolerance = ${n(v.usl)} − ${n(v.lsl)} = ${r(tol, 6)}`, `6σ = 6 × ${n(v.sd)} = ${r(6 * n(v.sd), 6)}`, `Cp = ${r(tol, 6)} ÷ ${r(6 * n(v.sd), 6)} = ${r(cp, 3)}`],
        interpretation: `${cp >= 1.67 ? 'Highly capable (≥ 1.67).' : cp >= 1.33 ? 'Capable (≥ 1.33).' : cp >= 1 ? 'Marginal (1.0–1.33): defects likely if the process drifts.' : 'Not capable (< 1): the spread is wider than the tolerance.'} Cp ignores centring — always check Cpk too.`,
        status: cp >= 1.33 ? 'good' : cp >= 1 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'cpk', title: 'Cpk Calculator', category: 'Quality', lessonId: 'cp-and-cpk',
    description: 'Actual capability considering process centring.',
    formula: 'Cpu = (USL − μ) ÷ 3σ;  Cpl = (μ − LSL) ÷ 3σ;  Cpk = min(Cpu, Cpl);  Cp = (USL − LSL) ÷ 6σ',
    assumptions: ['Stable process, approximately normal data.', 'Estimated defect PPM assumes normality.'],
    example: 'USL 10.05, LSL 9.95, μ 10.02, σ 0.01 → Cpk = min(1.0, 2.33) = 1.0.',
    inputs: [
      { key: 'usl', label: 'Upper specification limit (USL)', default: 10.05 },
      { key: 'lsl', label: 'Lower specification limit (LSL)', default: 9.95 },
      { key: 'mean', label: 'Process mean (μ)', default: 10.02 },
      { key: 'sd', label: 'Standard deviation (σ)', default: 0.01, min: 0.0000001 },
    ],
    compute: (v) => {
      const usl = n(v.usl), lsl = n(v.lsl), mu = n(v.mean), sd = n(v.sd);
      if (usl <= lsl) throw new CalcError('USL must be greater than LSL');
      const cpu = (usl - mu) / (3 * sd), cpl = (mu - lsl) / (3 * sd);
      const cpk = Math.min(cpu, cpl), cp = (usl - lsl) / (6 * sd);
      const phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));
      const ppm = ((1 - phi((usl - mu) / sd)) + phi((lsl - mu) / sd)) * 1e6;
      return {
        headline: { label: 'Cpk', value: r(cpk, 3) },
        extra: [{ label: 'Cp', value: r(cp, 3) }, { label: 'Cpu', value: r(cpu, 3) }, { label: 'Cpl', value: r(cpl, 3) }, { label: 'Expected out-of-spec', value: `${r(ppm, 1)} PPM` }],
        steps: [`Cpu = (${usl} − ${mu}) ÷ (3 × ${sd}) = ${r(cpu, 3)}`, `Cpl = (${mu} − ${lsl}) ÷ (3 × ${sd}) = ${r(cpl, 3)}`, `Cpk = min(${r(cpu, 3)}, ${r(cpl, 3)}) = ${r(cpk, 3)}`, `Cp = (${usl} − ${lsl}) ÷ (6 × ${sd}) = ${r(cp, 3)}`],
        interpretation: `${cpk >= 1.33 ? 'Capable.' : cpk >= 1 ? 'Marginal.' : 'Not capable — defects are being produced.'} ${cp - cpk > 0.2 ? `Cp (${r(cp, 2)}) is clearly higher than Cpk: the process is off-centre — re-centring toward ${r((usl + lsl) / 2, 4)} is the quickest fix.` : 'The process is reasonably centred; improvement needs variation reduction.'}`,
        status: cpk >= 1.33 ? 'good' : cpk >= 1 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'pareto', title: 'Pareto Percentage Calculator', category: 'Quality', lessonId: 'pareto-analysis',
    description: 'Sort categories, percentages and cumulative percentages; find the vital few.',
    formula: 'Category % = Count ÷ Total × 100;  Cumulative % = running sum after sorting descending',
    assumptions: ['Categories are mutually exclusive.', 'Vital few = categories up to ~80% cumulative.'],
    example: 'Rod seal 42, Piston seal 23, Weld porosity 15, Port thread 10, Others 10 → top 3 = 80%.',
    inputs: [{ key: 'list', label: 'Categories and counts', type: 'list', default: 'Rod seal damage: 42\nPiston seal pinch: 23\nWeld porosity: 15\nPort thread damage: 10\nOthers: 10', help: 'One per line as "category: count".' }],
    compute: (v) => {
      const items = parseLabelledList(String(v.list), 2).sort((a, b) => b.value - a.value);
      const total = items.reduce((a, b) => a + b.value, 0);
      if (total === 0) throw new CalcError('Total must be greater than zero');
      let cum = 0;
      const rows = items.map((it) => {
        cum += it.value;
        return { ...it, pct: (it.value / total) * 100, cum: (cum / total) * 100 };
      });
      const vital = [] as typeof rows;
      for (const row of rows) {
        vital.push(row);
        if (row.cum >= 80 - 1e-9) break;
      }
      return {
        headline: { label: 'Vital few', value: vital.map((x) => x.label).join(', ') },
        extra: [{ label: 'Share of total', value: p(vital[vital.length - 1].cum) }, { label: 'Total count', value: r(total, 0) }],
        steps: rows.map((x) => `${x.label}: ${r(x.value, 0)} → ${p(x.pct)} (cumulative ${p(x.cum)})`),
        interpretation: `${vital.length} of ${rows.length} categories cause ${p(vital[vital.length - 1].cum)} of the problem. Focus root-cause analysis there first.`,
        chart: rows.map((x) => ({ label: x.label, value: x.value })),
      };
    },
  },
  {
    id: 'copq', title: 'Cost of Poor Quality Calculator', category: 'Quality', lessonId: 'cost-of-poor-quality-copq',
    description: 'Total internal and external failure costs and their share of sales.',
    formula: 'COPQ = Scrap + Rework + Re-inspection + Warranty + Returns/freight + Penalties;  COPQ % = COPQ ÷ Sales × 100',
    assumptions: ['Costs for the same period (e.g., one month).', 'Rework includes labour and material.'],
    example: 'Scrap ₹40,000 + rework ₹90,000 + warranty ₹1,35,000 … on ₹1 Cr sales.',
    inputs: [
      { key: 'scrap', label: 'Scrap cost', default: 40000, unit: '₹', min: 0 },
      { key: 'rework', label: 'Rework cost', default: 90000, unit: '₹', min: 0 },
      { key: 'reinsp', label: 'Re-inspection / sorting cost', default: 15000, unit: '₹', min: 0 },
      { key: 'warranty', label: 'Warranty / field failure cost', default: 135000, unit: '₹', min: 0 },
      { key: 'returns', label: 'Returns & extra freight', default: 20000, unit: '₹', min: 0 },
      { key: 'penalty', label: 'Customer penalties', default: 0, unit: '₹', min: 0 },
      { key: 'sales', label: 'Sales in the same period', default: 10000000, unit: '₹', min: 1 },
    ],
    compute: (v) => {
      const internal = n(v.scrap) + n(v.rework) + n(v.reinsp);
      const external = n(v.warranty) + n(v.returns) + n(v.penalty);
      const copq = internal + external;
      const pc = (copq / n(v.sales)) * 100;
      return {
        headline: { label: 'COPQ', value: `₹${r(copq, 0)}` },
        extra: [{ label: 'Internal failure', value: `₹${r(internal, 0)}` }, { label: 'External failure', value: `₹${r(external, 0)}` }, { label: 'COPQ % of sales', value: p(pc, 2) }, { label: 'Annualised (×12)', value: `₹${r(copq * 12, 0)}` }],
        steps: [`Internal = ${r(n(v.scrap), 0)} + ${r(n(v.rework), 0)} + ${r(n(v.reinsp), 0)} = ₹${r(internal, 0)}`, `External = ${r(n(v.warranty), 0)} + ${r(n(v.returns), 0)} + ${r(n(v.penalty), 0)} = ₹${r(external, 0)}`, `COPQ = ₹${r(copq, 0)}; % of sales = ${p(pc, 2)}`],
        interpretation: `${external > internal ? 'External failures dominate — defects are reaching customers; strengthen detection immediately and prevention permanently.' : 'Internal failures dominate — defects are caught, but cost money; attack root causes in the process.'} Visible COPQ is often only the tip of the iceberg.`,
        status: pc <= 1 ? 'good' : pc <= 3 ? 'warn' : 'bad',
        chart: [{ label: 'Scrap', value: n(v.scrap) }, { label: 'Rework', value: n(v.rework) }, { label: 'Re-inspect', value: n(v.reinsp) }, { label: 'Warranty', value: n(v.warranty) }, { label: 'Returns', value: n(v.returns) }, { label: 'Penalties', value: n(v.penalty) }],
      };
    },
  },
  // ------------------------------------------------------------- MAINTENANCE
  {
    id: 'mtbf', title: 'MTBF Calculator', category: 'Maintenance', lessonId: 'mtbf',
    description: 'Mean time between failures of a repairable asset.',
    formula: 'MTBF = Total operating time ÷ Number of failures',
    assumptions: ['Operating time excludes repair/downtime.', 'Failures defined consistently.'],
    example: '720 h operating, 4 failures → 180 h.',
    inputs: [
      { key: 'op', label: 'Total operating time', default: 720, units: TIME_HOUR, min: 0 },
      { key: 'f', label: 'Number of failures', default: 4, unit: 'failures', min: 1, integer: true },
    ],
    compute: (v) => {
      const m = n(v.op) / n(v.f);
      return {
        headline: { label: 'MTBF', value: `${r(m, 2)} h` },
        extra: [{ label: 'Failure rate λ', value: `${r(1 / m, 5)} per h` }, { label: 'Reliability for 8 h', value: p(Math.exp(-8 / m) * 100, 2) }],
        steps: [`MTBF = ${r(n(v.op))} ÷ ${n(v.f)} = ${r(m, 2)} h`, `λ = 1 ÷ ${r(m, 2)} = ${r(1 / m, 5)} failures/h`, `R(8 h) = e^(−8 ÷ ${r(m, 2)}) = ${p(Math.exp(-8 / m) * 100, 2)}`],
        interpretation: 'Track MTBF monthly. A falling MTBF shows deteriorating reliability; analyse failure modes and strengthen PM/PdM.',
      };
    },
  },
  {
    id: 'mttr', title: 'MTTR Calculator', category: 'Maintenance', lessonId: 'mttr',
    description: 'Mean time to repair.',
    formula: 'MTTR = Total repair time ÷ Number of repairs',
    assumptions: ['Repair time from failure to restored operation (incl. waiting, diagnosis, repair, test).'],
    example: '10 h total for 4 repairs → 2.5 h.',
    inputs: [
      { key: 't', label: 'Total repair time', default: 10, units: TIME_HOUR, min: 0 },
      { key: 'nr', label: 'Number of repairs', default: 4, unit: 'repairs', min: 1, integer: true },
    ],
    compute: (v) => {
      const m = n(v.t) / n(v.nr);
      return {
        headline: { label: 'MTTR', value: `${r(m, 2)} h` },
        extra: [{ label: 'In minutes', value: `${r(m * 60, 0)} min` }],
        steps: [`MTTR = ${r(n(v.t))} ÷ ${n(v.nr)} = ${r(m, 2)} h`],
        interpretation: 'Split MTTR into response, diagnosis, waiting for parts and repair time. Waiting for parts is often the largest — check critical spares.',
        status: m <= 1 ? 'good' : m <= 3 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'availability', title: 'Availability Calculator', category: 'Maintenance', lessonId: 'equipment-availability',
    description: 'Inherent availability from MTBF and MTTR.',
    formula: 'Availability = MTBF ÷ (MTBF + MTTR) × 100',
    assumptions: ['Steady-state availability; ignores planned downtime and logistics delays not in MTTR.'],
    example: 'MTBF 180 h, MTTR 2.5 h → 98.6%.',
    inputs: [
      { key: 'mtbf', label: 'MTBF', default: 180, units: TIME_HOUR, min: 0.0001 },
      { key: 'mttr', label: 'MTTR', default: 2.5, units: TIME_HOUR, min: 0 },
    ],
    compute: (v) => {
      const a = (n(v.mtbf) / (n(v.mtbf) + n(v.mttr))) * 100;
      return {
        headline: { label: 'Availability', value: p(a, 2) },
        extra: [{ label: 'Unavailable time per 1,000 h', value: `${r(10 * (100 - a), 1)} h` }],
        steps: [`A = ${r(n(v.mtbf))} ÷ (${r(n(v.mtbf))} + ${r(n(v.mttr))}) × 100 = ${p(a, 2)}`],
        interpretation: 'Raise availability by increasing MTBF (prevent failures) or reducing MTTR (repair faster) — choose the cheaper lever.',
        status: a >= 97 ? 'good' : a >= 90 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'maintenance-cost', title: 'Maintenance Cost Calculator', category: 'Maintenance', lessonId: 'maintenance-cost-control',
    description: 'Total maintenance cost including the cost of downtime.',
    formula: 'Total = Labour hours × Rate + Spares + Contractor + Downtime hours × Downtime cost per hour',
    assumptions: ['Downtime cost per hour = lost contribution margin (for bottlenecks) or overtime cost to recover.'],
    example: '120 h × ₹500 + ₹1.5 L spares + ₹50,000 contractor + 16 h × ₹25,000 downtime.',
    inputs: [
      { key: 'lh', label: 'Maintenance labour hours', default: 120, unit: 'h', min: 0 },
      { key: 'rate', label: 'Labour rate', default: 500, unit: '₹/h', min: 0 },
      { key: 'spares', label: 'Spare parts', default: 150000, unit: '₹', min: 0 },
      { key: 'contr', label: 'Contractor / services', default: 50000, unit: '₹', min: 0 },
      { key: 'dh', label: 'Downtime hours', default: 16, unit: 'h', min: 0 },
      { key: 'dc', label: 'Downtime cost per hour', default: 25000, unit: '₹/h', min: 0 },
    ],
    compute: (v) => {
      const lab = n(v.lh) * n(v.rate), dt = n(v.dh) * n(v.dc);
      const direct = lab + n(v.spares) + n(v.contr);
      const total = direct + dt;
      return {
        headline: { label: 'Total maintenance cost', value: `₹${r(total, 0)}` },
        extra: [{ label: 'Direct maintenance cost', value: `₹${r(direct, 0)}` }, { label: 'Downtime cost', value: `₹${r(dt, 0)}` }, { label: 'Downtime share', value: p((dt / (total || 1)) * 100) }],
        steps: [`Labour = ${r(n(v.lh))} × ₹${r(n(v.rate))} = ₹${r(lab, 0)}`, `Direct = ₹${r(lab, 0)} + ₹${r(n(v.spares), 0)} + ₹${r(n(v.contr), 0)} = ₹${r(direct, 0)}`, `Downtime = ${r(n(v.dh))} × ₹${r(n(v.dc), 0)} = ₹${r(dt, 0)}`, `Total = ₹${r(total, 0)}`],
        interpretation: dt > direct ? 'Downtime costs more than maintenance itself — investing in prevention (PM/PdM, spares) is likely to pay back.' : 'Direct costs dominate — review PM intervals, spare consumption and contractor scope for optimisation.',
        chart: [{ label: 'Labour', value: lab }, { label: 'Spares', value: n(v.spares) }, { label: 'Contractor', value: n(v.contr) }, { label: 'Downtime', value: dt, color: '#d63a3a' }],
      };
    },
  },
  // ------------------------------------------------------------- INVENTORY
  {
    id: 'eoq', title: 'EOQ Calculator', category: 'Inventory', lessonId: 'eoq',
    description: 'Economic order quantity that minimises ordering + holding cost.',
    formula: 'EOQ = √(2 × D × S ÷ H);  H = Unit cost × Holding rate',
    assumptions: ['Constant, known annual demand.', 'Fixed ordering cost per order; no quantity discounts.', 'Instantaneous replenishment.'],
    example: 'D 9,600, S ₹2,000, unit cost ₹400, holding 25% → H ₹100 → EOQ ≈ 620.',
    inputs: [
      { key: 'd', label: 'Annual demand (D)', default: 9600, unit: 'units/yr', min: 1 },
      { key: 's', label: 'Ordering cost per order (S)', default: 2000, unit: '₹', min: 0.01 },
      { key: 'c', label: 'Unit cost', default: 400, unit: '₹', min: 0.01 },
      { key: 'h', label: 'Holding cost rate', default: 25, unit: '% per year', min: 0.01, max: 100 },
    ],
    compute: (v) => {
      const H = n(v.c) * (n(v.h) / 100);
      const eoq = Math.sqrt((2 * n(v.d) * n(v.s)) / H);
      const orders = n(v.d) / eoq;
      const tc = orders * n(v.s) + (eoq / 2) * H;
      return {
        headline: { label: 'EOQ', value: `${r(eoq, 0)} units` },
        extra: [{ label: 'Orders per year', value: r(orders, 1) }, { label: 'Days between orders (365)', value: r(365 / orders, 1) }, { label: 'Annual ordering + holding cost', value: `₹${r(tc, 0)}` }],
        steps: [`H = ₹${r(n(v.c))} × ${r(n(v.h))}% = ₹${r(H)} per unit-year`, `EOQ = √(2 × ${r(n(v.d), 0)} × ${r(n(v.s))} ÷ ${r(H)}) = √${r((2 * n(v.d) * n(v.s)) / H, 0)} = ${r(eoq, 1)}`, `Orders/yr = ${r(n(v.d), 0)} ÷ ${r(eoq, 1)} = ${r(orders, 2)}`, `Total cost = ${r(orders, 2)} × ${r(n(v.s))} + (${r(eoq, 1)} ÷ 2) × ${r(H)} = ₹${r(tc, 0)} (ordering = holding at EOQ)`],
        interpretation: 'Round to practical pack sizes. To make smaller, more frequent orders economical, reduce the ordering cost (e-ordering, milk runs, blanket POs).',
      };
    },
  },
  {
    id: 'safety-stock', title: 'Safety Stock Calculator', category: 'Inventory', lessonId: 'safety-stock',
    description: 'Buffer stock for demand variability during lead time.',
    formula: 'Safety stock = Z × σ_d × √L',
    assumptions: ['Daily demand approximately normal and independent.', 'Lead time constant (use a combined formula if lead time varies).'],
    example: '95% service (Z 1.645), σd 20/day, L 9 days → ≈ 99 units.',
    inputs: [
      { key: 'sl', label: 'Service level', type: 'select', default: '95', options: [{ label: '90%', value: '90' }, { label: '95%', value: '95' }, { label: '97.5%', value: '97.5' }, { label: '99%', value: '99' }, { label: '99.9%', value: '99.9' }] },
      { key: 'sd', label: 'Std. deviation of daily demand (σ_d)', default: 20, unit: 'units/day', min: 0 },
      { key: 'l', label: 'Lead time (L)', default: 9, unit: 'days', min: 0 },
    ],
    compute: (v) => {
      const z = invNorm(Number(v.sl) / 100);
      const ss = z * n(v.sd) * Math.sqrt(n(v.l));
      return {
        headline: { label: 'Safety stock', value: `${Math.ceil(ss)} units` },
        extra: [{ label: 'Z value', value: r(z, 3) }],
        steps: [`Z for ${v.sl}% = ${r(z, 3)}`, `√L = √${r(n(v.l))} = ${r(Math.sqrt(n(v.l)), 3)}`, `SS = ${r(z, 3)} × ${r(n(v.sd))} × ${r(Math.sqrt(n(v.l)), 3)} = ${r(ss, 2)} → ${Math.ceil(ss)}`],
        interpretation: 'Higher service levels raise safety stock sharply (99.9% needs almost twice the stock of 95%). Reduce safety stock by shortening lead time and reducing demand variability.',
      };
    },
  },
  {
    id: 'rop', title: 'Reorder Point Calculator', category: 'Inventory', lessonId: 'reorder-point',
    description: 'Stock level that triggers a new order.',
    formula: 'ROP = Average daily demand × Lead time (days) + Safety stock',
    assumptions: ['Continuous stock review.'],
    example: '50/day × 6 days + 100 = 400.',
    inputs: [
      { key: 'd', label: 'Average daily demand', default: 50, unit: 'units/day', min: 0 },
      { key: 'l', label: 'Lead time', default: 6, unit: 'days', min: 0 },
      { key: 'ss', label: 'Safety stock', default: 100, unit: 'units', min: 0 },
      { key: 'stock', label: 'Current stock (optional)', default: 450, unit: 'units', min: 0 },
    ],
    compute: (v) => {
      const ldd = n(v.d) * n(v.l);
      const rop = ldd + n(v.ss);
      const order = n(v.stock) <= rop;
      return {
        headline: { label: 'Reorder point', value: `${r(rop, 0)} units` },
        extra: [{ label: 'Lead-time demand', value: r(ldd, 0) }, { label: 'Order now?', value: order ? 'YES — stock at or below ROP' : `No — ${r(n(v.stock) - rop, 0)} units above ROP` }, { label: 'Days until ROP', value: n(v.d) > 0 ? r(Math.max(0, (n(v.stock) - rop) / n(v.d)), 1) : '—' }],
        steps: [`Lead-time demand = ${r(n(v.d))} × ${r(n(v.l))} = ${r(ldd)}`, `ROP = ${r(ldd)} + ${r(n(v.ss))} = ${r(rop)}`],
        interpretation: 'Update the ROP whenever demand or supplier lead time changes. In a two-bin system, the second bin size equals the ROP.',
        status: order ? 'warn' : 'good',
      };
    },
  },
  {
    id: 'inventory-turnover', title: 'Inventory Turnover Calculator', category: 'Inventory', lessonId: 'inventory-turnover',
    description: 'Inventory turns and days of inventory.',
    formula: 'Turnover = COGS ÷ Average inventory;  Average inventory = (Opening + Closing) ÷ 2;  Days = 365 ÷ Turnover',
    assumptions: ['All values for the same period (normally one year).'],
    example: 'COGS ₹120 Cr, opening ₹22 Cr, closing ₹18 Cr → 6 turns, 61 days.',
    inputs: [
      { key: 'cogs', label: 'Cost of goods sold (annual)', default: 1200000000, unit: '₹', min: 0 },
      { key: 'open', label: 'Opening inventory', default: 220000000, unit: '₹', min: 0 },
      { key: 'close', label: 'Closing inventory', default: 180000000, unit: '₹', min: 0 },
    ],
    compute: (v) => {
      const avg = (n(v.open) + n(v.close)) / 2;
      if (avg === 0) throw new CalcError('Average inventory cannot be zero');
      const t = n(v.cogs) / avg;
      return {
        headline: { label: 'Inventory turnover', value: `${r(t, 2)} turns/yr` },
        extra: [{ label: 'Days of inventory', value: `${r(365 / t, 1)} days` }, { label: 'Average inventory', value: `₹${r(avg, 0)}` }],
        steps: [`Average = (${r(n(v.open), 0)} + ${r(n(v.close), 0)}) ÷ 2 = ₹${r(avg, 0)}`, `Turnover = ${r(n(v.cogs), 0)} ÷ ${r(avg, 0)} = ${r(t, 2)}`, `Days = 365 ÷ ${r(t, 2)} = ${r(365 / t, 1)}`],
        interpretation: 'Higher turnover frees cash and exposes problems. Compare by category (raw, WIP, FG) to find where inventory accumulates.',
        status: t >= 8 ? 'good' : t >= 4 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'abc', title: 'ABC Analysis Calculator', category: 'Inventory', lessonId: 'abc-analysis',
    description: 'Classify items by annual consumption value.',
    formula: 'Value = Annual qty × Unit cost; sort descending; A ≤ A-limit cumulative %, B ≤ B-limit, rest C',
    assumptions: ['Enter "item: annual qty × unit cost" or "item: annual value".', 'Default limits A 80%, B 95%.'],
    example: 'Tubes, rods and seal kits usually form class A in a cylinder plant.',
    inputs: [
      { key: 'list', label: 'Items', type: 'list', default: 'Honed tubes: 2400 x 2000\nChrome rods: 2400 x 1500\nSeal kits: 9600 x 400\nGlands: 2400 x 450\nPistons: 2400 x 380\nForged clevis: 2400 x 300\nFasteners: 50000 x 4\nPort plugs: 20000 x 6\nLabels: 10000 x 2\nPaint (litres): 3000 x 350', help: 'One per line: "name: qty x unit cost" or "name: annual value".' },
      { key: 'a', label: 'Class A cumulative limit', default: 80, unit: '%', min: 1, max: 99 },
      { key: 'b', label: 'Class B cumulative limit', default: 95, unit: '%', min: 2, max: 100 },
    ],
    compute: (v) => {
      if (n(v.b) <= n(v.a)) throw new CalcError('B limit must be greater than A limit');
      const lines = String(v.list).split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      if (lines.length < 3) throw new CalcError('Enter at least 3 items');
      const items = lines.map((line) => {
        const idx = line.lastIndexOf(':');
        if (idx < 0) throw new CalcError(`Line "${line}" must contain ":"`);
        const label = line.slice(0, idx).trim();
        const rhs = line.slice(idx + 1).trim().replace(/,/g, '');
        const m = rhs.match(/^([\d.]+)\s*(?:[x×*]\s*([\d.]+))?$/i);
        if (!m) throw new CalcError(`Value on line "${line}" is not valid`);
        const val = m[2] ? Number(m[1]) * Number(m[2]) : Number(m[1]);
        return { label, value: val };
      });
      const total = items.reduce((a, b) => a + b.value, 0);
      if (total <= 0) throw new CalcError('Total value must be greater than zero');
      items.sort((a, b) => b.value - a.value);
      let cum = 0;
      const rows = items.map((it) => {
        const before = (cum / total) * 100;
        cum += it.value;
        const c = (cum / total) * 100;
        // An item is A if the cumulative share before it is still below the A limit.
        const cls = before < n(v.a) ? 'A' : before < n(v.b) ? 'B' : 'C';
        return { ...it, pct: (it.value / total) * 100, cum: c, cls };
      });
      const count = (c: string) => rows.filter((x) => x.cls === c);
      const share = (c: string) => count(c).reduce((a, b) => a + b.pct, 0);
      return {
        headline: { label: 'Class A items', value: count('A').map((x) => x.label).join(', ') },
        extra: ['A', 'B', 'C'].map((c) => ({ label: `Class ${c}`, value: `${count(c).length} items (${p((count(c).length / rows.length) * 100, 0)}) — ${p(share(c))} of value` })),
        steps: [`Total annual value = ₹${r(total, 0)}`, ...rows.map((x) => `${x.label}: ₹${r(x.value, 0)} → ${p(x.pct)} (cum. ${p(x.cum)}) → ${x.cls}`)],
        interpretation: 'Control class A tightly (frequent review, accurate forecasts, monthly counts), B moderately, C with simple rules (two-bin, bulk orders). Combine with VED for criticality.',
        chart: rows.map((x) => ({ label: x.label, value: x.value, color: x.cls === 'A' ? '#19489a' : x.cls === 'B' ? '#4f8ef0' : '#9fb0cd' })),
      };
    },
  },
  // ------------------------------------------------------------- FINANCE
  {
    id: 'roi', title: 'ROI Calculator', category: 'Finance', lessonId: 'return-on-investment-roi',
    description: 'Return on investment over a period.',
    formula: 'ROI % = (Total benefits − Investment) ÷ Investment × 100;  Annualised ≈ ROI ÷ Years (simple)',
    assumptions: ['Benefits are net annual savings or contribution (after operating costs).', 'No discounting (use NPV for long projects).'],
    example: '₹40 L robot, ₹16 L/yr for 4 years → ROI 60%.',
    inputs: [
      { key: 'inv', label: 'Investment', default: 4000000, unit: '₹', min: 1 },
      { key: 'ben', label: 'Net annual benefit', default: 1600000, unit: '₹/yr', min: 0 },
      { key: 'yrs', label: 'Evaluation period', default: 4, unit: 'years', min: 0.1 },
    ],
    compute: (v) => {
      const tb = n(v.ben) * n(v.yrs);
      const roi = ((tb - n(v.inv)) / n(v.inv)) * 100;
      return {
        headline: { label: 'ROI', value: p(roi) },
        extra: [{ label: 'Total benefit', value: `₹${r(tb, 0)}` }, { label: 'Net gain', value: `₹${r(tb - n(v.inv), 0)}` }, { label: 'Simple annual ROI', value: p(roi / n(v.yrs)) }],
        steps: [`Total benefit = ₹${r(n(v.ben), 0)} × ${r(n(v.yrs))} = ₹${r(tb, 0)}`, `ROI = (₹${r(tb, 0)} − ₹${r(n(v.inv), 0)}) ÷ ₹${r(n(v.inv), 0)} × 100 = ${p(roi)}`],
        interpretation: roi > 0 ? 'Positive return over the period. Compare with payback period and risk before deciding.' : 'Negative return — the investment does not pay back in the evaluation period.',
        status: roi > 50 ? 'good' : roi > 0 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'payback', title: 'Payback Period Calculator', category: 'Finance', lessonId: 'return-on-investment-roi',
    description: 'Time to recover an investment from savings.',
    formula: 'Payback period = Investment ÷ Net annual savings',
    assumptions: ['Savings are constant per year; no discounting.'],
    example: '₹22 L test bench, ₹18 L/yr → 1.22 years (≈ 15 months).',
    inputs: [
      { key: 'inv', label: 'Investment', default: 2200000, unit: '₹', min: 1 },
      { key: 'sav', label: 'Net annual savings', default: 1800000, unit: '₹/yr', min: 0.01 },
    ],
    compute: (v) => {
      const yrs = n(v.inv) / n(v.sav);
      return {
        headline: { label: 'Payback period', value: `${r(yrs, 2)} years` },
        extra: [{ label: 'In months', value: r(yrs * 12, 1) }],
        steps: [`Payback = ₹${r(n(v.inv), 0)} ÷ ₹${r(n(v.sav), 0)} = ${r(yrs, 2)} years = ${r(yrs * 12, 1)} months`],
        interpretation: yrs <= 1 ? 'Excellent — pays back within a year.' : yrs <= 3 ? 'Typical acceptable payback for industrial improvements (≤ 2–3 years).' : 'Long payback — verify benefits and consider risks or alternatives.',
        status: yrs <= 1.5 ? 'good' : yrs <= 3 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'cost-savings', title: 'Cost Savings Calculator', category: 'Finance', lessonId: 'industrial-cost-reduction',
    description: 'Annual and net savings from a unit cost reduction.',
    formula: 'Annual savings = (Old unit cost − New unit cost) × Annual volume;  Net first-year = Annual savings − One-time cost',
    assumptions: ['Volume constant; one-time cost incurred in year 1.'],
    example: 'Cost per cylinder ₹18,000 → ₹17,640, 9,600/yr, one-time ₹5 L.',
    inputs: [
      { key: 'old', label: 'Current unit cost', default: 18000, unit: '₹', min: 0 },
      { key: 'new', label: 'New unit cost', default: 17640, unit: '₹', min: 0 },
      { key: 'vol', label: 'Annual volume', default: 9600, unit: 'units', min: 0 },
      { key: 'once', label: 'One-time implementation cost', default: 500000, unit: '₹', min: 0 },
    ],
    compute: (v) => {
      const per = n(v.old) - n(v.new);
      const annual = per * n(v.vol);
      const net = annual - n(v.once);
      return {
        headline: { label: 'Annual savings', value: `₹${r(annual, 0)}` },
        extra: [{ label: 'Saving per unit', value: `₹${r(per)} (${p(n(v.old) ? (per / n(v.old)) * 100 : 0, 2)})` }, { label: 'Net first-year saving', value: `₹${r(net, 0)}` }, { label: 'Payback', value: annual > 0 ? `${r((n(v.once) / annual) * 12, 1)} months` : '—' }],
        steps: [`Per unit = ₹${r(n(v.old))} − ₹${r(n(v.new))} = ₹${r(per)}`, `Annual = ₹${r(per)} × ${r(n(v.vol), 0)} = ₹${r(annual, 0)}`, `Net year 1 = ₹${r(annual, 0)} − ₹${r(n(v.once), 0)} = ₹${r(net, 0)}`],
        interpretation: per < 0 ? 'The new cost is higher — this is a cost increase, not a saving.' : 'Validate savings with finance after implementation, and confirm quality and safety are not affected.',
        status: net > 0 ? 'good' : per > 0 ? 'warn' : 'bad',
      };
    },
  },
  {
    id: 'productivity-improvement', title: 'Productivity Improvement Calculator', category: 'Finance', lessonId: 'productivity-calculation',
    description: 'Change in productivity between two periods.',
    formula: 'Productivity = Output ÷ Input;  Improvement % = (New − Old) ÷ Old × 100',
    assumptions: ['Same output and input definitions in both periods (comparable product mix).'],
    example: '9,600 cyl / 48,000 h → 11,000 cyl / 50,000 h = +10%.',
    inputs: [
      { key: 'o1', label: 'Old output', default: 9600, unit: 'units', min: 0 },
      { key: 'i1', label: 'Old input (e.g., labour hours)', default: 48000, unit: 'h', min: 0.0001 },
      { key: 'o2', label: 'New output', default: 11000, unit: 'units', min: 0 },
      { key: 'i2', label: 'New input', default: 50000, unit: 'h', min: 0.0001 },
    ],
    compute: (v) => {
      const p1 = n(v.o1) / n(v.i1), p2 = n(v.o2) / n(v.i2);
      if (p1 === 0) throw new CalcError('Old productivity is zero — cannot compute change');
      const imp = ((p2 - p1) / p1) * 100;
      return {
        headline: { label: 'Productivity change', value: `${imp >= 0 ? '+' : ''}${p(imp, 2)}` },
        extra: [{ label: 'Old productivity', value: `${r(p1, 4)} per unit input` }, { label: 'New productivity', value: `${r(p2, 4)} per unit input` }, { label: 'Input saved for new output', value: `${r(n(v.o2) / p1 - n(v.i2), 0)}` }],
        steps: [`Old = ${r(n(v.o1))} ÷ ${r(n(v.i1))} = ${r(p1, 4)}`, `New = ${r(n(v.o2))} ÷ ${r(n(v.i2))} = ${r(p2, 4)}`, `Change = (${r(p2, 4)} − ${r(p1, 4)}) ÷ ${r(p1, 4)} × 100 = ${p(imp, 2)}`],
        interpretation: imp > 0 ? 'Productivity improved. Confirm it came from waste reduction (sustainable) and not only from volume effects.' : 'Productivity declined — investigate losses, mix changes or extra indirect effort.',
        status: imp > 0 ? 'good' : 'bad',
      };
    },
  },
];

function erf(x: number) {
  // Abramowitz-Stegun 7.1.26
  const s = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

export const calcById = (id: string) => CALCULATORS.find((c) => c.id === id);
export const CALC_CATEGORIES = ['Production', 'Quality', 'Maintenance', 'Inventory', 'Finance'] as const;
