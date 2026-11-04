import { Link } from 'react-router-dom';
import { ArrowRight, Bot } from 'lucide-react';
import { ROBOT_LABS, ROBOT_TYPES } from '../robotics/registry';
import { Card, PageHeader } from '../components/ui';
import { C } from '../diagrams/primitives';

function RobotIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-full" role="img" aria-label={kind}>
      <rect width={120} height={90} rx={8} fill={C.bg} />
      <rect x={0} y={78} width={120} height={12} fill="#dfe6f1" />
      {kind === 'articulated' && <><rect x={40} y={70} width={30} height={8} fill={C.navy} /><path d="M 55 70 L 50 40 L 85 25 L 98 40" fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" /><circle cx={50} cy={40} r={5} fill={C.navy} /><circle cx={85} cy={25} r={4} fill={C.navy} /></>}
      {kind === 'cobot' && <><rect x={40} y={70} width={30} height={8} fill={C.navy} /><path d="M 55 70 L 52 42 L 82 30 L 92 46" fill="none" stroke={C.blue} strokeWidth={8} strokeLinecap="round" /><circle cx={52} cy={42} r={5} fill="#fff" stroke={C.navy} /><circle cx={82} cy={30} r={4} fill="#fff" stroke={C.navy} /><circle cx={105} cy={55} r={5} fill="#e8b98e" /></>}
      {kind === 'scara' && <><rect x={30} y={30} width={10} height={48} fill={C.navy} /><path d="M 35 32 L 70 32 L 95 45" fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" /><rect x={92} y={45} width={5} height={22} fill={C.steelDark} /></>}
      {kind === 'delta' && <><rect x={25} y={10} width={70} height={10} fill={C.navy} /><path d="M 35 20 L 55 55 M 60 20 L 60 55 M 85 20 L 65 55" stroke={C.orange} strokeWidth={4} /><rect x={50} y={55} width={20} height={6} fill={C.steelDark} /></>}
      {kind === 'gantry' && <><rect x={10} y={15} width={6} height={63} fill={C.navy} /><rect x={104} y={15} width={6} height={63} fill={C.navy} /><rect x={10} y={15} width={100} height={8} fill={C.orange} /><rect x={56} y={23} width={8} height={35} fill={C.steelDark} /></>}
      {kind === 'agv' && <><line x1={0} y1={82} x2={120} y2={82} stroke="#f2c94c" strokeWidth={3} strokeDasharray="6 4" /><rect x={30} y={55} width={60} height={20} rx={4} fill={C.blue} /><rect x={40} y={40} width={40} height={15} fill="#c9a36b" /></>}
      {kind === 'amr' && <><rect x={30} y={55} width={60} height={20} rx={8} fill={C.green} /><circle cx={60} cy={60} r={30} fill="none" stroke={C.green} strokeDasharray="3 3" /><rect x={40} y={42} width={40} height={13} fill={C.orange} /></>}
    </svg>
  );
}

export default function RoboticsPage() {
  return (
    <div>
      <PageHeader eyebrow="Robotics lab" title="Learn the robots used in industry" description="Three hands-on environments cover articulated arms, robotic welding cells, mobile robots and collaborative robots — the main robot families found in manufacturing plants." />
      <div className="grid gap-4 lg:grid-cols-3">
        {ROBOT_LABS.map((l) => (
          <Link key={l.id} to={`/robotics/${l.id}`} className="card flex flex-col p-5 hover:border-brand-300">
            <div className="flex items-center gap-2 text-brand-600"><Bot size={18} /><span className="text-xs font-semibold uppercase tracking-wide">Learning environment</span></div>
            <h2 className="mt-2 text-lg font-bold">{l.title}</h2>
            <p className="mt-1 flex-1 text-sm text-navy-500">{l.description}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">{l.learn.map((x) => <li key={x} className="chip bg-navy-50 text-navy-600">{x}</li>)}</ul>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open environment <ArrowRight size={15} /></span>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold">Industrial robot families</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ROBOT_TYPES.map((r) => (
          <Card key={r.name} className="overflow-hidden" as="article">
            <RobotIcon kind={r.draw} />
            <div className="p-4 text-sm">
              <h3 className="font-bold">{r.name}</h3>
              <dl className="mt-2 space-y-1 text-navy-600">
                <div><dt className="inline font-semibold text-navy-800">Axes: </dt><dd className="inline">{r.axes}</dd></div>
                <div><dt className="inline font-semibold text-navy-800">Payload: </dt><dd className="inline">{r.payload}</dd></div>
                <div><dt className="inline font-semibold text-navy-800">Reach: </dt><dd className="inline">{r.reach}</dd></div>
                <div><dt className="inline font-semibold text-navy-800">Typical use: </dt><dd className="inline">{r.uses}</dd></div>
                <div><dt className="inline font-semibold text-ok-700">+ </dt><dd className="inline">{r.pros}</dd></div>
                <div><dt className="inline font-semibold text-bad-700">− </dt><dd className="inline">{r.cons}</dd></div>
              </dl>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-navy-400">Payload and reach figures are typical market ranges for orientation, not specifications of any particular manufacturer.</p>
    </div>
  );
}
