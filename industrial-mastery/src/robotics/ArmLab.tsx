import { useEffect, useRef, useState } from 'react';
import { Hand, Pause, Play, Plus, RotateCcw, Target, Trash2 } from 'lucide-react';
import { ARM, forward, inverse, lerpJoints, LIMITS, moveTime, type Joints } from './logic';
import { Callout, Card } from '../components/ui';
import { C } from '../diagrams/primitives';

const W = 640, H = 420, BX = 320, BY = 370;
const sx = (x: number) => BX + x;
const sy = (y: number) => BY - y;
const PICK = { x: -215, y: 40 };
const PLACE = { x: 205, y: 70 };
const HOME: Joints = { j1: 90, j2: -60, j3: -120 };
const NEAR = 14;

interface Waypoint { j: Joints; grip: boolean; label: string }

export default function ArmLab() {
  const [j, setJ] = useState<Joints>(HOME);
  const [grip, setGrip] = useState(false);
  const [part, setPart] = useState<{ x: number; y: number; held: boolean; placed: boolean }>({ ...PICK, held: false, placed: false });
  const [program, setProgram] = useState<Waypoint[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(90);
  const [msg, setMsg] = useState<string>('');
  const raf = useRef<number>();
  const fk = forward(j);

  // gripper physics: close near the part → pick; open → drop (placed if at fixture)
  const applyGrip = (closed: boolean, tcp: { x: number; y: number }, current: typeof part) => {
    if (closed && !current.held && Math.hypot(tcp.x - current.x, tcp.y - current.y) < NEAR) return { ...current, held: true, placed: false };
    if (!closed && current.held) {
      const atFixture = Math.hypot(tcp.x - PLACE.x, tcp.y - PLACE.y) < NEAR;
      return { x: atFixture ? PLACE.x : tcp.x, y: atFixture ? PLACE.y : Math.max(0, tcp.y), held: false, placed: atFixture };
    }
    return current;
  };

  const setGripper = (closed: boolean) => {
    setGrip(closed);
    setPart((p) => {
      const n = applyGrip(closed, fk.tcp, p);
      if (n.placed && !p.placed) setMsg('✓ Part placed in the fixture.');
      else if (closed && n.held && !p.held) setMsg('Part gripped.');
      else if (closed && !n.held) setMsg('Gripper closed on nothing — move the TCP onto the part first.');
      return n;
    });
  };

  const goTo = (pt: { x: number; y: number }, approach = 0) => {
    const s = inverse(pt.x, pt.y + approach, -90) ?? inverse(pt.x, pt.y + approach, -90, false);
    if (!s) return setMsg('Target out of reach or outside joint limits.');
    setJ(s);
    setMsg(`Moved by inverse kinematics: J1 ${s.j1.toFixed(1)}°, J2 ${s.j2.toFixed(1)}°, J3 ${s.j3.toFixed(1)}°.`);
  };

  const held = part.held ? { x: fk.tcp.x, y: fk.tcp.y } : { x: part.x, y: part.y };

  const record = () => setProgram((p) => [...p, { j: { ...j }, grip, label: `P${p.length + 1}` }]);
  const loadExample = () => {
    const ap = (pt: { x: number; y: number }, up: number) => (inverse(pt.x, pt.y + up, -90) ?? inverse(pt.x, pt.y + up, -90, false))!;
    setProgram([
      { j: HOME, grip: false, label: 'Home' },
      { j: ap(PICK, 60), grip: false, label: 'Approach pick' },
      { j: ap(PICK, 0), grip: true, label: 'Pick (close)' },
      { j: ap(PICK, 60), grip: true, label: 'Retract' },
      { j: ap(PLACE, 60), grip: true, label: 'Approach place' },
      { j: ap(PLACE, 0), grip: false, label: 'Place (open)' },
      { j: ap(PLACE, 60), grip: false, label: 'Retract' },
      { j: HOME, grip: false, label: 'Home' },
    ]);
    setMsg('Example pick-and-place program loaded. Press Play.');
  };

  const cycle = program.reduce((a, w, i) => a + (i ? moveTime(program[i - 1].j, w.j, speed) : 0) + (i && w.grip !== program[i - 1].grip ? 0.5 : 0), 0);

  const play = () => {
    if (program.length < 2) return setMsg('Record at least two waypoints.');
    setPart({ ...PICK, held: false, placed: false });
    setJ(program[0].j);
    setGrip(program[0].grip);
    setPlaying(true);
    let seg = 1, t0 = performance.now();
    let state = { ...PICK, held: false, placed: false };
    const step = (now: number) => {
      const a = program[seg - 1], b = program[seg];
      const dur = Math.max(0.3, moveTime(a.j, b.j, speed)) * 1000;
      const t = Math.min(1, (now - t0) / dur);
      const cur = lerpJoints(a.j, b.j, t);
      setJ(cur);
      if (t >= 1) {
        const tcp = forward(b.j).tcp;
        state = applyGrip(b.grip, tcp, state);
        setPart(state);
        setGrip(b.grip);
        seg++;
        t0 = now;
        if (seg >= program.length) {
          setPlaying(false);
          setMsg(state.placed ? `✓ Program complete — part placed. Cycle time ≈ ${cycle.toFixed(1)} s.` : 'Program finished but the part is not in the fixture. Check the pick and place points and gripper states.');
          return;
        }
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  const stop = () => { if (raf.current) cancelAnimationFrame(raf.current); setPlaying(false); };

  const reach = ARM.L1 + ARM.L2 + ARM.L3;
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card className="p-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-navy-50" role="img" aria-label="Robot arm workcell, side view">
            <circle cx={sx(0)} cy={sy(0)} r={reach} fill={C.blueLight} opacity={0.35} />
            <circle cx={sx(0)} cy={sy(0)} r={Math.abs(ARM.L1 - ARM.L2)} fill={C.bg} />
            <rect x={0} y={sy(0)} width={W} height={H - sy(0)} fill="#dfe6f1" />
            {/* conveyor */}
            <rect x={sx(-300)} y={sy(30)} width={160} height={14} fill={C.steelDark} />
            {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={sx(-290 + i * 35)} cy={sy(16)} r={6} fill={C.navy} />)}
            <text x={sx(-220)} y={sy(-8) + 4} textAnchor="middle" fontSize={11} fill={C.muted}>Infeed conveyor (pick)</text>
            {/* fixture */}
            <rect x={sx(180)} y={sy(60)} width={50} height={60} fill={C.steel} stroke={C.steelDark} />
            <rect x={sx(193)} y={sy(64)} width={24} height={6} fill={part.placed ? C.green : C.orange} />
            <text x={sx(205)} y={sy(-8) + 4} textAnchor="middle" fontSize={11} fill={C.muted}>Welding fixture (place)</text>
            {/* targets */}
            <circle cx={sx(PICK.x)} cy={sy(PICK.y)} r={NEAR} fill="none" stroke={C.orange} strokeDasharray="3 3" />
            <circle cx={sx(PLACE.x)} cy={sy(PLACE.y)} r={NEAR} fill="none" stroke={C.green} strokeDasharray="3 3" />
            {/* part (cylinder blank) */}
            <rect x={sx(held.x) - 12} y={sy(held.y) - 8} width={24} height={16} rx={3} fill={part.placed ? C.green : C.orange} stroke={C.navy} />
            {/* robot */}
            <rect x={sx(-40)} y={sy(0)} width={80} height={14} fill={C.navy} />
            <rect x={sx(-22)} y={sy(26)} width={44} height={26} fill={C.orange} />
            <line x1={sx(0)} y1={sy(0)} x2={sx(fk.elbow.x)} y2={sy(fk.elbow.y)} stroke={C.orange} strokeWidth={22} strokeLinecap="round" />
            <line x1={sx(fk.elbow.x)} y1={sy(fk.elbow.y)} x2={sx(fk.wrist.x)} y2={sy(fk.wrist.y)} stroke={C.orange} strokeWidth={16} strokeLinecap="round" />
            <line x1={sx(fk.wrist.x)} y1={sy(fk.wrist.y)} x2={sx(fk.tcp.x)} y2={sy(fk.tcp.y)} stroke={C.steelDark} strokeWidth={8} strokeLinecap="round" />
            {[{ x: 0, y: 0 }, fk.elbow, fk.wrist].map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === 0 ? 13 : 10} fill={C.navy} />)}
            {/* gripper fingers */}
            {(() => {
              const a = (fk.toolAngle * Math.PI) / 180, px = -Math.sin(a), py = Math.cos(a), gap = grip ? 7 : 14;
              return [-1, 1].map((s) => <line key={s} x1={sx(fk.tcp.x + px * gap * s)} y1={sy(fk.tcp.y + py * gap * s)} x2={sx(fk.tcp.x + px * gap * s + Math.cos(a) * 14)} y2={sy(fk.tcp.y + py * gap * s + Math.sin(a) * 14)} stroke={C.navy} strokeWidth={4} />);
            })()}
            <circle cx={sx(fk.tcp.x)} cy={sy(fk.tcp.y)} r={3} fill={C.red} />
            <text x={14} y={22} fontSize={12} fill={C.navy} fontFamily="Inter">TCP X {fk.tcp.x.toFixed(0)} mm · Y {fk.tcp.y.toFixed(0)} mm · tool {(((fk.toolAngle + 540) % 360) - 180).toFixed(0)}°</text>
            <text x={14} y={40} fontSize={11} fill={C.muted} fontFamily="Inter">Shaded area = reachable workspace (max reach {reach} mm)</text>
          </svg>
        </Card>
        {msg && <Callout tone={msg.startsWith('✓') ? 'ok' : 'info'}>{msg}</Callout>}
        <Card className="p-5">
          <h3 className="font-bold">How the arm moves</h3>
          <p className="mt-1 text-sm text-navy-600">This side view represents the shoulder (J2), elbow (J3) and wrist-pitch (J5) joints of a 6-axis articulated robot. <b>Forward kinematics</b> calculates the tool centre point (TCP) from joint angles: x = L1·cos θ1 + L2·cos(θ1+θ2) + L3·cos(θ1+θ2+θ3). <b>Inverse kinematics</b> works backwards from a target TCP to the joint angles — that is what "Move to pick/place" uses. A point-to-point move takes as long as the joint with the largest angle change: t = max|Δθ| ÷ joint speed.</p>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <h3 className="font-bold">Teach pendant — jog joints</h3>
          {(['j1', 'j2', 'j3'] as const).map((k, i) => (
            <div key={k}>
              <div className="flex justify-between text-sm"><label>{['J1 shoulder', 'J2 elbow', 'J3 wrist'][i]}</label><span className="font-mono">{j[k].toFixed(1)}°</span></div>
              <input type="range" min={LIMITS[k][0]} max={LIMITS[k][1]} step={0.5} value={j[k]} disabled={playing} onChange={(e) => setJ({ ...j, [k]: Number(e.target.value) })} className="w-full accent-brand-600" aria-label={k} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" disabled={playing} onClick={() => goTo(PICK)}><Target size={15} /> Move to pick</button>
            <button className="btn-secondary" disabled={playing} onClick={() => goTo(PLACE)}><Target size={15} /> Move to place</button>
            <button className={grip ? 'btn-primary' : 'btn-secondary'} disabled={playing} onClick={() => setGripper(!grip)}><Hand size={15} /> {grip ? 'Open gripper' : 'Close gripper'}</button>
            <button className="btn-ghost" disabled={playing} onClick={() => { setJ(HOME); setGrip(false); setPart({ ...PICK, held: false, placed: false }); setMsg(''); }}><RotateCcw size={15} /> Reset cell</button>
          </div>
          <div>
            <div className="flex justify-between text-sm"><label>Joint speed</label><span>{speed}°/s</span></div>
            <input type="range" min={30} max={240} step={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-brand-600" aria-label="Joint speed" />
          </div>
        </Card>
        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold">Program</h3><span className="text-xs text-navy-400">Cycle ≈ {cycle.toFixed(1)} s</span></div>
          <ol className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {program.map((w, i) => (
              <li key={i} className="flex items-center justify-between rounded bg-navy-50 px-2 py-1">
                <span><b>{i + 1}.</b> {w.label} <span className="text-xs text-navy-400">({w.j.j1.toFixed(0)}°, {w.j.j2.toFixed(0)}°, {w.j.j3.toFixed(0)}°) {w.grip ? '● closed' : '○ open'}</span></span>
                <button className="text-navy-400 hover:text-bad-600" onClick={() => setProgram(program.filter((_, k) => k !== i))} aria-label={`Delete waypoint ${i + 1}`} disabled={playing}><Trash2 size={14} /></button>
              </li>
            ))}
            {!program.length && <li className="text-navy-400">No waypoints. Jog the robot and press Record, or load the example.</li>}
          </ol>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" disabled={playing} onClick={record}><Plus size={15} /> Record point</button>
            <button className="btn-secondary" disabled={playing} onClick={loadExample}>Load example</button>
            {playing ? <button className="btn-primary" onClick={stop}><Pause size={15} /> Stop</button> : <button className="btn-primary" onClick={play}><Play size={15} /> Play</button>}
          </div>
          <p className="text-xs text-navy-400">Challenge: write a program that picks the blank from the conveyor and places it in the fixture with the shortest cycle time. Approach points 60 mm above the target avoid collisions.</p>
        </Card>
      </div>
    </div>
  );
}
