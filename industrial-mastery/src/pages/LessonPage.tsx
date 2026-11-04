import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Calculator, CheckCircle2, Clock, Download, GraduationCap, Lightbulb, Lock, Sigma, ThumbsDown, ThumbsUp, UserCog, Users } from 'lucide-react';
import { lessonById, lessonsOfModule, nextLesson, prevLesson, resolveRelated } from '../data/lessons';
import { moduleById } from '../data/modules';
import { buildLessonQuiz } from '../lib/quiz';
import { useProgress, isLessonComplete } from '../lib/progress';
import { BookmarkButton, Callout, Card, LevelBadge, PageHeader, SpeakButton, downloadFile, toCsv } from '../components/ui';
import QuizRunner from '../components/QuizRunner';
import { Diagram, HydraulicCylinder, TimwoodsGallery } from '../diagrams';
import { Scene, sceneFor } from '../illustrations/Scenes';
import { calcById } from '../calculators/defs';
import NotFound from './NotFound';
import type { Lesson } from '../types';

const SECTIONS = [
  ['what', 'What is it?'],
  ['why', 'Why do we need it?'],
  ['when', 'When do we use it?'],
  ['how', 'How does it work?'],
  ['factory', 'What it looks like in a factory'],
  ['hydraulic', 'Hydraulic cylinder example'],
  ['diagram', 'Diagram & illustration'],
  ['implement', 'Practical implementation'],
  ['calc', 'How do we calculate it?'],
  ['worksheet', 'Sample worksheet'],
  ['mistakes', 'What can go wrong?'],
  ['beginner', 'Beginner understanding'],
  ['manager', "Manager's insight"],
  ['proscons', 'Advantages & limitations'],
  ['related', 'Related methods'],
  ['test', 'Knowledge test'],
] as const;

function Section({ id, n, title, children, icon }: { id: string; n: number; title: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">{n}</span>
        <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide text-navy-800">{icon}{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Pronunciation shown when the lesson has none: spell out a leading/parenthesised acronym. */
function pronunciationOf(l: Lesson): string {
  if (l.pronunciation) return l.pronunciation;
  const m = l.title.match(/\(([A-Z0-9&]{2,6})\)/) ?? l.title.match(/^([A-Z0-9]{2,6})\b/);
  if (m) return m[1].replace(/[^A-Z0-9]/g, '').split('').join('-') + ' (spell the letters)';
  return 'Plain English — as written';
}

function managerQuestions(l: Lesson): string[] {
  const q = [
    `Where is ${l.title} visible on the shop floor today, and who owns it on each shift?`,
    `Are we making this mistake: "${l.mistakes[0].replace(/\.$/, '')}"? Show me the evidence.`,
  ];
  if (l.formula) q.push(`What is our current value (${l.formula.expr.split('=')[0].trim()}), what is the trend, and what is the target?`);
  if (l.limitations[0]) q.push(`How are we managing the limitation — ${l.limitations[0].charAt(0).toLowerCase() + l.limitations[0].slice(1).replace(/\.$/, '')}?`);
  if (l.related[0]) q.push(`Should we combine it with ${l.related[0]} to make the result stick?`);
  return q;
}

export default function LessonPage() {
  const { id = '' } = useParams();
  const lesson = lessonById(id);
  const { state, visitLesson, addLessonTime, setStudied, recordQuiz } = useProgress();
  const [reachedEnd, setReachedEnd] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // track visit + time on page (only while the tab is visible)
  useEffect(() => {
    if (!lesson) return;
    visitLesson(lesson.id, lesson.moduleId);
    setReachedEnd(false);
    setAttempt(0);
    let secs = 0;
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') secs++;
      if (secs >= 30) {
        addLessonTime(lesson.id, secs);
        secs = 0;
      }
    }, 1000);
    return () => {
      window.clearInterval(t);
      if (secs > 0) addLessonTime(lesson.id, secs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const ob = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setReachedEnd(true), { threshold: 0.1 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [lesson?.id]);

  const siblings = useMemo(() => (lesson ? lessonsOfModule(lesson.moduleId) : []), [lesson]);
  const questions = useMemo(() => (lesson ? buildLessonQuiz(lesson, siblings, attempt ? `#${attempt}` : '') : []), [lesson, siblings, attempt]);

  if (!lesson) return <NotFound />;
  const m = moduleById(lesson.moduleId)!;
  const lp = state.lessons[lesson.id];
  const complete = isLessonComplete(lp, state.settings);
  const calc = lesson.formula?.calculatorId ? calcById(lesson.formula.calculatorId) : undefined;
  const prev = prevLesson(lesson.id), next = nextLesson(lesson.id);
  const studied = !!lp?.studied;
  const sections = SECTIONS.filter(([k]) => k !== 'calc' || lesson.formula);
  let n = 0;
  const num = () => ++n;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_240px]">
      <article className="min-w-0 space-y-8">
        <div>
          <PageHeader
            crumbs={[{ to: '/academy', label: 'Academy' }, { to: `/modules/${m.slug}`, label: m.title }, { label: lesson.title }]}
            eyebrow={`Module ${m.id} · Lesson ${lesson.order}`}
            title={lesson.title}
            actions={<BookmarkButton itemKey={lesson.id} />}
          />
          <Card className="grid gap-4 p-4 md:grid-cols-4">
            <div>
              <p className="label">Full form</p>
              <p className="text-sm font-medium">{lesson.fullForm ?? '— (not an abbreviation)'}</p>
            </div>
            <div>
              <p className="label">Pronunciation</p>
              <p className="flex items-center gap-1 text-sm font-medium">{pronunciationOf(lesson)}<SpeakButton text={pronunciationOf(lesson).startsWith('Plain') ? lesson.title : pronunciationOf(lesson).replace(/-/g, ' ').replace(/\(.*?\)/g, '')} label={lesson.title} /></p>
            </div>
            <div>
              <p className="label">Difficulty</p>
              <LevelBadge level={lesson.level} />
            </div>
            <div>
              <p className="label">Status</p>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {complete ? <><CheckCircle2 size={16} className="text-ok-600" /> Completed</> : studied ? 'Studied — test pending' : lp ? 'In progress' : 'Not started'}
                <span className="ml-auto flex items-center gap-1 text-xs text-navy-400"><Clock size={13} />{lesson.minutes} min</span>
              </p>
            </div>
          </Card>
        </div>

        <Section id="what" n={num()} title="What is it?" icon={<GraduationCap size={16} />}>
          <p className="text-[17px] leading-relaxed text-navy-800">{lesson.definition}</p>
        </Section>
        <Section id="why" n={num()} title="Why do we need it?"><p className="leading-relaxed text-navy-700">{lesson.why}</p></Section>
        <Section id="when" n={num()} title="When do we use it?"><p className="leading-relaxed text-navy-700">{lesson.when}</p></Section>
        <Section id="how" n={num()} title="How does it work? — step by step">
          <ol className="space-y-2">
            {lesson.steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-navy-100 bg-white p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="text-sm leading-relaxed text-navy-800">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
        <Section id="factory" n={num()} title="Real manufacturing example">
          <div className="grid gap-4 md:grid-cols-[1fr_320px]">
            <Callout tone="info">{lesson.example}</Callout>
            <Scene k={sceneFor(lesson.title, lesson.moduleId)} />
          </div>
        </Section>
        <Section id="hydraulic" n={num()} title="Hydraulic cylinder industry example">
          <Callout tone="ok">{lesson.hydraulicExample}</Callout>
          <div className="mt-3 rounded-xl border border-navy-100 bg-white p-3"><HydraulicCylinder /></div>
        </Section>
        <Section id="diagram" n={num()} title="Diagram & illustration">
          <Card className="overflow-x-auto p-3 md:p-4">
            <div className="min-w-[520px]"><Diagram k={lesson.diagram} lesson={lesson} /></div>
          </Card>
          {lesson.tags.includes('timwoods') && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">The 8 wastes — one illustrated example each</p>
              <TimwoodsGallery />
            </div>
          )}
          {lesson.diagram === 'steps' && <p className="mt-2 text-xs text-navy-400">Flow diagram generated from this lesson's steps.</p>}
        </Section>
        <Section id="implement" n={num()} title="Practical implementation">
          <ul className="grid gap-2 md:grid-cols-2">
            {lesson.implementation.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg bg-white p-3 text-sm border border-navy-100"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ok-500" />{s}</li>
            ))}
          </ul>
        </Section>
        {lesson.formula && (
          <Section id="calc" n={num()} title="How do we calculate it?" icon={<Sigma size={16} />}>
            <Card className="p-4">
              <p className="rounded-lg bg-navy-900 px-4 py-3 font-mono text-sm text-white">{lesson.formula.expr}</p>
              {lesson.formula.vars.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-navy-700">{lesson.formula.vars.map((v) => <li key={v}>{v}</li>)}</ul>
              )}
              <p className="mt-3 text-sm"><span className="font-semibold">Worked example: </span>{lesson.formula.worked}</p>
              {calc && <Link to={`/calculators/${calc.id}`} className="btn-secondary mt-3"><Calculator size={16} /> Try it in the {calc.title}</Link>}
            </Card>
          </Section>
        )}
        <Section id="worksheet" n={num()} title="Sample worksheet / template">
          <Card className="overflow-x-auto">
            <table className="table-im min-w-[640px]">
              <thead><tr>{lesson.worksheet.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{lesson.worksheet.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </Card>
          <button className="btn-ghost mt-2" onClick={() => downloadFile(`${lesson.id}-worksheet.csv`, toCsv(lesson.worksheet.columns, lesson.worksheet.rows), 'text/csv')}><Download size={15} /> Download worksheet (CSV)</button>
        </Section>
        <Section id="mistakes" n={num()} title="What can go wrong? — common mistakes" icon={<AlertTriangle size={16} className="text-warn-500" />}>
          <ul className="space-y-2">
            {lesson.mistakes.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-warn-100 bg-warn-50 p-3 text-sm"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn-600" />{s}</li>
            ))}
          </ul>
        </Section>
        <Section id="beginner" n={num()} title="Beginner understanding" icon={<Lightbulb size={16} className="text-warn-500" />}>
          <Callout tone="warn">{lesson.beginner}</Callout>
        </Section>
        <Section id="manager" n={num()} title="Manager's insight" icon={<UserCog size={16} />}>
          <Callout tone="manager" title="MANAGER'S INSIGHT" icon={<UserCog size={16} />}>
            <p className="text-navy-100">{lesson.manager}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand-200">Questions an experienced manager asks</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-navy-100">{managerQuestions(lesson).map((q) => <li key={q}>{q}</li>)}</ul>
          </Callout>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-navy-100 bg-white p-4 text-sm"><p className="flex items-center gap-2 font-bold"><Users size={15} /> Operator's view</p><p className="mt-1 text-navy-600">Follows the standard for {lesson.title} at the workstation, records data honestly and raises a flag (Andon/escalation) when something is abnormal.</p></div>
            <div className="rounded-xl border border-navy-100 bg-white p-4 text-sm"><p className="flex items-center gap-2 font-bold"><UserCog size={15} /> Manager's view</p><p className="mt-1 text-navy-600">Owns the system around {lesson.title}: sets targets, provides resources and training, reviews results at the Gemba and removes the obstacles operators cannot remove themselves.</p></div>
          </div>
        </Section>
        <Section id="proscons" n={num()} title="Advantages & limitations">
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4"><p className="flex items-center gap-2 font-semibold text-ok-700"><ThumbsUp size={16} /> Advantages</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{lesson.advantages.map((a) => <li key={a}>{a}</li>)}</ul></Card>
            <Card className="p-4"><p className="flex items-center gap-2 font-semibold text-bad-700"><ThumbsDown size={16} /> Limitations</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{lesson.limitations.map((a) => <li key={a}>{a}</li>)}</ul></Card>
          </div>
        </Section>
        <Section id="related" n={num()} title="Related industrial methods">
          <div className="flex flex-wrap gap-2">
            {lesson.related.map((r) => {
              const rl = resolveRelated(r);
              return rl && rl.id !== lesson.id ? (
                <Link key={r} to={`/lessons/${rl.id}`} className="chip border border-brand-200 bg-white px-3 py-1 text-sm text-brand-700 hover:bg-brand-50">{rl.title}</Link>
              ) : (
                <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="chip border border-navy-200 bg-white px-3 py-1 text-sm text-navy-700 hover:bg-navy-50">{r}</Link>
              );
            })}
          </div>
        </Section>

        <div ref={endRef} className="h-px" aria-hidden />
        <Section id="test" n={num()} title="Five-question knowledge test">
          <Card className="mb-4 p-4">
            <label className={`flex items-start gap-3 ${reachedEnd || studied ? '' : 'opacity-60'}`}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-ok-600" checked={studied} disabled={!reachedEnd && !studied} onChange={(e) => setStudied(lesson.id, e.target.checked)} />
              <span className="text-sm">
                <span className="font-semibold">I have studied all sections of this lesson.</span>
                <span className="block text-navy-500">{reachedEnd || studied ? 'Completion also needs a quiz score of at least ' + state.settings.passMark + '%.' : 'Scroll through the whole lesson to enable this.'}</span>
              </span>
            </label>
          </Card>
          {studied ? (
            <QuizRunner
              key={`${lesson.id}-${attempt}`}
              questions={questions}
              passMark={state.settings.passMark}
              onComplete={(r) => recordQuiz(lesson.id, r.correct, r.total, lesson.title)}
              onRetry={() => setAttempt((a) => a + 1)}
            />
          ) : (
            <Callout tone="info" title="Test locked" icon={<Lock size={15} />}>Confirm you have studied all sections to unlock the knowledge test. Opening a lesson never marks it complete.</Callout>
          )}
          {lp?.quiz && <p className="mt-3 text-sm text-navy-500">Best score: <span className="font-semibold text-navy-800">{lp.quiz.score}%</span> after {lp.attempts} attempt{lp.attempts === 1 ? '' : 's'}.{complete && ' Lesson completed ✓'}</p>}
        </Section>

        <nav className="flex flex-col gap-3 border-t border-navy-100 pt-6 md:flex-row md:justify-between" aria-label="Lesson navigation">
          {prev ? <Link to={`/lessons/${prev.id}`} className="btn-secondary"><ArrowLeft size={16} /> {prev.title}</Link> : <span />}
          {next && <Link to={`/lessons/${next.id}`} className="btn-primary">{next.title} <ArrowRight size={16} /></Link>}
        </nav>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-20 card p-4">
          <p className="section-title">On this page</p>
          <ol className="mt-2 space-y-1 text-sm">
            {sections.map(([k, t], i) => (
              <li key={k}><a href={`#${k}`} className="flex gap-2 rounded px-1.5 py-1 text-navy-600 hover:bg-navy-50 hover:text-brand-700"><span className="w-5 text-navy-300">{i + 1}</span>{t}</a></li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
