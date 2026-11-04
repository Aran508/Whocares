// Pure simulation logic — no React. Unit-tested in tests/simulations.test.ts.
import { mulberry32 } from '../lib/rng';

// ---------------------------------------------------------------- Line balancing
export interface Station { name: string; time: number; operators: number }

export function analyseLine(stations: Station[], taktSec: number) {
  const eff = stations.map((s) => ({ ...s, effective: s.time / Math.max(1, s.operators) }));
  const bottleneck = eff.reduce((a, b) => (b.effective > a.effective ? b : a));
  const cycle = bottleneck.effective;
  const throughputPerHour = 3600 / cycle;
  const workContent = stations.reduce((a, s) => a + s.time, 0);
  const totalOperators = stations.reduce((a, s) => a + Math.max(1, s.operators), 0);
  const efficiency = (workContent / (totalOperators * cycle)) * 100;
  const idle = eff.map((s) => ({ name: s.name, idle: cycle - s.effective, utilisation: (s.effective / cycle) * 100 }));
  const totalIdle = idle.reduce((a, b) => a + b.idle * (stations.find((s) => s.name === b.name)!.operators || 1), 0);
  const minStations = taktSec > 0 ? Math.ceil(workContent / taktSec - 1e-9) : undefined;
  const overTakt = taktSec > 0 ? eff.filter((s) => s.effective > taktSec).map((s) => s.name) : [];
  const leastLoaded = eff.reduce((a, b) => (b.effective < a.effective ? b : a));
  const target = taktSec > 0 ? taktSec : workContent / stations.length;
  const suggestion = overTakt.length
    ? `${bottleneck.name} (${cycle.toFixed(0)} s) exceeds takt (${taktSec.toFixed(0)} s). Move about ${Math.ceil(cycle - target)} s of work to ${leastLoaded.name} (${leastLoaded.effective.toFixed(0)} s), apply SMED/method study to ${bottleneck.name}, or add a second operator there.`
    : efficiency < 85
      ? `All stations meet takt, but balance loss is ${(100 - efficiency).toFixed(1)}%. Combine light stations (e.g., ${leastLoaded.name}) to free an operator.`
      : 'The line is well balanced. Keep it stable with standard work and re-balance when demand (takt) changes.';
  return { bottleneck: bottleneck.name, cycle, throughputPerHour, workContent, efficiency, idle, totalIdle, minStations, overTakt, suggestion };
}

/** Move `seconds` of work from one station to another (never below 1 s). */
export function moveWork(stations: Station[], from: string, to: string, seconds: number): Station[] {
  const s = Math.min(seconds, (stations.find((x) => x.name === from)?.time ?? 1) - 1);
  return stations.map((x) => (x.name === from ? { ...x, time: x.time - s } : x.name === to ? { ...x, time: x.time + s } : x));
}

// ---------------------------------------------------------------- OEE
export function oee(planned: number, downtime: number, idealCt: number, total: number, rejected: number) {
  const run = Math.max(0, planned - downtime);
  const A = planned > 0 ? run / planned : 0;
  const P = run > 0 ? Math.min(1, (idealCt * total) / run) : 0;
  const Q = total > 0 ? Math.max(0, (total - rejected) / total) : 0;
  return { run, A, P, Q, oee: A * P * Q, speedLoss: Math.max(0, run - idealCt * total), qualityLoss: idealCt * rejected, good: total - rejected };
}

// ---------------------------------------------------------------- Inventory
export interface InvParams { days: number; demandMean: number; demandSd: number; leadTime: number; rop: number; orderQty: number; initial: number; seed: number; maxStock: number }
export interface InvDay { day: number; stock: number; demand: number; shipped: number; shortage: number; received: number; onOrder: number; ordered: boolean }

export function simulateInventory(p: InvParams) {
  const rand = mulberry32(p.seed);
  const gauss = () => {
    const u = Math.max(1e-9, rand()), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  let stock = p.initial;
  const pipeline: { arrive: number; qty: number }[] = [];
  const days: InvDay[] = [];
  let orders = 0;
  for (let d = 1; d <= p.days; d++) {
    let received = 0;
    for (const o of pipeline.filter((o) => o.arrive === d)) received += o.qty;
    stock += received;
    const demand = Math.max(0, Math.round(p.demandMean + gauss() * p.demandSd));
    const shipped = Math.min(stock, demand);
    const shortage = demand - shipped;
    stock -= shipped;
    const onOrder = pipeline.filter((o) => o.arrive > d).reduce((a, o) => a + o.qty, 0);
    let ordered = false;
    if (stock + onOrder <= p.rop) {
      pipeline.push({ arrive: d + p.leadTime, qty: p.orderQty });
      orders++;
      ordered = true;
    }
    days.push({ day: d, stock, demand, shipped, shortage, received, onOrder: onOrder + (ordered ? p.orderQty : 0), ordered });
  }
  const totalDemand = days.reduce((a, d) => a + d.demand, 0);
  const totalShort = days.reduce((a, d) => a + d.shortage, 0);
  const stockoutDays = days.filter((d) => d.shortage > 0).length;
  const avgStock = days.reduce((a, d) => a + d.stock, 0) / days.length;
  const excessDays = days.filter((d) => d.stock > p.maxStock).length;
  return { days, orders, fillRate: totalDemand ? ((totalDemand - totalShort) / totalDemand) * 100 : 100, stockoutDays, avgStock, totalShort, excessDays, daysOfCover: p.demandMean ? avgStock / p.demandMean : 0 };
}

// ---------------------------------------------------------------- Lean factory
export interface LeanImprovement { id: string; name: string; cost: number; description: string; effects: Partial<Record<keyof LeanMetrics, number>> } // multiplicative factors
export interface LeanMetrics { leadTimeDays: number; wip: number; travelM: number; waitingMinPerShift: number; searchMinPerShift: number; changeoverMin: number; outputPerShift: number; spaceM2: number }

export const LEAN_BASELINE: LeanMetrics = { leadTimeDays: 13, wip: 520, travelM: 380, waitingMinPerShift: 95, searchMinPerShift: 22, changeoverMin: 70, outputPerShift: 34, spaceM2: 1800 };

export const LEAN_IMPROVEMENTS: LeanImprovement[] = [
  { id: '5s', name: '5S & shadow boards', cost: 2, description: 'Sort, set in order and shine the cells; tools on shadow boards.', effects: { searchMinPerShift: 0.15, outputPerShift: 1.03, spaceM2: 0.92 } },
  { id: 'cell', name: 'Cellular layout (cut → weld → assemble → test)', cost: 12, description: 'Move machines into one flow cell in process sequence.', effects: { travelM: 0.25, leadTimeDays: 0.6, wip: 0.6, spaceM2: 0.8 } },
  { id: 'kanban', name: 'Kanban pull + FIFO lanes', cost: 4, description: 'Replace MRP push between processes with supermarkets and FIFO lanes with max limits.', effects: { wip: 0.45, leadTimeDays: 0.55 } },
  { id: 'smed', name: 'SMED on welding fixtures', cost: 5, description: 'Pre-stage fixtures, quick clamps, standard programs.', effects: { changeoverMin: 0.3, outputPerShift: 1.06 } },
  { id: 'balance', name: 'Line balancing to takt', cost: 1, description: 'Rebalance stations with a Yamazumi chart; pre-fill at gland station.', effects: { waitingMinPerShift: 0.4, outputPerShift: 1.12 } },
  { id: 'pou', name: 'Point-of-use kitting', cost: 3, description: 'Seal kits and fasteners delivered in kitted trays by a milk run.', effects: { travelM: 0.85, searchMinPerShift: 0.6, waitingMinPerShift: 0.85, outputPerShift: 1.04 } },
  { id: 'tpm', name: 'TPM on the honing bottleneck', cost: 6, description: 'Autonomous maintenance + PM schedule on the constraint.', effects: { waitingMinPerShift: 0.7, outputPerShift: 1.08 } },
];

export function applyLean(selected: string[]): LeanMetrics {
  const m = { ...LEAN_BASELINE };
  for (const imp of LEAN_IMPROVEMENTS.filter((i) => selected.includes(i.id))) {
    for (const [k, f] of Object.entries(imp.effects)) (m as Record<string, number>)[k] *= f as number;
  }
  // Little's law consistency: lead time cannot be below WIP / daily output (2 shifts)
  m.leadTimeDays = Math.max(m.leadTimeDays, m.wip / (m.outputPerShift * 2) / 4);
  return m;
}

// ---------------------------------------------------------------- Daily production
export interface ShiftEvent { title: string; detail: string; options: { label: string; effect: { lostUnits: number; rejects: number; cost: number; nextHoursBonus?: number }; feedback: string; good: boolean }[] }

export const SHIFT_EVENTS: ShiftEvent[] = [
  { title: 'Smooth start', detail: 'Material, people and machines are ready. The hourly target is 5 cylinders.', options: [{ label: 'Hold the 10-minute start-of-shift meeting and confirm the plan', effect: { lostUnits: 0, rejects: 0, cost: 0, nextHoursBonus: 0.2 }, feedback: 'A short SQCDP meeting aligns the team and surfaces risks early.', good: true }, { label: 'Skip the meeting to save time', effect: { lostUnits: 0, rejects: 0, cost: 0 }, feedback: 'No loss now, but problems later are discovered more slowly.', good: false }] },
  { title: 'Seal kits missing at assembly', detail: 'The kitting area has not delivered seal kits for the 80 mm cylinders. Assembly will stop in 10 minutes.', options: [{ label: 'Escalate to stores immediately and re-sequence to 63 mm cylinders with kits available', effect: { lostUnits: 0.5, rejects: 0, cost: 0 }, feedback: 'Escalation plus re-sequencing protects output. Ask PPC why the full-kit check failed.', good: true }, { label: 'Let the fitter go and fetch kits himself', effect: { lostUnits: 1.5, rejects: 0, cost: 0 }, feedback: 'The fitter is away from the line; output is lost and the cause is not fixed.', good: false }, { label: 'Start assembly without seals and fit them later', effect: { lostUnits: 0, rejects: 1, cost: 3000 }, feedback: 'Out-of-sequence assembly creates rework and quality risk.', good: false }] },
  { title: 'Leak-test failures', detail: 'Two cylinders failed the leak test this hour (rod seal).', options: [{ label: 'Stop, contain the batch, call the quality engineer and check the seal-installation tool', effect: { lostUnits: 1, rejects: 2, cost: 3000, nextHoursBonus: 0.3 }, feedback: 'Jidoka: stopping costs output now but prevents a batch of failures.', good: true }, { label: 'Rework the two and keep running', effect: { lostUnits: 0.5, rejects: 2, cost: 3000, nextHoursBonus: -0.6 }, feedback: 'The cause remains — more failures follow in later hours.', good: false }, { label: 'Increase test pressure tolerance so they pass', effect: { lostUnits: 0, rejects: 0, cost: 0, nextHoursBonus: -0.3 }, feedback: 'Never change acceptance criteria to hide a defect — this risks a customer escape.', good: false }] },
  { title: 'Welding robot breakdown', detail: 'Robot R2 stopped with a wire-feed fault. Maintenance estimates 40 minutes.', options: [{ label: 'Call maintenance (Andon), move the welder to manual backup cell, inform PPC', effect: { lostUnits: 1, rejects: 0, cost: 1000 }, feedback: 'Fast escalation and use of the backup limits the loss.', good: true }, { label: 'Wait for maintenance to arrive', effect: { lostUnits: 3, rejects: 0, cost: 0 }, feedback: 'Waiting idles the line; use backup capacity when available.', good: false }] },
  { title: 'Operator absent at test bench', detail: 'One of two certified test operators did not report for the second half of the shift.', options: [{ label: 'Deploy the certified reliever from the skill matrix; delay non-critical training', effect: { lostUnits: 0.5, rejects: 0, cost: 0 }, feedback: 'Skill-matrix planning pays off here.', good: true }, { label: 'Let an uncertified operator run the test', effect: { lostUnits: 0, rejects: 1, cost: 2000 }, feedback: 'Testing is a critical operation — uncertified operators risk escapes and safety incidents.', good: false }, { label: 'Run the bench with one operator only', effect: { lostUnits: 2, rejects: 0, cost: 0 }, feedback: 'Output falls significantly at the constraint.', good: false }] },
  { title: 'Crane waiting at welding', detail: 'Welders wait 10–15 minutes for the shared overhead crane every hour.', options: [{ label: 'Stagger crane use and request a jib crane via Kaizen', effect: { lostUnits: 0.5, rejects: 0, cost: 0, nextHoursBonus: 0.2 }, feedback: 'Short-term countermeasure + permanent improvement request.', good: true }, { label: 'Accept it as normal', effect: { lostUnits: 1, rejects: 0, cost: 0 }, feedback: 'Waiting is waste (Muda) — it must be made visible and attacked.', good: false }] },
  { title: 'Paint shop asks for 10 extra cylinders "to fill the oven"', detail: 'Paint wants to run a full batch, ahead of customer demand.', options: [{ label: 'Decline — follow the plan and demand (avoid overproduction)', effect: { lostUnits: 0, rejects: 0, cost: 0 }, feedback: 'Overproduction is the worst waste; produce to takt.', good: true }, { label: 'Agree to keep paint busy', effect: { lostUnits: 1, rejects: 0, cost: 2000 }, feedback: 'Creates WIP and diverts capacity from required orders.', good: false }] },
  { title: 'End of shift', detail: 'Last hour. Handover is due.', options: [{ label: 'Complete the handover with WIP status, open issues and batch identification', effect: { lostUnits: 0, rejects: 0, cost: 0 }, feedback: 'A clear handover prevents mix-ups like the wrong-bin case.', good: true }, { label: 'Leave a verbal note', effect: { lostUnits: 0, rejects: 0, cost: 0 }, feedback: 'Verbal handovers lose information — partially inspected batches are a typical victim.', good: false }] },
];

export interface HourRecord { hour: number; event: string; choice: string; planned: number; actual: number; rejects: number; lost: number; cost: number; good: boolean }

export function playHour(hour: number, eventIdx: number, optionIdx: number, bonus: number, planned = 5): { rec: HourRecord; bonus: number } {
  const ev = SHIFT_EVENTS[eventIdx];
  const opt = ev.options[optionIdx];
  const base = planned + Math.max(-1.5, Math.min(0.5, bonus));
  const actual = Math.max(0, Math.round((base - opt.effect.lostUnits) * 2) / 2);
  const good = Math.max(0, actual - opt.effect.rejects);
  return {
    rec: { hour, event: ev.title, choice: opt.label, planned, actual: good, rejects: opt.effect.rejects, lost: Math.max(0, planned - good), cost: opt.effect.cost, good: opt.good },
    bonus: bonus + (opt.effect.nextHoursBonus ?? 0),
  };
}
