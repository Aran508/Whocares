import { useRef, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { Callout, Card, PageHeader, downloadFile } from '../components/ui';
import type { ProgressState } from '../types';

export default function SettingsPage() {
  const { state, updateSettings, reset, importState } = useProgress();
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as ProgressState;
      if (!data || typeof data !== 'object' || !data.lessons || !Array.isArray(data.bookmarks)) throw new Error('bad');
      importState(data);
      setMsg('Progress imported successfully.');
    } catch {
      setMsg('That file is not a valid Industrial Mastery progress export.');
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader eyebrow="Settings" title="Settings & data" />
      <Card className="space-y-4 p-5">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" className="input" value={state.settings.learnerName} onChange={(e) => updateSettings({ learnerName: e.target.value })} placeholder="Shown on the dashboard" />
        </div>
        <div>
          <label className="label" htmlFor="pass">Lesson completion pass mark: {state.settings.passMark}%</label>
          <input id="pass" type="range" min={60} max={100} step={20} value={state.settings.passMark} onChange={(e) => updateSettings({ passMark: Number(e.target.value) })} className="w-full accent-brand-600" />
          <p className="text-xs text-navy-400">Each lesson test has 5 questions, so the pass mark moves in 20% steps (60% = 3 of 5, 80% = 4 of 5, 100% = 5 of 5). Lesson completion is recalculated immediately.</p>
        </div>
        <div>
          <label className="label" htmlFor="exam">Assessment pass mark: {state.settings.examPassMark}%</label>
          <input id="exam" type="range" min={50} max={90} step={5} value={state.settings.examPassMark} onChange={(e) => updateSettings({ examPassMark: Number(e.target.value) })} className="w-full accent-brand-600" />
        </div>
      </Card>
      <Card className="space-y-3 p-5">
        <h2 className="font-bold">Your data</h2>
        <p className="text-sm text-navy-500">Progress is stored locally in this browser (localStorage). Export a backup to move it to another device.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => downloadFile(`industrial-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json')}><Download size={15} /> Export progress</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Import progress</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          <button className="btn-secondary text-bad-600" onClick={() => { if (window.confirm('Delete all progress, quiz scores and bookmarks? This cannot be undone.')) { reset(); setMsg('All progress has been reset.'); } }}><Trash2 size={15} /> Reset all progress</button>
        </div>
        {msg && <Callout tone="info">{msg}</Callout>}
      </Card>
    </div>
  );
}
