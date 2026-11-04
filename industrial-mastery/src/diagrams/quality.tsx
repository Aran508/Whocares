import { Arrow, Box, C, Label, Svg, T, Verdict } from './primitives';
import { TableDiagram } from './generic';

export function Fishbone({ effect = 'Leak at rod seal', causes }: { effect?: string; causes?: Record<string, string[]> }) {
  const cats = causes ?? {
    Man: ['Fitter not trained on sleeve', 'Shift change'],
    Machine: ['Rod polisher worn', 'Test bench gauge'],
    Method: ['No chamfer standard', 'No installation sleeve'],
    Material: ['New rod batch: sharp thread', 'Seal hardness'],
    Measurement: ['Test hold only 30 s', 'No chamfer check'],
    Environment: ['Dust in assembly', 'Low temperature'],
  };
  const names = Object.keys(cats);
  const W = 860, H = 400, spineY = 200, x0 = 40, x1 = 660;
  return (
    <Svg w={W} h={H} title="Fishbone (Ishikawa) diagram">
      <line x1={x0} y1={spineY} x2={x1} y2={spineY} stroke={C.navy} strokeWidth={3} />
      <polygon points={`${x1},${spineY - 12} ${x1 + 16},${spineY} ${x1},${spineY + 12}`} fill={C.navy} />
      <Box x={x1 + 20} y={spineY - 42} w={170} h={84} fill={C.redLight} stroke={C.red} label={effect} size={13} max={20} />
      {names.map((n, i) => {
        const top = i % 2 === 0;
        const bx = 120 + Math.floor(i / 2) * 190;
        const by = top ? 40 : 360;
        return (
          <g key={n}>
            <line x1={bx} y1={by} x2={bx + 70} y2={spineY} stroke={C.steelDark} strokeWidth={2} />
            <rect x={bx - 52} y={top ? by - 26 : by + 2} width={104} height={24} rx={6} fill={C.blue} />
            <T x={bx} y={top ? by - 14 : by + 14} size={12} weight={700} fill={C.white}>{n}</T>
            {cats[n].map((c, j) => {
              const t = (j + 1) / (cats[n].length + 1);
              const px = bx + 70 * t, py = by + (spineY - by) * t;
              return (
                <g key={c}>
                  <line x1={px - 70} y1={py} x2={px} y2={py} stroke={C.line} strokeWidth={1.5} />
                  <text x={px - 72} y={py - 5} fontSize={10.5} fill={C.ink} textAnchor="start" fontFamily="Inter, sans-serif">{c}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </Svg>
  );
}

export function Pareto({ data }: { data?: { label: string; value: number }[] }) {
  const d = (data ?? [
    { label: 'Rod seal', value: 42 },
    { label: 'Piston seal', value: 23 },
    { label: 'Weld porosity', value: 15 },
    { label: 'Port thread', value: 10 },
    { label: 'Others', value: 10 },
  ]).slice().sort((a, b) => b.value - a.value);
  const total = d.reduce((a, b) => a + b.value, 0);
  const W = 620, H = 340, x0 = 60, y0 = 20, ch = 250, cw = 500;
  const bw = cw / d.length;
  const max = d[0].value;
  let cum = 0;
  const pts = d.map((x, i) => {
    cum += x.value;
    return [x0 + bw * i + bw / 2, y0 + ch - (cum / total) * ch] as const;
  });
  return (
    <Svg w={W} h={H} title="Pareto chart">
      <line x1={x0} y1={y0} x2={x0} y2={y0 + ch} stroke={C.steelDark} />
      <line x1={x0} y1={y0 + ch} x2={x0 + cw} y2={y0 + ch} stroke={C.steelDark} />
      <line x1={x0 + cw} y1={y0} x2={x0 + cw} y2={y0 + ch} stroke={C.steelDark} />
      <line x1={x0} y1={y0 + ch * 0.2} x2={x0 + cw} y2={y0 + ch * 0.2} stroke={C.orange} strokeDasharray="5 4" />
      <Label x={x0 + cw + 8} y={y0 + ch * 0.2} text="80%" color={C.orange} anchor="start" />
      <Label x={x0 + cw + 8} y={y0} text="100%" anchor="start" />
      {d.map((x, i) => {
        const h = (x.value / max) * ch * 0.78;
        return (
          <g key={x.label}>
            <rect x={x0 + bw * i + 8} y={y0 + ch - h} width={bw - 16} height={h} fill={pts[i][1] <= y0 + ch * 0.2 + 1 || i === 0 ? C.blue : C.steel} rx={3} />
            <Label x={x0 + bw * i + bw / 2} y={y0 + ch - h - 10} text={String(x.value)} color={C.navy} />
            <T x={x0 + bw * i + bw / 2} y={y0 + ch + 22} size={10.5} max={14}>{x.label}</T>
          </g>
        );
      })}
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.red} strokeWidth={2} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={C.red} />)}
      <Label x={20} y={y0 + ch / 2} text="Count" />
    </Svg>
  );
}

export function ControlChart() {
  const vals = [80.021, 80.019, 80.023, 80.020, 80.018, 80.022, 80.021, 80.019, 80.020, 80.022, 80.023, 80.024, 80.025, 80.026, 80.028];
  const W = 640, H = 300, x0 = 70, y0 = 30, cw = 540, ch = 220;
  const ucl = 80.0258, lcl = 80.0142, cl = 80.02;
  const ymin = 80.012, ymax = 80.03;
  const Y = (v: number) => y0 + ch - ((v - ymin) / (ymax - ymin)) * ch;
  return (
    <Svg w={W} h={H} title="X-bar control chart with a trend signal">
      <rect x={x0} y={y0} width={cw} height={ch} fill={C.bg} />
      {[['UCL', ucl, C.red], ['CL', cl, C.green], ['LCL', lcl, C.red]].map(([n, v, col]) => (
        <g key={n as string}>
          <line x1={x0} x2={x0 + cw} y1={Y(v as number)} y2={Y(v as number)} stroke={col as string} strokeDasharray={n === 'CL' ? undefined : '6 4'} strokeWidth={1.5} />
          <Label x={x0 - 8} y={Y(v as number)} text={`${n} ${(v as number).toFixed(4)}`} anchor="end" color={col as string} size={10} />
        </g>
      ))}
      <polyline points={vals.map((v, i) => `${x0 + 20 + i * 36},${Y(v)}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={2} />
      {vals.map((v, i) => <circle key={i} cx={x0 + 20 + i * 36} cy={Y(v)} r={4.5} fill={v > ucl || i >= 9 ? C.red : C.blue} />)}
      <rect x={x0 + 20 + 9 * 36 - 12} y={Y(80.0285) - 12} width={6 * 36 + 4} height={Y(80.021) - Y(80.0285) + 24} fill="none" stroke={C.orange} strokeDasharray="4 3" rx={6} />
      <Label x={x0 + 20 + 12 * 36} y={y0 + ch + 18} text="Signal: 6 rising points + point above UCL → tool/stone wear" color={C.orange} />
      <Label x={x0 + cw / 2} y={y0 - 14} text="X̄ chart — honed bore Ø80 (subgroups of 5)" color={C.navy} />
    </Svg>
  );
}

export function Capability() {
  const W = 640, H = 300, x0 = 40, w = 560, base = 240;
  const curve = (mu: number, sd: number, scale: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = mu - 4 * sd + (8 * sd * i) / 120;
      const y = Math.exp(-((x - mu) ** 2) / (2 * sd * sd));
      pts.push(`${x0 + ((x - 9.9) / 0.2) * w},${base - y * scale}`);
    }
    return pts.join(' ');
  };
  const X = (v: number) => x0 + ((v - 9.9) / 0.2) * w;
  return (
    <Svg w={W} h={H} title="Process capability: centred vs off-centre">
      <line x1={x0} y1={base} x2={x0 + w} y2={base} stroke={C.steelDark} />
      {[['LSL 9.95', 9.95], ['USL 10.05', 10.05], ['Target 10.00', 10.0]].map(([l, v]) => (
        <g key={l as string}>
          <line x1={X(v as number)} x2={X(v as number)} y1={40} y2={base} stroke={(l as string).startsWith('T') ? C.green : C.red} strokeDasharray="6 4" strokeWidth={1.5} />
          <Label x={X(v as number)} y={28} text={l as string} color={(l as string).startsWith('T') ? C.green : C.red} />
        </g>
      ))}
      <polyline points={curve(10.0, 0.01, 170)} fill={C.blueLight} fillOpacity={0.5} stroke={C.blue} strokeWidth={2} />
      <polyline points={curve(10.03, 0.01, 170)} fill={C.orangeLight} fillOpacity={0.5} stroke={C.orange} strokeWidth={2} />
      <Label x={X(10.0)} y={base + 22} text="Centred: Cp 1.67, Cpk 1.67" color={C.blue} />
      <Label x={X(10.038)} y={base + 42} text="Shifted: Cp 1.67, Cpk 0.67" color={C.orange} />
    </Svg>
  );
}

export function FmeaTable() {
  return (
    <TableDiagram
      title="PFMEA extract — welding and assembly"
      cols={['Step', 'Failure mode', 'Effect', 'S', 'Cause', 'O', 'Control', 'D', 'RPN']}
      rows={[
        ['OP40 Weld', 'Lack of fusion', 'Burst / leak', '9', 'Low current', '4', 'Visual', '6', '216'],
        ['OP40 Weld', 'Porosity', 'Leak', '7', 'Low gas flow', '4', 'Sample X-ray', '5', '140'],
        ['OP70 Seal fit', 'Seal lip cut', 'Leak', '7', 'Sharp thread', '5', 'Leak test', '3', '105'],
        ['OP80 Test', 'Test too short', 'Escape', '8', 'No timer', '3', 'None', '8', '192'],
      ]}
      highlight={(r, c) => (c === 8 ? (r === 0 || r === 3 ? C.redLight : C.orangeLight) : c === 3 && r === 0 ? C.redLight : undefined)}
    />
  );
}

export function ControlPlanTable() {
  return (
    <TableDiagram
      title="Control plan extract"
      cols={['Op', 'Characteristic', 'Specification', 'Method', 'Sample/Freq.', 'Control', 'Reaction plan']}
      rows={[
        ['OP20', 'Bore Ø', '80 H8', 'Bore gauge', '5 / 2 h', 'X̄-R chart', 'Stop, segregate, QE'],
        ['OP40', 'Weld current', '210–230 A', 'Robot monitor', '100%', 'Alarm', 'Stop, check gas & wire'],
        ['OP80', 'Leak tightness', '375 bar 3 min', 'Test bench', '100%', 'Record', 'Red tag, quarantine'],
      ]}
    />
  );
}

export function Pdca() {
  const W = 520, H = 360, cx = 260, cy = 180, r = 130;
  const q = [
    ['PLAN', 'Analyse, find cause, plan countermeasure', C.blue, -1, -1],
    ['DO', 'Try it on a small scale', C.green, 1, -1],
    ['CHECK', 'Measure: did it work?', C.orange, 1, 1],
    ['ACT', 'Standardise or adjust and repeat', C.red, -1, 1],
  ] as const;
  return (
    <Svg w={W} h={H} title="PDCA cycle">
      {q.map(([n, d, col, sx, sy], i) => {
        const a0 = [Math.PI, -Math.PI / 2, 0, Math.PI / 2][i];
        const a1 = a0 + Math.PI / 2;
        const p = `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        return (
          <g key={n}>
            <path d={p} fill={col} opacity={0.9} stroke={C.white} strokeWidth={4} />
            <T x={cx + sx * 58} y={cy + sy * 52 - 10} size={16} weight={800} fill={C.white}>{n}</T>
            <T x={cx + sx * 58} y={cy + sy * 52 + 16} size={10} weight={500} fill={C.white} max={16}>{d}</T>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke={C.steelDark} strokeWidth={2} strokeDasharray="10 6" />
      <Arrow x1={cx + r + 14} y1={cy - 6} x2={cx + r + 14} y2={cy + 4} />
    </Svg>
  );
}

export function Dmaic() {
  const ph = [
    ['D', 'Define', 'Problem, goal, scope, charter, SIPOC'],
    ['M', 'Measure', 'Baseline, MSA, process map'],
    ['A', 'Analyse', 'Root cause with data'],
    ['I', 'Improve', 'Pilot and implement solutions'],
    ['C', 'Control', 'Control plan, SPC, handover'],
  ];
  const cols = [C.blueDark, C.blue, C.orange, C.green, C.red];
  return (
    <Svg w={820} h={190} title="DMAIC roadmap">
      {ph.map(([k, n, d], i) => {
        const x = 10 + i * 162;
        return (
          <g key={k}>
            <polygon points={`${x},20 ${x + 140},20 ${x + 160},80 ${x + 140},140 ${x},140 ${x + 20},80`} fill={cols[i]} />
            <T x={x + 80} y={58} size={26} weight={800} fill={C.white}>{k}</T>
            <T x={x + 80} y={92} size={13} weight={700} fill={C.white}>{n}</T>
            <T x={x + 80} y={168} size={10.5} max={26}>{d}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function EightD() {
  const d = ['Team', 'Describe problem', 'Contain', 'Root cause (occur + escape)', 'Choose actions', 'Implement & validate', 'Prevent recurrence', 'Recognise team'];
  return (
    <Svg w={840} h={220} title="8D problem-solving steps">
      {d.map((s, i) => {
        const x = 10 + i * 103;
        const col = i === 2 ? C.orange : i === 3 ? C.red : i === 6 ? C.green : C.blue;
        return (
          <g key={i}>
            <rect x={x} y={30} width={92} height={120} rx={10} fill={C.white} stroke={col} strokeWidth={2} />
            <rect x={x} y={30} width={92} height={36} rx={10} fill={col} />
            <T x={x + 46} y={48} size={15} weight={800} fill={C.white}>{`D${i + 1}`}</T>
            <T x={x + 46} y={108} size={11} max={13} weight={600}>{s}</T>
            {i < 7 && <Arrow x1={x + 92} y1={90} x2={x + 103} y2={90} />}
          </g>
        );
      })}
      <T x={420} y={185} size={11} fill={C.muted}>D3 protects the customer within 24 h · D4 needs TWO root causes · D7 changes the system</T>
    </Svg>
  );
}

export function FiveWhy() {
  const chain = [
    ['Problem', 'Wrong cylinders sent to paint'],
    ['Why 1', 'Assembly built from the wrong bin'],
    ['Why 2', 'Bins looked identical (chalk marks only)'],
    ['Why 3', 'No identification standard for partly inspected batches'],
    ['Why 4', 'Shift handover does not cover WIP status'],
    ['Root cause', 'No batch identification & handover standard'],
  ];
  return (
    <Svg w={560} h={470} title="5 Why chain">
      {chain.map(([k, v], i) => {
        const y = 10 + i * 76;
        const col = i === 0 ? C.red : i === chain.length - 1 ? C.green : C.blue;
        return (
          <g key={k}>
            <rect x={20} y={y} width={100} height={56} rx={8} fill={col} />
            <T x={70} y={y + 28} size={12} weight={700} fill={C.white}>{k}</T>
            <Box x={130} y={y} w={410} h={56} fill={i === chain.length - 1 ? C.greenLight : C.white} stroke={col} label={v} size={12} max={52} weight={500} />
            {i < chain.length - 1 && <Arrow x1={70} y1={y + 56} x2={70} y2={y + 74} />}
          </g>
        );
      })}
    </Svg>
  );
}

export function QaVsQc() {
  return (
    <Svg w={640} h={260} title="QA versus QC">
      <Box x={20} y={20} w={290} h={220} fill={C.blueLight} stroke={C.blue} />
      <Box x={330} y={20} w={290} h={220} fill={C.orangeLight} stroke={C.orange} />
      <T x={165} y={46} size={16} weight={800} fill={C.blueDark}>Quality Assurance (QA)</T>
      <T x={475} y={46} size={16} weight={800} fill="#97510a">Quality Control (QC)</T>
      {['Process-oriented', 'Preventive — before defects', 'Procedures, audits, training', 'Qualifies WPS, suppliers, gauges', 'Asks: will we make it right?'].map((t, i) => <T key={t} x={165} y={86 + i * 30} size={12}>{'• ' + t}</T>)}
      {['Product-oriented', 'Detective — finds defects', 'Inspection, measurement, test', 'Leak test, DFT, stroke checks', 'Asks: did we make it right?'].map((t, i) => <T key={t} x={475} y={86 + i * 30} size={12}>{'• ' + t}</T>)}
    </Svg>
  );
}

export function InspectionStages() {
  const st = [['Supplier', C.steel], ['IQC', C.orange], ['Machining', C.blueLight], ['IPQC', C.orange], ['Welding · Assembly', C.blueLight], ['FQC', C.orange], ['Customer', C.greenLight]] as const;
  return (
    <Svg w={860} h={170} title="Inspection stages in the flow">
      {st.map(([n, f], i) => {
        const x = 10 + i * 122;
        return (
          <g key={n}>
            <Box x={x} y={40} w={104} h={64} fill={f} stroke={f === C.orange ? C.orange : C.blue} label={n} color={f === C.orange ? C.white : C.navy} size={12} />
            {i < st.length - 1 && <Arrow x1={x + 104} y1={72} x2={x + 122} y2={72} />}
          </g>
        );
      })}
      <T x={430} y={140} size={11} fill={C.muted}>Orange = inspection gates. Each later gate is more expensive; prevention (QA) reduces load on all gates.</T>
    </Svg>
  );
}

export function SigmaLevels() {
  const rows = [['2σ', '308,537'], ['3σ', '66,807'], ['4σ', '6,210'], ['5σ', '233'], ['6σ', '3.4']];
  return (
    <Svg w={560} h={260} title="Sigma levels and DPMO">
      {rows.map(([s, d], i) => {
        const w = [480, 380, 260, 140, 40][i];
        return (
          <g key={s}>
            <T x={40} y={40 + i * 44} size={14} weight={700}>{s}</T>
            <rect x={70} y={24 + i * 44} width={w} height={32} rx={6} fill={[C.red, C.orange, C.blue, C.blueDark, C.green][i]} />
            <T x={70 + w + 50} y={40 + i * 44} size={12} anchor="middle">{`${d} DPMO`}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function CoqIceberg() {
  return (
    <Svg w={600} h={360} title="Cost of poor quality iceberg">
      <rect x={0} y={110} width={600} height={250} fill={C.blueLight} />
      <polygon points="300,20 380,110 220,110" fill={C.white} stroke={C.steelDark} />
      <polygon points="220,110 380,110 470,340 130,340" fill="#eef4ff" stroke={C.steelDark} />
      <T x={300} y={80} size={11} weight={700}>Visible</T>
      <T x={300} y={96} size={10}>scrap · rework · warranty</T>
      {['Lost capacity & overtime', 'Expediting & extra freight', 'Excess inspection & sorting', 'Management time on firefighting', 'Lost customers & reputation', 'Excess inventory "just in case"'].map((t, i) => <T key={t} x={300} y={140 + i * 30} size={12}>{t}</T>)}
      <Label x={560} y={124} text="waterline" color={C.blue} anchor="end" />
    </Svg>
  );
}

export function CorrectionVsCA() {
  return (
    <Svg w={760} h={250} title="Correction, corrective action and preventive action">
      {[['Correction', 'Fix the defective product now', 'Replace damaged seals in 12 cylinders', C.orange], ['Corrective action', 'Remove the root cause of THIS problem', 'Chamfer on drawing + installation sleeve', C.blue], ['Preventive action', 'Remove causes of POTENTIAL problems elsewhere', 'Same sleeve for all cylinder families', C.green]].map(([h, d, e, col], i) => (
        <g key={h}>
          <rect x={10 + i * 250} y={20} width={236} height={210} rx={12} fill={C.white} stroke={col} strokeWidth={2} />
          <rect x={10 + i * 250} y={20} width={236} height={44} rx={12} fill={col} />
          <T x={128 + i * 250} y={42} size={15} weight={800} fill={C.white}>{h}</T>
          <T x={128 + i * 250} y={110} size={12} weight={600} max={30}>{d}</T>
          <T x={128 + i * 250} y={180} size={11} fill={C.muted} max={32}>{'e.g. ' + e}</T>
        </g>
      ))}
    </Svg>
  );
}

export function Distinctions() {
  const pairs = [
    ['Symptom', 'Root cause', 'Wrong cylinders at paint', 'No batch-ID & handover standard'],
    ['Correction', 'Corrective action', 'Strip & reassemble', 'Batch tag + scan before assembly'],
    ['Detection', 'Preventive action', 'Scan check at paint', 'Interlock: press will not start on mismatch'],
    ['Temporary countermeasure', 'Permanent solution', '100% serial check at paint', 'Poka-Yoke scanning system + standard'],
  ];
  return (
    <Svg w={780} h={330} title="Four key distinctions in problem solving">
      {pairs.map(([a, b, ea, eb], i) => {
        const y = 10 + i * 80;
        return (
          <g key={a}>
            <Box x={10} y={y} w={340} h={66} fill={C.orangeLight} stroke={C.orange} />
            <Box x={430} y={y} w={340} h={66} fill={C.greenLight} stroke={C.green} />
            <T x={180} y={y + 22} size={13} weight={800}>{a}</T>
            <T x={180} y={y + 46} size={11} fill={C.ink}>{ea}</T>
            <T x={600} y={y + 22} size={13} weight={800}>{b}</T>
            <T x={600} y={y + 46} size={11} fill={C.ink}>{eb}</T>
            <Arrow x1={354} y1={y + 33} x2={426} y2={y + 33} color={C.navy} width={2} />
          </g>
        );
      })}
    </Svg>
  );
}

export function Msa() {
  const targets = [
    ['Accurate & precise', 0, 0, 3],
    ['Precise, not accurate (bias)', 14, -10, 3],
    ['Accurate, not precise', 0, 0, 14],
    ['Neither', 12, 10, 14],
  ] as const;
  return (
    <Svg w={760} h={230} title="Measurement accuracy and precision">
      {targets.map(([n, dx, dy, spread], i) => {
        const cx = 95 + i * 190, cy = 95;
        const pts = Array.from({ length: 7 }, (_, k) => [cx + dx + Math.cos(k * 2.1) * spread * ((k % 3) + 1) / 2, cy + dy + Math.sin(k * 2.1) * spread * ((k % 3) + 1) / 2]);
        return (
          <g key={n}>
            {[60, 42, 24, 8].map((r, k) => <circle key={r} cx={cx} cy={cy} r={r} fill={k % 2 ? C.white : C.blueLight} stroke={C.blue} />)}
            {pts.map(([x, y], k) => <circle key={k} cx={x} cy={y} r={3.5} fill={C.red} />)}
            <T x={cx} y={190} size={11} max={22} weight={600}>{n}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function DefectClass() {
  return (
    <Svg w={720} h={200} title="Defect classification">
      {[['CRITICAL', 'Safety / legal risk', 'Weld crack, leakage, wrong pressure rating', '100% or Poka-Yoke; stop line', C.red], ['MAJOR', 'Affects function or fit', 'Wrong stroke, damaged port thread', 'Tight sampling, AQL 0.65', C.orange], ['MINOR', 'Cosmetic, no functional effect', 'Paint shade variation', 'Normal sampling', C.blue]].map(([h, d, e, ctl, col], i) => (
        <g key={h}>
          <rect x={10 + i * 238} y={10} width={224} height={180} rx={12} fill={C.white} stroke={col} strokeWidth={2} />
          <rect x={10 + i * 238} y={10} width={224} height={38} rx={12} fill={col} />
          <T x={122 + i * 238} y={30} size={14} weight={800} fill={C.white}>{h}</T>
          <T x={122 + i * 238} y={70} size={12} weight={600}>{d}</T>
          <T x={122 + i * 238} y={112} size={11} max={30} fill={C.muted}>{e}</T>
          <T x={122 + i * 238} y={160} size={11} max={30} weight={600}>{ctl}</T>
        </g>
      ))}
    </Svg>
  );
}

export function PokaYokeBeforeAfter() {
  return (
    <Svg w={760} h={300} title="Poka-Yoke: fixture before and after mistake-proofing">
      <rect x={10} y={10} width={360} height={280} rx={12} fill={C.bg} stroke={C.line} />
      <rect x={390} y={10} width={360} height={280} rx={12} fill={C.bg} stroke={C.line} />
      <Verdict x={24} y={22} ok={false} text="Before: accepts any piston" />
      <Verdict x={404} y={22} ok text="After: only Ø70 fits + scan interlock" />
      {/* before fixture: flat plate with round pocket bigger than both */}
      <rect x={60} y={150} width={260} height={60} rx={6} fill={C.steel} />
      <ellipse cx={190} cy={150} rx={70} ry={14} fill={C.steelDark} />
      <ellipse cx={150} cy={110} rx={40} ry={10} fill={C.orange} />
      <rect x={110} y={80} width={80} height={30} fill={C.orange} opacity={0.85} />
      <T x={150} y={95} size={10} fill={C.white} weight={700}>Ø63 (wrong)</T>
      <T x={190} y={240} size={11} max={44}>Oversized pocket: Ø63 and Ø70 pistons both sit in the fixture. The press cycles anyway.</T>
      {/* after fixture */}
      <rect x={440} y={150} width={260} height={60} rx={6} fill={C.steel} />
      <ellipse cx={570} cy={150} rx={44} ry={11} fill={C.steelDark} />
      <rect x={612} y={128} width={14} height={22} fill={C.green} />
      <T x={619} y={118} size={9} fill={C.green} weight={700}>pin</T>
      <rect x={530} y={92} width={80} height={46} fill={C.blue} />
      <T x={570} y={115} size={10} fill={C.white} weight={700}>Ø70 ✓</T>
      <rect x={660} y={70} width={40} height={28} rx={4} fill={C.navy} />
      <T x={680} y={84} size={8} fill={C.white}>SCAN</T>
      <T x={570} y={240} size={11} max={44}>Diameter-specific locating ring + offset pin; barcode of piston and tube must match the work order before the press can cycle.</T>
    </Svg>
  );
}

export function SupplierQuality() {
  const s = ['Select & audit', 'Quality agreement', 'PPAP / FAI', 'Monitor PPM & OTIF', 'Develop / 8D'];
  return (
    <Svg w={760} h={150} title="Supplier quality management cycle">
      {s.map((x, i) => (
        <g key={x}>
          <Box x={10 + i * 150} y={40} w={130} h={60} label={x} size={12} fill={i === 4 ? C.greenLight : C.blueLight} stroke={i === 4 ? C.green : C.blue} />
          {i < s.length - 1 && <Arrow x1={140 + i * 150} y1={70} x2={160 + i * 150} y2={70} />}
        </g>
      ))}
      <path d="M 700 105 Q 380 150 75 105" fill="none" stroke={C.steelDark} strokeDasharray="5 4" />
      <T x={380} y={138} size={10} fill={C.muted}>feedback loop: ratings decide skip-lot, controlled shipping or phase-out</T>
    </Svg>
  );
}
