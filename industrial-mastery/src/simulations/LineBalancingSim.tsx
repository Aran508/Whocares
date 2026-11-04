import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RotateCcw, Wand2 } from 'lucide-react';
import { analyseLine, moveWork, type Station } from './logic';
import { Callout, Card } from '../components/ui';

const INITIAL: Station[] = [
  { name: 'Cutting', time: 40, operators: 1 },
  { name: 'Facing', time: 55, operators: 1 },
  { name: 'Chamfering', time: 30, operators: 1 },
  { name: 'Welding', time: 78, operators: 1 },
  { name: 'Assembly', time: 60, operators: 1 },
];

export default function LineBalancingSim() {
  const [st, setSt] = useState<Station[]>(INITIAL);
  const [demand, setDemand] = useState(400);
  const [hours, setHours] = useState(7.5);
  const takt = (hours * 3600) / demand;
  const a = useMemo(() => analyseLine(st, takt), [st, takt]);
  const set = (i: number, k: 'time' | 'operators', v: number) => setSt((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const autoImprove = () => {
    const eff = st.map((s) => ({ ...s, e: s.time / s.operators }));
    const bn = eff.reduce((x, y) => (y.e > x.e ? y : x));
    const light = eff.reduce((x, y) => (y.e < x.e ? y : x));
    const move = Math.max(1, Math.floor((bn.e - light.e) / 2));
    setSt(moveWork(st, bn.name, light.name, move));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="dem">Demand / shift</label><input id="dem" type="number" min={1} className="input" value={demand} onChange={(e) => setDemand(Math.max(1, Number(e.target.value) || 1))} /></div>
            <div><label className="label" htmlFor="hrs">Net hours / shift</label><input id="hrs" type="number" min={1} step={0.5} className="input" value={hours} onChange={(e) => setHours(Math.max(1, Number(e.target.value) || 1))} /></div>
          </div>
          <p className="text-sm">Takt time = {hours} h × 3600 ÷ {demand} = <span className="font-bold">{takt.toFixed(1)} s</span></p>
          {st.map((s, i) => (
            <div key={s.name} className="rounded-lg border border-navy-100 p-3">
              <div className="flex items-center justify-between text-sm font-semibold"><span>{i + 1}. {s.name}</span><span className={s.name === a.bottleneck ? 'text-bad-600' : 'text-navy-500'}>{(s.time / s.operators).toFixed(0)} s{s.operators > 1 ? ` (${s.time}s ÷ ${s.operators})` : ''}</span></div>
              <input type="range" min={5} max={150} value={s.time} onChange={(e) => set(i, 'time', Number(e.target.value))} className="mt-2 w-full accent-brand-600" aria-label={`${s.name} operation time`} />
              <div className="mt-1 flex items-center gap-2 text-xs text-navy-500">
                Operators:
                {[1, 2].map((o) => <button key={o} onClick={() => set(i, 'operators', o)} className={`rounded px-2 py-0.5 ${s.operators === o ? 'bg-navy-900 text-white' : 'bg-navy-50'}`}>{o}</button>)}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={autoImprove}><Wand2 size={15} /> Apply improvement</button>
            <button className="btn-secondary" onClick={() => setSt(INITIAL)}><RotateCcw size={15} /></button>
          </div>
        </Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[['Bottleneck', a.bottleneck], ['Line cycle', `${a.cycle.toFixed(1)} s`], ['Throughput', `${a.throughputPerHour.toFixed(1)} /h`], ['Line efficiency', `${a.efficiency.toFixed(1)}%`]].map(([l, v]) => (
              <div key={l} className="card p-3"><p className="text-xs text-navy-400">{l}</p><p className="text-lg font-bold">{v}</p></div>
            ))}
          </div>
          <Card className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={st.map((s) => ({ name: s.name, effective: Math.round(s.time / s.operators), idle: Math.round(a.cycle - s.time / s.operators) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" s" width={50} />
                  <Tooltip />
                  <ReferenceLine y={takt} stroke="#0f1b33" strokeDasharray="6 4" label={{ value: `Takt ${takt.toFixed(0)} s`, position: 'insideTopRight', fontSize: 12 }} />
                  <Bar dataKey="effective" stackId="a" name="Work time (s)">
                    {st.map((s) => <Cell key={s.name} fill={s.name === a.bottleneck ? '#d63a3a' : s.time / s.operators > takt ? '#e5830f' : '#2a6fdb'} />)}
                  </Bar>
                  <Bar dataKey="idle" stackId="a" name="Idle per cycle (s)" fill="#d9e8ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-navy-500"><span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-bad-500" /> Bottleneck</span><span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-warn-500" /> Above takt</span><span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-100" /> Idle time</span></div>
          </Card>
          <table className="table-im card overflow-hidden">
            <thead><tr><th>Station</th><th>Utilisation</th><th>Idle per cycle</th></tr></thead>
            <tbody>{a.idle.map((x) => <tr key={x.name}><td>{x.name}</td><td>{x.utilisation.toFixed(0)}%</td><td>{x.idle.toFixed(1)} s</td></tr>)}</tbody>
          </table>
          <Callout tone={a.overTakt.length ? 'bad' : a.efficiency < 85 ? 'warn' : 'ok'} title="Possible improvement">{a.suggestion}{a.minStations !== undefined && ` Theoretical minimum stations at this takt: ${a.minStations}.`}</Callout>
        </div>
      </div>
    </div>
  );
}
