import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { oee } from './logic';
import { Callout, Card } from '../components/ui';

const BASE = { planned: 450, down: 60, ict: 1.2, total: 280, rej: 14 };

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><label className="font-medium">{label}</label><span className="font-semibold">{value} {unit}</span></div>
      <input type="range" className="w-full accent-brand-600" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  );
}

export default function OeeSim() {
  const [v, setV] = useState(BASE);
  const maxTotal = Math.floor((v.planned - v.down) / v.ict);
  const total = Math.min(v.total, maxTotal);
  const rej = Math.min(v.rej, total);
  const r = oee(v.planned, v.down, v.ict, total, rej);
  const b = oee(BASE.planned, BASE.down, BASE.ict, BASE.total, BASE.rej);
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  const weakest = [['Availability', r.A], ['Performance', r.P], ['Quality', r.Q]].sort((a, c) => (a[1] as number) - (c[1] as number))[0][0];
  const scenarios: [string, Partial<typeof BASE>][] = [
    ['Halve downtime (TPM)', { down: Math.round(BASE.down / 2) }],
    ['SMED + no minor stops', { total: Math.min(Math.floor((BASE.planned - BASE.down) / BASE.ict), BASE.total + 40) }],
    ['Poka-Yoke halves rejects', { rej: Math.round(BASE.rej / 2) }],
    ['Reset', BASE],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="space-y-4 p-5">
        <Slider label="Planned production time" value={v.planned} min={240} max={480} unit="min" onChange={(x) => setV({ ...v, planned: x })} />
        <Slider label="Downtime" value={v.down} min={0} max={Math.min(200, v.planned - 30)} unit="min" onChange={(x) => setV({ ...v, down: x })} />
        <Slider label="Ideal cycle time" value={v.ict} min={0.5} max={3} step={0.1} unit="min" onChange={(x) => setV({ ...v, ict: x })} />
        <Slider label="Actual production (total)" value={total} min={0} max={maxTotal} unit="units" onChange={(x) => setV({ ...v, total: x })} />
        <Slider label="Rejected quantity" value={rej} min={0} max={Math.max(0, total)} unit="units" onChange={(x) => setV({ ...v, rej: x })} />
        <p className="text-xs text-navy-400">Total production is capped at run time ÷ ideal cycle time = {maxTotal} units (performance cannot exceed 100%).</p>
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map(([n, p]) => <button key={n} className="btn-secondary text-xs" onClick={() => setV(n === 'Reset' ? BASE : { ...BASE, ...p })}>{n}</button>)}
        </div>
      </Card>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Availability', r.A, b.A], ['Performance', r.P, b.P], ['Quality', r.Q, b.Q], ['OEE', r.oee, b.oee]].map(([l, x, y]) => (
            <div key={l as string} className={`card p-3 ${l === 'OEE' ? 'ring-2 ring-brand-200' : ''}`}>
              <p className="text-xs text-navy-400">{l as string}</p>
              <p className="text-2xl font-bold">{pct(x as number)}</p>
              <p className={`text-xs ${(x as number) >= (y as number) ? 'text-ok-600' : 'text-bad-600'}`}>{(x as number) >= (y as number) ? '▲' : '▼'} {(((x as number) - (y as number)) * 100).toFixed(1)} pts vs baseline</p>
            </div>
          ))}
        </div>
        <Card className="p-4">
          <p className="mb-2 text-sm font-semibold">Where the planned time goes (minutes)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ n: 'Planned', v: v.planned }, { n: 'Downtime', v: v.down }, { n: 'Speed loss', v: Math.round(r.speedLoss) }, { n: 'Quality loss', v: Math.round(r.qualityLoss) }, { n: 'Fully productive', v: Math.round(v.ict * r.good) }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                <XAxis dataKey="n" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={40} />
                <Tooltip />
                <Bar dataKey="v" name="Minutes" radius={[4, 4, 0, 0]}>
                  {['#0f1b33', '#d63a3a', '#e5830f', '#d63a3a', '#1f9d5c'].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Callout tone={r.oee >= 0.85 ? 'ok' : r.oee >= 0.6 ? 'warn' : 'bad'} title="Interpretation">
          OEE = {pct(r.A)} × {pct(r.P)} × {pct(r.Q)} = <b>{pct(r.oee)}</b>. The weakest factor is <b>{weakest}</b> — {weakest === 'Availability' ? 'attack breakdowns and setups (TPM, SMED).' : weakest === 'Performance' ? 'attack minor stops and reduced speed (observation, standard work).' : 'attack defects at the source (Poka-Yoke, SPC).'} Hidden capacity at 85% OEE: {Math.max(0, Math.round((0.85 - r.oee) * v.planned / v.ict))} more good units per shift.
        </Callout>
      </div>
    </div>
  );
}
