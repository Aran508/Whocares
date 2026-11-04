import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { SIMULATIONS } from '../simulations/registry';
import { PageHeader } from '../components/ui';

export default function SimulationsPage() {
  return (
    <div>
      <PageHeader eyebrow="Simulation lab" title="Interactive industrial simulations" description="Experiment safely: change parameters, make decisions and see how a factory responds. Each simulation links back to the lessons it practises." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SIMULATIONS.map((s, i) => (
          <Link key={s.id} to={`/simulations/${s.id}`} className="card flex flex-col p-5 hover:border-brand-300">
            <div className="flex items-center gap-2 text-brand-600"><FlaskConical size={18} /><span className="text-xs font-semibold uppercase tracking-wide">Simulation {i + 1} · {s.department}</span></div>
            <h2 className="mt-2 text-lg font-bold">{s.title}</h2>
            <p className="mt-1 flex-1 text-sm text-navy-500">{s.description}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">{s.learn.map((l) => <li key={l} className="chip bg-navy-50 text-navy-600">{l}</li>)}</ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
