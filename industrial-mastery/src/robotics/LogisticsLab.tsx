import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, UserRound } from 'lucide-react';
import { astar, followGuidePath, guidePath, key, palletPlan, type Cell } from './logic';
import { Callout, Card, Tabs } from '../components/ui';
import { C } from '../diagrams/primitives';

const GW = 16, GH = 10, CS = 40, CELL_M = 2;
const STORE: Cell = { x: 1, y: 5 };
const STATIONS: { name: string; c: Cell }[] = [
  { name: 'Welding', c: { x: 14, y: 1 } },
  { name: 'Assembly', c: { x: 14, y: 5 } },
  { name: 'Test', c: { x: 14, y: 8 } },
];
const AISLE = 5;
const RACKS = new Set<string>([...[3, 4, 5, 6, 7, 8].flatMap((x) => [key({ x, y: 2 }), key({ x, y: 8 })]), ...[10, 11].flatMap((x) => [key({ x, y: 3 }), key({ x, y: 7 })])]);

function MobileRobots() {
  const [obstacles, setObstacles] = useState<Set<string>>(new Set([key({ x: 8, y: 5 })]));
  const [mode, setMode] = useState<'AGV' | 'AMR'>('AGV');
  const [anim, setAnim] = useState<{ path: Cell[]; i: number } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState<{ delivered: number; distance: number; time: number; blocked: number } | null>(null);
  const raf = useRef<number>();
  const blocked = useMemo(() => new Set([...RACKS, ...obstacles]), [obstacles]);

  const plan = () => {
    const legs: Cell[][] = [];
    const lines: string[] = [];
    let delivered = 0, distance = 0, blockedCount = 0;
    let pos = STORE;
    for (const st of STATIONS) {
      for (const [from, to, label] of [[pos, st.c, `to ${st.name}`], [st.c, STORE, 'back to stores']] as const) {
        if (mode === 'AGV') {
          const g = guidePath(from, to, AISLE);
          const r = followGuidePath(g, new Set([...obstacles].filter((k) => k !== key(to))));
          legs.push(r.path);
          distance += Math.max(0, r.path.length - 1);
          if (r.blockedAt) {
            blockedCount++;
            lines.push(`AGV stopped ${label}: obstacle on guide path at (${r.blockedAt.x}, ${r.blockedAt.y}). It waits for a person to clear it.`);
            return { legs, lines, delivered, distance, blocked: blockedCount };
          }
        } else {
          const p = astar(GW, GH, blocked, from, to);
          if (!p) { lines.push(`AMR found no route ${label}.`); blockedCount++; return { legs, lines, delivered, distance, blocked: blockedCount }; }
          legs.push(p);
          distance += p.length - 1;
        }
        if (to !== STORE) { delivered++; lines.push(`Delivered seal kits ${label}.`); }
        pos = to;
      }
    }
    return { legs, lines, delivered, distance, blocked: blockedCount };
  };

  const run = () => {
    const r = plan();
    const path = r.legs.flat();
    const time = (r.distance * CELL_M) / 1.0 + r.delivered * 30; // 1 m/s, 30 s handover per delivery
    setLog(r.lines);
    setStats({ delivered: r.delivered, distance: r.distance * CELL_M, time, blocked: r.blocked });
    let i = 0, last = performance.now();
    const step = (now: number) => {
      if (now - last > 70) { i++; last = now; setAnim({ path, i }); }
      if (i < path.length - 1) raf.current = requestAnimationFrame(step);
    };
    setAnim({ path, i: 0 });
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const toggle = (c: Cell) => {
    const k = key(c);
    if (RACKS.has(k) || k === key(STORE) || STATIONS.some((s) => key(s.c) === k)) return;
    const n = new Set(obstacles);
    if (n.has(k)) n.delete(k); else n.add(k);
    setObstacles(n);
    setAnim(null);
    setStats(null);
  };
  const veh = anim ? anim.path[Math.min(anim.i, anim.path.length - 1)] : STORE;
  const trail = anim ? anim.path.slice(0, anim.i + 1) : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <Card className="p-3">
        <svg viewBox={`0 0 ${GW * CS} ${GH * CS}`} className="w-full h-auto rounded-lg bg-white" role="img" aria-label="Warehouse grid with mobile robot">
          {Array.from({ length: GW * GH }, (_, n) => {
            const x = n % GW, y = Math.floor(n / GW), k = key({ x, y });
            const isRack = RACKS.has(k), isObs = obstacles.has(k);
            return <rect key={k} x={x * CS} y={y * CS} width={CS} height={CS} fill={isRack ? C.steelDark : isObs ? C.orange : y === AISLE ? '#fff8e1' : C.bg} stroke="#e4eaf4" onClick={() => toggle({ x, y })} style={{ cursor: isRack ? 'default' : 'pointer' }} />;
          })}
          <line x1={0} y1={AISLE * CS + CS / 2} x2={GW * CS} y2={AISLE * CS + CS / 2} stroke="#f2c94c" strokeWidth={4} strokeDasharray="8 6" opacity={mode === 'AGV' ? 1 : 0.3} />
          {[STORE, ...STATIONS.map((s) => s.c)].map((c, i) => <rect key={i} x={c.x * CS + 3} y={c.y * CS + 3} width={CS - 6} height={CS - 6} rx={6} fill={i === 0 ? C.navy : C.green} />)}
          <text x={STORE.x * CS + CS / 2} y={STORE.y * CS - 6} textAnchor="middle" fontSize={11} fill={C.navy}>Stores</text>
          {STATIONS.map((s) => <text key={s.name} x={s.c.x * CS + CS / 2} y={s.c.y * CS - 6} textAnchor="middle" fontSize={11} fill={C.navy}>{s.name}</text>)}
          {trail.length > 1 && <polyline points={trail.map((c) => `${c.x * CS + CS / 2},${c.y * CS + CS / 2}`).join(' ')} fill="none" stroke={mode === 'AGV' ? C.blue : C.green} strokeWidth={3} opacity={0.7} />}
          <rect x={veh.x * CS + 8} y={veh.y * CS + 10} width={CS - 16} height={CS - 20} rx={5} fill={mode === 'AGV' ? C.blue : C.green} stroke={C.navy} />
          {mode === 'AMR' && <circle cx={veh.x * CS + CS / 2} cy={veh.y * CS + CS / 2} r={CS * 0.9} fill="none" stroke={C.green} strokeDasharray="3 4" opacity={0.6} />}
        </svg>
        <p className="mt-2 text-xs text-navy-400">Click empty cells to place or remove obstacles (orange = pallet left in the aisle). Dark cells are racks. Yellow dashed line = AGV magnetic guide tape. 1 cell = {CELL_M} m.</p>
      </Card>
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <Tabs tabs={[{ id: 'AGV', label: 'AGV — fixed guide path' }, { id: 'AMR', label: 'AMR — autonomous navigation' }]} value={mode} onChange={(m) => { setMode(m); setAnim(null); setStats(null); }} />
          <p className="text-sm text-navy-600">{mode === 'AGV' ? 'An Automated Guided Vehicle follows magnetic tape. It is simple and predictable, but it cannot leave its path: an obstacle on the tape stops it.' : 'An Autonomous Mobile Robot uses lidar and a map to plan its own route (here: A* path-finding) and drives around obstacles.'}</p>
          <div className="flex gap-2"><button className="btn-primary flex-1" onClick={run}><Play size={15} /> Run 3 deliveries</button><button className="btn-secondary" onClick={() => { setObstacles(new Set()); setAnim(null); setStats(null); }}><RotateCcw size={15} /></button></div>
        </Card>
        {stats && (
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-navy-400">Deliveries</p><p className="text-lg font-bold">{stats.delivered} / 3</p></div>
              <div><p className="text-xs text-navy-400">Distance</p><p className="text-lg font-bold">{stats.distance} m</p></div>
              <div><p className="text-xs text-navy-400">Time (1 m/s + 30 s/drop)</p><p className="text-lg font-bold">{Math.round(stats.time)} s</p></div>
              <div><p className="text-xs text-navy-400">Deliveries / hour</p><p className="text-lg font-bold">{stats.delivered ? ((stats.delivered / stats.time) * 3600).toFixed(0) : 0}</p></div>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-navy-600">{log.map((l, i) => <li key={i}>• {l}</li>)}</ul>
          </Card>
        )}
        <Callout tone="manager" title="MANAGER'S INSIGHT"><span className="text-navy-100">AGVs suit stable, repeat routes with disciplined aisles; AMRs suit changing layouts and mixed traffic but cost more and need good maps and Wi-Fi. Either way, 5S in the aisles (no pallets left on routes) decides real throughput.</span></Callout>
      </div>
    </div>
  );
}

function Palletising() {
  const [o, setO] = useState({ palletL: 1200, palletW: 800, maxH: 1200, boxL: 400, boxW: 300, boxH: 250, pickSec: 7, humanNearby: false, collaborativeFactor: 0.5 });
  const r = palletPlan(o);
  const num = (k: keyof typeof o, label: string, min: number, max: number, step = 10) => (
    <div key={k}><label className="label" htmlFor={k}>{label}</label><input id={k} type="number" className="input" min={min} max={max} step={step} value={o[k] as number} onChange={(e) => { const v = Number(e.target.value); if (isFinite(v) && v >= min && v <= max) setO({ ...o, [k]: v }); }} /></div>
  );
  // draw one layer (best orientation found)
  const colsA = Math.floor(o.palletL / o.boxL), rowsA = Math.floor(o.palletW / o.boxW);
  const colsB = Math.floor(o.palletL / o.boxW), rowsB = Math.floor(o.palletW / o.boxL);
  const useB = colsB * rowsB > colsA * rowsA;
  const s = 360 / o.palletL;
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  const bw = useB ? o.boxW : o.boxL, bh = useB ? o.boxL : o.boxW;
  for (let i = 0; i < (useB ? colsB : colsA); i++) for (let j = 0; j < (useB ? rowsB : rowsA); j++) boxes.push({ x: i * bw, y: j * bh, w: bw, h: bh });
  const restX = (useB ? colsB : colsA) * bw;
  if (!useB && o.palletL - restX >= o.boxW) for (let i = 0; i < Math.floor((o.palletL - restX) / o.boxW); i++) for (let j = 0; j < Math.floor(o.palletW / o.boxL); j++) boxes.push({ x: restX + i * o.boxW, y: j * o.boxL, w: o.boxW, h: o.boxL });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card className="p-4">
          <svg viewBox="0 0 520 330" className="w-full h-auto rounded-lg bg-navy-50" role="img" aria-label="Pallet layer pattern and cobot">
            <rect x={20} y={20} width={o.palletL * s} height={o.palletW * s} fill="#c9a36b" stroke="#8a6a3b" strokeWidth={2} />
            {boxes.map((b, i) => <rect key={i} x={20 + b.x * s + 1} y={20 + b.y * s + 1} width={b.w * s - 2} height={b.h * s - 2} fill={C.orange} stroke="#97510a" />)}
            <text x={20} y={20 + o.palletW * s + 18} fontSize={11} fill={C.muted}>Top view of one layer — {r.perLayer} cartons, {r.areaUse.toFixed(0)}% of pallet area used</text>
            <circle cx={450} cy={150} r={22} fill={C.navy} />
            <path d={`M 450 150 L 430 100 L 395 ${o.humanNearby ? 120 : 80}`} fill="none" stroke={C.blue} strokeWidth={12} strokeLinecap="round" />
            <circle cx={450} cy={150} r={o.humanNearby ? 60 : 90} fill="none" stroke={o.humanNearby ? C.orange : C.green} strokeDasharray="5 4" />
            {o.humanNearby && <g><circle cx={490} cy={250} r={10} fill="#e8b98e" /><rect x={480} y={262} width={20} height={34} rx={5} fill={C.green} /></g>}
            <text x={450} y={290} textAnchor="middle" fontSize={10} fill={C.muted}>{o.humanNearby ? 'Person in zone → reduced speed' : 'Zone clear → full speed'}</text>
          </svg>
        </Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Cartons / layer', r.perLayer], ['Layers', r.layers], ['Cartons / pallet', r.total], ['Cartons / hour', r.boxesPerHour.toFixed(0)]].map(([l, v]) => <div key={l as string} className="card p-3"><p className="text-xs text-navy-400">{l}</p><p className="text-lg font-bold">{v}</p></div>)}
        </div>
        <Callout tone="info" title="Collaborative robot safety">Cobots can work near people without fences because force and speed are limited and the cell monitors separation. When a person enters the collaborative zone, the cobot slows (here to {Math.round(o.collaborativeFactor * 100)}% speed), so pick time rises from {o.pickSec}s to {r.pickTime.toFixed(1)}s and a pallet takes {r.palletTimeMin.toFixed(1)} min. Good layout keeps people out of the zone during normal operation.</Callout>
      </div>
      <Card className="space-y-3 p-5">
        <h3 className="font-bold">Cobot palletising set-up</h3>
        <div className="grid grid-cols-2 gap-3">
          {num('palletL', 'Pallet length (mm)', 600, 1500)}{num('palletW', 'Pallet width (mm)', 600, 1200)}
          {num('boxL', 'Carton length (mm)', 100, 800)}{num('boxW', 'Carton width (mm)', 100, 800)}
          {num('boxH', 'Carton height (mm)', 50, 600)}{num('maxH', 'Max stack height (mm)', 300, 1800)}
          {num('pickSec', 'Pick-place time (s)', 3, 30, 1)}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-600" checked={o.humanNearby} onChange={(e) => setO({ ...o, humanNearby: e.target.checked })} /><UserRound size={15} /> Person working in the collaborative zone</label>
        <div><label className="label" htmlFor="cf">Speed when person present: {Math.round(o.collaborativeFactor * 100)}%</label><input id="cf" type="range" min={0.2} max={1} step={0.1} value={o.collaborativeFactor} onChange={(e) => setO({ ...o, collaborativeFactor: Number(e.target.value) })} className="w-full accent-brand-600" /></div>
        <p className="text-xs text-navy-400">Cylinders packed in cartons (e.g., 400 × 300 × 250 mm) on a 1200 × 800 Euro pallet. The calculator tries both orientations and a mixed block pattern.</p>
      </Card>
    </div>
  );
}

export default function LogisticsLab() {
  const [tab, setTab] = useState<'mobile' | 'pallet'>('mobile');
  return (
    <div className="space-y-4">
      <Tabs tabs={[{ id: 'mobile', label: 'Mobile robots: AGV vs AMR' }, { id: 'pallet', label: 'Cobot palletising' }]} value={tab} onChange={setTab} />
      {tab === 'mobile' ? <MobileRobots /> : <Palletising />}
    </div>
  );
}
