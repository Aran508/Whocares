import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GLOSSARY, GLOSSARY_DEPARTMENTS } from '../data/glossary';
import { Card, PageHeader, SpeakButton } from '../components/ui';

export default function GlossaryPage() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [dept, setDept] = useState('All');
  const [letter, setLetter] = useState('All');
  const letters = useMemo(() => ['All', ...Array.from(new Set(GLOSSARY.map((g) => g.term[0].toUpperCase()))).sort()], []);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GLOSSARY.filter((g) =>
      (dept === 'All' || g.department === dept) &&
      (letter === 'All' || g.term[0].toUpperCase() === letter) &&
      (!s || g.term.toLowerCase().includes(s) || (g.fullForm ?? '').toLowerCase().includes(s) || g.meaning.toLowerCase().includes(s)),
    );
  }, [q, dept, letter]);

  return (
    <div>
      <PageHeader eyebrow="Glossary & pronunciation dictionary" title={`${GLOSSARY.length} industrial terms`} description="Every term with its full form, easy English pronunciation, simple meaning, department, practical example and related methods. Use the speaker icon to hear it (uses your browser's voice)." />
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-[1fr_220px]">
        <input className="input" placeholder="Search a term, full form or meaning… e.g. Heijunka, FMEA, traceability" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" />
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department filter">
          <option>All</option>
          {GLOSSARY_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="flex flex-wrap gap-1 md:col-span-2">
          {letters.map((l) => <button key={l} onClick={() => setLetter(l)} className={`h-7 min-w-[28px] rounded px-1.5 text-xs font-semibold ${letter === l ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}>{l}</button>)}
        </div>
      </Card>
      <p className="mb-3 text-sm text-navy-500">{list.length} terms</p>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((g) => (
          <Card key={g.term} className="p-4" as="article">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{g.term}</h2>
              <span className="chip bg-navy-50 text-navy-600">{g.department}</span>
            </div>
            {g.fullForm && <p className="text-sm text-navy-500">{g.fullForm}</p>}
            <p className="mt-1 flex items-center gap-1 text-sm"><span className="font-semibold text-brand-700">{g.pronunciation}</span><SpeakButton text={g.pronunciation.startsWith('Plain') ? g.term : g.pronunciation.replace(/-/g, ' ').replace(/\(.*?\)/g, '')} label={g.term} /></p>
            <p className="mt-2 text-sm text-navy-800">{g.meaning}</p>
            <p className="mt-2 text-sm text-navy-500"><span className="font-semibold text-navy-700">Example: </span>{g.example}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              {g.related.map((r) => <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="chip bg-brand-50 text-brand-700 hover:bg-brand-100">{r}</Link>)}
              {g.lessonId && <Link to={`/lessons/${g.lessonId}`} className="ml-auto font-semibold text-brand-600 hover:underline">Open lesson →</Link>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
