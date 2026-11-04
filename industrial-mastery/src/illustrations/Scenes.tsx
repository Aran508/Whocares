import type { ReactNode } from 'react';
import { C } from '../diagrams/primitives';

// Original flat illustrations. They depict generic equipment, not any real company or factory.

const Floor = () => (
  <>
    <rect x={0} y={0} width={480} height={240} fill="#eef3fa" />
    <rect x={0} y={190} width={480} height={50} fill="#dfe6f1" />
    <line x1={0} y1={190} x2={480} y2={190} stroke="#c9d4e6" />
    <rect x={0} y={208} width={480} height={4} fill="#f2c94c" opacity={0.8} />
  </>
);

const Person = ({ x, y, color = C.blue, hat = '#f2c94c' }: { x: number; y: number; color?: string; hat?: string }) => (
  <g>
    <circle cx={x} cy={y} r={9} fill="#e8b98e" />
    <path d={`M ${x - 10} ${y - 3} a 10 10 0 0 1 20 0 z`} fill={hat} />
    <rect x={x - 11} y={y + 10} width={22} height={34} rx={6} fill={color} />
    <rect x={x - 9} y={y + 44} width={7} height={26} fill={C.navy} />
    <rect x={x + 2} y={y + 44} width={7} height={26} fill={C.navy} />
  </g>
);

const scenes: Record<string, { title: string; caption: string; draw: ReactNode }> = {
  cnc: {
    title: 'CNC machining centre',
    caption: 'A CNC lathe turns pistons and glands to tight tolerances; the door interlock prevents operation with the guard open.',
    draw: (
      <>
        <Floor />
        <rect x={110} y={60} width={250} height={130} rx={10} fill="#cfd8e6" stroke={C.steelDark} strokeWidth={2} />
        <rect x={130} y={78} width={140} height={90} rx={6} fill="#a9c7f0" opacity={0.7} stroke={C.steelDark} />
        <rect x={150} y={112} width={60} height={22} fill={C.steelDark} />
        <rect x={210} y={118} width={40} height={10} fill="#e8edf5" />
        <polygon points="250,118 262,123 250,128" fill={C.orange} />
        <rect x={285} y={78} width={60} height={70} rx={6} fill={C.navy} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={293 + c * 17} y={110 + r * 11} width={12} height={8} rx={2} fill="#4f8ef0" />))}
        <rect x={295} y={86} width={40} height={18} rx={2} fill="#1f9d5c" />
        <Person x={395} y={110} />
      </>
    ),
  },
  welding: {
    title: 'Robotic welding cell',
    caption: 'A six-axis robot welds port bosses to cylinder tubes inside a guarded cell with fume extraction and arc screens.',
    draw: (
      <>
        <Floor />
        <rect x={40} y={40} width={300} height={150} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="8 6" />
        <rect x={80} y={150} width={50} height={40} fill={C.steelDark} />
        <path d="M 105 150 L 135 95 L 195 80 L 230 110" fill="none" stroke={C.orange} strokeWidth={14} strokeLinecap="round" />
        <circle cx={105} cy={150} r={10} fill={C.navy} /><circle cx={135} cy={95} r={9} fill={C.navy} /><circle cx={195} cy={80} r={8} fill={C.navy} />
        <rect x={180} y={150} width={140} height={22} rx={10} fill={C.steel} />
        <circle cx={232} cy={140} r={14} fill="#ffe27a" opacity={0.9} />
        <circle cx={232} cy={140} r={26} fill="#ffe27a" opacity={0.25} />
        <rect x={230} y={20} width={14} height={60} fill="#9fb0cd" />
        <rect x={360} y={70} width={70} height={110} rx={6} fill={C.navy} />
        <rect x={370} y={84} width={50} height={28} fill="#4f8ef0" />
        <Person x={440} y={110} color={C.green} />
      </>
    ),
  },
  assembly: {
    title: 'Cylinder assembly line',
    caption: 'Stations in sequence — rod assembly, seal fitting, tube insertion, gland tightening and leak test — paced to takt time.',
    draw: (
      <>
        <Floor />
        <rect x={20} y={150} width={440} height={16} fill={C.steelDark} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={40 + i * 110} y={110} width={70} height={40} rx={4} fill="#cfd8e6" stroke={C.steelDark} />
            <rect x={48 + i * 110} y={124} width={54} height={14} rx={7} fill={C.steel} />
            <Person x={75 + i * 110} y={58} color={[C.blue, C.green, C.blue, C.green][i]} />
          </g>
        ))}
        <rect x={20} y={20} width={150} height={26} rx={4} fill={C.navy} />
        <text x={30} y={38} fontSize={12} fill="#fff" fontFamily="Inter">PLAN 40 · ACT 36</text>
      </>
    ),
  },
  inspection: {
    title: 'Quality inspection',
    caption: 'Bore gauges, micrometers and a calibrated pressure test bench verify critical characteristics against the control plan.',
    draw: (
      <>
        <Floor />
        <rect x={60} y={120} width={360} height={70} fill="#cfd8e6" stroke={C.steelDark} />
        <rect x={110} y={100} width={160} height={24} rx={12} fill={C.steel} stroke={C.steelDark} />
        <rect x={300} y={70} width={60} height={50} rx={4} fill={C.navy} />
        <circle cx={330} cy={95} r={18} fill="#fff" stroke={C.steelDark} strokeWidth={3} />
        <line x1={330} y1={95} x2={342} y2={86} stroke={C.red} strokeWidth={3} />
        <rect x={150} y={60} width={8} height={40} fill={C.steelDark} />
        <circle cx={154} cy={56} r={12} fill="#fff" stroke={C.steelDark} strokeWidth={3} />
        <Person x={420} y={90} color={C.blueDark} hat="#ffffff" />
      </>
    ),
  },
  painting: {
    title: 'Paint booth',
    caption: 'Cylinders are degreased, masked and sprayed in an extracted booth; dry film thickness is measured before dispatch.',
    draw: (
      <>
        <Floor />
        <rect x={60} y={30} width={360} height={160} fill="#e4eaf4" stroke={C.steelDark} strokeWidth={2} />
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={80 + i * 60} y1={30} x2={80 + i * 60} y2={46} stroke={C.steelDark} />)}
        <line x1={60} y1={46} x2={420} y2={46} stroke={C.steelDark} strokeWidth={3} />
        {[0, 1, 2].map((i) => <rect key={i} x={110 + i * 100} y={60} width={20} height={100} rx={8} fill={['#1d5ac0', '#1d5ac0', '#9fb0cd'][i]} />)}
        <path d="M 360 120 l 30 -10 l 0 20 z" fill={C.steelDark} />
        <path d="M 340 110 q -20 10 -60 0 q 20 20 60 20" fill="#86b6fb" opacity={0.6} />
        <Person x={400} y={100} color={C.steelDark} hat="#ffffff" />
      </>
    ),
  },
  grinding: {
    title: 'Grinding and honing',
    caption: 'Honing stones create a precise bore with a cross-hatch finish; cylindrical grinding finishes chrome rods.',
    draw: (
      <>
        <Floor />
        <rect x={60} y={110} width={360} height={80} fill="#cfd8e6" stroke={C.steelDark} />
        <rect x={100} y={90} width={280} height={30} rx={15} fill={C.steel} stroke={C.steelDark} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={110 + i * 22} y1={92} x2={124 + i * 22} y2={118} stroke={C.steelDark} opacity={0.5} />)}
        <rect x={60} y={60} width={40} height={60} fill={C.navy} />
        <circle cx={240} cy={70} r={26} fill="#9fb0cd" stroke={C.steelDark} strokeWidth={3} />
        <circle cx={240} cy={70} r={6} fill={C.navy} />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={268 + i * 6} cy={88 + i * 3} r={1.5} fill={C.orange} />)}
      </>
    ),
  },
  warehouse: {
    title: 'Warehouse and stores',
    caption: 'Labelled rack locations, FIFO lanes and min/max marks keep material findable and traceable.',
    draw: (
      <>
        <Floor />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={30 + r * 140} y={40} width={120} height={150} fill="none" stroke={C.blueDark} strokeWidth={3} />
            {[0, 1, 2].map((s) => <line key={s} x1={30 + r * 140} x2={150 + r * 140} y1={88 + s * 48} y2={88 + s * 48} stroke={C.blueDark} strokeWidth={3} />)}
            {[0, 1, 2].map((s) => [0, 1].map((b) => <rect key={`${s}${b}`} x={40 + r * 140 + b * 54} y={58 + s * 48} width={46} height={28} fill={['#e5830f', '#c9a36b', '#9fb0cd'][(r + s + b) % 3]} />))}
          </g>
        ))}
        <rect x={360} y={160} width={60} height={26} rx={4} fill={C.orange} />
        <circle cx={372} cy={190} r={7} fill={C.navy} /><circle cx={408} cy={190} r={7} fill={C.navy} />
      </>
    ),
  },
  robot: {
    title: 'Industrial robot',
    caption: 'An articulated robot with six degrees of freedom; its tool centre point is programmed through a teach pendant.',
    draw: (
      <>
        <Floor />
        <rect x={170} y={170} width={80} height={20} fill={C.navy} />
        <rect x={190} y={140} width={40} height={32} fill={C.orange} />
        <path d="M 210 140 L 180 80 L 290 50 L 330 90" fill="none" stroke={C.orange} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        {[[210, 140], [180, 80], [290, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={C.navy} />)}
        <rect x={322} y={88} width={24} height={12} fill={C.steelDark} />
        <path d="M 340 100 l 8 16 M 328 100 l -6 16" stroke={C.steelDark} strokeWidth={4} />
        <rect x={60} y={110} width={50} height={70} rx={6} fill={C.navy} />
        <rect x={67} y={118} width={36} height={24} fill="#4f8ef0" />
        <rect x={380} y={150} width={80} height={40} fill="#cfd8e6" stroke={C.steelDark} />
      </>
    ),
  },
  maintenance: {
    title: 'Maintenance of a hydraulic press',
    caption: 'Lockout/tagout, a bled accumulator and a ram safety block protect the technician during maintenance.',
    draw: (
      <>
        <Floor />
        <rect x={140} y={30} width={160} height={160} fill="none" stroke={C.steelDark} strokeWidth={10} />
        <rect x={180} y={50} width={80} height={60} fill={C.steel} stroke={C.steelDark} />
        <rect x={210} y={110} width={20} height={30} fill="#e8edf5" />
        <rect x={180} y={150} width={80} height={30} fill={C.steelDark} />
        <rect x={232} y={140} width={20} height={10} fill={C.orange} />
        <rect x={330} y={80} width={40} height={60} rx={4} fill="#cfd8e6" stroke={C.steelDark} />
        <rect x={340} y={130} width={20} height={20} rx={3} fill={C.red} />
        <path d="M 344 130 v -8 a 6 6 0 0 1 12 0 v 8" fill="none" stroke={C.navy} strokeWidth={3} />
        <Person x={90} y={110} color={C.blue} />
      </>
    ),
  },
  safety: {
    title: 'Industrial safety',
    caption: 'PPE, marked walkways, machine guarding and clear emergency signs — controls chosen by the hierarchy of controls.',
    draw: (
      <>
        <Floor />
        <rect x={0} y={190} width={140} height={50} fill="#1f9d5c" opacity={0.25} />
        <polygon points="300,40 360,140 240,140" fill="#f2c94c" stroke={C.navy} strokeWidth={4} />
        <text x={300} y={125} fontSize={52} textAnchor="middle" fill={C.navy} fontWeight={800}>!</text>
        <rect x={380} y={60} width={70} height={46} rx={6} fill={C.green} />
        <text x={415} y={88} fontSize={12} fill="#fff" textAnchor="middle" fontFamily="Inter">EXIT →</text>
        <Person x={90} y={110} color={C.orange} />
        <rect x={74} y={128} width={32} height={6} fill="#f2c94c" />
      </>
    ),
  },
  board: {
    title: 'Shop-floor management board',
    caption: 'SQCDP, hourly output and an action list reviewed in a 10-minute stand-up meeting at the start of every shift.',
    draw: (
      <>
        <Floor />
        <rect x={80} y={20} width={320} height={160} rx={6} fill="#fff" stroke={C.navy} strokeWidth={3} />
        {['S', 'Q', 'C', 'D', 'P'].map((l, i) => (
          <g key={l}>
            <text x={110 + i * 60} y={52} fontSize={22} fontWeight={800} fill={[C.green, C.blue, C.orange, C.blueDark, C.steelDark][i]} fontFamily="Inter">{l}</text>
            {Array.from({ length: 6 }, (_, d) => <rect key={d} x={100 + i * 60 + (d % 3) * 13} y={62 + Math.floor(d / 3) * 13} width={10} height={10} fill={(i + d) % 5 === 0 ? C.red : C.green} />)}
          </g>
        ))}
        <rect x={100} y={110} width={280} height={56} fill="#f3f6fb" />
        <polyline points="110,150 150,140 190,145 230,125 270,130 310,118 350,122" fill="none" stroke={C.blue} strokeWidth={3} />
        <Person x={50} y={120} />
        <Person x={440} y={120} color={C.green} />
      </>
    ),
  },
  supply: {
    title: 'Inbound logistics',
    caption: 'A milk-run truck collects tubes, rods and seals from several suppliers on a fixed timetable.',
    draw: (
      <>
        <Floor />
        <rect x={60} y={110} width={220} height={80} rx={6} fill="#fff" stroke={C.steelDark} strokeWidth={2} />
        <rect x={280} y={130} width={80} height={60} rx={8} fill={C.blue} />
        <rect x={300} y={140} width={40} height={22} fill="#d9e8ff" />
        {[90, 190, 330].map((x) => <circle key={x} cx={x} cy={192} r={14} fill={C.navy} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={80 + i * 64} y={130} width={54} height={40} fill={['#e5830f', '#c9a36b', '#9fb0cd'][i]} />)}
        <path d="M 380 80 q 40 -40 80 0" fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="6 4" />
      </>
    ),
  },
  office: {
    title: 'Engineering documentation',
    caption: 'Controlled drawings, process sheets and work instructions, released through an approval workflow.',
    draw: (
      <>
        <rect x={0} y={0} width={480} height={240} fill="#eef3fa" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${70 + i * 120}, ${40 + i * 8}) rotate(${-6 + i * 6})`}>
            <rect width={110} height={150} rx={4} fill="#fff" stroke={C.steelDark} />
            <rect x={10} y={10} width={90} height={10} fill={C.blue} />
            {[0, 1, 2, 3, 4, 5].map((l) => <rect key={l} x={10} y={30 + l * 14} width={l % 2 ? 70 : 90} height={6} fill="#c9d4e6" />)}
            <rect x={60} y={120} width={40} height={20} rx={3} fill="none" stroke={C.green} strokeWidth={2} />
            <text x={80} y={134} fontSize={9} textAnchor="middle" fill={C.green} fontFamily="Inter">REV C</text>
          </g>
        ))}
      </>
    ),
  },
  strategy: {
    title: 'Plant leadership review',
    caption: 'Leaders align on a few breakthrough objectives and review KPIs, risks and decisions every month.',
    draw: (
      <>
        <rect x={0} y={0} width={480} height={240} fill="#eef3fa" />
        <rect x={100} y={130} width={280} height={20} rx={4} fill={C.steelDark} />
        <rect x={150} y={20} width={180} height={100} rx={6} fill="#fff" stroke={C.navy} strokeWidth={2} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={170 + i * 38} y={100 - (i + 1) * 16} width={26} height={(i + 1) * 16} fill={[C.blue, C.blue, C.green, C.green][i]} />)}
        <Person x={90} y={120} />
        <Person x={240} y={160} color={C.green} />
        <Person x={390} y={120} color={C.steelDark} />
      </>
    ),
  },
};

export const SCENE_KEYS = Object.keys(scenes);

export function Scene({ k, className = '' }: { k: string; className?: string }) {
  const s = scenes[k] ?? scenes.assembly;
  return (
    <figure className={`overflow-hidden rounded-xl border border-navy-100 bg-white ${className}`}>
      <svg viewBox="0 0 480 240" role="img" aria-label={s.title} className="w-full h-auto block">
        <title>{s.title}</title>
        {s.draw}
      </svg>
      <figcaption className="px-4 py-2.5 text-xs text-navy-500 border-t border-navy-100">
        <span className="font-semibold text-navy-800">{s.title}.</span> {s.caption} <span className="italic">Illustration.</span>
      </figcaption>
    </figure>
  );
}

const MODULE_SCENE: Record<string, string> = { A: 'board', B: 'assembly', C: 'board', D: 'inspection', E: 'inspection', F: 'assembly', G: 'maintenance', H: 'warehouse', I: 'office', J: 'cnc', K: 'strategy', L: 'safety', M: 'strategy' };

const KEYWORDS: [RegExp, string][] = [
  [/weld|wps|pqr|wqr/i, 'welding'],
  [/paint/i, 'painting'],
  [/cnc|machin|tool|cycle time|changeover|smed/i, 'cnc'],
  [/grind|hon|burnish/i, 'grinding'],
  [/inspect|spc|control chart|capab|cp |cpk|msa|gauge|calibr|fai|first piece|ppm|defect/i, 'inspection'],
  [/warehouse|inventory|stock|eoq|abc|fsn|ved|grn|fifo|fefo|reorder|safety stock|kanban|supermarket/i, 'warehouse'],
  [/supplier|procure|purchase|milk run|supply chain|delivery|otif/i, 'supply'],
  [/maint|mtbf|mttr|tpm|lubric|spare|reliab|breakdown/i, 'maintenance'],
  [/safety|hazard|loto|ppe|fire|permit|incident|near-miss|hira|jsa|guard/i, 'safety'],
  [/robot|automation/i, 'robot'],
  [/sqcdp|kpi|daily|shop-floor|gemba|board|andon|visual/i, 'board'],
  [/document|sop|work instruction|drawing|bom|routing|ecn|ecr|dcr|register|report/i, 'office'],
  [/hoshin|strateg|scorecard|leader|roi|tco|decision|change management|benchmark/i, 'strategy'],
  [/assembly|line|takt|balanc|bottleneck/i, 'assembly'],
];

export function sceneFor(title: string, moduleId: string): string {
  for (const [re, k] of KEYWORDS) if (re.test(title)) return k;
  return MODULE_SCENE[moduleId] ?? 'assembly';
}
export const moduleScene = (id: string) => MODULE_SCENE[id] ?? 'assembly';
