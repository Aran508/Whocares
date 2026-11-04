import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Play, ShieldAlert, XCircle } from 'lucide-react';
import { heatInput, weldCycle, weldQuality, WPS, type Seam, type WeldParams } from './logic';
import { Callout, Card } from '../components/ui';
import { C } from '../diagrams/primitives';

const SEAMS: (Seam & { cx: number; cy: number; r: number })[] = [
  { id: 'base', name: 'Base circumferential seam (Ø100)', length: 314, cx: 120, cy: 150, r: 46 },
  { id: 'port1', name: 'Port boss 1 fillet (Ø32)', length: 101, cx: 230, cy: 150, r: 18 },
  { id: 'port2', name: 'Port boss 2 fillet (Ø32)', length: 101, cx: 470, cy: 150, r: 18 },
  { id: 'clevis', name: 'Rod-end clevis seam (Ø56)', length: 176, cx: 575, cy: 150, r: 28 },
];

const SAFETY = [
  { id: 'door', label: 'Cell door closed — safety interlock made', why: 'Prevents entry into the robot envelope while it moves.' },
  { id: 'curtain', label: 'Light curtain at loading station active', why: 'Stops the robot if someone reaches in at the loading side.' },
  { id: 'estop', label: 'E-stop tested at start of shift', why: 'Emergency stop must be proven to work before automatic operation.' },
  { id: 'fume', label: 'Fume extraction running', why: 'Welding fumes are a health hazard — extraction at source.' },
  { id: 'screen', label: 'Arc screens in place', why: 'Protects people nearby from arc radiation (arc eye).' },
];

export default function WeldingCellLab() {
  const [params, setParams] = useState<WeldParams>({ current: 210, voltage: 25, travel: 360, gas: 12 });
  const [selected, setSelected] = useState<string[]>(['base', 'port1', 'port2']);
  const [safety, setSafety] = useState<string[]>([]);
  const [takt, setTakt] = useState(240);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ seam: number; t: number } | null>(null);
  const [done, setDone] = useState(false);
  const raf = useRef<number>();
  const q = weldQuality(params);
  const seams = SEAMS.filter((s) => selected.includes(s.id));
  const cyc = weldCycle(seams, params.travel);
  const missing = SAFETY.filter((s) => !safety.includes(s.id));

  const run = () => {
    if (missing.length || !seams.length) return;
    setRunning(true);
    setDone(false);
    let i = 0, t0 = performance.now();
    const step = (now: number) => {
      const dur = 1200 + seams[i].length * 4;
      const t = Math.min(1, (now - t0) / dur);
      setProgress({ seam: i, t });
      if (t >= 1) {
        i++;
        t0 = now;
        if (i >= seams.length) {
          setRunning(false);
          setDone(true);
          setProgress(null);
          return;
        }
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const torch = progress ? (() => { const s = seams[progress.seam]; const a = progress.t * Math.PI * 2 - Math.PI / 2; return { x: s.cx + s.r * Math.cos(a), y: s.cy + s.r * Math.sin(a), s, a }; })() : null;
  const p = (k: keyof WeldParams, label: string, min: number, max: number, unit: string, range: readonly [number, number]) => {
    const ok = params[k] >= range[0] && params[k] <= range[1];
    return (
      <div>
        <div className="flex justify-between text-sm"><label>{label} <span className="text-xs text-navy-400">(WPS {range[0]}–{range[1]})</span></label><span className={`font-mono font-semibold ${ok ? 'text-ok-700' : 'text-bad-600'}`}>{params[k]} {unit}</span></div>
        <input type="range" min={min} max={max} value={params[k]} disabled={running} onChange={(e) => { setParams({ ...params, [k]: Number(e.target.value) }); setDone(false); }} className="w-full accent-brand-600" aria-label={label} />
      </div>
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Card className="p-3">
          <svg viewBox="0 0 700 330" className="w-full h-auto rounded-lg bg-navy-50" role="img" aria-label="Robotic welding cell, top view">
            <rect x={20} y={20} width={660} height={290} fill="none" stroke={missing.find((m) => m.id === 'door') ? C.red : C.orange} strokeWidth={3} strokeDasharray="10 6" />
            <text x={30} y={40} fontSize={11} fill={C.muted}>Guarded cell</text>
            {/* positioner + cylinder tube */}
            <rect x={70} y={120} width={30} height={60} fill={C.steelDark} />
            <rect x={600} y={120} width={30} height={60} fill={C.steelDark} />
            <rect x={100} y={128} width={500} height={44} rx={8} fill={C.steel} stroke={C.steelDark} />
            {SEAMS.map((s) => {
              const on = selected.includes(s.id);
              const doneSeam = done ? on : progress ? seams.findIndex((x) => x.id === s.id) < progress.seam && on : false;
              return (
                <g key={s.id}>
                  <circle cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke={doneSeam ? (q.ok ? C.green : C.red) : on ? C.orange : C.line} strokeWidth={on ? 4 : 2} strokeDasharray={on ? undefined : '4 4'} />
                  <text x={s.cx} y={s.cy - s.r - 8} textAnchor="middle" fontSize={10} fill={C.navy}>{s.name.split(' (')[0]}</text>
                </g>
              );
            })}
            {torch && (() => { const arc = (torch.a - (-Math.PI / 2)); return <path d={`M ${torch.s.cx} ${torch.s.cy - torch.s.r} A ${torch.s.r} ${torch.s.r} 0 ${arc > Math.PI ? 1 : 0} 1 ${torch.x} ${torch.y}`} fill="none" stroke={C.green} strokeWidth={5} />; })()}
            {/* robot */}
            <circle cx={350} cy={265} r={26} fill={C.navy} />
            <line x1={350} y1={265} x2={torch ? torch.x : 350} y2={torch ? torch.y : 205} stroke={C.orange} strokeWidth={14} strokeLinecap="round" />
            {torch && <><circle cx={torch.x} cy={torch.y} r={10} fill="#ffe27a" opacity={0.9} /><circle cx={torch.x} cy={torch.y} r={20} fill="#ffe27a" opacity={0.25} /></>}
            {/* light curtain & loading */}
            <rect x={640} y={250} width={40} height={60} fill={safety.includes('curtain') ? C.greenLight : C.redLight} />
            {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={640} y1={254 + i * 12} x2={680} y2={254 + i * 12} stroke={safety.includes('curtain') ? C.green : C.red} strokeDasharray="2 3" />)}
            <text x={660} y={244} textAnchor="middle" fontSize={9} fill={C.muted}>Load</text>
            {safety.includes('fume') && <path d="M 350 110 q 10 -30 0 -60 M 370 110 q 10 -30 0 -60" stroke={C.steel} strokeWidth={3} fill="none" />}
            <text x={350} y={322} textAnchor="middle" fontSize={11} fill={C.muted}>Robot on fixed base · two-axis positioner rotates the tube between seams</text>
          </svg>
        </Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Heat input', `${heatInput(params).toFixed(2)} kJ/mm`], ['Arc-on time', `${cyc.arc.toFixed(0)} s`], ['Cycle time', `${cyc.cycle.toFixed(0)} s`], ['Arc-on ratio', `${cyc.arcOnRatio.toFixed(0)}%`]].map(([l, v]) => <div key={l} className="card p-3"><p className="text-xs text-navy-400">{l}</p><p className="text-lg font-bold">{v}</p></div>)}
        </div>
        {done && (
          <Callout tone={q.ok ? 'ok' : 'bad'} title={q.ok ? 'Weld inspection: PASS' : 'Weld inspection: FAIL'}>
            {q.ok ? `All ${seams.length} seams welded within the WPS. Cycle ${cyc.cycle.toFixed(0)} s vs takt ${takt} s — ${cyc.cycle <= takt ? 'meets takt.' : 'exceeds takt; consider a second positioner station so the operator loads while the robot welds (convert loading to external time).'}` : <ul className="list-disc pl-5">{q.issues.concat(q.inWps ? [] : ['One or more parameters are outside the qualified WPS range — production welds must be within WPS.']).map((i) => <li key={i}>{i}</li>)}</ul>}
          </Callout>
        )}
        <Card className="p-5 text-sm text-navy-600">
          <h3 className="font-bold text-navy-900">What you are learning</h3>
          <p className="mt-1">Heat input = V × I × 60 ÷ (travel speed mm/min × 1000) in kJ/mm. Too little → lack of fusion; too much → burn-through and distortion. Gas flow protects the weld pool: below the WPS minimum, porosity appears. The robot only repeats what it is given — the WPS, the program and the safety system decide quality and safety.</p>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <h3 className="font-bold">1. Weld program — select seams</h3>
          {SEAMS.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-600" disabled={running} checked={selected.includes(s.id)} onChange={() => { setSelected(selected.includes(s.id) ? selected.filter((x) => x !== s.id) : [...selected, s.id]); setDone(false); }} />{s.name} <span className="ml-auto text-xs text-navy-400">{s.length} mm</span></label>
          ))}
        </Card>
        <Card className="space-y-3 p-5">
          <h3 className="font-bold">2. Welding parameters (WPS-07)</h3>
          {p('current', 'Current', 150, 280, 'A', WPS.current)}
          {p('voltage', 'Voltage', 18, 34, 'V', WPS.voltage)}
          {p('travel', 'Travel speed', 200, 600, 'mm/min', WPS.travel)}
          {p('gas', 'Gas flow (Ar/CO₂)', 5, 30, 'L/min', WPS.gas)}
          <div className="flex items-center gap-2 text-sm">{q.inWps ? <CheckCircle2 size={16} className="text-ok-600" /> : <XCircle size={16} className="text-bad-600" />}{q.inWps ? 'All parameters within WPS' : 'Parameters outside WPS'}</div>
          <div><label className="label" htmlFor="takt">Takt time (s)</label><input id="takt" type="number" className="input" value={takt} onChange={(e) => setTakt(Math.max(30, Number(e.target.value) || 30))} /></div>
        </Card>
        <Card className="space-y-2 p-5">
          <h3 className="flex items-center gap-2 font-bold"><ShieldAlert size={16} className="text-bad-500" /> 3. Safety checks before automatic run</h3>
          {SAFETY.map((s) => (
            <label key={s.id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-ok-600" disabled={running} checked={safety.includes(s.id)} onChange={() => setSafety(safety.includes(s.id) ? safety.filter((x) => x !== s.id) : [...safety, s.id])} /><span>{s.label}<span className="block text-xs text-navy-400">{s.why}</span></span></label>
          ))}
        </Card>
        <button className="btn-primary w-full py-3" disabled={running || missing.length > 0 || !seams.length} onClick={run}><Play size={16} /> {running ? 'Welding…' : 'Run cycle'}</button>
        {missing.length > 0 && <p className="text-xs text-bad-600">Automatic run is blocked: {missing.length} safety condition{missing.length > 1 ? 's' : ''} not met. In a real cell the safety PLC enforces this.</p>}
      </div>
    </div>
  );
}
