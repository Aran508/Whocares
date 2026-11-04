import { useMemo, useState } from 'react';
import { applyLean, LEAN_BASELINE, LEAN_IMPROVEMENTS, type LeanMetrics } from './logic';
import { Callout, Card } from '../components/ui';
import { C } from '../diagrams/primitives';

const BUDGET = 20;
const ROWS: [keyof LeanMetrics, string, string, boolean][] = [
  ['leadTimeDays', 'Lead time', 'days', false],
  ['wip', 'WIP', 'pcs', false],
  ['travelM', 'Travel per cylinder', 'm', false],
  ['waitingMinPerShift', 'Waiting', 'min/shift', false],
  ['searchMinPerShift', 'Searching', 'min/shift', false],
  ['changeoverMin', 'Changeover', 'min', false],
  ['outputPerShift', 'Output', 'cyl/shift', true],
  ['spaceM2', 'Floor space', 'm²', false],
];

function FactoryView({ cell, kanban, fiveS }: { cell: boolean; kanban: boolean; fiveS: boolean }) {
  const pos = cell ? [[80, 70], [180, 70], [280, 70], [280, 170], [180, 170], [80, 170]] : [[40, 40], [380, 60], [60, 190], [330, 190], [200, 120], [420, 160]];
  const names = ['Cut', 'Hone', 'Weld', 'Assy', 'Test', 'Paint'];
  const wip = kanban ? 2 : 7;
  return (
    <svg viewBox="0 0 480 250" className="w-full h-auto rounded-lg bg-navy-50" role="img" aria-label={cell ? 'Cellular layout' : 'Scattered functional layout'}>
      <polyline points={pos.map((p) => `${p[0] + 30},${p[1] + 18}`).join(' ')} fill="none" stroke={cell ? C.green : C.red} strokeWidth={2} strokeDasharray={cell ? undefined : '6 4'} />
      {pos.map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={60} height={36} rx={6} fill={C.blueLight} stroke={C.blue} />
          <text x={x + 30} y={y + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.navy}>{names[i]}</text>
          {i < 5 && Array.from({ length: wip }, (_, k) => <rect key={k} x={x + 62 + (k % 3) * 7} y={y + 2 + Math.floor(k / 3) * 7} width={5} height={5} fill={C.orange} />)}
        </g>
      ))}
      {!fiveS && [[150, 30], [250, 225], [420, 100], [120, 140]].map(([x, y], i) => <rect key={i} x={x} y={y} width={14} height={10} fill="#b9a27d" transform={`rotate(${i * 25} ${x} ${y})`} />)}
      <text x={240} y={244} textAnchor="middle" fontSize={11} fill={C.muted}>{cell ? 'U-cell: short flow, one team' : 'Functional layout: long, crossing routes'} · orange = WIP · brown = clutter</text>
    </svg>
  );
}

export default function LeanFactorySim() {
  const [sel, setSel] = useState<string[]>([]);
  const m = useMemo(() => applyLean(sel), [sel]);
  const spent = LEAN_IMPROVEMENTS.filter((i) => sel.includes(i.id)).reduce((a, i) => a + i.cost, 0);
  const toggle = (id: string) => {
    if (sel.includes(id)) return setSel(sel.filter((x) => x !== id));
    const cost = LEAN_IMPROVEMENTS.find((i) => i.id === id)!.cost;
    if (spent + cost <= BUDGET) setSel([...sel, id]);
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <Card className="p-5">
        <p className="text-sm text-navy-500">Budget: ₹{BUDGET} lakh. Choose improvements for the cylinder plant.</p>
        <div className="mt-2 h-2 rounded-full bg-navy-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(spent / BUDGET) * 100}%` }} /></div>
        <p className="mt-1 text-xs text-navy-400">Spent ₹{spent} lakh of ₹{BUDGET} lakh</p>
        <div className="mt-3 space-y-2">
          {LEAN_IMPROVEMENTS.map((i) => {
            const on = sel.includes(i.id);
            const afford = on || spent + i.cost <= BUDGET;
            return (
              <label key={i.id} className={`flex gap-3 rounded-lg border p-3 text-sm ${on ? 'border-ok-500 bg-ok-50' : afford ? 'border-navy-100' : 'border-navy-100 opacity-50'}`}>
                <input type="checkbox" className="mt-1 accent-ok-600" checked={on} disabled={!afford} onChange={() => toggle(i.id)} />
                <span><span className="font-semibold">{i.name}</span> <span className="text-xs text-navy-400">₹{i.cost} L</span><br /><span className="text-navy-500">{i.description}</span></span>
              </label>
            );
          })}
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="p-4"><FactoryView cell={sel.includes('cell')} kanban={sel.includes('kanban')} fiveS={sel.includes('5s')} /></Card>
        <Card className="overflow-x-auto">
          <table className="table-im">
            <thead><tr><th>Metric</th><th>Before</th><th>After</th><th>Change</th></tr></thead>
            <tbody>
              {ROWS.map(([k, l, u, higher]) => {
                const b = LEAN_BASELINE[k], a = m[k];
                const ch = ((a - b) / b) * 100;
                const good = higher ? ch > 0.5 : ch < -0.5;
                return <tr key={k}><td>{l}</td><td>{b.toFixed(k === 'leadTimeDays' ? 1 : 0)} {u}</td><td className="font-semibold">{a.toFixed(k === 'leadTimeDays' ? 1 : 0)} {u}</td><td className={good ? 'text-ok-700' : Math.abs(ch) < 0.5 ? 'text-navy-400' : 'text-bad-700'}>{ch > 0 ? '+' : ''}{ch.toFixed(0)}%</td></tr>;
              })}
            </tbody>
          </table>
        </Card>
        <Callout tone={sel.length ? 'ok' : 'info'} title="Manager's reading">
          {sel.length === 0 ? 'Choose improvements on the left. Watch which wastes each one removes.' : `Output ${m.outputPerShift.toFixed(0)} cylinders/shift (+${(((m.outputPerShift - LEAN_BASELINE.outputPerShift) / LEAN_BASELINE.outputPerShift) * 100).toFixed(0)}%) and lead time ${m.leadTimeDays.toFixed(1)} days. ${!sel.includes('5s') ? 'Tip: 5S is cheap and is the foundation for sustaining everything else.' : ''} ${sel.includes('kanban') && !sel.includes('smed') ? 'Kanban works best when changeovers are short — consider SMED.' : ''}`}
        </Callout>
      </div>
    </div>
  );
}
