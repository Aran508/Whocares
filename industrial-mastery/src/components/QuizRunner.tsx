import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { Question } from '../types';
import { scoreAnswers } from '../lib/quiz';
import { Diagram } from '../diagrams';
import { lessonById } from '../data/lessons';

const TYPE_LABEL: Record<Question['type'], string> = {
  mcq: 'Multiple choice', truefalse: 'True / false', match: 'Match the terms', diagram: 'Identify the diagram', calc: 'Calculate the result', scenario: 'Scenario decision',
};

export interface QuizResult {
  correct: number;
  total: number;
  score: number;
  wrongTopics: string[];
}

export default function QuizRunner({ questions, onComplete, passMark, onRetry, title }: { questions: Question[]; onComplete: (r: QuizResult) => void; passMark: number; onRetry?: () => void; title?: string }) {
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (q.type === 'match') return Array.isArray(a) && (q.left ?? []).every((_, i) => typeof a[i] === 'number' && a[i] >= 0);
    return typeof a === 'number';
  }).length;

  const submit = () => {
    const r = scoreAnswers(questions, answers);
    setResult(r);
    onComplete(r);
    window.scrollTo({ top: (document.getElementById('quiz-top')?.offsetTop ?? 0) - 80, behavior: 'smooth' });
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    onRetry?.();
  };

  const weak = useMemo(() => {
    if (!result) return [];
    const counts = new Map<string, number>();
    result.wrongTopics.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [result]);

  return (
    <div id="quiz-top" className="space-y-4">
      {title && <h3 className="text-lg font-bold">{title}</h3>}
      {result && (
        <div className={`rounded-xl border p-4 ${result.score >= passMark ? 'border-ok-100 bg-ok-50' : 'border-warn-100 bg-warn-50'}`} role="status">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold">{result.score}% <span className="text-base font-medium text-navy-500">({result.correct} of {result.total} correct)</span></p>
              <p className="text-sm text-navy-600">{result.score >= passMark ? `Passed — the requirement is ${passMark}%.` : `Not yet passed — ${passMark}% is required. Review the explanations below and try again.`}</p>
            </div>
            <button className="btn-secondary" onClick={retry}><RotateCcw size={16} /> Retake</button>
          </div>
          {weak.length > 0 && (
            <div className="mt-3 text-sm">
              <p className="font-semibold text-navy-800">Weak topics & recommended revision</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {weak.slice(0, 8).map(([t, c]) => {
                  const l = lessonById(t);
                  return (
                    <li key={t}>
                      {l ? <Link to={`/lessons/${l.id}`} className="chip bg-white border border-warn-100 text-navy-800 hover:border-brand-300">{l.title} · {c} wrong</Link> : <span className="chip bg-white border border-warn-100">{t} · {c} wrong</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const a = answers[q.id];
          const done = !!result;
          let isCorrect = false;
          if (done) isCorrect = q.type === 'match' ? Array.isArray(a) && (q.answer as number[]).every((v, i) => a[i] === v) : a === q.answer;
          return (
            <li key={q.id} className={`card p-4 md:p-5 ${done ? (isCorrect ? 'ring-1 ring-ok-500/40' : 'ring-1 ring-bad-500/40') : ''}`}>
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">{qi + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{TYPE_LABEL[q.type]}</p>
                  <p className="mt-0.5 font-medium text-navy-900">{q.prompt}</p>
                  {q.diagram && (
                    <div className="mt-3 rounded-lg border border-navy-100 bg-navy-50/40 p-2 pointer-events-none select-none" aria-hidden>
                      <Diagram k={q.diagram} />
                    </div>
                  )}
                  {q.type === 'match' ? (
                    <div className="mt-3 space-y-2">
                      {(q.left ?? []).map((term, li) => {
                        const cur = Array.isArray(a) ? a[li] : -1;
                        const ok = done && cur === (q.answer as number[])[li];
                        return (
                          <div key={li} className="grid gap-2 md:grid-cols-[220px_1fr] md:items-center">
                            <span className="text-sm font-semibold text-navy-800">{term}</span>
                            <select
                              className={`input ${done ? (ok ? 'border-ok-500' : 'border-bad-500') : ''}`}
                              disabled={done}
                              value={cur ?? -1}
                              onChange={(e) => {
                                const arr = Array.isArray(a) ? [...a] : (q.left ?? []).map(() => -1);
                                arr[li] = Number(e.target.value);
                                setAnswers((s) => ({ ...s, [q.id]: arr }));
                              }}
                              aria-label={`Match for ${term}`}
                            >
                              <option value={-1}>Select meaning…</option>
                              {q.options.map((o, oi) => <option key={oi} value={oi}>{o}</option>)}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {q.options.map((o, oi) => {
                        const selected = a === oi;
                        const correctOpt = done && oi === q.answer;
                        const wrongSel = done && selected && oi !== q.answer;
                        return (
                          <label key={oi} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${correctOpt ? 'border-ok-500 bg-ok-50' : wrongSel ? 'border-bad-500 bg-bad-50' : selected ? 'border-brand-500 bg-brand-50' : 'border-navy-100 hover:border-navy-300'} ${done ? 'cursor-default' : ''}`}>
                            <input type="radio" className="mt-0.5 accent-brand-600" name={q.id} checked={selected} disabled={done} onChange={() => setAnswers((s) => ({ ...s, [q.id]: oi }))} />
                            <span className="flex-1">{o}</span>
                            {correctOpt && <CheckCircle2 size={18} className="text-ok-600 shrink-0" />}
                            {wrongSel && <XCircle size={18} className="text-bad-600 shrink-0" />}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {done && (
                    <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${isCorrect ? 'bg-ok-50 text-ok-700' : 'bg-bad-50 text-bad-700'}`}>
                      <p className="font-semibold">{isCorrect ? 'Correct.' : 'Incorrect.'}</p>
                      {q.type === 'match' && !isCorrect && (
                        <p className="mt-1 text-navy-700">Correct matches: {(q.left ?? []).map((t, i) => `${t} → ${q.options[(q.answer as number[])[i]]}`).join(' · ')}</p>
                      )}
                      <p className="mt-1 text-navy-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {!result && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={submit} disabled={answeredCount < questions.length}>Submit answers</button>
          <span className="text-sm text-navy-400">{answeredCount} of {questions.length} answered</span>
        </div>
      )}
    </div>
  );
}
