import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { search, SEARCH_DEPARTMENTS, SEARCH_METHODS, SEARCH_TYPES } from '../lib/search';
import { Card, PageHeader } from '../components/ui';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [dept, setDept] = useState('All');
  const [method, setMethod] = useState('All');
  const results = useMemo(() => search(q, { type, level, department: dept, methodology: method }), [q, type, level, dept, method]);
  const shown = results.slice(0, 120);

  return (
    <div>
      <PageHeader eyebrow="Search" title={q ? `Results for "${q}"` : 'Search all topics'} description="Searches courses, lessons, glossary, calculators, templates, case studies, simulations and robotics labs." />
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-5">
        <input className="input md:col-span-5" value={q} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} placeholder="Type to search…" aria-label="Search query" autoFocus />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option>All</option>{SEARCH_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level"><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department"><option>All</option>{SEARCH_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Methodology"><option value="All">All methodologies</option>{SEARCH_METHODS.map((d) => <option key={d}>{d}</option>)}</select>
        <p className="self-center text-sm text-navy-500">{results.length} results{results.length > shown.length ? ` (showing ${shown.length})` : ''}</p>
      </Card>
      <ul className="space-y-2">
        {shown.map((r, i) => (
          <li key={`${r.type}-${r.to}-${i}`}>
            <Link to={r.to} className="card block p-4 hover:border-brand-300">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="chip bg-brand-50 text-brand-700">{r.type}</span>
                <span className="text-navy-400">{r.department}</span>
                {r.level && <span className="text-navy-400">· {r.level}</span>}
                {r.methodology && <span className="text-navy-400">· {r.methodology}</span>}
              </div>
              <p className="mt-1 font-semibold">{r.title}</p>
              <p className="line-clamp-2 text-sm text-navy-500">{r.text}</p>
            </Link>
          </li>
        ))}
      </ul>
      {!results.length && <Card className="p-8 text-center text-navy-500">No results. Try a shorter word such as "takt", "leak", "FMEA" or "safety".</Card>}
    </div>
  );
}
