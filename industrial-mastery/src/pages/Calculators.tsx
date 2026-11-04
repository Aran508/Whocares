import { Link } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { CALCULATORS, CALC_CATEGORIES } from '../calculators/defs';
import { Card, PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';
import { timeAgo } from '../lib/format';

export default function CalculatorsPage() {
  const { state } = useProgress();
  return (
    <div>
      <PageHeader eyebrow="Industrial Calculator Centre" title={`${CALCULATORS.length} industrial calculators`} description="Each calculator validates its inputs, supports unit selection where relevant, states its assumptions and shows every calculation step with an interpretation of the result." />
      <div className="space-y-8">
        {CALC_CATEGORIES.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-lg font-bold">{cat}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CALCULATORS.filter((c) => c.category === cat).map((c) => (
                <Link key={c.id} to={`/calculators/${c.id}`} className="card flex gap-3 p-4 hover:border-brand-300">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Calculator size={18} /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{c.title}</span>
                    <span className="block text-sm text-navy-500">{c.description}</span>
                    <span className="mt-1 block truncate font-mono text-[11px] text-navy-400">{c.formula}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Card className="mt-8 p-5">
        <h2 className="font-bold">Your calculator practice history</h2>
        {state.calcHistory.length ? (
          <ul className="mt-3 divide-y divide-navy-100">
            {state.calcHistory.slice(0, 12).map((h, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <Link to={`/calculators/${h.calcId}`} className="font-medium hover:text-brand-700">{h.title}</Link>
                <span className="text-navy-500">{h.summary}</span>
                <span className="text-xs text-navy-400">{timeAgo(h.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-navy-400">Use "Save to practice history" on any calculator to keep a record of your calculations.</p>
        )}
      </Card>
    </div>
  );
}
