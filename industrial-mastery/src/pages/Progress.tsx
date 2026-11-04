import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { useStats } from '../lib/stats';
import { LESSONS, lessonById } from '../data/lessons';
import { CASE_STUDIES } from '../data/caseStudies';
import { Card, PageHeader, ProgressBar, Stat } from '../components/ui';
import { LEVELS } from '../lib/levels';
import { timeAgo } from '../lib/format';

export default function ProgressPage() {
  const { state } = useProgress();
  const stats = useStats();
  const quizzes = Object.entries(state.lessons).filter(([, l]) => l.quiz).sort((a, b) => (b[1].quiz!.at - a[1].quiz!.at));
  const solved = Object.values(state.casesSolved).filter((c) => c.correct).length;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My learning progress" title="Progress report" description="Completion requires studying the lesson and passing its knowledge test. All data is stored in this browser; export it from Settings to keep a backup." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Lessons completed" value={`${stats.completedCount}/${stats.totalLessons}`} />
        <Stat label="Quiz average" value={stats.quizCount ? `${stats.quizAvg}%` : '—'} />
        <Stat label="Assessments passed" value={stats.passedExams} />
        <Stat label="Cases solved" value={`${solved}/${CASE_STUDIES.length}`} />
        <Stat label="Learning hours" value={stats.hours.toFixed(1)} />
      </div>
      <Card className="p-5">
        <h2 className="font-bold">Level requirements</h2>
        <table className="table-im mt-3">
          <thead><tr><th>Level</th><th>Lessons</th><th>Passed assessments</th><th>Comprehensive exam</th><th>Status</th></tr></thead>
          <tbody>
            {LEVELS.map((l) => (
              <tr key={l.level}>
                <td className="font-semibold">{l.level}. {l.name}</td><td>{l.minLessons}</td><td>{l.minAssessments}</td><td>{l.requiresComprehensive ? 'Required' : '—'}</td>
                <td>{l.level <= stats.level.current.level ? <span className="flex items-center gap-1 text-ok-700"><CheckCircle2 size={15} /> Achieved</span> : <span className="text-navy-400">Locked</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Completion by course</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {stats.perModule.map((m) => (
            <Link key={m.module.id} to={`/modules/${m.module.slug}`} className="block rounded-lg border border-navy-100 p-3 hover:border-brand-300">
              <div className="flex justify-between text-sm"><span className="font-semibold">{m.module.title}</span><span className="text-navy-500">{m.done}/{m.total}</span></div>
              <ProgressBar value={m.pct} color="bg-ok-500" className="mt-2" label={m.module.title} />
            </Link>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">Quiz scores</h2>
          {quizzes.length ? (
            <ul className="mt-3 max-h-80 divide-y divide-navy-100 overflow-y-auto">
              {quizzes.map(([id, l]) => (
                <li key={id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/lessons/${id}`} className="truncate hover:text-brand-700">{lessonById(id)?.title ?? id}</Link>
                  <span className={l.quiz!.score >= state.settings.passMark ? 'font-semibold text-ok-700' : 'font-semibold text-warn-700'}>{l.quiz!.score}%</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-navy-400">No quizzes taken yet.</p>}
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Learning history</h2>
          {state.activity.length ? (
            <ul className="mt-3 max-h-80 divide-y divide-navy-100 overflow-y-auto">
              {state.activity.filter((a) => a.kind !== 'lesson').slice().reverse().slice(0, 40).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate"><span className="chip mr-2 bg-navy-50 text-navy-600">{a.kind}</span>{a.kind === 'case' ? CASE_STUDIES.find((c) => c.id === a.ref)?.title : a.label}</span>
                  <span className="shrink-0 text-xs text-navy-400">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-navy-400">Your activity will appear here.</p>}
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="font-bold">All lessons</h2>
        <p className="text-sm text-navy-500">{LESSONS.length} lessons · green = completed, blue = started</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {LESSONS.map((l) => {
            const done = stats.completed.has(l.id), started = !!state.lessons[l.id];
            return <Link key={l.id} to={`/lessons/${l.id}`} title={l.title} className={`h-4 w-4 rounded-sm ${done ? 'bg-ok-500' : started ? 'bg-brand-300' : 'bg-navy-100 hover:bg-navy-200'}`} aria-label={`${l.title}: ${done ? 'completed' : started ? 'started' : 'not started'}`} />;
          })}
        </div>
      </Card>
    </div>
  );
}
