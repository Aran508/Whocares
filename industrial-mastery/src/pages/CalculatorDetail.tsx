import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, Info, RotateCcw, Save } from 'lucide-react';
import { calcById } from '../calculators/defs';
import { runCalc, validate, type CalcResult } from '../calculators/engine';
import { BookmarkButton, Callout, Card, PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';
import { lessonById } from '../data/lessons';
import NotFound from './NotFound';

export default function CalculatorDetail() {
  const { id = '' } = useParams();
  const def = calcById(id);
  if (!def) return <NotFound />;
  return <CalcView key={def.id} id={def.id} />;
}

function CalcView({ id }: { id: string }) {
  const def = calcById(id)!;
  const init = () => Object.fromEntries(def.inputs.map((i) => [i.key, String(i.default)]));
  const [raw, setRaw] = useState<Record<string, string>>(init);
  const [units, setUnits] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const { recordCalc } = useProgress();

  const { values, errors } = useMemo(() => validate(def, raw, units), [def, raw, units]);
  const hasErrors = Object.keys(errors).length > 0;
  const out = useMemo(() => (hasErrors ? null : runCalc(def, values)), [def, values, hasErrors]);
  const result = out && !('error' in out) ? (out as CalcResult) : null;
  const calcError = out && 'error' in out ? out.error : null;
  const lesson = def.lessonId ? lessonById(def.lessonId) : undefined;

  const reset = () => {
    setRaw(init());
    setUnits({});
    setSaved(false);
  };
  const statusCls = result?.status === 'good' ? 'border-ok-100 bg-ok-50' : result?.status === 'warn' ? 'border-warn-100 bg-warn-50' : result?.status === 'bad' ? 'border-bad-100 bg-bad-50' : 'border-brand-100 bg-brand-50';

  return (
    <div>
      <PageHeader crumbs={[{ to: '/calculators', label: 'Calculators' }, { label: def.title }]} eyebrow={`${def.category} calculator`} title={def.title} description={def.description} actions={<BookmarkButton itemKey={`calc:${def.id}`} />} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Inputs</h2>
            <button className="btn-ghost" onClick={reset}><RotateCcw size={15} /> Reset</button>
          </div>
          <form className="mt-3 space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
            {def.inputs.map((inp) => (
              <div key={inp.key}>
                <label className="label" htmlFor={`in-${inp.key}`}>{inp.label}</label>
                {inp.type === 'list' ? (
                  <textarea id={`in-${inp.key}`} className={`input font-mono text-xs min-h-[150px] ${errors[inp.key] ? 'border-bad-500' : ''}`} value={raw[inp.key]} onChange={(e) => { setRaw((r) => ({ ...r, [inp.key]: e.target.value })); setSaved(false); }} />
                ) : inp.type === 'select' ? (
                  <select id={`in-${inp.key}`} className="input" value={raw[inp.key]} onChange={(e) => setRaw((r) => ({ ...r, [inp.key]: e.target.value }))}>
                    {inp.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input id={`in-${inp.key}`} inputMode="decimal" className={`input ${errors[inp.key] ? 'border-bad-500 focus:ring-bad-100' : ''}`} value={raw[inp.key]} onChange={(e) => { setRaw((r) => ({ ...r, [inp.key]: e.target.value })); setSaved(false); }} aria-invalid={!!errors[inp.key]} aria-describedby={errors[inp.key] ? `err-${inp.key}` : undefined} />
                    {inp.units ? (
                      <select className="input w-28" value={units[inp.key] ?? 0} onChange={(e) => setUnits((u) => ({ ...u, [inp.key]: Number(e.target.value) }))} aria-label={`${inp.label} unit`}>
                        {inp.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
                      </select>
                    ) : inp.unit ? (
                      <span className="grid min-w-[64px] place-items-center rounded-lg bg-navy-50 px-2 text-xs text-navy-500">{inp.unit}</span>
                    ) : null}
                  </div>
                )}
                {inp.help && <p className="mt-1 text-xs text-navy-400">{inp.help}</p>}
                {errors[inp.key] && <p id={`err-${inp.key}`} className="mt-1 text-xs font-medium text-bad-600">{errors[inp.key]}</p>}
              </div>
            ))}
          </form>
          <div className="mt-5 rounded-lg bg-navy-50 p-3">
            <p className="label">Formula</p>
            <p className="font-mono text-xs text-navy-800">{def.formula}</p>
          </div>
        </Card>

        <div className="space-y-4">
          {hasErrors && <Callout tone="warn" title="Check the inputs">Fix the highlighted fields to calculate the result.</Callout>}
          {calcError && <Callout tone="bad" title="Cannot calculate">{calcError}</Callout>}
          {result && (
            <>
              <div className={`rounded-xl border p-5 ${statusCls}`} role="status" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{result.headline.label}</p>
                <p className="mt-1 text-3xl font-bold text-navy-900 break-words">{result.headline.value}</p>
                {result.extra && (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {result.extra.map((e) => (
                      <div key={e.label} className="rounded-lg bg-white/70 px-3 py-2">
                        <dt className="text-xs text-navy-500">{e.label}</dt>
                        <dd className="font-semibold text-navy-900">{e.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary" disabled={saved} onClick={() => { recordCalc(def.id, def.title, `${result.headline.label}: ${result.headline.value}`); setSaved(true); }}><Save size={15} /> {saved ? 'Saved to history' : 'Save to practice history'}</button>
                </div>
              </div>
              <Card className="p-5">
                <h2 className="font-bold">Step-by-step calculation</h2>
                <ol className="mt-3 space-y-2">
                  {result.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-100 text-[11px] font-bold">{i + 1}</span><span className="font-mono text-[13px] text-navy-800 break-words min-w-0">{s}</span></li>
                  ))}
                </ol>
              </Card>
              <Callout tone="info" title="Result interpretation" icon={<Info size={15} />}>{result.interpretation}</Callout>
              {result.chart && (
                <Card className="p-5">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4c6187' }} interval={0} angle={result.chart.length > 6 ? -25 : 0} textAnchor={result.chart.length > 6 ? 'end' : 'middle'} height={result.chart.length > 6 ? 70 : 30} />
                        <YAxis tick={{ fontSize: 11, fill: '#6f84a8' }} width={60} />
                        <Tooltip formatter={(v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2 })} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chart.map((c, i) => <Cell key={i} fill={c.color ?? '#2a6fdb'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </>
          )}
          <Card className="p-5">
            <h2 className="font-bold">Industrial example</h2>
            <p className="mt-1 text-sm text-navy-700">{def.example}</p>
            <h3 className="mt-4 text-sm font-bold">Assumptions</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-navy-600">{def.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
            {lesson && <Link to={`/lessons/${lesson.id}`} className="btn-ghost mt-3 -ml-3"><BookOpen size={15} /> Learn the concept: {lesson.title}</Link>}
          </Card>
        </div>
      </div>
    </div>
  );
}
