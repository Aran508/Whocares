// Pure robotics logic: kinematics, path finding, welding and palletising maths.

export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;

// ------------------------------------------------------------- Planar 3-joint arm
export interface ArmGeom { L1: number; L2: number; L3: number }
export interface Joints { j1: number; j2: number; j3: number } // degrees
export const ARM: ArmGeom = { L1: 160, L2: 130, L3: 40 };
export const LIMITS = { j1: [0, 180], j2: [-150, 150], j3: [-180, 180] } as const;

export function forward(j: Joints, g: ArmGeom = ARM) {
  const a1 = rad(j.j1), a2 = rad(j.j1 + j.j2), a3 = rad(j.j1 + j.j2 + j.j3);
  const elbow = { x: g.L1 * Math.cos(a1), y: g.L1 * Math.sin(a1) };
  const wrist = { x: elbow.x + g.L2 * Math.cos(a2), y: elbow.y + g.L2 * Math.sin(a2) };
  const tcp = { x: wrist.x + g.L3 * Math.cos(a3), y: wrist.y + g.L3 * Math.sin(a3) };
  return { elbow, wrist, tcp, toolAngle: j.j1 + j.j2 + j.j3 };
}

/** Analytic inverse kinematics for a target TCP with a given tool angle (deg). */
export function inverse(x: number, y: number, toolAngleDeg: number, elbowUp = true, g: ArmGeom = ARM): Joints | null {
  const wx = x - g.L3 * Math.cos(rad(toolAngleDeg));
  const wy = y - g.L3 * Math.sin(rad(toolAngleDeg));
  const c2 = (wx * wx + wy * wy - g.L1 * g.L1 - g.L2 * g.L2) / (2 * g.L1 * g.L2);
  if (c2 < -1 || c2 > 1) return null;
  const t2 = (elbowUp ? -1 : 1) * Math.acos(c2);
  const t1 = Math.atan2(wy, wx) - Math.atan2(g.L2 * Math.sin(t2), g.L1 + g.L2 * Math.cos(t2));
  let j1 = deg(t1);
  const j2 = deg(t2);
  let j3 = toolAngleDeg - j1 - j2;
  j3 = ((((j3 + 180) % 360) + 360) % 360) - 180;
  j1 = ((((j1 + 180) % 360) + 360) % 360) - 180;
  const sol = { j1, j2, j3 };
  if (!withinLimits(sol)) return null;
  return sol;
}

export function withinLimits(j: Joints) {
  return j.j1 >= LIMITS.j1[0] - 1e-6 && j.j1 <= LIMITS.j1[1] + 1e-6 && j.j2 >= LIMITS.j2[0] && j.j2 <= LIMITS.j2[1] && j.j3 >= LIMITS.j3[0] && j.j3 <= LIMITS.j3[1];
}

/** Synchronised point-to-point move time: slowest joint decides (deg/s), plus settle time. */
export function moveTime(a: Joints, b: Joints, speedDegS = 90, settle = 0.2) {
  const d = Math.max(Math.abs(a.j1 - b.j1), Math.abs(a.j2 - b.j2), Math.abs(a.j3 - b.j3));
  return d / speedDegS + (d > 0 ? settle : 0);
}

export const lerpJoints = (a: Joints, b: Joints, t: number): Joints => ({ j1: a.j1 + (b.j1 - a.j1) * t, j2: a.j2 + (b.j2 - a.j2) * t, j3: a.j3 + (b.j3 - a.j3) * t });

// ------------------------------------------------------------- Grid path finding (A*)
export interface Cell { x: number; y: number }
export const key = (c: Cell) => `${c.x},${c.y}`;

export function astar(w: number, h: number, blocked: Set<string>, start: Cell, goal: Cell): Cell[] | null {
  const open: { c: Cell; f: number; g: number }[] = [{ c: start, f: 0, g: 0 }];
  const came = new Map<string, string>();
  const gScore = new Map<string, number>([[key(start), 0]]);
  const hfn = (c: Cell) => Math.abs(c.x - goal.x) + Math.abs(c.y - goal.y);
  const closed = new Set<string>();
  while (open.length) {
    open.sort((a, b) => a.f - b.f || b.g - a.g);
    const cur = open.shift()!;
    const ck = key(cur.c);
    if (ck === key(goal)) {
      const path = [cur.c];
      let k = ck;
      while (came.has(k)) {
        k = came.get(k)!;
        const [x, y] = k.split(',').map(Number);
        path.unshift({ x, y });
      }
      return path;
    }
    if (closed.has(ck)) continue;
    closed.add(ck);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: cur.c.x + dx, y: cur.c.y + dy };
      if (n.x < 0 || n.y < 0 || n.x >= w || n.y >= h) continue;
      const nk = key(n);
      if (blocked.has(nk) && nk !== key(goal)) continue;
      const g = cur.g + 1;
      if (g < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, g);
        came.set(nk, ck);
        open.push({ c: n, g, f: g + hfn(n) });
      }
    }
  }
  return null;
}

/** AGV follows a fixed guide path; returns the path up to the first blocked cell. */
export function followGuidePath(path: Cell[], blocked: Set<string>) {
  const idx = path.findIndex((c) => blocked.has(key(c)));
  return idx < 0 ? { path, blockedAt: null as Cell | null } : { path: path.slice(0, idx), blockedAt: path[idx] };
}

/** Manhattan guide path: horizontal along the main aisle row, then vertical to the station. */
export function guidePath(start: Cell, goal: Cell, aisleY: number): Cell[] {
  const out: Cell[] = [];
  let c = { ...start };
  out.push({ ...c });
  while (c.y !== aisleY) { c = { x: c.x, y: c.y + Math.sign(aisleY - c.y) }; out.push({ ...c }); }
  while (c.x !== goal.x) { c = { x: c.x + Math.sign(goal.x - c.x), y: c.y }; out.push({ ...c }); }
  while (c.y !== goal.y) { c = { x: c.x, y: c.y + Math.sign(goal.y - c.y) }; out.push({ ...c }); }
  return out;
}

// ------------------------------------------------------------- Welding
export interface WeldParams { current: number; voltage: number; travel: number; gas: number } // A, V, mm/min, L/min
export const WPS = { current: [200, 240], voltage: [24, 28], travel: [300, 450], gas: [15, 20], heatInput: [0.8, 1.6] } as const;

export function heatInput(p: WeldParams) {
  return (p.voltage * p.current * 60) / (p.travel * 1000); // kJ/mm
}

export function weldQuality(p: WeldParams) {
  const hi = heatInput(p);
  const issues: string[] = [];
  if (p.gas < WPS.gas[0]) issues.push('Porosity — shielding gas flow below WPS (gas pockets in the weld).');
  if (p.gas > 25) issues.push('Turbulence — excessive gas flow draws in air (porosity risk).');
  if (hi < WPS.heatInput[0]) issues.push(`Lack of fusion — heat input ${hi.toFixed(2)} kJ/mm is too low.`);
  if (hi > WPS.heatInput[1]) issues.push(`Burn-through / distortion — heat input ${hi.toFixed(2)} kJ/mm is too high.`);
  if (p.voltage > WPS.voltage[1] + 1) issues.push('Undercut and spatter — arc voltage too high.');
  if (p.current < WPS.current[0] - 20) issues.push('Incomplete penetration — current far below WPS.');
  const inWps = p.current >= WPS.current[0] && p.current <= WPS.current[1] && p.voltage >= WPS.voltage[0] && p.voltage <= WPS.voltage[1] && p.travel >= WPS.travel[0] && p.travel <= WPS.travel[1] && p.gas >= WPS.gas[0] && p.gas <= WPS.gas[1];
  return { heatInput: hi, issues, inWps, ok: issues.length === 0 && inWps };
}

export interface Seam { id: string; name: string; length: number } // mm

export function weldCycle(seams: Seam[], travelMmMin: number, loadUnload = 45, airMove = 3, positionerTurn = 4) {
  const arc = seams.reduce((a, s) => a + (s.length / travelMmMin) * 60, 0);
  const moves = seams.length * airMove + Math.max(0, seams.length - 1) * positionerTurn;
  const cycle = arc + moves + loadUnload;
  return { arc, moves, loadUnload, cycle, arcOnRatio: cycle ? (arc / cycle) * 100 : 0 };
}

// ------------------------------------------------------------- Palletising
export function boxesPerLayer(palletL: number, palletW: number, boxL: number, boxW: number) {
  const a = Math.floor(palletL / boxL) * Math.floor(palletW / boxW);
  const b = Math.floor(palletL / boxW) * Math.floor(palletW / boxL);
  // mixed block: fill with orientation A, use leftover strip with orientation B
  const colsA = Math.floor(palletL / boxL);
  const rest = palletL - colsA * boxL;
  const mixed = colsA * Math.floor(palletW / boxW) + Math.floor(rest / boxW) * Math.floor(palletW / boxL);
  return Math.max(a, b, mixed);
}

export function palletPlan(o: { palletL: number; palletW: number; maxH: number; boxL: number; boxW: number; boxH: number; pickSec: number; humanNearby: boolean; collaborativeFactor: number }) {
  const perLayer = boxesPerLayer(o.palletL, o.palletW, o.boxL, o.boxW);
  const layers = Math.floor(o.maxH / o.boxH);
  const total = perLayer * layers;
  const pick = o.humanNearby ? o.pickSec / o.collaborativeFactor : o.pickSec;
  const palletTime = total * pick;
  const areaUse = ((perLayer * o.boxL * o.boxW) / (o.palletL * o.palletW)) * 100;
  return { perLayer, layers, total, pickTime: pick, palletTimeMin: palletTime / 60, boxesPerHour: 3600 / pick, areaUse };
}
