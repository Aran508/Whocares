import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { lessonById } from '../data/lessons';
import { caseById } from '../data/caseStudies';
import { calcById } from '../calculators/defs';
import { templateById } from '../data/templates';
import { Empty, PageHeader } from '../components/ui';

function resolve(key: string): { type: string; title: string; to: string } | null {
  const [p, id] = key.includes(':') ? key.split(':') : ['lesson', key];
  if (p === 'lesson') { const l = lessonById(id); return l ? { type: 'Lesson', title: l.title, to: `/lessons/${l.id}` } : null; }
  if (p === 'case') { const c = caseById(id); return c ? { type: 'Case study', title: c.title, to: `/cases/${c.id}` } : null; }
  if (p === 'calc') { const c = calcById(id); return c ? { type: 'Calculator', title: c.title, to: `/calculators/${c.id}` } : null; }
  if (p === 'template') { const t = templateById(id); return t ? { type: 'Template', title: t.title, to: `/templates/${t.id}` } : null; }
  return null;
}

export default function BookmarksPage() {
  const { state, toggleBookmark } = useProgress();
  const items = state.bookmarks.map((k) => ({ k, r: resolve(k) })).filter((x) => x.r);
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Bookmarks" title="Saved topics" description="Lessons, case studies, calculators and templates you bookmarked." />
      {items.length ? (
        <ul className="space-y-2">
          {items.map(({ k, r }) => (
            <li key={k} className="card flex items-center gap-3 p-4">
              <span className="chip bg-brand-50 text-brand-700">{r!.type}</span>
              <Link to={r!.to} className="flex-1 font-semibold hover:text-brand-700">{r!.title}</Link>
              <button className="btn-ghost px-2" onClick={() => toggleBookmark(k)} aria-label={`Remove ${r!.title}`}><X size={16} /></button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="No bookmarks yet">Use the Bookmark button on lessons, cases, calculators and templates.</Empty>
      )}
    </div>
  );
}
