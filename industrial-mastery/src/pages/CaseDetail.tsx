import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, Lightbulb, Search, ShieldCheck, Target, UserCog, Wrench } from 'lucide-react';
import { caseById, CASE_STUDIES } from '../data/caseStudies';
import { lessonById, resolveRelated } from '../data/lessons';
import { BookmarkButton, Callout, Card, LevelBadge, PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';
import { kv } from '../lib/storage';
import NotFound from './NotFound';

export default function CaseDetail() {
  const { id = '' } = useParams();
  const c = caseById(id);
  if (!c) return <NotFound />;
  return <CaseView key={c.id} id={c.id} />;
}

function CaseView({ id }: { id: string }) {
  const c = caseById(id)!;
  const { state, recordCase } = useProgress();
  const prior = state.casesSolved[c.id];
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(!!prior);
  const [notes, setNotes] = useState(() => kv.get(`case-notes:${c.id}`, ''));
  const idx = CASE_STUDIES.findIndex((x) => x.id === c.id);
  const next = CASE_STUDIES[idx + 1];

  const submit = () => {
    if (choice === null) return;
    recordCase(c.id, choice === c.challenge.answer);
    setRevealed(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ to: '/cases', label: 'Case studies' }, { label: c.title }]} eyebrow={`Case ${String(idx + 1).padStart(2, '0')} · ${c.department}`} title={c.title} actions={<BookmarkButton itemKey={`case:${c.id}`} />} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2"><LevelBadge level={c.level} /></div>
            <h2 className="mt-3 font-bold">Situation</h2>
            <p className="mt-1 text-navy-700 leading-relaxed">{c.situation}</p>
            <h2 className="mt-4 font-bold">Problem statement</h2>
            <Callout tone="bad">{c.problem}</Callout>
          </Card>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-bold"><ClipboardList size={16} /> Available data</h2>
            <table className="table-im mt-2"><tbody>{c.data.map((d) => <tr key={d.label}><th className="w-1/3 normal-case tracking-normal text-sm">{d.label}</th><td>{d.value}</td></tr>)}</tbody></table>
          </Card>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-bold"><Target size={16} /> Learner challenge — decide before you look</h2>
            <p className="mt-1 font-medium">{c.challenge.question}</p>
            <div className="mt-3 grid gap-2">
              {c.challenge.options.map((o, i) => {
                const correct = revealed && i === c.challenge.answer;
                const wrong = revealed && choice === i && i !== c.challenge.answer;
                return (
                  <label key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${correct ? 'border-ok-500 bg-ok-50' : wrong ? 'border-bad-500 bg-bad-50' : choice === i ? 'border-brand-500 bg-brand-50' : 'border-navy-100'}`}>
                    <input type="radio" name="challenge" className="mt-0.5 accent-brand-600" disabled={revealed} checked={choice === i} onChange={() => setChoice(i)} />
                    {o}
                  </label>
                );
              })}
            </div>
            <label className="label mt-4" htmlFor="notes">Your reasoning / proposed actions (saved in this browser)</label>
            <textarea id="notes" className="input min-h-[90px]" value={notes} onChange={(e) => { setNotes(e.target.value); kv.set(`case-notes:${c.id}`, e.target.value); }} placeholder="Write your containment, root cause, corrective and preventive actions before revealing the suggested solution…" />
            {!revealed ? (
              <button className="btn-primary mt-3" disabled={choice === null} onClick={submit}>Submit decision & reveal solution</button>
            ) : (
              <div className={`mt-3 rounded-lg p-3 text-sm ${choice === null ? 'bg-navy-50' : choice === c.challenge.answer ? 'bg-ok-50 text-ok-700' : 'bg-bad-50 text-bad-700'}`}>
                <p className="font-semibold">{choice === null ? (prior?.correct ? 'You solved this case earlier.' : 'You reviewed this case earlier.') : choice === c.challenge.answer ? 'Good decision.' : 'Not the best decision.'}</p>
                <p className="mt-1 text-navy-700">{c.challenge.feedback}</p>
              </div>
            )}
          </Card>

          {revealed && (
            <>
              <Card className="p-5">
                <h2 className="flex items-center gap-2 font-bold"><Search size={16} /> Root cause investigation</h2>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-navy-700">{c.investigation.map((s) => <li key={s}>{s}</li>)}</ol>
                {c.calculation && <div className="mt-3 rounded-lg bg-navy-900 px-4 py-3 font-mono text-sm text-white">{c.calculation}</div>}
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5"><h2 className="flex items-center gap-2 font-bold"><Wrench size={16} /> Corrective action</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{c.corrective.map((s) => <li key={s}>{s}</li>)}</ul></Card>
                <Card className="p-5"><h2 className="flex items-center gap-2 font-bold"><ShieldCheck size={16} /> Preventive action</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{c.preventive.map((s) => <li key={s}>{s}</li>)}</ul></Card>
              </div>
              <Callout tone="ok" title="Expected outcome" icon={<Lightbulb size={15} />}>{c.outcome}</Callout>
              <Callout tone="manager" title="MANAGER'S DECISION" icon={<UserCog size={15} />}><span className="text-navy-100">{c.decision}</span></Callout>
            </>
          )}
        </div>
        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold">Applicable methods</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.methods.map((m) => {
                const l = resolveRelated(m);
                return l ? <Link key={m} to={`/lessons/${l.id}`} className="chip border border-brand-200 bg-white px-2.5 py-1 text-brand-700">{m}</Link> : <span key={m} className="chip bg-navy-50 px-2.5 py-1 text-navy-600">{m}</span>;
              })}
            </div>
            <h2 className="mt-4 font-bold">Related lessons</h2>
            <ul className="mt-2 space-y-1 text-sm">{c.related.map((r) => { const l = lessonById(r); return l ? <li key={r}><Link className="text-brand-700 hover:underline" to={`/lessons/${l.id}`}>{l.title}</Link></li> : null; })}</ul>
          </Card>
          {next && <Link to={`/cases/${next.id}`} className="card block p-4 hover:border-brand-300"><span className="text-xs text-navy-400">Next case</span><span className="block font-semibold">{next.title}</span></Link>}
        </aside>
      </div>
    </div>
  );
}
