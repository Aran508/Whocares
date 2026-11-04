import { Arrow, Box, C, Label, Svg, T } from './primitives';

export function TimeDefinitions() {
  return (
    <Svg w={820} h={300} title="Cycle time, takt time, lead time and standard time compared">
      <T x={410} y={20} size={13} weight={700}>Four different "times" — never mix them up</T>
      {[
        ['Cycle time', 'Actual time per unit at a station (observed)', '4.5 min at welding', C.blue, 160],
        ['Takt time', 'Required pace = available time ÷ demand (customer)', '4.0 min — demand-based target', C.green, 140],
        ['Standard time', 'Normal time + allowances (planning & costing)', '4.9 min for a trained welder', C.orange, 175],
        ['Lead time', 'Total time from order/material in to delivery (incl. waiting)', '13 days, of which < 1 h is work', C.red, 620],
      ].map(([n, d, e, col, w], i) => (
        <g key={n as string}>
          <T x={80} y={64 + i * 58} size={12} weight={800} fill={col as string}>{n as string}</T>
          <rect x={160} y={48 + i * 58} width={w as number} height={30} rx={6} fill={col as string} opacity={0.85} />
          <T x={170 + (w as number)} y={56 + i * 58} size={11} anchor="start" weight={600}>{''}</T>
          <text x={(w as number) + 172} y={58 + i * 58} fontSize={11} fill={C.ink} fontFamily="Inter, sans-serif">{d as string}</text>
          <text x={(w as number) + 172} y={73 + i * 58} fontSize={10} fill={C.muted} fontFamily="Inter, sans-serif">{e as string}</text>
        </g>
      ))}
      <T x={410} y={284} size={11} fill={C.navy}>Cycle time 4.5 &gt; takt 4.0 → welding cannot meet demand. Lead time is dominated by waiting, not cycle time.</T>
    </Svg>
  );
}

export function BottleneckLine({ times }: { times?: { label: string; ct: number }[] }) {
  const st = times ?? [
    { label: 'Cutting', ct: 3 },
    { label: 'Honing', ct: 10 },
    { label: 'Welding', ct: 6.7 },
    { label: 'Assembly', ct: 5 },
    { label: 'Testing', ct: 6 },
  ];
  const max = Math.max(...st.map((s) => s.ct));
  return (
    <Svg w={820} h={300} title="Multi-stage line with one constrained operation">
      {st.map((s, i) => {
        const x = 20 + i * 160;
        const bn = s.ct === max;
        const neck = 60 - (s.ct / max) * 46;
        return (
          <g key={s.label}>
            <Box x={x} y={40} w={120} h={60} label={s.label} fill={bn ? C.red : C.blueLight} stroke={bn ? C.red : C.blue} color={bn ? C.white : C.navy} />
            <T x={x + 60} y={118} size={11} weight={600}>{`CT ${s.ct} min → ${(60 / s.ct).toFixed(1)}/h`}</T>
            {i < st.length - 1 && <Arrow x1={x + 120} y1={70} x2={x + 158} y2={70} />}
            <path d={`M ${x + 10} 160 L ${x + 110} 160 L ${x + 110} ${160 + neck} L ${x + 75} ${200} L ${x + 75} 240 L ${x + 45} 240 L ${x + 45} 200 L ${x + 10} ${160 + neck} Z`} fill={bn ? C.redLight : C.bg} stroke={bn ? C.red : C.line} />
            {bn && Array.from({ length: 8 }, (_, k) => <rect key={k} x={x - 30 + (k % 4) * 9} y={150 - Math.floor(k / 4) * 10} width={8} height={8} fill={C.orange} />)}
          </g>
        );
      })}
      <T x={410} y={272} size={12} weight={700} fill={C.red}>{`Line output = slowest step = ${(60 / max).toFixed(1)} units/h. WIP piles up in front of the bottleneck; later steps starve.`}</T>
    </Svg>
  );
}

export function OeeWaterfall() {
  const bars = [
    ['Planned time', 450, 0, C.navy],
    ['Breakdowns', 30, 420, C.red],
    ['Setups', 20, 400, C.red],
    ['Run time', 400, 0, C.blue],
    ['Minor stops', 25, 375, C.orange],
    ['Reduced speed', 35, 340, C.orange],
    ['Net run time', 340, 0, C.blue],
    ['Scrap/rework', 20, 320, C.red],
    ['Fully productive', 320, 0, C.green],
  ] as const;
  const s = 0.42;
  return (
    <Svg w={860} h={290} title="OEE loss waterfall">
      {bars.map(([n, v, base, col], i) => (
        <g key={n}>
          <rect x={20 + i * 94} y={230 - (base + v) * s} width={76} height={v * s} fill={col} rx={3} />
          <Label x={58 + i * 94} y={222 - (base + v) * s} text={`${v}`} color={C.navy} size={10} />
          <T x={58 + i * 94} y={256} size={10} max={13}>{n}</T>
        </g>
      ))}
      <T x={430} y={14} size={12} weight={700}>Honing (min): A = 400/450 = 88.9% · P = 340/400 = 85% · Q = 320/340 = 94.1% · OEE = 71.1%</T>
    </Svg>
  );
}

export function Yamazumi({ stations, takt }: { stations?: { label: string; va: number; nva: number; waste: number }[]; takt?: number }) {
  const st = stations ?? [
    { label: 'Rod assy', va: 120, nva: 20, waste: 10 },
    { label: 'Seal fit', va: 100, nva: 30, waste: 20 },
    { label: 'Tube insert', va: 130, nva: 30, waste: 20 },
    { label: 'Gland', va: 160, nva: 50, waste: 30 },
    { label: 'Leak test', va: 180, nva: 60, waste: 30 },
  ];
  const tk = takt ?? 240;
  const max = Math.max(tk * 1.2, ...st.map((s) => s.va + s.nva + s.waste));
  const H = 260, s = H / max;
  return (
    <Svg w={720} h={340} title="Yamazumi chart">
      {st.map((x, i) => {
        let y = 280;
        const seg = (v: number, col: string) => {
          y -= v * s;
          return <rect x={60 + i * 120} y={y} width={80} height={v * s} fill={col} />;
        };
        const total = x.va + x.nva + x.waste;
        return (
          <g key={x.label}>
            {seg(x.va, C.green)}
            {seg(x.nva, C.orange)}
            {seg(x.waste, C.red)}
            <Label x={100 + i * 120} y={270 - total * s} text={`${total} s`} color={total > tk ? C.red : C.navy} />
            <T x={100 + i * 120} y={300} size={11} weight={600}>{x.label}</T>
          </g>
        );
      })}
      <line x1={40} x2={680} y1={280 - tk * s} y2={280 - tk * s} stroke={C.navy} strokeDasharray="8 4" strokeWidth={2} />
      <Label x={690} y={280 - tk * s} text={`Takt ${tk}s`} anchor="end" color={C.navy} />
      {[['Value-added', C.green], ['Necessary NVA', C.orange], ['Waste', C.red]].map(([n, c], i) => (
        <g key={n}><rect x={60 + i * 150} y={318} width={14} height={14} fill={c} /><Label x={80 + i * 150} y={325} text={n} anchor="start" /></g>
      ))}
    </Svg>
  );
}

export function Gantt() {
  const t = [['Specification', 0, 2, false], ['Procure pump unit', 2, 6, true], ['Civil & utilities', 4, 2, false], ['Installation', 8, 2, true], ['Software & logging', 7, 3, false], ['Validation (MSA, trial)', 10, 1, true], ['Training & handover', 11, 1, true]] as const;
  return (
    <Svg w={760} h={300} title="Gantt chart — second test bench project (weeks)">
      {Array.from({ length: 13 }, (_, w) => (
        <g key={w}>
          <line x1={190 + w * 44} x2={190 + w * 44} y1={20} y2={270} stroke={C.line} />
          {w < 12 && <Label x={212 + w * 44} y={14} text={`W${w + 1}`} size={10} />}
        </g>
      ))}
      {t.map(([n, s, d, crit], i) => (
        <g key={n}>
          <text x={180} y={44 + i * 34} fontSize={11} textAnchor="end" fill={C.ink} fontFamily="Inter, sans-serif" dominantBaseline="middle">{n}</text>
          <rect x={190 + s * 44} y={32 + i * 34} width={d * 44} height={22} rx={5} fill={crit ? C.red : C.blue} />
        </g>
      ))}
      <line x1={190 + 6.5 * 44} x2={190 + 6.5 * 44} y1={20} y2={270} stroke={C.orange} strokeWidth={2} />
      <Label x={190 + 6.5 * 44} y={284} text="Today" color={C.orange} />
      <Label x={560} y={284} text="Red = critical path" color={C.red} />
    </Svg>
  );
}

export function CapacityBars() {
  const r = [['Cutting', 62], ['Honing', 105], ['Welding', 83], ['Assembly', 78], ['Leak test', 122], ['Paint', 70]] as const;
  return (
    <Svg w={720} h={300} title="Capacity load by resource">
      <line x1={110} y1={20} x2={110} y2={260} stroke={C.steelDark} />
      {r.map(([n, v], i) => (
        <g key={n}>
          <text x={100} y={44 + i * 38} fontSize={12} textAnchor="end" dominantBaseline="middle" fill={C.ink} fontFamily="Inter, sans-serif">{n}</text>
          <rect x={110} y={32 + i * 38} width={v * 4.4} height={24} rx={4} fill={v > 100 ? C.red : v > 85 ? C.orange : C.green} />
          <Label x={120 + v * 4.4} y={44 + i * 38} text={`${v}%`} anchor="start" color={C.navy} />
        </g>
      ))}
      <line x1={110 + 440} x2={110 + 440} y1={20} y2={262} stroke={C.red} strokeDasharray="6 4" />
      <Label x={550} y={280} text="100% capacity" color={C.red} />
      <line x1={110 + 374} x2={110 + 374} y1={20} y2={262} stroke={C.orange} strokeDasharray="3 3" />
      <Label x={484} y={280} text="85% plan limit" color={C.orange} />
    </Svg>
  );
}

export function HourlyBoard() {
  const rows = [['08–09', 5, 5, ''], ['09–10', 5, 4, 'Seal kit missing'], ['10–11', 5, 3, 'Leak fail ×2'], ['11–12', 5, 5, ''], ['12–13', 3, 3, 'Lunch (staggered)'], ['13–14', 5, 4, 'Crane wait']] as const;
  let ct = 0, ca = 0;
  return (
    <Svg w={720} h={300} title="Hourly production board">
      <rect x={10} y={10} width={700} height={280} rx={10} fill={C.white} stroke={C.navy} strokeWidth={2} />
      {['Hour', 'Target', 'Actual', 'Cum. T', 'Cum. A', 'Reason'].map((h, i) => <T key={h} x={[50, 130, 200, 270, 340, 530][i]} y={34} size={12} weight={800}>{h}</T>)}
      {rows.map(([h, t, a, r], i) => {
        ct += t; ca += a;
        const red = a < t;
        return (
          <g key={h}>
            <rect x={14} y={48 + i * 38} width={692} height={34} fill={red ? C.redLight : C.greenLight} />
            {[h, String(t), String(a), String(ct), String(ca), r].map((c, k) => <T key={k} x={[50, 130, 200, 270, 340, 530][k]} y={65 + i * 38} size={12} weight={k === 2 ? 800 : 500} fill={k === 2 && red ? C.red : C.navy}>{c}</T>)}
          </g>
        );
      })}
    </Svg>
  );
}

export function TaktLine() {
  return (
    <Svg w={720} h={200} title="Takt-paced line">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Box x={20 + i * 140} y={60} w={110} h={60} label={`Station ${i + 1}`} size={12} />
          <circle cx={75 + i * 140} cy={150} r={18} fill={C.white} stroke={C.green} strokeWidth={3} />
          <line x1={75 + i * 140} y1={150} x2={75 + i * 140 + 10 * Math.cos(i)} y2={150 - 12} stroke={C.green} strokeWidth={2} />
        </g>
      ))}
      <T x={360} y={30} size={12} weight={700}>Every station completes its work within takt 22.5 min — the line moves as one</T>
    </Svg>
  );
}

export function Utilization() {
  const segs = [['Running', 360, C.green], ['Waiting material', 35, C.orange], ['Setup', 25, C.blue], ['Tool change', 18, C.steelDark], ['Idle', 12, C.red]] as const;
  let x = 20;
  return (
    <Svg w={720} h={160} title="Machine time breakdown">
      {segs.map(([n, v, col]) => {
        const w = v * 1.5;
        const el = (
          <g key={n}>
            <rect x={x} y={40} width={w} height={46} fill={col} />
            <T x={x + w / 2} y={108} size={10} max={14}>{`${n} ${v}m`}</T>
          </g>
        );
        x += w;
        return el;
      })}
      <T x={360} y={20} size={12} weight={700}>CNC piston lathe — 450 min available · Utilisation = 360 ÷ 450 = 80%</T>
    </Svg>
  );
}

export function PpcFlow() {
  const s = ['Forecast & orders', 'Routing', 'Loading & capacity', 'Scheduling', 'Dispatching', 'Follow-up & control'];
  return (
    <Svg w={860} h={200} title="PPC functions">
      {s.map((x, i) => (
        <g key={x}>
          <Box x={10 + i * 142} y={40} w={124} h={64} label={x} size={12} fill={i < 4 ? C.blueLight : C.greenLight} stroke={i < 4 ? C.blue : C.green} />
          {i < s.length - 1 && <Arrow x1={134 + i * 142} y1={72} x2={150 + i * 142} y2={72} />}
        </g>
      ))}
      <T x={290} y={130} size={11} fill={C.blue} weight={700}>PLANNING</T>
      <T x={720} y={130} size={11} fill={C.green} weight={700}>CONTROL</T>
      <path d="M 790 110 Q 430 190 70 110" fill="none" stroke={C.steelDark} strokeDasharray="5 4" />
      <T x={430} y={180} size={10} fill={C.muted}>Deviations feed back into the next plan</T>
    </Svg>
  );
}

export function WipDiagram() {
  return (
    <Svg w={720} h={220} title="WIP accumulation and Little's Law">
      {['Cut', 'Hone', 'Weld', 'Assy', 'Paint'].map((n, i) => (
        <g key={n}>
          <Box x={20 + i * 140} y={120} w={100} h={50} label={n} size={12} />
          {i < 4 && Array.from({ length: [6, 14, 4, 9][i] }, (_, k) => <rect key={k} x={124 + i * 140 + (k % 3) * 11} y={160 - Math.floor(k / 3) * 11} width={9} height={9} fill={C.orange} />)}
        </g>
      ))}
      <T x={360} y={40} size={13} weight={700}>{"Little's Law:  Lead time = WIP ÷ Throughput"}</T>
      <T x={360} y={66} size={12}>620 pieces ÷ 40 per day = 15.5 days in the factory</T>
      <T x={360} y={200} size={11} fill={C.muted}>Largest pile (before welding) shows where flow is blocked</T>
    </Svg>
  );
}

export function BomTree() {
  return (
    <Svg w={800} h={300} title="Bill of materials tree — hydraulic cylinder">
      <Box x={320} y={10} w={160} h={44} label="L0 Cylinder 100/56×800" fill={C.blue} color={C.white} size={12} />
      {[['L1 Tube assembly', 30], ['L1 Rod assembly', 230], ['L1 Gland', 430], ['L1 Piston', 560], ['L1 Seal kit ×1', 680]].map(([n, x]) => (
        <g key={n as string}>
          <Arrow x1={400} y1={54} x2={(x as number) + 55} y2={98} head={false} color={C.line} />
          <Box x={x as number} y={100} w={110} h={40} label={n as string} size={11} />
        </g>
      ))}
      {[['Tube Ø100×10', 0], ['Base', 70], ['Port boss ×2', 140], ['Rod Ø56', 210], ['Clevis', 280], ['Nut', 350]].map(([n, x], i) => (
        <g key={n as string}>
          <Arrow x1={i < 3 ? 85 : 285} y1={140} x2={(x as number) + 32} y2={198} head={false} color={C.line} />
          <Box x={x as number} y={200} w={64} h={40} label={n as string} size={9.5} fill={C.bg} stroke={C.steelDark} />
        </g>
      ))}
      <T x={400} y={276} size={11} fill={C.muted}>MRP explodes the MPS through this tree, nets stock, and offsets by lead time</T>
    </Svg>
  );
}

export function Sawtooth() {
  const W = 700, H = 300, x0 = 60, base = 250, top = 40;
  return (
    <Svg w={W} h={H} title="Inventory sawtooth with reorder point and safety stock">
      <line x1={x0} y1={top - 10} x2={x0} y2={base} stroke={C.steelDark} />
      <line x1={x0} y1={base} x2={W - 20} y2={base} stroke={C.steelDark} />
      <rect x={x0} y={base - 50} width={W - 80} height={50} fill={C.orangeLight} />
      <Label x={W - 30} y={base - 25} text="Safety stock" anchor="end" color="#97510a" />
      <line x1={x0} x2={W - 20} y1={base - 120} y2={base - 120} stroke={C.red} strokeDasharray="6 4" />
      <Label x={W - 30} y={base - 130} text="Reorder point" anchor="end" color={C.red} />
      <polyline points={`${x0},${top} ${x0 + 160},${base - 70} ${x0 + 160},${top + 20} ${x0 + 320},${base - 50} ${x0 + 320},${top} ${x0 + 470},${base - 90} ${x0 + 470},${top + 10} ${x0 + 600},${base - 60}`} fill="none" stroke={C.blue} strokeWidth={2.5} />
      <Arrow x1={x0 + 110} y1={base - 120} x2={x0 + 110} y2={base + 2} dashed color={C.muted} />
      <Arrow x1={x0 + 110} y1={base + 18} x2={x0 + 160} y2={base + 18} color={C.navy} />
      <Label x={x0 + 135} y={base + 32} text="Lead time" color={C.navy} />
      <Label x={x0 - 20} y={top} text="Max" />
      <Label x={x0 + 300} y={20} text="Order placed when stock hits ROP; it arrives after the lead time" color={C.navy} />
    </Svg>
  );
}

export function EoqCurve() {
  const W = 640, H = 300, x0 = 60, y0 = 250;
  const pts = (f: (q: number) => number) => Array.from({ length: 60 }, (_, i) => { const q = 100 + i * 25; return `${x0 + (q - 100) * 0.35},${y0 - f(q) * 0.0035}`; }).join(' ');
  const D = 9600, S = 2000, Hc = 100;
  return (
    <Svg w={W} h={H} title="EOQ total cost curve">
      <line x1={x0} y1={20} x2={x0} y2={y0} stroke={C.steelDark} />
      <line x1={x0} y1={y0} x2={W - 20} y2={y0} stroke={C.steelDark} />
      <polyline points={pts((q) => (q / 2) * Hc)} fill="none" stroke={C.orange} strokeWidth={2} />
      <polyline points={pts((q) => (D / q) * S)} fill="none" stroke={C.blue} strokeWidth={2} />
      <polyline points={pts((q) => (q / 2) * Hc + (D / q) * S)} fill="none" stroke={C.navy} strokeWidth={3} />
      <line x1={x0 + (620 - 100) * 0.35} x2={x0 + (620 - 100) * 0.35} y1={30} y2={y0} stroke={C.green} strokeDasharray="5 4" />
      <Label x={x0 + (620 - 100) * 0.35} y={y0 + 16} text="EOQ ≈ 620" color={C.green} />
      <Label x={W - 70} y={y0 - 160} text="Holding" color={C.orange} />
      <Label x={x0 + 60} y={40} text="Ordering" color={C.blue} anchor="start" />
      <Label x={W - 70} y={y0 - 225} text="Total" color={C.navy} />
      <Label x={(W) / 2} y={H - 10} text="Order quantity →" />
    </Svg>
  );
}

export function AbcCurve() {
  return (
    <Svg w={600} h={300} title="ABC analysis curve">
      <line x1={60} y1={20} x2={60} y2={250} stroke={C.steelDark} />
      <line x1={60} y1={250} x2={560} y2={250} stroke={C.steelDark} />
      <rect x={60} y={20} width={100} height={230} fill={C.blueLight} />
      <rect x={160} y={20} width={150} height={230} fill="#eef4ff" />
      <polyline points="60,250 100,110 160,66 230,44 310,32 420,24 560,20" fill="none" stroke={C.blueDark} strokeWidth={3} />
      <Label x={110} y={270} text="A: 20% items" color={C.blueDark} />
      <Label x={235} y={270} text="B: 30%" />
      <Label x={435} y={270} text="C: 50% of items" />
      <Label x={40} y={66} text="80%" anchor="end" />
      <Label x={40} y={32} text="95%" anchor="end" />
      <Label x={330} y={10} text="Cumulative % of annual consumption value" color={C.navy} />
    </Svg>
  );
}

export function Changeover() {
  return (
    <Svg w={720} h={180} title="Changeover time definition">
      <rect x={20} y={60} width={200} height={40} fill={C.blue} rx={4} />
      <T x={120} y={80} size={12} fill={C.white} weight={700}>Product A good parts</T>
      <rect x={220} y={60} width={280} height={40} fill={C.redLight} stroke={C.red} />
      <T x={360} y={80} size={12} weight={700} fill={C.red}>Changeover: setup + adjust + trial + approval</T>
      <rect x={500} y={60} width={200} height={40} fill={C.green} rx={4} />
      <T x={600} y={80} size={12} fill={C.white} weight={700}>Product B good parts</T>
      <Arrow x1={220} y1={130} x2={500} y2={130} color={C.navy} />
      <Arrow x1={500} y1={130} x2={220} y2={130} color={C.navy} />
      <T x={360} y={150} size={11}>Last good part (A) → first good part (B)</T>
    </Svg>
  );
}

export function MtbfTimeline() {
  const ev = [[0, 160, 'up'], [160, 164, 'down'], [164, 350, 'up'], [350, 353, 'down'], [353, 540, 'up'], [540, 546, 'down'], [546, 700, 'up']] as const;
  return (
    <Svg w={760} h={190} title="MTBF and MTTR on a timeline">
      {ev.map(([a, b, s], i) => <rect key={i} x={30 + a} y={60} width={b - a} height={40} fill={s === 'up' ? C.green : C.red} />)}
      <Arrow x1={30} y1={120} x2={190} y2={120} color={C.green} />
      <Label x={110} y={136} text="Time between failures" color={C.green} />
      <Arrow x1={380} y1={44} x2={383} y2={58} color={C.red} />
      <Label x={381} y={34} text="Repair time" color={C.red} />
      <T x={380} y={170} size={12} weight={700}>{'MTBF = Σ up-time ÷ failures · MTTR = Σ repair time ÷ repairs · A = MTBF ÷ (MTBF + MTTR)'}</T>
    </Svg>
  );
}

export function Bathtub() {
  return (
    <Svg w={640} h={280} title="Bathtub curve">
      <line x1={50} y1={20} x2={50} y2={230} stroke={C.steelDark} />
      <line x1={50} y1={230} x2={610} y2={230} stroke={C.steelDark} />
      <path d="M 55 40 Q 110 190 200 190 L 430 190 Q 540 190 600 50" fill="none" stroke={C.blue} strokeWidth={3} />
      <T x={120} y={255} size={11} weight={700}>Infant mortality</T>
      <T x={315} y={255} size={11} weight={700}>Random failures (useful life)</T>
      <T x={540} y={255} size={11} weight={700}>Wear-out</T>
      <T x={120} y={120} size={10} fill={C.muted} max={20}>Burn-in, commissioning checks</T>
      <T x={315} y={160} size={10} fill={C.muted}>Condition monitoring, spares</T>
      <T x={540} y={120} size={10} fill={C.muted} max={18}>Time-based PM / replacement</T>
      <Label x={30} y={125} text="λ" />
    </Svg>
  );
}

export function PfCurve() {
  return (
    <Svg w={640} h={260} title="P-F curve">
      <line x1={50} y1={20} x2={50} y2={220} stroke={C.steelDark} />
      <line x1={50} y1={220} x2={610} y2={220} stroke={C.steelDark} />
      <path d="M 55 40 L 260 44 Q 450 60 560 200" fill="none" stroke={C.blue} strokeWidth={3} />
      <circle cx={300} cy={48} r={6} fill={C.orange} />
      <Label x={300} y={32} text="P: potential failure detectable" color={C.orange} />
      <circle cx={560} cy={200} r={6} fill={C.red} />
      <Label x={560} y={184} text="F: functional failure" color={C.red} anchor="end" />
      <Arrow x1={300} y1={240} x2={560} y2={240} color={C.navy} />
      <Label x={430} y={252} text="P-F interval — plan the repair here" color={C.navy} />
      <Label x={110} y={60} text="Condition" />
      {[['Vibration', 330], ['Oil analysis', 380], ['Noise/heat', 470]].map(([n, x]) => <Label key={n as string} x={x as number} y={110} text={n as string} size={10} color={C.muted} />)}
    </Svg>
  );
}

export function MaintenanceTypes() {
  return (
    <Svg w={760} h={220} title="Maintenance strategies">
      {[['Breakdown', 'Fix after failure', 'Non-critical items only', C.red], ['Preventive', 'Fixed interval', 'Age/usage wear', C.blue], ['Condition-based', 'When limit reached', 'Inspectable condition', C.orange], ['Predictive', 'Trend & predict', 'Critical, detectable', C.green], ['Corrective', 'Repair found defects', 'After inspection', C.steelDark]].map(([n, d, e, col], i) => (
        <g key={n}>
          <rect x={10 + i * 150} y={20} width={140} height={180} rx={12} fill={C.white} stroke={col} strokeWidth={2} />
          <rect x={10 + i * 150} y={20} width={140} height={40} rx={12} fill={col} />
          <T x={80 + i * 150} y={40} size={12} weight={800} fill={C.white}>{n}</T>
          <T x={80 + i * 150} y={100} size={11} weight={600} max={18}>{d}</T>
          <T x={80 + i * 150} y={150} size={10.5} fill={C.muted} max={18}>{e}</T>
        </g>
      ))}
    </Svg>
  );
}

export function TpmHouse() {
  const p = ['Autonomous maint.', 'Planned maint.', 'Focused improvement', 'Quality maint.', 'Early equipment mgmt.', 'Training', 'Safety & environment', 'Office TPM'];
  return (
    <Svg w={760} h={330} title="TPM house — 8 pillars">
      <polygon points="380,10 740,80 20,80" fill={C.blueDark} />
      <T x={380} y={56} size={13} weight={800} fill={C.white}>Zero breakdowns · Zero defects · Zero accidents</T>
      {p.map((n, i) => (
        <g key={n}>
          <rect x={26 + i * 90} y={90} width={80} height={170} fill={C.blue} rx={4} />
          <g transform={`translate(${66 + i * 90},175) rotate(-90)`}><T x={0} y={0} size={11} weight={700} fill={C.white}>{n}</T></g>
        </g>
      ))}
      <rect x={20} y={268} width={720} height={50} fill={C.navy} />
      <T x={380} y={293} size={12} weight={700} fill={C.white}>Foundation: 5S · OEE measurement · Kaizen culture</T>
    </Svg>
  );
}

export function HydraulicCylinder() {
  return (
    <Svg w={820} h={240} title="Hydraulic cylinder — main components">
      <rect x={60} y={80} width={420} height={80} rx={8} fill={C.steel} stroke={C.steelDark} strokeWidth={2} />
      <rect x={40} y={70} width={30} height={100} rx={4} fill={C.steelDark} />
      <circle cx={30} cy={120} r={18} fill={C.white} stroke={C.steelDark} strokeWidth={6} />
      <rect x={470} y={74} width={60} height={92} rx={4} fill={C.blueDark} />
      <rect x={240} y={86} width={34} height={68} fill={C.navy} />
      <rect x={274} y={104} width={420} height={32} fill="#e8edf5" stroke={C.steelDark} />
      <circle cx={720} cy={120} r={20} fill={C.white} stroke={C.steelDark} strokeWidth={6} />
      <rect x={690} y={104} width={14} height={32} fill={C.steelDark} />
      <rect x={120} y={58} width={24} height={22} fill={C.steelDark} />
      <rect x={420} y={58} width={24} height={22} fill={C.steelDark} />
      {[[30, 'Base / clevis', 200], [150, 'Tube (honed bore)', 30], [257, 'Piston + seals', 200], [500, 'Gland + rod seals', 30], [600, 'Chrome rod', 200], [130, 'Port bosses (welded)', 30]].map(([x, n, y]) => (
        <g key={n as string}>
          <line x1={x as number} y1={(y as number) < 100 ? 52 : 168} x2={x as number} y2={(y as number) < 100 ? 40 : 186} stroke={C.muted} />
          <Label x={x as number} y={(y as number) < 100 ? 30 : 200} text={n as string} color={C.navy} />
        </g>
      ))}
      <T x={410} y={226} size={11} fill={C.muted}>Illustrative double-acting cylinder used in examples throughout the academy</T>
    </Svg>
  );
}
