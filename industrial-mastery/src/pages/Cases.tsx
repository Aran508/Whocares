import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { CASE_STUDIES } from '../data/caseStudies';
import { LevelBadge, PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';

export default function CasesPage() {
  const { state } = useProgress();
  const depts = ['All', ...Array.from(new Set(CASE_STUDIES.map((c) => c.department)))];
  const [d, setD] = useState('All');
  const list = CASE_STUDIES.filter((c) => d === 'All' || c.department === d);
  return (
    <div>
      <PageHeader eyebrow="Practical case studies" title={`${CASE_STUDIES.length} realistic factory problems`} description="Fictional but realistic situations. Read the situation and data, make your decision first — the suggested investigation and solution are revealed only after you answer." />
      <div className="mb-4 flex flex-wrap gap-2">
        {depts.map((x) => <button key={x} onClick={() => setD(x)} className={`chip px-3 py-1.5 text-sm ${d === x ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-navy-50'}`}>{x}</button>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c, i) => {
          const s = state.casesSolved[c.id];
          return (
            <Link key={c.id} to={`/cases/${c.id}`} className="card flex flex-col p-4 hover:border-brand-300">
              <div className="flex items-center justify-between text-xs text-navy-400">
                <span>Case {String(CASE_STUDIES.indexOf(c) + 1).padStart(2, '0')} · {c.department}</span>
                {s ? s.correct ? <span className="flex items-center gap-1 text-ok-600"><CheckCircle2 size={14} /> Solved</span> : <span className="flex items-center gap-1 text-bad-600"><XCircle size={14} /> Reviewed</span> : <span className="flex items-center gap-1"><CircleDashed size={14} /> Open</span>}
              </div>
              <h2 className="mt-1 font-bold">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-navy-500 line-clamp-3">{c.problem}</p>
              <div className="mt-3"><LevelBadge level={c.level} /></div>
              <span className="sr-only">{i}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
