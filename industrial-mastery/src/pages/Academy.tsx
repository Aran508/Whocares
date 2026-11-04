import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Briefcase, Calculator, FlaskConical } from 'lucide-react';
import { MODULES } from '../data/modules';
import { useStats } from '../lib/stats';
import { Card, PageHeader, ProgressBar } from '../components/ui';
import ModuleIcon from '../components/ModuleIcon';
import { Scene, moduleScene } from '../illustrations/Scenes';

export default function Academy() {
  const stats = useStats();
  return (
    <div>
      <PageHeader
        eyebrow="Learning Academy"
        title="Complete industrial management curriculum"
        description={`${MODULES.length} courses and ${stats.totalLessons} lessons from shop-floor fundamentals to plant-level strategy. Each lesson follows the same structure: what it is, why it exists, how it works, factory and hydraulic-cylinder examples, diagram, formula, worksheet, mistakes, manager's insight and a 5-question test.`}
      />
      <Card className="mb-6 p-5">
        <h2 className="font-bold">Recommended learning path</h2>
        <ol className="mt-3 grid gap-2 text-sm md:grid-cols-4">
          {[
            ['1. Foundation', 'Fundamentals → Production → Lean'],
            ['2. Quality & problems', 'Quality → Problem Solving → Safety'],
            ['3. Engineering systems', 'Industrial Engg. → Maintenance → Supply Chain → Documentation'],
            ['4. Leading the plant', 'NPD → Projects → Advanced Management'],
          ].map(([h, d]) => (
            <li key={h} className="rounded-lg bg-navy-50 p-3"><span className="font-semibold text-navy-900">{h}</span><br /><span className="text-navy-500">{d}</span></li>
          ))}
        </ol>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.perModule.map(({ module: m, done, total, pct }) => (
          <Link key={m.id} to={`/modules/${m.slug}`} className="card group flex flex-col overflow-hidden hover:shadow-lift transition-shadow">
            <div className="pointer-events-none"><Scene k={moduleScene(m.id)} className="rounded-none border-0 [&_figcaption]:hidden" /></div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50"><ModuleIcon name={m.icon} size={16} /></span>
                Module {m.id} · {m.department}
              </div>
              <h2 className="mt-2 text-lg font-bold group-hover:text-brand-700">{m.title}</h2>
              <p className="mt-1 flex-1 text-sm text-navy-500">{m.description}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-navy-400"><span>{done} of {total} lessons completed</span><span>{pct}%</span></div>
                <ProgressBar value={pct} color="bg-ok-500" className="mt-1" label={`${m.title} progress`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ['/simulations', 'Simulation Lab', 'Six interactive factory simulations', <FlaskConical key="a" size={18} />],
          ['/robotics', 'Robotics Lab', 'Three industrial-robot learning environments', <Bot key="b" size={18} />],
          ['/cases', 'Case Studies', '25 realistic factory problems to solve', <Briefcase key="c" size={18} />],
          ['/calculators', 'Calculators', '33 industrial calculators with steps', <Calculator key="d" size={18} />],
        ].map(([to, t, d, i]) => (
          <Link key={to as string} to={to as string} className="card flex items-center gap-3 p-4 hover:border-brand-300">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">{i}</span>
            <span className="flex-1"><span className="block font-semibold">{t}</span><span className="text-xs text-navy-500">{d}</span></span>
            <ArrowRight size={16} className="text-navy-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
