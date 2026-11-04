import { useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';
import { playHour, SHIFT_EVENTS, type HourRecord } from './logic';
import { Callout, Card } from '../components/ui';

export default function DailyProductionSim() {
  const [records, setRecords] = useState<HourRecord[]>([]);
  const [bonus, setBonus] = useState(0);
  const hour = records.length;
  const done = hour >= SHIFT_EVENTS.length;
  const ev = SHIFT_EVENTS[Math.min(hour, SHIFT_EVENTS.length - 1)];
  const planned = SHIFT_EVENTS.length * 5;
  const actual = records.reduce((a, r) => a + r.actual, 0);
  const rejects = records.reduce((a, r) => a + r.rejects, 0);
  const cost = records.reduce((a, r) => a + r.cost, 0);
  const goodDecisions = records.filter((r) => r.good).length;

  const choose = (i: number) => {
    const { rec, bonus: nb } = playHour(hour + 1, hour, i, bonus);
    setRecords([...records, rec]);
    setBonus(nb);
  };
  let cumP = 0, cumA = 0;
  const chart = records.map((r) => { cumP += r.planned; cumA += r.actual; return { h: `H${r.hour}`, actual: r.actual, cumPlan: cumP, cumActual: cumA }; });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[['Planned', planned], ['Actual (good)', actual], ['Shortfall', Math.max(0, records.length * 5 - actual)], ['Rejected', rejects], ['Extra cost', `₹${cost.toLocaleString()}`]].map(([l, v]) => <div key={l as string} className="card p-3"><p className="text-xs text-navy-400">{l}</p><p className="text-lg font-bold">{v}</p></div>)}
        </div>
        <Card className="p-4">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                <XAxis dataKey="h" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={30} />
                <Tooltip />
                <Bar dataKey="actual" name="Good output this hour" fill="#2a6fdb" radius={[4, 4, 0, 0]} />
                <Line dataKey="cumPlan" name="Cumulative plan" stroke="#0f1b33" strokeDasharray="6 4" dot={false} />
                <Line dataKey="cumActual" name="Cumulative actual" stroke="#1f9d5c" strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="overflow-x-auto">
          <table className="table-im min-w-[640px]">
            <thead><tr><th>Hour</th><th>Plan</th><th>Actual</th><th>Rejects</th><th>Loss reason</th><th>Your decision</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.hour} className={r.actual < r.planned ? 'bg-bad-50/40' : ''}>
                  <td>H{r.hour}</td><td>{r.planned}</td><td className="font-semibold">{r.actual}</td><td>{r.rejects}</td><td>{r.event}</td>
                  <td className="text-xs"><span className="flex items-start gap-1">{r.good ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok-600" /> : <XCircle size={14} className="mt-0.5 shrink-0 text-bad-600" />}{r.choice}</span></td>
                </tr>
              ))}
              {!records.length && <tr><td colSpan={6} className="text-center text-navy-400">The hourly production board fills as the shift progresses.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="space-y-4">
        {!done ? (
          <Card className="p-5">
            <p className="section-title">Hour {hour + 1} of {SHIFT_EVENTS.length} · Target 5 cylinders</p>
            <h3 className="mt-1 text-lg font-bold">{ev.title}</h3>
            <p className="mt-1 text-sm text-navy-600">{ev.detail}</p>
            <p className="mt-3 text-sm font-semibold">As production manager, what do you do?</p>
            <div className="mt-2 grid gap-2">{ev.options.map((o, i) => <button key={i} className="btn-secondary h-auto justify-start whitespace-normal py-2.5 text-left" onClick={() => choose(i)}>{o.label}</button>)}</div>
            {records.length > 0 && <p className="mt-3 rounded-lg bg-navy-50 p-3 text-xs text-navy-600"><b>Last decision:</b> {SHIFT_EVENTS[hour - 1].options.find((o) => o.label === records[hour - 1].choice)?.feedback}</p>}
          </Card>
        ) : (
          <Card className="space-y-3 p-5">
            <h3 className="text-lg font-bold">Shift summary</h3>
            <p className="text-sm">Delivered <b>{actual}</b> of {planned} planned cylinders ({((actual / planned) * 100).toFixed(0)}%), {rejects} rejected, extra cost ₹{cost.toLocaleString()}.</p>
            <p className="text-sm">Good management decisions: <b>{goodDecisions} of {records.length}</b>.</p>
            <ul className="space-y-1 text-xs text-navy-600">{records.filter((r) => !r.good).map((r) => <li key={r.hour}>H{r.hour} — {SHIFT_EVENTS[r.hour - 1].options.find((o) => o.label === r.choice)?.feedback}</li>)}</ul>
            <Callout tone="manager" title="MANAGER'S INSIGHT"><span className="text-navy-100">Good shift managers protect safety and quality first, escalate early, use backup capacity, avoid overproduction and leave a clear handover. Output follows good decisions.</span></Callout>
            <button className="btn-primary" onClick={() => { setRecords([]); setBonus(0); }}>Run a new shift</button>
          </Card>
        )}
      </div>
    </div>
  );
}
