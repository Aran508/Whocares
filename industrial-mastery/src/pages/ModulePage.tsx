import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ClipboardCheck, ExternalLink, PlayCircle } from 'lucide-react';
import { moduleBySlug } from '../data/modules';
import { lessonsOfModule } from '../data/lessons';
import { useProgress } from '../lib/progress';
import { Card, LevelBadge, PageHeader, ProgressBar } from '../components/ui';
import ModuleIcon from '../components/ModuleIcon';
import NotFound from './NotFound';
import { Scene, moduleScene } from '../illustrations/Scenes';
import type { Level } from '../types';

export default function ModulePage() {
  const { slug = '' } = useParams();
  const m = moduleBySlug(slug);
  const { state, isComplete } = useProgress();
  const [level, setLevel] = useState<Level | 'All'>('All');
  const [q, setQ] = useState('');
  const lessons = useMemo(() => (m ? lessonsOfModule(m.id) : []), [m]);
  if (!m) return <NotFound />;
  const done = lessons.filter((l) => isComplete(l.id)).length;
  const pct = Math.round((done / lessons.length) * 100);
  const filtered = lessons.filter((l) => (level === 'All' || l.level === level) && (!q || l.title.toLowerCase().includes(q.toLowerCase())));
  const next = lessons.find((l) => !isComplete(l.id));
  const lastTest = state.assessments.filter((a) => a.examId === `module-${m.id}`).slice(-1)[0];

  return (
    <div>
      <PageHeader
        crumbs={[{ to: '/academy', label: 'Learning Academy' }, { label: m.title }]}
        eyebrow={`Module ${m.id} · ${m.department}`}
        title={m.title}
        description={m.description}
        actions={
          <>
            {next && <Link to={`/lessons/${next.id}`} className="btn-primary"><PlayCircle size={16} /> {done ? 'Continue' : 'Start module'}</Link>}
            <Link to={`/assessments/module-${m.id}`} className="btn-secondary"><ClipboardCheck size={16} /> Module test</Link>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600"><ModuleIcon name={m.icon} size={22} /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Learning outcome</p>
              <p className="text-sm text-navy-500">{m.outcome}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-navy-500"><span>{done} of {lessons.length} lessons completed</span><span>{pct}%</span></div>
          <ProgressBar value={pct} color="bg-ok-500" className="mt-1" label="Module progress" />
          <p className="mt-3 text-xs text-navy-400">A lesson is completed only when you have studied all sections and scored at least {state.settings.passMark}% in its knowledge test.{lastTest ? ` Last module test: ${lastTest.score}% (${lastTest.passed ? 'passed' : 'not passed'}).` : ''}</p>
        </Card>
        <Scene k={moduleScene(m.id)} />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-bold">Lessons ({filtered.length})</h2>
        <div className="flex flex-wrap gap-2">
          <input className="input w-56" placeholder="Filter lessons…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter lessons" />
          <select className="input w-40" value={level} onChange={(e) => setLevel(e.target.value as Level | 'All')} aria-label="Filter by level">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>
      <ol className="mt-3 grid gap-2">
        {filtered.map((l, i) => {
          const lp = state.lessons[l.id];
          const complete = isComplete(l.id);
          const cross = l.moduleId !== m.id;
          return (
            <li key={l.id}>
              <Link to={`/lessons/${l.id}`} className="card flex items-center gap-4 p-4 hover:border-brand-300">
                <span className="w-7 text-center text-sm font-semibold text-navy-300">{i + 1}</span>
                {complete ? <CheckCircle2 className="text-ok-500 shrink-0" size={22} /> : <Circle className={`${lp ? 'text-brand-400' : 'text-navy-200'} shrink-0`} size={22} />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900">{l.title}</p>
                  <p className="truncate text-sm text-navy-500">{l.definition}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 md:flex">
                  {cross && <span className="chip bg-navy-50 text-navy-500" title="This lesson is shared with another module"><ExternalLink size={12} /> shared</span>}
                  {lp?.quiz && <span className={`chip ${lp.quiz.score >= state.settings.passMark ? 'bg-ok-50 text-ok-700' : 'bg-warn-50 text-warn-700'}`}>Quiz {lp.quiz.score}%</span>}
                  <LevelBadge level={l.level} />
                  <span className="flex items-center gap-1 text-xs text-navy-400"><Clock size={13} />{l.minutes} min</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
