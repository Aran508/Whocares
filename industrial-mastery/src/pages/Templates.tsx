import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { PageHeader } from '../components/ui';

export default function TemplatesPage() {
  const depts = ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.department)))];
  const [d, setD] = useState('All');
  return (
    <div>
      <PageHeader eyebrow="Templates & downloads" title={`${TEMPLATES.length} practical industrial templates`} description="Each template contains sample data, clear instructions and editable fields. Your edits are saved in this browser and can be exported to CSV, Excel or PDF (print)." />
      <div className="mb-4 flex flex-wrap gap-2">
        {depts.map((x) => <button key={x} onClick={() => setD(x)} className={`chip px-3 py-1.5 text-sm ${d === x ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-navy-50'}`}>{x}</button>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.filter((t) => d === 'All' || t.department === d).map((t) => (
          <Link key={t.id} to={`/templates/${t.id}`} className="card flex gap-3 p-4 hover:border-brand-300">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ok-50 text-ok-600"><FileSpreadsheet size={18} /></span>
            <span><span className="block font-semibold">{t.title}</span><span className="block text-xs text-navy-400">{t.department} · {t.columns.length} columns</span><span className="mt-1 block text-sm text-navy-500">{t.purpose}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
