import type { ReactNode } from 'react';
import type { Lesson } from '../types';
import { Arrow, Box, C, Svg, T } from './primitives';
import { CycleDiagram, Matrix2x2, StepsFlow, TableDiagram } from './generic';
import * as Q from './quality';
import * as L from './lean';
import * as P from './production';
import * as M from './management';

function FaultTree() {
  return (
    <Svg w={760} h={320} title="Fault tree — rod ejection during test">
      <Box x={280} y={10} w={200} h={46} label="TOP: Rod ejected during test" fill={C.redLight} stroke={C.red} />
      <path d="M 360 70 q 20 -14 40 0 l -40 0 z" fill={C.orange} /><T x={380} y={88} size={10} weight={700}>OR</T>
      <Arrow x1={380} y1={56} x2={380} y2={68} head={false} />
      {[['Gland thread failure', 120], ['Gland not torqued', 520]].map(([n, x]) => (
        <g key={n as string}><Arrow x1={380} y1={96} x2={(x as number) + 80} y2={130} head={false} /><Box x={x as number} y={130} w={160} h={44} label={n as string} size={11} /></g>
      ))}
      <path d="M 580 190 h 40 v 10 a 20 20 0 0 1 -40 0 z" fill={C.blue} /><T x={600} y={200} size={10} weight={700} fill={C.white}>AND</T>
      <Arrow x1={600} y1={174} x2={600} y2={188} head={false} />
      {[['Torque step skipped', 460], ['No torque-mark check', 640]].map(([n, x]) => (
        <g key={n as string}><Arrow x1={600} y1={220} x2={(x as number) + 60} y2={250} head={false} /><Box x={x as number} y={250} w={120} h={44} label={n as string} size={10.5} fill={C.bg} stroke={C.steelDark} /></g>
      ))}
      <T x={200} y={260} size={11} fill={C.muted} max={36}>An AND gate means BOTH must fail — adding the torque-mark check creates a second barrier.</T>
    </Svg>
  );
}

function Triangle({ title, corners, center }: { title: string; corners: [string, string, string]; center: string }) {
  return (
    <Svg w={520} h={320} title={title}>
      <polygon points="260,30 480,280 40,280" fill={C.blueLight} stroke={C.blue} strokeWidth={3} />
      <T x={260} y={18} size={14} weight={800} fill={C.blueDark}>{corners[0]}</T>
      <T x={470} y={300} size={14} weight={800} fill={C.blueDark}>{corners[1]}</T>
      <T x={50} y={300} size={14} weight={800} fill={C.blueDark}>{corners[2]}</T>
      <T x={260} y={190} size={12} max={26}>{center}</T>
    </Svg>
  );
}

function NestedScope() {
  return (
    <Svg w={560} h={320} title="Production within manufacturing within operations">
      <ellipse cx={280} cy={160} rx={260} ry={150} fill={C.blueLight} stroke={C.blue} />
      <ellipse cx={280} cy={180} rx={180} ry={110} fill="#c7dcff" stroke={C.blue} />
      <ellipse cx={280} cy={200} rx={100} ry={70} fill={C.blue} />
      <T x={280} y={40} size={14} weight={800} fill={C.blueDark}>Operations</T>
      <T x={280} y={100} size={13} weight={800} fill={C.blueDark}>Manufacturing</T>
      <T x={280} y={200} size={13} weight={800} fill={C.white}>Production</T>
      <T x={90} y={160} size={10} fill={C.ink} max={14}>+ planning, purchase, logistics</T>
      <T x={470} y={170} size={10} fill={C.ink} max={14}>+ engineering, processes, quality</T>
    </Svg>
  );
}

function NpdKanbanBoard() {
  const cols = [['Design', ['Clevis rev C']], ['Procurement', ['Seal kit ⚠ 34 d']], ['Machining (WIP ≤ 6)', ['Tube 100×10', 'Rod Ø56']], ['Assembly', []], ['Test', ['Proto P3']], ['Done', ['Gland', 'Piston']]] as const;
  return (
    <Svg w={860} h={260} title="NPD Kanban board">
      {cols.map(([n, cards], i) => (
        <g key={n}>
          <rect x={6 + i * 142} y={10} width={134} height={240} rx={8} fill={C.bg} stroke={C.line} />
          <T x={73 + i * 142} y={30} size={11} weight={800}>{n}</T>
          {cards.map((c, k) => (
            <g key={c}>
              <rect x={16 + i * 142} y={50 + k * 56} width={114} height={46} rx={6} fill={c.includes('⚠') ? C.redLight : C.white} stroke={c.includes('⚠') ? C.red : C.blue} />
              <T x={73 + i * 142} y={73 + k * 56} size={11} weight={600}>{c}</T>
            </g>
          ))}
        </g>
      ))}
    </Svg>
  );
}

function A3Layout() {
  return (
    <Svg w={760} h={340} title="A3 report layout">
      <rect x={5} y={5} width={750} height={330} rx={8} fill={C.white} stroke={C.navy} strokeWidth={2} />
      <line x1={380} y1={5} x2={380} y2={335} stroke={C.navy} />
      {[['1 Background', 15, 15, 85], ['2 Current condition (charts)', 15, 110, 105], ['3 Goal', 15, 225, 40], ['4 Root cause analysis', 15, 275, 50], ['5 Countermeasures', 390, 15, 90], ['6 Implementation plan', 390, 115, 110], ['7 Follow-up & results', 390, 235, 90]].map(([n, x, y, h]) => (
        <Box key={n as string} x={x as number} y={y as number} w={355} h={h as number} label={n as string} size={12} fill={(x as number) < 380 ? C.blueLight : C.greenLight} stroke={(x as number) < 380 ? C.blue : C.green} />
      ))}
    </Svg>
  );
}

const steps = (l?: Lesson) => <StepsFlow steps={l?.steps ?? []} title={l?.title ?? 'Process'} />;
const cycle = (l?: Lesson) => <CycleDiagram steps={l?.steps ?? []} title={l?.title ?? 'Cycle'} center={l?.title.split(' ')[0]} />;

const REGISTRY: Record<string, (l?: Lesson) => ReactNode> = {
  steps,
  fishbone: () => <Q.Fishbone />,
  'six-m': () => <Q.Fishbone />,
  pareto: () => <Q.Pareto />,
  'control-chart': () => <Q.ControlChart />,
  capability: () => <Q.Capability />,
  fmea: () => <Q.FmeaTable />,
  'control-plan': () => <Q.ControlPlanTable />,
  pdca: () => <Q.Pdca />,
  'iso-pdca': () => <Q.Pdca />,
  dmaic: () => <Q.Dmaic />,
  'eight-d': () => <Q.EightD />,
  'five-why': () => <Q.FiveWhy />,
  'qa-vs-qc': () => <Q.QaVsQc />,
  'inspection-stages': () => <Q.InspectionStages />,
  'sigma-levels': () => <Q.SigmaLevels />,
  'coq-iceberg': () => <Q.CoqIceberg />,
  'correction-vs-ca': () => <Q.CorrectionVsCA />,
  distinctions: () => <Q.Distinctions />,
  msa: () => <Q.Msa />,
  'defect-class': () => <Q.DefectClass />,
  'poka-yoke-before-after': () => <Q.PokaYokeBeforeAfter />,
  'supplier-quality': () => <Q.SupplierQuality />,
  'tps-house': () => <L.TpsHouse />,
  'five-s-before-after': () => <L.FiveSBeforeAfter />,
  'kanban-loop': () => <L.KanbanLoop />,
  andon: () => <L.AndonBoard />,
  vsm: () => <L.Vsm />,
  timwoods: () => <L.Timwoods />,
  'three-m': () => <L.ThreeM />,
  smed: () => <L.Smed />,
  heijunka: () => <L.Heijunka />,
  'push-pull': () => <L.PushPull />,
  jit: () => <L.PushPull />,
  'batch-vs-flow': () => <L.BatchVsFlow />,
  'fifo-lane': () => <L.FifoLane />,
  supermarket: () => <L.Supermarket />,
  'milk-run': () => <L.MilkRun />,
  'material-flow': () => <L.MilkRun />,
  'cell-u': () => <L.CellU />,
  spaghetti: () => (
    <div className="grid md:grid-cols-2 gap-3">
      <L.Spaghetti />
      <L.Spaghetti after />
    </div>
  ),
  'gemba-route': () => <L.Spaghetti />,
  'layout-before-after': () => <L.LayoutBeforeAfter />,
  jidoka: () => <L.JidokaDiagram />,
  'standard-work': () => <L.StandardWork />,
  'visual-mgmt': () => <L.VisualMgmt />,
  'time-definitions': () => <P.TimeDefinitions />,
  'bottleneck-line': () => <P.BottleneckLine />,
  'assembly-line': () => <P.Yamazumi />,
  'oee-waterfall': () => <P.OeeWaterfall />,
  yamazumi: () => <P.Yamazumi />,
  swcs: () => <P.Yamazumi stations={[{ label: 'Load saw', va: 8, nva: 2, waste: 0 }, { label: 'Load lathe', va: 20, nva: 5, waste: 0 }, { label: 'Walk', va: 0, nva: 0, waste: 6 }, { label: 'Grind & check', va: 24, nva: 6, waste: 0 }]} takt={36} />,
  gantt: () => <P.Gantt />,
  milestones: () => <P.Gantt />,
  'capacity-bars': () => <P.CapacityBars />,
  'hourly-board': () => <P.HourlyBoard />,
  'gemba-board': () => <P.HourlyBoard />,
  'takt-line': () => <P.TaktLine />,
  utilization: () => <P.Utilization />,
  'ppc-flow': () => <P.PpcFlow />,
  wip: () => <P.WipDiagram />,
  'bom-tree': () => <P.BomTree />,
  sawtooth: () => <P.Sawtooth />,
  'eoq-curve': () => <P.EoqCurve />,
  'abc-curve': () => <P.AbcCurve />,
  changeover: () => <P.Changeover />,
  'mtbf-timeline': () => <P.MtbfTimeline />,
  bathtub: () => <P.Bathtub />,
  'pf-curve': () => <P.PfCurve />,
  'maintenance-types': () => <P.MaintenanceTypes />,
  'tpm-house': () => <P.TpmHouse />,
  'org-chart': () => <M.OrgChart />,
  'role-pyramid': () => <M.RolePyramid />,
  sqcdp: () => <M.Sqcdp />,
  'kpi-tree': () => <M.KpiTree />,
  'tier-meetings': () => <M.TierMeetings />,
  escalation: () => <M.Escalation />,
  'decision-matrix': () => <M.DecisionMatrix />,
  raci: () => <M.Raci />,
  wbs: () => <M.Wbs />,
  cpm: () => <M.Cpm />,
  'risk-matrix': () => <M.RiskMatrix />,
  swot: () => <M.Swot />,
  bsc: () => <M.Bsc />,
  hoshin: () => <M.Hoshin />,
  'mbo-cascade': () => <M.Hoshin />,
  'stage-gate': () => <M.StageGate />,
  'doc-lifecycle': () => <M.DocLifecycle />,
  revision: () => <M.DocLifecycle />,
  'hierarchy-controls': () => <M.HierarchyControls />,
  loto: () => <M.Loto />,
  'layout-types': () => <M.LayoutTypes />,
  'value-chain': () => <M.ValueChain />,
  'factory-system': () => <M.FactorySystem />,
  'wrong-bin': () => <M.WrongBin />,
  heinrich: () => <M.Heinrich />,
  'fire-triangle': () => <M.FireTriangle />,
  kotter: () => <M.Kotter />,
  'audit-cycle': () => <M.AuditCycle />,
  'fault-tree': () => <FaultTree />,
  'qcd-triangle': () => <Triangle title="QCD" corners={['Quality', 'Delivery', 'Cost']} center="Improve one without harming the others — quality problems usually hurt all three" />,
  'triple-constraint': () => <Triangle title="Triple constraint" corners={['Scope', 'Cost', 'Time']} center="Quality sits in the middle — change one corner and the others move" />,
  'nested-scope': () => <NestedScope />,
  'npd-kanban': () => <NpdKanbanBoard />,
  a3: () => <A3Layout />,
  'stakeholder-grid': () => <Matrix2x2 title="Stakeholder power/interest grid" xLabel="Interest" yLabel="Power" cells={['Keep satisfied (finance)', 'Manage closely (plant head)', 'Monitor', 'Keep informed (test operators)']} />,
  'thomas-kilmann': () => <Matrix2x2 title="Conflict styles" xLabel="Concern for others" yLabel="Concern for self" cells={['Competing', 'Collaborating', 'Avoiding', 'Accommodating (Compromise in the centre)']} />,
  'skill-matrix': () => (
    <TableDiagram title="Skill matrix — assembly & test" cols={['Operator', 'Rod assy', 'Seal fit', 'Gland torque', 'Leak test', 'Paint']} rows={[['A. Khan', '4', '4', '3', '3', '1'], ['M. Das', '3', '4', '4', '2', '0'], ['R. Patil', '4', '3', '3', '0', '2'], ['S. Rao', '2', '2', '1', '0', '4']]} highlight={(_, c) => (c === 4 ? C.orangeLight : undefined)} />
  ),
  'time-study-sheet': () => <TableDiagram title="Time study sheet" cols={['Element', 'C1', 'C2', 'C3', 'C4', 'C5', 'Avg (s)']} rows={[['Pick rod', '6', '5', '6', '7', '6', '6.0'], ['Fit piston', '42', '40', '44', '41', '43', '42.0'], ['Torque nut', '18', '19', '18', '18', '20', '18.6'], ['Place', '5', '5', '6', '5', '5', '5.2']]} />,
  'flow-process-chart': () => <TableDiagram title="Flow process chart — tube" cols={['Step', 'Symbol', 'Distance (m)', 'Time (min)']} rows={[['Cut', '○ Operation', '-', '3'], ['To honing', '→ Transport', '40', '5'], ['Wait', 'D Delay', '-', '960'], ['Hone', '○ Operation', '-', '10'], ['Inspect bore', '□ Inspection', '-', '2'], ['To store', '→ Transport', '60', '6'], ['Store', '▽ Storage', '-', '1440']]} highlight={(r) => ([1, 2, 5, 6].includes(r) ? C.redLight : undefined)} />,
  'from-to': () => <TableDiagram title="From-to chart (trips/day)" cols={['From \\ To', 'Cut', 'Hone', 'Weld', 'Assy', 'Paint']} rows={[['Cut', '-', '40', '0', '0', '0'], ['Hone', '0', '-', '40', '0', '0'], ['Weld', '0', '0', '-', '40', '0'], ['Assy', '0', '0', '0', '-', '40']]} />,
  'ce-matrix': () => <TableDiagram title="Cause-and-effect matrix" cols={['Input', 'No leak (10)', 'Stroke OK (6)', 'Finish (4)', 'Score']} rows={[['Rod roughness', '9', '0', '9', '126'], ['Seal hardness', '9', '0', '1', '94'], ['Install tool', '9', '0', '3', '102'], ['Cleanliness', '3', '0', '3', '42']]} />,
  'cost-structure': () => <TableDiagram title="Cost structure of a ₹18,000 cylinder" cols={['Element', '₹', '% of price']} rows={[['Tube & rod', '7,500', '41.7'], ['Seals', '1,200', '6.7'], ['Other parts', '2,300', '12.8'], ['Direct labour', '2,000', '11.1'], ['Machine overhead', '3,000', '16.7'], ['Paint & test', '800', '4.4'], ['Margin', '1,200', '6.7']]} />,
  coq: () => <TableDiagram title="Cost of quality categories" cols={['Prevention', 'Appraisal', 'Internal failure', 'External failure']} rows={[['Training, FMEA', 'Inspection, tests', 'Scrap', 'Warranty'], ['Poka-Yoke', 'Calibration', 'Rework', 'Returns'], ['Planning', 'Audits', 'Downtime', 'Penalties, lost customers']]} highlight={(_, c) => (c >= 2 ? C.redLight : c === 0 ? C.greenLight : undefined)} />,
  jsa: () => <TableDiagram title="Job safety analysis — dismantle a cylinder" cols={['Step', 'Hazard', 'Control']} rows={[['Release pressure', 'Stored energy, oil jet', 'Bleed, verify 0 bar on gauge'], ['Secure rod', 'Rod drops/moves', 'Support block, crane'], ['Unscrew gland', 'Pinch, strain', 'Correct C-spanner, two people'], ['Pull rod', 'Heavy load', 'Crane with soft sling']]} />,
  charter: () => <TableDiagram title="Project charter" cols={['Field', 'Content']} rows={[['Objective', '+90 tests/day capacity'], ['Scope', 'Bench, pump unit, logging (no building)'], ['Budget / time', '₹22 L · 12 weeks'], ['Sponsor / PM', 'Plant head / Maintenance manager'], ['Success', 'Capacity verified, MSA ≤ 10%']]} />,
  'control-loop': cycle,
  lessons: cycle,
  'performance-cycle': cycle,
  agile: cycle,
};

export function hasBespokeDiagram(key: string) {
  return key in REGISTRY && key !== 'steps' && REGISTRY[key] !== steps;
}

export function Diagram({ k, lesson }: { k: string; lesson?: Lesson }) {
  const render = REGISTRY[k] ?? steps;
  return <>{render(lesson)}</>;
}

export { StepsFlow, CycleDiagram };
export { TimwoodsGallery } from './lean';
export { HydraulicCylinder } from './production';
