import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Callout, Card } from '../components/ui';
import { Fishbone } from '../diagrams/quality';

const CAUSES = [
  { id: 'c1', cat: 'Material', text: 'New chrome-rod batch from supplier B', relevant: true },
  { id: 'c2', cat: 'Method', text: 'No installation sleeve — seal slides over thread', relevant: true },
  { id: 'c3', cat: 'Measurement', text: 'Leak-test hold time shortened', relevant: true },
  { id: 'c4', cat: 'Man', text: 'Night-shift fitters are careless', relevant: false },
  { id: 'c5', cat: 'Machine', text: 'Paint booth temperature low', relevant: false },
  { id: 'c6', cat: 'Material', text: 'Seal compound hardness out of spec', relevant: true },
  { id: 'c7', cat: 'Environment', text: 'Dust in assembly area', relevant: true },
  { id: 'c8', cat: 'Man', text: 'Canteen menu changed', relevant: false },
  { id: 'c9', cat: 'Machine', text: 'Rod polishing machine worn', relevant: true },
];

const EVIDENCE = [
  { id: 'e1', q: 'Failures by shift', a: 'A: 11, B: 12, C: 11 — no shift pattern.', useful: true },
  { id: 'e2', q: 'When did failures start?', a: '3 March — the day after the first rods of supplier B batch were used.', useful: true },
  { id: 'e3', q: 'Inspect failed seals', a: 'Inner lip cut on 24 of 24 rod-seal failures.', useful: true },
  { id: 'e4', q: 'Seal hardness certificate', a: '90 Shore A — within specification.', useful: true },
  { id: 'e5', q: 'Rod thread end of new batch', a: 'Sharp thread run-out, no chamfer (old batch had a 15° chamfer).', useful: true },
  { id: 'e6', q: 'Paint DFT records', a: 'All within 80–120 µm — not related to leakage.', useful: false },
];

const WHYS = [
  { q: 'Why do cylinders leak at the rod seal?', opts: ['The seal lip is cut during assembly', 'Fitters do not care about quality', 'Test pressure is too high'], a: 0 },
  { q: 'Why is the seal lip cut?', opts: ['The seal slides over a sharp thread edge', 'The seal is the wrong colour', 'The rod is too long'], a: 0 },
  { q: 'Why is there a sharp edge?', opts: ['New rods have no chamfer at the thread run-out', 'The operator used the wrong spanner', 'Humidity is high'], a: 0 },
  { q: 'Why do new rods have no chamfer?', opts: ['The chamfer is not specified on the drawing; old supplier added it by habit', 'Supplier B is dishonest', 'Machining was rushed'], a: 0 },
];

const ACTIONS = [
  { id: 'a1', text: 'Add 15° × 2 mm chamfer to the rod drawing (ECN) and inform supplier', good: true },
  { id: 'a2', text: 'Introduce a tapered installation sleeve (Poka-Yoke)', good: true },
  { id: 'a3', text: 'Retrain all fitters and issue a warning', good: false },
  { id: 'a4', text: 'Add a second leak test after painting', good: false },
  { id: 'a5', text: 'Add chamfer check to incoming inspection plan and PFMEA', good: true },
  { id: 'a6', text: 'Lower the leak-test pressure to reduce failures', good: false },
];

export default function DefectInvestigationSim() {
  const [step, setStep] = useState(0);
  const [causes, setCauses] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [whys, setWhys] = useState<number[]>([]);
  const [root, setRoot] = useState<number | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const toggle = (arr: string[], set: (a: string[]) => void, id: string) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const causeScore = CAUSES.filter((c) => causes.includes(c.id) === c.relevant).length;
  const whyScore = whys.filter((w, i) => w === WHYS[i].a).length;
  const actScore = ACTIONS.filter((a) => actions.includes(a.id) === a.good).length;
  const total = Math.round(((causeScore / CAUSES.length) * 20 + (evidence.filter((e) => EVIDENCE.find((x) => x.id === e)!.useful).length / 5) * 15 + (whyScore / WHYS.length) * 30 + (root === 1 ? 15 : 0) + (actScore / ACTIONS.length) * 20));
  const fishCauses: Record<string, string[]> = {};
  CAUSES.filter((c) => causes.includes(c.id)).forEach((c) => (fishCauses[c.cat] = [...(fishCauses[c.cat] ?? []), c.text]));
  ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'].forEach((k) => (fishCauses[k] = fishCauses[k] ?? []));

  const steps = ['1 Possible causes', '2 Collect evidence', '3 Ask 5 Why', '4 Root cause', '5 Corrective action', 'Feedback'];
  return (
    <div className="space-y-4">
      <Callout tone="bad" title="Factory problem">Leak-test failures on 80 mm boom cylinders rose from 1.5% to 6% in two weeks. You are the production engineer. Investigate.</Callout>
      <ol className="flex flex-wrap gap-2">{steps.map((s, i) => <li key={s}><button onClick={() => i <= step && setStep(i)} className={`chip px-3 py-1 ${i === step ? 'bg-navy-900 text-white' : i < step ? 'bg-ok-50 text-ok-700' : 'bg-navy-50 text-navy-400'}`}>{s}</button></li>)}</ol>

      {step === 0 && (
        <Card className="p-5">
          <p className="font-semibold">Select the causes worth investigating (build your fishbone)</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {CAUSES.map((c) => (
              <label key={c.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${causes.includes(c.id) ? 'border-brand-500 bg-brand-50' : 'border-navy-100'}`}>
                <input type="checkbox" className="accent-brand-600" checked={causes.includes(c.id)} onChange={() => toggle(causes, setCauses, c.id)} />
                <span className="chip bg-navy-50 text-navy-600">{c.cat}</span>{c.text}
              </label>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto"><div className="min-w-[640px]"><Fishbone effect="Leak at rod seal (6%)" causes={fishCauses} /></div></div>
          <button className="btn-primary mt-3" disabled={!causes.length} onClick={() => setStep(1)}>Next: collect evidence</button>
        </Card>
      )}
      {step === 1 && (
        <Card className="p-5">
          <p className="font-semibold">Request data to verify or eliminate causes (Gemba & records)</p>
          <div className="mt-3 grid gap-2">
            {EVIDENCE.map((e) => (
              <div key={e.id} className="rounded-lg border border-navy-100 p-3">
                <div className="flex items-center justify-between gap-2 text-sm"><span className="font-medium">{e.q}</span>{!evidence.includes(e.id) && <button className="btn-secondary text-xs" onClick={() => setEvidence([...evidence, e.id])}>Request</button>}</div>
                {evidence.includes(e.id) && <p className="mt-1 text-sm text-navy-600">→ {e.a}</p>}
              </div>
            ))}
          </div>
          <button className="btn-primary mt-3" disabled={evidence.length < 2} onClick={() => setStep(2)}>Next: 5 Why</button>
        </Card>
      )}
      {step === 2 && (
        <Card className="p-5 space-y-3">
          {WHYS.map((w, i) => (i === 0 || whys[i - 1] !== undefined) && (
            <div key={i}>
              <p className="text-sm font-semibold">Why {i + 1}: {w.q}</p>
              <div className="mt-1 grid gap-1.5">
                {w.opts.map((o, oi) => (
                  <label key={oi} className={`flex items-center gap-2 rounded border px-3 py-1.5 text-sm ${whys[i] === oi ? (oi === w.a ? 'border-ok-500 bg-ok-50' : 'border-bad-500 bg-bad-50') : 'border-navy-100'}`}>
                    <input type="radio" name={`why${i}`} className="accent-brand-600" checked={whys[i] === oi} onChange={() => { const n = whys.slice(0, i); n[i] = oi; setWhys(n); }} />{o}
                  </label>
                ))}
              </div>
              {whys[i] !== undefined && whys[i] !== w.a && <p className="mt-1 text-xs text-bad-600">That answer is not supported by the evidence (or blames people). Try again — choose the factual cause.</p>}
            </div>
          ))}
          <button className="btn-primary" disabled={whys.length < WHYS.length || whys.some((w, i) => w !== WHYS[i].a)} onClick={() => setStep(3)}>Next: root cause</button>
        </Card>
      )}
      {step === 3 && (
        <Card className="p-5">
          <p className="font-semibold">State the root cause</p>
          {['Operator error on all shifts', 'Missing chamfer requirement on the drawing allowed sharp thread edges that cut the seal (no installation sleeve)', 'Seal supplier quality', 'Leak test is too strict'].map((o, i) => (
            <label key={i} className={`mt-2 flex items-center gap-2 rounded border px-3 py-2 text-sm ${root === i ? 'border-brand-500 bg-brand-50' : 'border-navy-100'}`}><input type="radio" name="root" className="accent-brand-600" checked={root === i} onChange={() => setRoot(i)} />{o}</label>
          ))}
          <button className="btn-primary mt-3" disabled={root === null} onClick={() => setStep(4)}>Next: corrective action</button>
        </Card>
      )}
      {step === 4 && (
        <Card className="p-5">
          <p className="font-semibold">Select the corrective and preventive actions</p>
          <div className="mt-2 grid gap-2">
            {ACTIONS.map((a) => (
              <label key={a.id} className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${actions.includes(a.id) ? 'border-brand-500 bg-brand-50' : 'border-navy-100'}`}><input type="checkbox" className="accent-brand-600" checked={actions.includes(a.id)} onChange={() => toggle(actions, setActions, a.id)} />{a.text}</label>
            ))}
          </div>
          <button className="btn-primary mt-3" disabled={!actions.length} onClick={() => setStep(5)}>See feedback</button>
        </Card>
      )}
      {step === 5 && (
        <Card className="space-y-3 p-5">
          <p className="text-2xl font-bold">Investigation score: {total}/100</p>
          <ul className="space-y-1 text-sm">
            {CAUSES.map((c) => { const ok = causes.includes(c.id) === c.relevant; return <li key={c.id} className="flex gap-2">{ok ? <CheckCircle2 size={16} className="text-ok-600" /> : <XCircle size={16} className="text-bad-600" />}{c.text} — {c.relevant ? 'worth investigating' : 'not a credible cause'}</li>; })}
          </ul>
          <p className="text-sm">{root === 1 ? '✓ Correct root cause — it is in the system (drawing/method), not in people.' : '✕ The root cause is the missing chamfer requirement plus no installation sleeve. Shift data showed no people pattern.'}</p>
          <ul className="space-y-1 text-sm">
            {ACTIONS.map((a) => { const ok = actions.includes(a.id) === a.good; return <li key={a.id} className="flex gap-2">{ok ? <CheckCircle2 size={16} className="text-ok-600" /> : <XCircle size={16} className="text-bad-600" />}{a.text} — {a.good ? 'effective' : 'weak or harmful'}</li>; })}
          </ul>
          <Callout tone="manager" title="MANAGER'S INSIGHT">
            <span className="text-navy-100">Containment first (100% retest, extended hold), then two root causes: occurrence (no chamfer, no sleeve) and escape (test hold too short). Prefer design and Poka-Yoke actions over retraining.</span>
          </Callout>
          <button className="btn-secondary" onClick={() => { setStep(0); setCauses([]); setEvidence([]); setWhys([]); setRoot(null); setActions([]); }}>Restart investigation</button>
        </Card>
      )}
    </div>
  );
}
