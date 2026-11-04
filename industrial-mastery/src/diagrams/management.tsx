import { Arrow, Box, C, Label, Svg, T } from './primitives';
import { TableDiagram } from './generic';

export function OrgChart() {
  return (
    <Svg w={820} h={300} title="Production department structure">
      <Box x={330} y={10} w={160} h={44} label="Production Manager" fill={C.blue} color={C.white} />
      {[['Section Head — Machining', 20], ['Section Head — Welding', 220], ['Section Head — Assembly & Test', 420], ['Section Head — Paint', 620]].map(([n, x]) => (
        <g key={n as string}>
          <Arrow x1={410} y1={54} x2={(x as number) + 90} y2={98} head={false} color={C.line} />
          <Box x={x as number} y={100} w={180} h={44} label={n as string} size={11} />
          <Arrow x1={(x as number) + 90} y1={144} x2={(x as number) + 90} y2={170} head={false} color={C.line} />
          <Box x={(x as number) + 20} y={170} w={140} h={36} label="Shift supervisors" size={10.5} fill={C.bg} stroke={C.steelDark} />
          <Box x={(x as number) + 20} y={216} w={140} h={36} label="Cell leaders · operators" size={10.5} fill={C.white} stroke={C.line} />
        </g>
      ))}
      <Box x={600} y={10} w={200} h={44} label="Support: PE · QE · PPC · Maint." fill={C.orangeLight} stroke={C.orange} size={11} />
      <Arrow x1={600} y1={32} x2={492} y2={32} dashed color={C.orange} />
      <T x={410} y={282} size={11} fill={C.muted}>Typical span of control: 15–25 operators per supervisor</T>
    </Svg>
  );
}

export function RolePyramid() {
  return (
    <Svg w={760} h={260} title="Plant head, production manager and production engineer">
      {[['Plant Head', 'Whole site · strategy · budget · SQCDP results', 'Horizon: months–years', C.blueDark], ['Production Manager', 'Daily output · people · discipline · escalation', 'Horizon: today–weeks', C.blue], ['Production Engineer', 'Methods · process sheets · fixtures · cycle times · technical problems', 'Horizon: root cause & next improvement', C.green]].map(([n, d, h, col], i) => (
        <g key={n}>
          <rect x={10 + i * 250} y={20} width={236} height={220} rx={14} fill={C.white} stroke={col} strokeWidth={2} />
          <rect x={10 + i * 250} y={20} width={236} height={46} rx={14} fill={col} />
          <T x={128 + i * 250} y={43} size={15} weight={800} fill={C.white}>{n}</T>
          <T x={128 + i * 250} y={124} size={12} max={30}>{d}</T>
          <T x={128 + i * 250} y={206} size={11} fill={C.muted} max={30}>{h}</T>
        </g>
      ))}
    </Svg>
  );
}

export function Sqcdp() {
  const L = [['S', 'Safety', C.green], ['Q', 'Quality', C.blue], ['C', 'Cost', C.orange], ['D', 'Delivery', C.blueDark], ['P', 'People', C.steelDark]] as const;
  return (
    <Svg w={820} h={260} title="SQCDP board">
      <rect x={5} y={5} width={810} height={250} rx={12} fill={C.white} stroke={C.navy} strokeWidth={2} />
      {L.map(([k, n, col], i) => (
        <g key={k}>
          <T x={85 + i * 160} y={40} size={40} weight={900} fill={col}>{k}</T>
          <T x={85 + i * 160} y={76} size={12} weight={700}>{n}</T>
          {Array.from({ length: 21 }, (_, d) => {
            const red = (i === 1 && (d === 4 || d === 11)) || (i === 3 && (d === 4 || d === 12)) || (i === 0 && d === 17);
            return <rect key={d} x={25 + i * 160 + (d % 7) * 17} y={96 + Math.floor(d / 7) * 18} width={14} height={14} rx={2} fill={d > 17 ? C.bg : red ? C.red : C.green} />;
          })}
          <T x={85 + i * 160} y={170} size={10} fill={C.muted} max={22}>{['No incidents; near misses logged', 'Leak FPY ≥ 98%', 'Scrap & overtime cost', 'Plan vs actual ≥ 95%', 'Attendance · skills · ideas'][i]}</T>
        </g>
      ))}
      <T x={410} y={225} size={11} fill={C.navy}>Day 5: red Q (leak failures) and red D (shortfall) together → attack quality to recover delivery</T>
    </Svg>
  );
}

export function KpiTree() {
  return (
    <Svg w={820} h={280} title="KPI tree">
      <Box x={320} y={10} w={180} h={46} label="Plant profit / ROCE" fill={C.blueDark} color={C.white} />
      {[['OTD 97%', 40], ['Cost / cylinder', 240], ['Customer PPM < 300', 440], ['LTIFR < 1', 640]].map(([n, x]) => (
        <g key={n as string}>
          <Arrow x1={410} y1={56} x2={(x as number) + 70} y2={98} head={false} color={C.line} />
          <Box x={x as number} y={100} w={140} h={42} label={n as string} size={11} />
        </g>
      ))}
      {[['Schedule adherence', 0], ['Honing OEE', 120], ['Labour productivity', 240], ['Scrap cost', 360], ['Leak-test FPY', 480], ['Near-miss reports', 600], ['PM compliance', 700]].map(([n, x], i) => (
        <g key={n as string}>
          <Arrow x1={[110, 110, 310, 310, 510, 710, 110][i]} y1={142} x2={(x as number) + 55} y2={198} head={false} color={C.line} />
          <Box x={(x as number) + 5} y={200} w={104} h={40} label={n as string} size={10} fill={C.bg} stroke={C.steelDark} />
        </g>
      ))}
      <T x={410} y={266} size={11} fill={C.muted}>Shop-floor (leading) KPIs drive plant (lagging) results</T>
    </Svg>
  );
}

export function TierMeetings() {
  return (
    <Svg w={760} h={240} title="Tiered daily meetings">
      {[['Tier 1 — Team', '08:00 · 10 min · at the line board', C.green], ['Tier 2 — Section', '08:45 · 15 min · review escalations', C.blue], ['Tier 3 — Plant', '09:30 · 20 min · plant KPIs & support', C.blueDark]].map(([n, d, col], i) => (
        <g key={n}>
          <Box x={30 + i * 245} y={160 - i * 60} w={210} h={64} fill={col} stroke={col} />
          <T x={135 + i * 245} y={180 - i * 60} size={13} weight={800} fill={C.white}>{n}</T>
          <T x={135 + i * 245} y={204 - i * 60} size={10.5} fill={C.white}>{d}</T>
          {i < 2 && <Arrow x1={240 + i * 245} y1={180 - i * 60} x2={273 + i * 245} y2={146 - i * 60} color={C.red} width={2} />}
        </g>
      ))}
      <T x={380} y={30} size={11} fill={C.red} weight={700}>Unsolved problems escalate upward within 90 minutes</T>
    </Svg>
  );
}

export function Escalation() {
  const L = [['Operator', '0 min', C.green], ['Team leader', '5 min', C.green], ['Supervisor', '15 min', C.orange], ['Production manager', '30 min', C.orange], ['Plant head', '2 h', C.red]] as const;
  return (
    <Svg w={760} h={200} title="Escalation matrix">
      {L.map(([n, t, col], i) => (
        <g key={n}>
          <rect x={10 + i * 150} y={40} width={136} height={70} rx={10} fill={col} />
          <T x={78 + i * 150} y={66} size={12} weight={800} fill={C.white}>{n}</T>
          <T x={78 + i * 150} y={90} size={11} fill={C.white}>{`after ${t}`}</T>
          {i < 4 && <Arrow x1={146 + i * 150} y1={75} x2={160 + i * 150} y2={75} />}
        </g>
      ))}
      <T x={380} y={150} size={11} fill={C.muted}>Example trigger: line stop · quality hold · safety incident · material shortage</T>
    </Svg>
  );
}

export function DecisionMatrix() {
  return (
    <TableDiagram
      title="Weighted decision matrix — countermeasure for wrong-bin picking"
      cols={['Option', 'Effectiveness (40%)', 'Cost (20%)', 'Speed (20%)', 'Sustainability (20%)', 'Weighted score']}
      rows={[
        ['Barcode scan + interlock', '5', '3', '4', '5', '4.4'],
        ['Colour-coded bins', '3', '5', '5', '3', '3.8'],
        ['Extra inspection', '2', '2', '4', '1', '2.2'],
        ['Retrain operators', '1', '5', '5', '1', '2.6'],
      ]}
      highlight={(r, c) => (r === 0 && c === 5 ? C.greenLight : undefined)}
    />
  );
}

export function Raci() {
  return (
    <TableDiagram
      title="RACI matrix — second test bench project"
      cols={['Task', 'Plant head', 'Maint. mgr', 'Prod. engineer', 'Quality eng.', 'Production']}
      rows={[
        ['Approve budget', 'A', 'R', 'C', 'I', 'I'],
        ['Specification', 'I', 'A', 'R', 'C', 'C'],
        ['Installation', 'I', 'A/R', 'C', 'I', 'I'],
        ['MSA & validation', 'I', 'C', 'C', 'A/R', 'I'],
        ['Training & handover', 'I', 'C', 'R', 'C', 'A'],
      ]}
      highlight={(_, c) => (c === 0 ? C.bg : undefined)}
    />
  );
}

export function Wbs() {
  const L1 = ['1 Specification', '2 Procurement', '3 Civil & utilities', '4 Installation', '5 Software', '6 Validation', '7 Training & handover'];
  return (
    <Svg w={860} h={240} title="Work breakdown structure">
      <Box x={330} y={10} w={200} h={44} label="0 Second leak-test bench" fill={C.blueDark} color={C.white} />
      {L1.map((n, i) => (
        <g key={n}>
          <Arrow x1={430} y1={54} x2={60 + i * 122} y2={98} head={false} color={C.line} />
          <Box x={6 + i * 122} y={100} w={112} h={44} label={n} size={10.5} />
        </g>
      ))}
      {[['2.1 Pump unit', 128], ['2.2 Frame', 128], ['2.3 Sensors', 128], ['6.1 MSA', 616], ['6.2 Trial run', 616]].map(([n, x], i) => (
        <Box key={n as string} x={(x as number) + (i % 3 === 0 ? 0 : 0)} y={156 + (i < 3 ? i : i - 3) * 26} w={112} h={22} label={n as string} size={9.5} fill={C.bg} stroke={C.steelDark} />
      ))}
    </Svg>
  );
}

export function Cpm() {
  const n = [['Start', 30, 120], ['A Spec 2w', 150, 120], ['B Pump 6w', 300, 50], ['C Civil 2w', 300, 190], ['D Install 2w', 470, 120], ['E Validate 1w', 620, 120], ['F Handover 1w', 760, 120]] as const;
  const e = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6]];
  const crit = new Set(['0-1', '1-2', '2-4', '4-5', '5-6']);
  return (
    <Svg w={860} h={260} title="Critical path network">
      {e.map(([a, b]) => <Arrow key={`${a}-${b}`} x1={n[a][1] + 50} y1={n[a][2]} x2={n[b][1] - 52} y2={n[b][2]} color={crit.has(`${a}-${b}`) ? C.red : C.steelDark} width={crit.has(`${a}-${b}`) ? 2.6 : 1.5} />)}
      {n.map(([l, x, y], i) => <Box key={l} x={x - 50} y={y - 24} w={100} h={48} label={l} size={11} fill={[0, 1, 2, 4, 5, 6].includes(i) ? C.redLight : C.blueLight} stroke={[0, 1, 2, 4, 5, 6].includes(i) ? C.red : C.blue} />)}
      <T x={430} y={240} size={12} weight={700} fill={C.red}>Critical path A–B–D–E–F = 12 weeks · Civil work (C) has 4 weeks of float</T>
    </Svg>
  );
}

export function RiskMatrix() {
  const W = 520, H = 400, x0 = 80, y0 = 20, s = 60;
  return (
    <Svg w={W} h={H} title="5×5 risk matrix">
      {Array.from({ length: 25 }, (_, i) => {
        const l = (i % 5) + 1, sv = 5 - Math.floor(i / 5);
        const sc = l * sv;
        const col = sc >= 15 ? C.red : sc >= 8 ? C.orange : C.green;
        return (
          <g key={i}>
            <rect x={x0 + (l - 1) * s} y={y0 + (5 - sv) * s} width={s - 3} height={s - 3} fill={col} opacity={0.85} rx={4} />
            <T x={x0 + (l - 1) * s + s / 2} y={y0 + (5 - sv) * s + s / 2} size={13} weight={700} fill={C.white}>{String(sc)}</T>
          </g>
        );
      })}
      <circle cx={x0 + 2 * s + 30} cy={y0 + 0 * s + 30} r={22} fill="none" stroke={C.navy} strokeWidth={3} />
      <circle cx={x0 + 0 * s + 30} cy={y0 + 0 * s + 30} r={22} fill="none" stroke={C.navy} strokeWidth={3} strokeDasharray="4 3" />
      <Arrow x1={x0 + 2 * s + 6} y1={y0 + 30} x2={x0 + 58} y2={y0 + 30} color={C.navy} width={2} />
      <T x={x0 + 150} y={y0 + 5 * s + 26} size={12} fill={C.muted}>Likelihood 1 → 5</T>
      <g transform={`translate(${x0 - 40}, ${y0 + 150}) rotate(-90)`}><T x={0} y={0} size={12} fill={C.muted}>Severity 1 → 5</T></g>
      <T x={260} y={380} size={11} fill={C.navy}>Hose burst during test: 3×5 = 15 → enclosure + restraints → 1×5 = 5</T>
    </Svg>
  );
}

export function Swot() {
  return (
    <Svg w={600} h={380} title="SWOT">
      {[['Strengths', 'Precision honing & welding skills; OEM relationships', C.green], ['Weaknesses', 'Manual painting; long lead time 13 days', C.orange], ['Opportunities', 'Electric excavators; smart cylinders with sensors', C.blue], ['Threats', 'Low-cost imports; seal supply risk', C.red]].map(([n, d, col], i) => (
        <g key={n}>
          <rect x={10 + (i % 2) * 295} y={10 + Math.floor(i / 2) * 185} width={285} height={175} rx={12} fill={C.white} stroke={col} strokeWidth={2} />
          <T x={152 + (i % 2) * 295} y={40 + Math.floor(i / 2) * 185} size={16} weight={800} fill={col}>{n}</T>
          <T x={152 + (i % 2) * 295} y={110 + Math.floor(i / 2) * 185} size={12} max={34}>{d}</T>
        </g>
      ))}
    </Svg>
  );
}

export function Bsc() {
  const p = [['Financial', 'EBITDA 14% · cost/cyl −8%', C.blueDark], ['Customer', 'OTD 97% · PPM < 300', C.blue], ['Internal process', 'OEE 75% · lead time 5 d', C.orange], ['Learning & growth', '80% operators skill level 3', C.green]] as const;
  return (
    <Svg w={680} h={360} title="Balanced scorecard strategy map">
      {p.map(([n, d, col], i) => (
        <g key={n}>
          <Box x={140} y={10 + i * 86} w={400} h={64} fill={col} stroke={col} />
          <T x={340} y={32 + i * 86} size={14} weight={800} fill={C.white}>{n}</T>
          <T x={340} y={56 + i * 86} size={11} fill={C.white}>{d}</T>
          {i > 0 && <Arrow x1={340} y1={10 + i * 86} x2={340} y2={76 + (i - 1) * 86} color={C.navy} width={2} />}
        </g>
      ))}
      <T x={600} y={180} size={10} fill={C.muted} max={14}>Cause-and-effect: bottom drives top</T>
    </Svg>
  );
}

export function Hoshin() {
  return (
    <Svg w={760} h={280} title="Hoshin Kanri cascade with catchball">
      {[['3–5 yr breakthrough', 'World-class quality · 5-day lead time', C.blueDark], ['Annual objectives', 'PPM < 100 · lead time 12→5 d · cost −8%', C.blue], ['Department priorities', 'Welding: robot cell, SMED · Assembly: cell + Kanban', C.green], ['Team actions & KPIs', 'Bowling charts reviewed monthly', C.orange]].map(([n, d, col], i) => (
        <g key={n}>
          <Box x={40 + i * 40} y={14 + i * 64} w={500 - i * 40} h={52} fill={col} stroke={col} />
          <T x={290 + i * 20} y={30 + i * 64} size={12} weight={800} fill={C.white}>{n}</T>
          <T x={290 + i * 20} y={50 + i * 64} size={10.5} fill={C.white}>{d}</T>
        </g>
      ))}
      <path d="M 600 40 Q 700 140 600 240" fill="none" stroke={C.red} strokeWidth={2} />
      <path d="M 620 240 Q 720 140 620 40" fill="none" stroke={C.green} strokeWidth={2} />
      <T x={690} y={140} size={11} weight={700} max={10}>Catchball (two-way)</T>
    </Svg>
  );
}

export function StageGate() {
  return (
    <Svg w={860} h={200} title="Stage-gate process">
      {['Scoping', 'Business case', 'Development', 'Test & validate', 'Launch'].map((s, i) => (
        <g key={s}>
          <polygon points={`${20 + i * 165},${80} ${40 + i * 165},${60} ${48 + i * 165},${80} ${40 + i * 165},${100}`} fill={C.orange} />
          <T x={40 + i * 165} y={120} size={10} weight={700} fill={C.orange}>{`G${i + 1}`}</T>
          <Box x={56 + i * 165} y={52} w={120} h={56} label={`Stage ${i + 1}: ${s}`} size={11} />
        </g>
      ))}
      <T x={430} y={160} size={11} fill={C.muted}>Each gate: Go · Kill · Hold · Recycle, based on deliverables (e.g. G3 boom cylinder: fatigue test passed → tooling ₹18 L approved)</T>
    </Svg>
  );
}

export function DocLifecycle() {
  const s = ['Creation', 'Review', 'Approval', 'Release', 'Distribution', 'Revision', 'Obsolete control'];
  return (
    <Svg w={880} h={210} title="Engineering document lifecycle">
      {s.map((x, i) => (
        <g key={x}>
          <Box x={6 + i * 125} y={50} w={110} h={58} label={x} size={12} fill={i === 6 ? C.redLight : i === 3 ? C.greenLight : C.blueLight} stroke={i === 6 ? C.red : i === 3 ? C.green : C.blue} />
          {i < s.length - 1 && <Arrow x1={116 + i * 125} y1={79} x2={130 + i * 125} y2={79} />}
        </g>
      ))}
      <path d="M 696 110 Q 630 170 380 150" fill="none" stroke={C.steelDark} strokeDasharray="5 4" />
      <Arrow x1={390} y1={151} x2={380} y2={150} />
      <T x={540} y={182} size={10.5} fill={C.muted}>A revision loops back through review and approval; the old revision is withdrawn</T>
    </Svg>
  );
}

export function HierarchyControls() {
  const L = [['Elimination', 'Remove the hazard', C.green], ['Substitution', 'Replace with less hazardous', '#44b37a'], ['Engineering controls', 'Guards, interlocks, ventilation', C.blue], ['Administrative', 'Procedures, training, permits', C.orange], ['PPE', 'Last line of defence', C.red]] as const;
  return (
    <Svg w={640} h={340} title="Hierarchy of controls">
      {L.map(([n, d, col], i) => {
        const w = 600 - i * 90;
        return (
          <g key={n}>
            <rect x={(640 - w) / 2} y={10 + i * 64} width={w} height={58} rx={8} fill={col} />
            <T x={320} y={30 + i * 64} size={14} weight={800} fill={C.white}>{n}</T>
            <T x={320} y={52 + i * 64} size={10.5} fill={C.white}>{d}</T>
          </g>
        );
      })}
      <Label x={20} y={30} text="Most effective" anchor="start" color={C.green} />
      <Label x={20} y={300} text="Least effective" anchor="start" color={C.red} />
    </Svg>
  );
}

export function Loto() {
  const s = ['Prepare', 'Notify', 'Shut down', 'Isolate', 'Lock & tag', 'Release stored energy', 'Verify zero energy', 'Work · remove own lock'];
  return (
    <Svg w={880} h={230} title="Lockout/Tagout steps">
      {s.map((x, i) => (
        <g key={x}>
          <circle cx={55 + i * 108} cy={70} r={34} fill={i === 5 || i === 6 ? C.red : C.blue} />
          <T x={55 + i * 108} y={70} size={18} weight={800} fill={C.white}>{String(i + 1)}</T>
          <T x={55 + i * 108} y={128} size={11} max={14} weight={600}>{x}</T>
          {i < s.length - 1 && <Arrow x1={89 + i * 108} y1={70} x2={127 + i * 108} y2={70} />}
        </g>
      ))}
      <rect x={300} y={170} width={44} height={36} rx={6} fill={C.red} />
      <path d="M 308 170 v -12 a 14 14 0 0 1 28 0 v 12" fill="none" stroke={C.navy} strokeWidth={5} />
      <T x={540} y={190} size={11} max={56}>Hydraulic press: isolator locked, accumulator bled to 0 bar, ram blocked, try-start verified.</T>
    </Svg>
  );
}

export function LayoutTypes() {
  return (
    <Svg w={860} h={240} title="Four layout types">
      {[['Process (functional)', 'Similar machines grouped'], ['Product (line)', 'Machines in sequence'], ['Cellular', 'Mini-line per family'], ['Fixed position', 'Product stays, resources come']].map(([n, d], i) => {
        const x = 10 + i * 214;
        return (
          <g key={n}>
            <rect x={x} y={10} width={200} height={220} rx={10} fill={C.bg} stroke={C.line} />
            <T x={x + 100} y={30} size={12} weight={800}>{n}</T>
            {i === 0 && [0, 1, 2, 3].map((k) => <g key={k}>{[0, 1].map((m) => <rect key={m} x={x + 20 + (k % 2) * 90 + m * 34} y={56 + Math.floor(k / 2) * 70} width={28} height={28} fill={[C.blue, C.orange, C.green, C.steelDark][k]} />)}</g>)}
            {i === 0 && <path d={`M ${x + 34} ${100} L ${x + 140} 80 L ${x + 50} 160 L ${x + 160} 150`} fill="none" stroke={C.red} strokeDasharray="4 3" />}
            {i === 1 && [0, 1, 2, 3, 4].map((k) => <g key={k}><rect x={x + 14 + k * 36} y={100} width={28} height={28} fill={C.blue} />{k < 4 && <Arrow x1={x + 42 + k * 36} y1={114} x2={x + 50 + k * 36} y2={114} />}</g>)}
            {i === 2 && <path d={`M ${x + 40} 70 L ${x + 160} 70 L ${x + 160} 150 L ${x + 40} 150`} fill="none" stroke={C.orange} strokeWidth={10} opacity={0.4} />}
            {i === 2 && [[40, 70], [100, 70], [160, 70], [160, 150], [100, 150], [40, 150]].map(([a, b], k) => <rect key={k} x={x + a - 14} y={b - 14} width={28} height={28} fill={C.green} />)}
            {i === 3 && <><rect x={x + 50} y={90} width={100} height={40} rx={6} fill={C.steelDark} />{[[30, 60], [170, 60], [30, 160], [170, 160], [100, 180]].map(([a, b], k) => <g key={k}><circle cx={x + a} cy={b} r={10} fill={C.blue} /><Arrow x1={x + a} y1={b} x2={x + 100 + (a - 100) * 0.4} y2={110 + (b - 110) * 0.4} color={C.muted} /></g>)}</>}
            <T x={x + 100} y={208} size={10.5} fill={C.muted}>{d}</T>
          </g>
        );
      })}
    </Svg>
  );
}

export function ValueChain() {
  const s = ['Raw material (steel mill)', 'Tier-2 (tubes, rods, seals)', 'Tier-1 (cylinder plant)', 'OEM (excavator)', 'End user (contractor)'];
  return (
    <Svg w={860} h={170} title="Manufacturing value chain">
      {s.map((x, i) => (
        <g key={x}>
          <Box x={6 + i * 172} y={40} w={150} h={66} label={x} size={12} fill={i === 2 ? C.blue : C.blueLight} color={i === 2 ? C.white : C.navy} />
          {i < s.length - 1 && <Arrow x1={156 + i * 172} y1={73} x2={176 + i * 172} y2={73} />}
        </g>
      ))}
      <T x={430} y={140} size={11} fill={C.muted}>Material flows right → ; demand, specifications and money flow left ←</T>
    </Svg>
  );
}

export function FactorySystem() {
  return (
    <Svg w={760} h={260} title="Factory as a managed system">
      {[['Inputs', ['Man', 'Machine', 'Material', 'Method', 'Money'], 20], ['Outputs', ['Safe work', 'Right quality', 'On time', 'Lowest cost'], 560]].map(([h, items, x]) => (
        <g key={h as string}>
          <T x={(x as number) + 90} y={24} size={13} weight={800}>{h as string}</T>
          {(items as string[]).map((t, i) => <Box key={t} x={x as number} y={40 + i * 40} w={180} h={32} label={t} size={11} fill={h === 'Inputs' ? C.bg : C.greenLight} stroke={h === 'Inputs' ? C.steelDark : C.green} />)}
        </g>
      ))}
      <Box x={260} y={60} w={240} h={140} fill={C.blue} stroke={C.blue} />
      <T x={380} y={90} size={14} weight={800} fill={C.white}>Industrial management</T>
      <T x={380} y={130} size={11} fill={C.white}>Plan → Organise → Direct</T>
      <T x={380} y={154} size={11} fill={C.white}>→ Control → Improve</T>
      <Arrow x1={202} y1={130} x2={258} y2={130} width={2.5} />
      <Arrow x1={502} y1={130} x2={558} y2={130} width={2.5} />
      <path d="M 640 210 Q 380 260 110 210" fill="none" stroke={C.orange} strokeDasharray="5 4" strokeWidth={2} />
      <T x={380} y={248} size={11} fill={C.orange}>Feedback: KPIs and customer results</T>
    </Svg>
  );
}

export function WrongBin() {
  return (
    <Svg w={860} h={320} title="Wrong-bin investigation timeline">
      <line x1={30} y1={150} x2={830} y2={150} stroke={C.navy} strokeWidth={3} />
      {[[60, '20:00', 'Welding of WO-2318 (18 pcs) complete'], [190, '22:00', '9 of 18 weld-inspected OK; 9 pending'], [330, '22:30', 'Bins moved to shared staging; chalk marks only'], [480, '07:30', 'Day shift picks bin with WO-2297 (different stroke)'], [630, '10:00', 'Wrong cylinders assembled'], [780, '13:00', 'Found at paint — stroke tags mismatch']].map(([x, t, d], i) => (
        <g key={i}>
          <circle cx={x as number} cy={150} r={10} fill={i >= 3 ? C.red : C.blue} />
          <T x={x as number} y={i % 2 ? 196 : 104} size={12} weight={800}>{t as string}</T>
          <T x={x as number} y={i % 2 ? 230 : 70} size={10.5} max={20}>{d as string}</T>
        </g>
      ))}
      <rect x={30} y={262} width={800} height={46} rx={8} fill={C.greenLight} stroke={C.green} />
      <T x={430} y={285} size={11.5} weight={700} max={120}>Root cause: no batch-identification & handover standard · Fix: printed batch tags, colour-coded locations, scan-to-start interlock</T>
    </Svg>
  );
}

export function Heinrich() {
  const L = [['1 major injury', C.red, 120], ['29 minor injuries', C.orange, 260], ['300 near misses', C.blue, 400], ['Thousands of unsafe acts/conditions', C.steelDark, 560]] as const;
  return (
    <Svg w={640} h={290} title="Safety pyramid">
      {L.map(([n, col, w], i) => (
        <g key={n}>
          <polygon points={`${320 - (w as number) / 2 + 30},${20 + i * 64} ${320 + (w as number) / 2 - 30},${20 + i * 64} ${320 + (w as number) / 2},${80 + i * 64} ${320 - (w as number) / 2},${80 + i * 64}`} fill={col} />
          <T x={320} y={50 + i * 64} size={12} weight={800} fill={C.white}>{n}</T>
        </g>
      ))}
      <T x={320} y={278} size={11} fill={C.muted}>Reducing near misses and unsafe conditions at the base reduces serious injuries at the top</T>
    </Svg>
  );
}

export function FireTriangle() {
  return (
    <Svg w={520} h={300} title="Fire triangle">
      <polygon points="260,20 480,260 40,260" fill={C.redLight} stroke={C.red} strokeWidth={3} />
      <T x={260} y={180} size={18} weight={900} fill={C.red}>FIRE</T>
      <T x={130} y={130} size={13} weight={700}>Heat</T>
      <T x={390} y={130} size={13} weight={700}>Oxygen</T>
      <T x={260} y={282} size={13} weight={700}>Fuel</T>
      <T x={260} y={220} size={10.5} fill={C.ink} max={40}>Remove any one side → fire cannot exist</T>
    </Svg>
  );
}

export function Kotter() {
  const s = ['Create urgency', 'Guiding coalition', 'Vision', 'Communicate', 'Remove obstacles', 'Quick wins', 'Build on change', 'Anchor in culture'];
  return (
    <Svg w={860} h={220} title="Kotter's 8 steps of change">
      {s.map((x, i) => (
        <g key={x}>
          <rect x={10 + i * 106} y={150 - i * 16} width={96} height={40 + i * 16} rx={6} fill={[C.blueDark, C.blue, C.blue, C.green, C.green, C.orange, C.orange, C.red][i]} />
          <T x={58 + i * 106} y={168 - i * 8} size={10.5} weight={700} fill={C.white} max={13}>{x}</T>
        </g>
      ))}
    </Svg>
  );
}

export function AuditCycle() {
  const s = ['Plan programme', 'Prepare checklist', 'Audit with evidence', 'Report findings', 'CAPA & follow-up'];
  return (
    <Svg w={760} h={160} title="Audit cycle">
      {s.map((x, i) => (
        <g key={x}>
          <Box x={10 + i * 150} y={40} w={130} h={60} label={x} size={12} />
          {i < s.length - 1 && <Arrow x1={140 + i * 150} y1={70} x2={160 + i * 150} y2={70} />}
        </g>
      ))}
      <path d="M 700 102 Q 380 160 75 102" fill="none" stroke={C.steelDark} strokeDasharray="5 4" />
      <Arrow x1={80} y1={104} x2={75} y2={102} />
    </Svg>
  );
}
