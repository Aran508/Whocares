import { Link } from 'react-router-dom';
import { Award, Calculator, ClipboardCheck, Layers, Briefcase } from 'lucide-react';
import { EXAMS } from '../lib/exams';
import { useProgress } from '../lib/progress';
import { Card, PageHeader } from '../components/ui';
import { timeAgo } from '../lib/format';

export default function AssessmentsPage() {
  const { state } = useProgress();
  const best = (id: string) => state.assessments.filter((a) => a.examId === id).reduce<number | null>((m, a) => (m === null || a.score > m ? a.score : m), null);
  const icon = (k: string) => (k === 'module' ? <Layers size={18} /> : k === 'comprehensive' ? <Award size={18} /> : k === 'case' ? <Briefcase size={18} /> : <Calculator size={18} />);
  const groups: [string, typeof EXAMS][] = [
    ['Comprehensive & practical', EXAMS.filter((e) => e.kind !== 'module')],
    ['Module-level tests', EXAMS.filter((e) => e.kind === 'module')],
  ];
  return (
    <div>
      <PageHeader eyebrow="Assessments" title="Test your knowledge" description={`Lesson quizzes live inside each lesson. Here you take module tests, the comprehensive examination, a practical case assessment and a calculation drill. Pass mark: ${state.settings.examPassMark}% (change in Settings). Every attempt draws a fresh set of questions.`} />
      {groups.map(([g, list]) => (
        <section key={g} className="mb-8">
          <h2 className="mb-3 text-lg font-bold">{g}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((e) => {
              const b = best(e.id);
              const passed = b !== null && b >= state.settings.examPassMark;
              return (
                <Link key={e.id} to={`/assessments/${e.id}`} className="card flex flex-col p-4 hover:border-brand-300">
                  <div className="flex items-center gap-2 text-brand-600">{icon(e.kind)}<span className="text-xs font-semibold uppercase tracking-wide">{e.count} questions</span></div>
                  <h3 className="mt-2 font-bold">{e.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-navy-500">{e.description}</p>
                  <p className="mt-3 text-sm">{b === null ? <span className="text-navy-400">Not attempted</span> : <span className={passed ? 'font-semibold text-ok-700' : 'font-semibold text-warn-700'}>Best {b}% · {passed ? 'Passed' : 'Not passed'}</span>}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 font-bold"><ClipboardCheck size={16} /> Assessment history</h2>
        {state.assessments.length ? (
          <table className="table-im mt-3">
            <thead><tr><th>Assessment</th><th>Score</th><th>Result</th><th>Weak topics</th><th>When</th></tr></thead>
            <tbody>
              {state.assessments.slice().reverse().slice(0, 20).map((a, i) => (
                <tr key={i}><td>{a.title}</td><td>{a.score}% ({a.correct}/{a.total})</td><td>{a.passed ? <span className="text-ok-700">Passed</span> : <span className="text-warn-700">Not passed</span>}</td><td className="text-xs">{a.weakTopics.slice(0, 3).join(', ') || '—'}</td><td className="text-xs text-navy-400">{timeAgo(a.at)}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 text-sm text-navy-400">No assessments taken yet.</p>
        )}
      </Card>
    </div>
  );
}
