import { Arrow, Box, C, Label, Svg, T, Verdict } from './primitives';

export function TpsHouse() {
  return (
    <Svg w={620} h={420} title="Toyota Production System house">
      <polygon points="310,10 600,110 20,110" fill={C.blueDark} />
      <T x={310} y={70} size={13} weight={700} fill={C.white} max={40}>Best quality · Lowest cost · Shortest lead time · Safety · Morale</T>
      <rect x={40} y={120} width={150} height={190} fill={C.blue} rx={4} />
      <T x={115} y={150} size={15} weight={800} fill={C.white}>Just-In-Time</T>
      {['Takt time', 'Continuous flow', 'Pull system', 'Quick changeover'].map((t, i) => <T key={t} x={115} y={190 + i * 26} size={11} fill={C.white}>{t}</T>)}
      <rect x={430} y={120} width={150} height={190} fill={C.blue} rx={4} />
      <T x={505} y={150} size={15} weight={800} fill={C.white}>Jidoka</T>
      {['Stop at abnormality', 'Andon', 'Poka-Yoke', 'Separate man/machine'].map((t, i) => <T key={t} x={505} y={190 + i * 26} size={11} fill={C.white}>{t}</T>)}
      <rect x={200} y={120} width={220} height={190} fill={C.bg} stroke={C.line} />
      <T x={310} y={200} size={13} weight={700} max={22}>People & teamwork</T>
      <T x={310} y={240} size={11} max={28} fill={C.muted}>Problem solving · Kaizen · Respect</T>
      <rect x={20} y={320} width={580} height={44} fill={C.steelDark} />
      <T x={310} y={342} size={12} weight={700} fill={C.white}>Heijunka (levelling) · Standardised work · Kaizen</T>
      <rect x={20} y={368} width={580} height={44} fill={C.navy} />
      <T x={310} y={390} size={12} weight={700} fill={C.white}>Stability: 5S · TPM · Visual management</T>
    </Svg>
  );
}

function Tool({ x, y, kind, color = C.steelDark, rot = 0 }: { x: number; y: number; kind: 'spanner' | 'hammer' | 'screwdriver' | 'torque'; color?: string; rot?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      {kind === 'spanner' && (<><rect x={-4} y={-28} width={8} height={50} rx={3} fill={color} /><circle cx={0} cy={-30} r={9} fill={color} /><circle cx={0} cy={-30} r={4} fill={C.bg} /></>)}
      {kind === 'hammer' && (<><rect x={-3} y={-20} width={6} height={46} rx={2} fill="#8a5a2b" /><rect x={-14} y={-30} width={28} height={12} rx={2} fill={color} /></>)}
      {kind === 'screwdriver' && (<><rect x={-5} y={-30} width={10} height={22} rx={3} fill={C.red} /><rect x={-1.5} y={-8} width={3} height={32} fill={color} /></>)}
      {kind === 'torque' && (<><rect x={-3} y={-32} width={6} height={58} rx={2} fill={color} /><rect x={-7} y={14} width={14} height={14} rx={3} fill={C.navy} /></>)}
    </g>
  );
}

export function FiveSBeforeAfter() {
  return (
    <Svg w={760} h={320} title="5S: unorganised vs organised tool rack">
      <rect x={10} y={10} width={360} height={300} rx={12} fill={C.bg} stroke={C.line} />
      <rect x={390} y={10} width={360} height={300} rx={12} fill={C.bg} stroke={C.line} />
      <Verdict x={24} y={22} ok={false} text="Before: search, clutter, hidden leaks" />
      <Verdict x={404} y={22} ok text="After: shadow board, labels, clean" />
      <rect x={40} y={60} width={300} height={160} fill="#e9dfcf" stroke={C.steelDark} />
      <Tool x={80} y={130} kind="spanner" rot={35} /><Tool x={120} y={150} kind="hammer" rot={-60} /><Tool x={170} y={120} kind="screwdriver" rot={80} /><Tool x={230} y={160} kind="spanner" rot={-20} /><Tool x={280} y={120} kind="torque" rot={50} /><Tool x={150} y={185} kind="screwdriver" rot={-30} />
      <rect x={60} y={235} width={60} height={30} fill="#b9a27d" /><rect x={130} y={240} width={50} height={25} fill="#a48c66" /><ellipse cx={260} cy={262} rx={60} ry={8} fill="#6b5a3a" opacity={0.4} />
      <T x={190} y={290} size={11} fill={C.red}>Average 20 min searching per shift</T>
      <rect x={420} y={60} width={300} height={160} fill={C.white} stroke={C.steelDark} />
      {[['spanner', 'SP-19'], ['hammer', 'HM-01'], ['screwdriver', 'SD-06'], ['torque', 'TW-450'], ['spanner', 'SP-24']].map(([k, l], i) => (
        <g key={l}>
          <rect x={436 + i * 56} y={80} width={44} height={110} rx={4} fill="none" stroke={C.line} strokeDasharray="3 3" />
          <Tool x={458 + i * 56} y={140} kind={k as 'spanner'} color={C.blueDark} />
          <Label x={458 + i * 56} y={205} text={l} size={9} color={C.navy} />
        </g>
      ))}
      <rect x={430} y={235} width={280} height={30} rx={4} fill={C.greenLight} stroke={C.green} />
      <T x={570} y={250} size={11} weight={600}>Labelled seal-kit bins · min/max marks</T>
      <T x={570} y={290} size={11} fill={C.green}>Search time under 1 minute; missing tool visible at once</T>
    </Svg>
  );
}

export function KanbanLoop() {
  return (
    <Svg w={720} h={260} title="Kanban loop between assembly and supermarket">
      <Box x={20} y={70} w={170} h={90} label="Supplying process (seal-kit kitting)" fill={C.blueLight} />
      <Box x={280} y={70} w={160} h={90} label="Supermarket (max 4 bins)" fill={C.orangeLight} stroke={C.orange} />
      <Box x={530} y={70} w={170} h={90} label="Assembly line (consumes kits)" fill={C.greenLight} stroke={C.green} />
      <Arrow x1={190} y1={115} x2={278} y2={115} width={2.4} />
      <Arrow x1={440} y1={115} x2={528} y2={115} width={2.4} />
      <path d="M 615 160 Q 615 230 360 230 Q 105 230 105 162" fill="none" stroke={C.red} strokeWidth={2} strokeDasharray="6 4" />
      <polygon points="105,162 99,176 111,176" fill={C.red} />
      <rect x={325} y={214} width={70} height={30} rx={4} fill={C.white} stroke={C.red} />
      <T x={360} y={229} size={10} weight={700} fill={C.red}>KANBAN</T>
      <T x={360} y={30} size={12} weight={600}>Material flows → ; empty-bin card returns ⇠ to authorise refill</T>
    </Svg>
  );
}

export function AndonBoard() {
  const st = [['ST1', 'green'], ['ST2', 'green'], ['ST3 Test', 'yellow'], ['ST4', 'green'], ['ST5 Paint', 'red']] as const;
  const col = { green: C.green, yellow: C.orange, red: C.red };
  return (
    <Svg w={680} h={220} title="Andon board">
      <rect x={10} y={10} width={660} height={200} rx={10} fill={C.navy} />
      <T x={340} y={34} size={14} weight={700} fill={C.white}>ASSEMBLY LINE 2 — Plan 40 · Actual 26 · Takt 11.3 min</T>
      {st.map(([n, s], i) => (
        <g key={n}>
          <rect x={30 + i * 128} y={60} width={110} height={90} rx={8} fill={col[s]} />
          <T x={85 + i * 128} y={92} size={13} weight={800} fill={C.white}>{n}</T>
          <T x={85 + i * 128} y={122} size={10} fill={C.white} max={16}>{s === 'green' ? 'Running' : s === 'yellow' ? 'Help called — Quality' : 'Stopped — Maintenance'}</T>
        </g>
      ))}
      <T x={340} y={180} size={11} fill={C.steel}>Yellow: team leader responds within 1 min · Red: line stopped, escalate after 10 min</T>
    </Svg>
  );
}

export function Vsm() {
  const p = [['Cutting', 'CT 3 min', 'C/O 20'], ['Honing', 'CT 10 min', 'C/O 45'], ['Welding', 'CT 6 min', 'C/O 50'], ['Assembly', 'CT 11 min', 'C/O 15'], ['Test', 'CT 9 min', 'C/O 5'], ['Paint', 'CT 8 min', 'Batch 20']];
  const inv = ['5 d', '3 d', '2 d', '1 d', '0.5 d', '2 d'];
  return (
    <Svg w={900} h={330} title="Value stream map — current state">
      <Box x={10} y={10} w={120} h={50} label="Tube & rod suppliers" fill={C.bg} stroke={C.steelDark} size={11} />
      <Box x={770} y={10} w={120} h={50} label="OEM customer 960/month" fill={C.bg} stroke={C.steelDark} size={11} />
      <Box x={370} y={10} w={160} h={44} label="Production control (MRP)" fill={C.blueLight} size={11} />
      <Arrow x1={370} y1={32} x2={132} y2={32} dashed />
      <Arrow x1={770} y1={32} x2={532} y2={32} dashed />
      {p.map(([n, ct, co], i) => {
        const x = 30 + i * 145;
        return (
          <g key={n}>
            <polygon points={`${x - 26},150 ${x - 14},128 ${x - 2},150`} fill={C.orange} />
            <Label x={x - 14} y={162} text={inv[i]} size={10} color={C.orange} />
            <Box x={x + 4} y={100} w={110} h={42} label={n} fill={C.blue} color={C.white} size={12} />
            <rect x={x + 4} y={142} width={110} height={44} fill={C.white} stroke={C.blue} />
            <Label x={x + 59} y={156} text={ct} size={10} />
            <Label x={x + 59} y={174} text={co} size={10} />
            <Arrow x1={x + 59} y1={56} x2={x + 59} y2={98} dashed color={C.muted} />
          </g>
        );
      })}
      <polyline points="10,240 120,240 120,270 150,270 150,240 265,240 265,270 295,270 295,240 410,240 410,270 440,270 440,240 555,240 555,270 585,270 585,240 700,240 700,270 730,270 730,240 845,240 845,270 880,270" fill="none" stroke={C.navy} strokeWidth={1.5} />
      <T x={450} y={300} size={12} weight={700}>Lead time ≈ 13.5 days · Value-added time ≈ 47 min · VA ratio ≈ 0.3%</T>
      <T x={450} y={222} size={10} fill={C.muted}>Push arrows everywhere; each process is scheduled separately by MRP</T>
    </Svg>
  );
}

const WASTES: { k: string; name: string; ex: string; draw: (x: number, y: number) => JSX.Element }[] = [
  { k: 'T', name: 'Transportation', ex: 'Tubes carried 300 m to a distant honing bay and back', draw: (x, y) => (<g><rect x={x + 10} y={y + 40} width={60} height={26} fill={C.orange} rx={3} /><circle cx={x + 22} cy={y + 70} r={6} fill={C.navy} /><circle cx={x + 58} cy={y + 70} r={6} fill={C.navy} /><Arrow x1={x + 80} y1={y + 52} x2={x + 140} y2={y + 52} dashed color={C.red} /><rect x={x + 120} y={y + 20} width={30} height={20} fill={C.steel} /></g>) },
  { k: 'I', name: 'Inventory', ex: '200 finished rods stored "just in case"', draw: (x, y) => (<g>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={x + 14 + (i % 3) * 34} y={y + 16 + Math.floor(i / 3) * 20} width={30} height={16} fill={C.steel} stroke={C.steelDark} />)}<polygon points={`${x + 130},${y + 70} ${x + 145},${y + 40} ${x + 160},${y + 70}`} fill={C.orange} /><T x={x + 145} y={y + 62} size={9} fill={C.white}>I</T></g>) },
  { k: 'M', name: 'Motion', ex: 'Fitter walking to fetch seal kits 14 times a shift', draw: (x, y) => (<g><circle cx={x + 40} cy={y + 20} r={9} fill={C.navy} /><line x1={x + 40} y1={y + 29} x2={x + 40} y2={y + 55} stroke={C.navy} strokeWidth={4} /><line x1={x + 40} y1={y + 55} x2={x + 28} y2={y + 75} stroke={C.navy} strokeWidth={4} /><line x1={x + 40} y1={y + 55} x2={x + 54} y2={y + 75} stroke={C.navy} strokeWidth={4} /><path d={`M ${x + 60} ${y + 70} q 30 -40 60 0 q 15 20 25 -10`} fill="none" stroke={C.red} strokeDasharray="4 3" strokeWidth={2} /></g>) },
  { k: 'W', name: 'Waiting', ex: 'Welder waiting 25 min for the overhead crane', draw: (x, y) => (<g><circle cx={x + 50} cy={y + 44} r={28} fill={C.white} stroke={C.navy} strokeWidth={3} /><line x1={x + 50} y1={y + 44} x2={x + 50} y2={y + 26} stroke={C.navy} strokeWidth={3} /><line x1={x + 50} y1={y + 44} x2={x + 64} y2={y + 52} stroke={C.red} strokeWidth={3} /><T x={x + 120} y={y + 44} size={22} weight={800} fill={C.red}>…</T></g>) },
  { k: 'O', name: 'Overproduction', ex: 'Painting cylinders that have no customer order yet', draw: (x, y) => (<g>{Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + 10 + i * 22} y={y + 30 - (i > 3 ? 14 : 0)} width={18} height={44} rx={3} fill={i > 3 ? C.red : C.blue} />)}<T x={x + 120} y={y + 10} size={10} fill={C.red}>no order</T></g>) },
  { k: 'O', name: 'Overprocessing', ex: 'Honing to Ra 0.2 µm when 0.4 µm is specified', draw: (x, y) => (<g><rect x={x + 20} y={y + 30} width={110} height={30} rx={14} fill={C.steel} /><path d={`M ${x + 30} ${y + 45} ${Array.from({ length: 20 }, (_, i) => `l 5 ${i % 2 ? 4 : -4}`).join(' ')}`} fill="none" stroke={C.blueDark} /><T x={x + 75} y={y + 78} size={10}>spec 0.4 → made 0.2</T></g>) },
  { k: 'D', name: 'Defects', ex: 'Leak-test failure from a cut seal → rework', draw: (x, y) => (<g><rect x={x + 20} y={y + 30} width={100} height={30} rx={4} fill={C.steel} /><rect x={x + 110} y={y + 36} width={40} height={18} fill={C.steelDark} /><path d={`M ${x + 108} ${y + 62} q 4 10 0 16 q -4 -8 0 -16`} fill={C.orange} /><T x={x + 60} y={y + 18} size={14} weight={800} fill={C.red}>✕ LEAK</T></g>) },
  { k: 'S', name: 'Skills underutilisation', ex: 'Experienced fitters never asked to improve fixtures', draw: (x, y) => (<g><circle cx={x + 50} cy={y + 28} r={11} fill={C.navy} /><rect x={x + 38} y={y + 40} width={24} height={34} rx={6} fill={C.navy} /><path d={`M ${x + 75} ${y + 20} q 20 -15 40 0 q 20 15 0 30 l -20 0 l -12 10 l 2 -10 q -20 -15 -10 -30`} fill={C.white} stroke={C.steelDark} /><T x={x + 98} y={y + 30} size={16} fill={C.orange}>💡</T></g>) },
];

export function Timwoods() {
  return (
    <Svg w={880} h={440} title="The 8 wastes — TIMWOODS">
      {WASTES.map((w, i) => {
        const x = 10 + (i % 4) * 218, y = 10 + Math.floor(i / 4) * 216;
        return (
          <g key={w.name}>
            <rect x={x} y={y} width={206} height={204} rx={12} fill={C.white} stroke={C.line} />
            <circle cx={x + 24} cy={y + 24} r={16} fill={C.red} />
            <T x={x + 24} y={y + 24} size={15} weight={800} fill={C.white}>{w.k}</T>
            <T x={x + 120} y={y + 24} size={13} weight={700}>{w.name}</T>
            {w.draw(x + 26, y + 46)}
            <T x={x + 103} y={y + 172} size={10.5} max={34} fill={C.ink}>{w.ex}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function TimwoodsGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {WASTES.map((w) => (
        <figure key={w.name} className="rounded-xl border border-navy-100 bg-white p-3">
          <svg viewBox="0 0 200 110" className="w-full h-auto" role="img" aria-label={w.name}>
            <rect x={0} y={0} width={200} height={110} rx={10} fill={C.bg} />
            {w.draw(20, 16)}
          </svg>
          <figcaption className="mt-2 text-sm">
            <span className="font-semibold text-navy-900"><span className="text-bad-600">{w.k}</span> — {w.name}</span>
            <span className="block text-navy-500 text-xs mt-0.5">{w.ex}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ThreeM() {
  return (
    <Svg w={760} h={240} title="Muda, Mura, Muri">
      {[['MURI', 'Overburden', 'One truck carrying 3 tonnes in one trip', C.red, [90]], ['MURA', 'Unevenness', 'Loads of 2 t, 0 t, 1 t on different trips', C.orange, [60, 0, 30]], ['MUDA', 'Waste', 'Trips with empty space or no load', C.blue, [20, 20, 20, 0]], ['IDEAL', 'Levelled', '1 t per trip, every trip', C.green, [30, 30, 30]]].map(([n, d, e, col, loads], i) => {
        const x = 10 + i * 188;
        return (
          <g key={n as string}>
            <rect x={x} y={10} width={178} height={220} rx={12} fill={C.white} stroke={col as string} strokeWidth={2} />
            <T x={x + 89} y={34} size={15} weight={800} fill={col as string}>{n as string}</T>
            <T x={x + 89} y={54} size={11} fill={C.muted}>{d as string}</T>
            {(loads as number[]).map((l, k) => (
              <g key={k}>
                <rect x={x + 16 + k * 40} y={150 - l} width={32} height={l} fill={col as string} opacity={0.75} />
                <rect x={x + 12 + k * 40} y={150} width={40} height={12} fill={C.navy} />
              </g>
            ))}
            <T x={x + 89} y={196} size={10.5} max={28}>{e as string}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function Smed() {
  const bars = [
    { label: 'Before', parts: [['Search fixture', 15, C.red], ['Wait first-off', 20, C.red], ['Adjust', 18, C.orange], ['Change', 12, C.blue], ['Program', 10, C.orange]] },
    { label: 'Separate', parts: [['Change', 12, C.blue], ['Adjust', 18, C.orange], ['Wait first-off', 20, C.red]] },
    { label: 'Convert', parts: [['Change', 12, C.blue], ['Adjust', 6, C.orange], ['On-machine gauge', 4, C.green]] },
    { label: 'Streamline', parts: [['Quick clamps', 6, C.blue], ['Gauge', 3, C.green]] },
  ] as const;
  return (
    <Svg w={760} h={260} title="SMED stages reduce internal changeover time">
      {bars.map((b, i) => {
        let x = 140;
        const total = b.parts.reduce((a, p) => a + p[1], 0);
        return (
          <g key={b.label}>
            <T x={70} y={40 + i * 54} size={12} weight={700}>{b.label}</T>
            {b.parts.map(([n, m, col]) => {
              const w = m * 7.2;
              const el = (
                <g key={n}>
                  <rect x={x} y={24 + i * 54} width={w - 2} height={32} fill={col} rx={4} />
                  {w > 50 && <T x={x + w / 2} y={40 + i * 54} size={9.5} fill={C.white} max={Math.floor(w / 6)}>{n}</T>}
                </g>
              );
              x += w;
              return el;
            })}
            <Label x={x + 30} y={40 + i * 54} text={`${total} min`} color={C.navy} />
          </g>
        );
      })}
      <T x={400} y={240} size={11} fill={C.muted}>Internal time only (machine stopped). External preparation happens while the machine runs.</T>
    </Svg>
  );
}

export function Heijunka() {
  const batch = ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'];
  const lev = ['A', 'B', 'A', 'C', 'A', 'B', 'A', 'C', 'A', 'B', 'A', 'C'];
  const col: Record<string, string> = { A: C.blue, B: C.orange, C: C.green };
  return (
    <Svg w={720} h={230} title="Heijunka: batched vs levelled sequence">
      {[['Batched (Mon A, Tue B, Wed C)', batch], ['Levelled (repeating mix every day)', lev]].map(([n, seq], r) => (
        <g key={n as string}>
          <T x={360} y={24 + r * 100} size={12} weight={700}>{n as string}</T>
          {(seq as string[]).map((s, i) => (
            <g key={i}>
              <rect x={30 + i * 55} y={40 + r * 100} width={48} height={42} rx={6} fill={col[s]} />
              <T x={54 + i * 55} y={61 + r * 100} size={14} weight={800} fill={C.white}>{s}</T>
            </g>
          ))}
        </g>
      ))}
      <T x={360} y={214} size={11} fill={C.muted}>A = 63 mm, B = 80 mm, C = 100 mm cylinders. Levelling keeps upstream demand steady.</T>
    </Svg>
  );
}

export function PushPull() {
  return (
    <Svg w={760} h={260} title="Push versus pull">
      <T x={190} y={20} size={13} weight={800} fill={C.red}>PUSH — schedule every process</T>
      <T x={570} y={20} size={13} weight={800} fill={C.green}>PULL — schedule one point</T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Box x={20 + i * 120} y={60} w={90} h={50} label={['Machining', 'Welding', 'Assembly'][i]} size={11} />
          {i < 2 && <polygon points={`${118 + i * 120},120 ${130 + i * 120},100 ${142 + i * 120},120`} fill={C.orange} />}
          {i < 2 && <Arrow x1={110 + i * 120} y1={85} x2={130 + i * 120} y2={85} />}
          <Arrow x1={65 + i * 120} y1={170} x2={65 + i * 120} y2={112} dashed color={C.muted} />
        </g>
      ))}
      <Box x={110} y={170} w={150} h={36} label="MRP schedule ×3" fill={C.redLight} stroke={C.red} size={11} />
      <T x={190} y={232} size={10.5} fill={C.muted}>Inventory piles up between processes</T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Box x={400 + i * 120} y={60} w={90} h={50} label={['Machining', 'Supermarket', 'Assembly'][i]} size={11} fill={i === 1 ? C.orangeLight : C.blueLight} stroke={i === 1 ? C.orange : C.blue} />
          {i < 2 && <Arrow x1={490 + i * 120} y1={85} x2={510 + i * 120} y2={85} />}
        </g>
      ))}
      <path d="M 685 112 Q 685 150 565 150 Q 445 150 445 114" fill="none" stroke={C.green} strokeDasharray="5 4" strokeWidth={2} />
      <T x={565} y={162} size={10} fill={C.green}>Kanban signal</T>
      <Box x={610} y={170} w={150} h={36} label="Schedule pacemaker only" fill={C.greenLight} stroke={C.green} size={11} />
      <T x={570} y={232} size={10.5} fill={C.muted}>Inventory limited to supermarket max</T>
    </Svg>
  );
}

export function BatchVsFlow() {
  return (
    <Svg w={760} h={240} title="Batch processing versus one-piece flow">
      {[['Batch of 5 (each step 1 min)', [[0, 5], [5, 10], [10, 15]], 'First piece out: 11 min · All done: 15 min', C.orange], ['One-piece flow', [[0, 5], [1, 6], [2, 7]], 'First piece out: 3 min · All done: 7 min', C.green]].map(([n, segs, res, col], r) => (
        <g key={n as string}>
          <T x={110} y={30 + r * 110} size={12} weight={700} anchor="middle">{n as string}</T>
          {(segs as number[][]).map(([a, b], s) => (
            <g key={s}>
              <Label x={200} y={30 + r * 110 + s * 24} text={`Step ${s + 1}`} anchor="end" />
              {Array.from({ length: b - a }, (_, k) => <rect key={k} x={210 + (a + k) * 32} y={20 + r * 110 + s * 24} width={30} height={18} rx={3} fill={col as string} />)}
            </g>
          ))}
          <T x={480} y={100 + r * 110} size={11} fill={C.navy}>{res as string}</T>
        </g>
      ))}
    </Svg>
  );
}

export function FifoLane() {
  return (
    <Svg w={720} h={200} title="FIFO lane with maximum quantity">
      <Box x={10} y={60} w={120} h={70} label="Honing" />
      <Box x={590} y={60} w={120} h={70} label="Welding" />
      <rect x={150} y={70} width={420} height={50} fill={C.bg} stroke={C.steelDark} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={160 + i * 44} y={78} width={38} height={34} rx={4} fill={i < 3 ? C.steel : C.blue} />)}
      <line x1={556} y1={60} x2={556} y2={130} stroke={C.red} strokeWidth={3} />
      <Label x={556} y={48} text="MAX 12" color={C.red} />
      <Arrow x1={140} y1={95} x2={150} y2={95} />
      <Arrow x1={570} y1={95} x2={588} y2={95} />
      <T x={360} y={160} size={11} max={90}>Oldest batch leaves first. When the lane is full, honing stops — the signal that welding is the constraint today.</T>
    </Svg>
  );
}

export function Supermarket() {
  return (
    <Svg w={640} h={240} title="Supermarket with min/max locations">
      <rect x={60} y={30} width={520} height={160} fill={C.white} stroke={C.steelDark} />
      {['Rod R-56', 'Rod R-45', 'Tube T-80', 'Tube T-100'].map((p, i) => (
        <g key={p}>
          <rect x={80 + i * 125} y={50} width={105} height={120} fill={C.bg} stroke={C.line} />
          <T x={132 + i * 125} y={64} size={11} weight={700}>{p}</T>
          {Array.from({ length: [4, 2, 3, 1][i] }, (_, k) => <rect key={k} x={92 + i * 125} y={150 - k * 22} width={80} height={18} rx={3} fill={[C.blue, C.blue, C.blue, C.red][i]} />)}
          <line x1={84 + i * 125} x2={182 + i * 125} y1={84} y2={84} stroke={C.green} strokeDasharray="3 3" />
          <line x1={84 + i * 125} x2={182 + i * 125} y1={146} y2={146} stroke={C.red} strokeDasharray="3 3" />
        </g>
      ))}
      <Label x={40} y={84} text="max" color={C.green} />
      <Label x={40} y={146} text="min" color={C.red} />
      <T x={320} y={216} size={11} fill={C.muted}>Tube T-100 below min → its Kanban has already gone back to the tube cell</T>
    </Svg>
  );
}

export function MilkRun() {
  const stops = [[120, 60], [300, 40], [480, 70], [520, 190], [330, 220], [140, 180]];
  return (
    <Svg w={640} h={280} title="Milk run route">
      <polygon points={stops.map((s) => s.join(',')).join(' ')} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="10 6" />
      {stops.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={22} fill={i === 0 ? C.navy : C.white} stroke={C.blue} strokeWidth={2} />
          <T x={x} y={y} size={10} weight={700} fill={i === 0 ? C.white : C.navy}>{i === 0 ? 'Store' : `ST${i}`}</T>
        </g>
      ))}
      <T x={320} y={262} size={11} fill={C.muted}>Fixed route every 60 min: deliver full bins, collect empties and Kanban cards</T>
    </Svg>
  );
}

export function CellU() {
  const m = ['Saw', 'CNC lathe', 'Induction hardening', 'Grinder', 'Chrome check', 'Wash'];
  const pos = [[40, 40], [200, 40], [360, 40], [360, 200], [200, 200], [40, 200]];
  return (
    <Svg w={540} h={320} title="U-shaped cell">
      <path d="M 120 120 L 440 120 L 440 190 L 120 190" fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="6 4" />
      {m.map((n, i) => <Box key={n} x={pos[i][0]} y={pos[i][1]} w={140} h={70} label={n} size={12} fill={i === 0 || i === 5 ? C.greenLight : C.blueLight} stroke={i === 0 || i === 5 ? C.green : C.blue} />)}
      <circle cx={280} cy={156} r={12} fill={C.navy} />
      <T x={280} y={300} size={11} fill={C.muted}>Raw material enters and finished rods leave at the same end — one operator sees the whole flow</T>
    </Svg>
  );
}

export function Spaghetti({ after = false }: { after?: boolean }) {
  const st = [[60, 60, 'Seal store'], [460, 70, 'Tool crib'], [260, 210, 'Bench'], [80, 230, 'Rod rack'], [440, 240, 'Test']] as const;
  const path = after ? 'M 260 210 L 300 225 L 260 240 L 220 225 Z' : 'M 260 210 L 60 60 L 260 210 L 460 70 L 260 210 L 80 230 L 260 210 L 60 60 L 440 240 L 260 210 L 460 70 L 80 230 L 440 240';
  return (
    <Svg w={540} h={290} title={after ? 'Spaghetti diagram after kitting' : 'Spaghetti diagram before'}>
      <rect x={10} y={10} width={520} height={270} fill={C.bg} stroke={C.line} />
      <path d={path} fill="none" stroke={C.red} strokeWidth={2} opacity={0.75} />
      {st.map(([x, y, n]) => <Box key={n} x={x - 45} y={y - 18} w={90} h={36} label={n} size={11} fill={C.white} />)}
      <T x={270} y={28} size={12} weight={700} fill={after ? C.green : C.red}>{after ? 'After: kitted tray at bench — 40 m per shift' : 'Before: 14 trips — 1.6 km per shift'}</T>
    </Svg>
  );
}

export function LayoutBeforeAfter() {
  return (
    <Svg w={780} h={300} title="Layout before and after">
      <rect x={10} y={10} width={370} height={280} rx={10} fill={C.bg} stroke={C.line} />
      <rect x={400} y={10} width={370} height={280} rx={10} fill={C.bg} stroke={C.line} />
      <Verdict x={24} y={20} ok={false} text="Before: 380 m per cylinder" />
      <Verdict x={414} y={20} ok text="After: 95 m, one bay" />
      {[['Cut', 40, 70], ['Hone', 290, 70], ['Weld', 40, 210], ['Assy', 290, 210], ['Test', 165, 140]].map(([n, x, y], i, a) => (
        <g key={n as string}>
          <Box x={x as number} y={y as number} w={70} h={40} label={n as string} size={11} />
          {i < a.length - 1 && <Arrow x1={(x as number) + 35} y1={(y as number) + 20} x2={(a[i + 1][1] as number) + 35} y2={(a[i + 1][2] as number) + 20} color={C.red} dashed />}
        </g>
      ))}
      {['Cut', 'Hone', 'Weld', 'Assy', 'Test', 'Paint'].map((n, i) => (
        <g key={n}>
          <Box x={420 + i * 58} y={150} w={50} h={40} label={n} size={10} fill={C.greenLight} stroke={C.green} />
          {i < 5 && <Arrow x1={470 + i * 58} y1={170} x2={478 + i * 58} y2={170} color={C.green} />}
        </g>
      ))}
    </Svg>
  );
}

export function JidokaDiagram() {
  return (
    <Svg w={720} h={180} title="Jidoka sequence">
      {['Detect abnormality', 'Stop automatically', 'Call (Andon)', 'Fix / contain', 'Root cause & standardise'].map((s, i) => (
        <g key={s}>
          <Box x={10 + i * 142} y={50} w={124} h={70} label={s} size={12} fill={i === 1 ? C.redLight : i === 4 ? C.greenLight : C.blueLight} stroke={i === 1 ? C.red : i === 4 ? C.green : C.blue} />
          {i < 4 && <Arrow x1={134 + i * 142} y1={85} x2={150 + i * 142} y2={85} />}
        </g>
      ))}
      <T x={360} y={160} size={11} fill={C.muted}>Leak-test bench: failure → bench locks part in red cage → QE called → cause recorded before release</T>
    </Svg>
  );
}

export function StandardWork() {
  return (
    <Svg w={720} h={200} title="Three elements of standardised work">
      {[['Takt time', 'Pace set by demand: 11.25 min'], ['Work sequence', 'Best order of steps with key points'], ['Standard WIP', 'Minimum parts needed in the cell: 3']].map(([h, d], i) => (
        <g key={h}>
          <circle cx={130 + i * 230} cy={90} r={70} fill={[C.blue, C.green, C.orange][i]} opacity={0.9} />
          <T x={130 + i * 230} y={80} size={14} weight={800} fill={C.white}>{h}</T>
          <T x={130 + i * 230} y={108} size={10.5} fill={C.white} max={18}>{d}</T>
        </g>
      ))}
    </Svg>
  );
}

export function VisualMgmt() {
  return (
    <Svg w={720} h={240} title="Visual management colour standard">
      {[['Pending inspection', C.orange, '9 of 18 inspected — WO-2318'], ['Inspected OK', C.green, 'Released to assembly'], ['Rejected / hold', C.red, 'Locked cage — QE only']].map(([n, col, d], i) => (
        <g key={n}>
          <rect x={20 + i * 235} y={30} width={215} height={170} rx={10} fill={C.white} stroke={col} strokeWidth={3} strokeDasharray={i === 2 ? '8 4' : undefined} />
          <rect x={20 + i * 235} y={30} width={215} height={36} rx={10} fill={col} />
          <T x={127 + i * 235} y={48} size={13} weight={800} fill={C.white}>{n}</T>
          {[0, 1, 2].map((k) => <rect key={k} x={40 + i * 235 + k * 62} y={90} width={52} height={60} rx={4} fill={C.steel} />)}
          <rect x={44 + i * 235} y={96} width={44} height={16} fill={C.white} />
          <T x={127 + i * 235} y={176} size={10.5} max={30}>{d}</T>
        </g>
      ))}
    </Svg>
  );
}
