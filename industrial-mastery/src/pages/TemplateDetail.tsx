import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileDown, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { templateById } from '../data/templates';
import { BookmarkButton, Card, PageHeader, downloadFile, toCsv, toExcelHtml } from '../components/ui';
import { kv } from '../lib/storage';
import { useProgress } from '../lib/progress';
import NotFound from './NotFound';

export default function TemplateDetail() {
  const { id = '' } = useParams();
  const t = templateById(id);
  if (!t) return <NotFound />;
  return <Editor key={t.id} id={t.id} />;
}

function Editor({ id }: { id: string }) {
  const t = templateById(id)!;
  const { log } = useProgress();
  const [rows, setRows] = useState<string[][]>(() => kv.get(`template:${t.id}`, t.rows));
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (dirty) kv.set(`template:${t.id}`, rows);
  }, [rows, dirty, t.id]);

  const set = (r: number, c: number, v: string) => {
    setDirty(true);
    setRows((rs) => rs.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)));
  };
  const addRow = () => { setDirty(true); setRows((rs) => [...rs, t.columns.map(() => '')]); };
  const delRow = (r: number) => { setDirty(true); setRows((rs) => rs.filter((_, i) => i !== r)); };
  const reset = () => { kv.remove(`template:${t.id}`); setDirty(false); setRows(t.rows); };
  const exported = (kind: string) => log({ kind: 'template', ref: t.id, label: `${t.title} (${kind})` });

  return (
    <div>
      <PageHeader
        crumbs={[{ to: '/templates', label: 'Templates' }, { label: t.title }]}
        eyebrow={`${t.department} template`}
        title={t.title}
        description={t.purpose}
        actions={<BookmarkButton itemKey={`template:${t.id}`} />}
      />
      <Card className="mb-4 p-5 no-print">
        <h2 className="font-bold">Instructions</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700">{t.instructions.map((i) => <li key={i}>{i}</li>)}</ul>
      </Card>
      <div className="mb-3 flex flex-wrap gap-2 no-print">
        <button className="btn-secondary" onClick={addRow}><Plus size={15} /> Add row</button>
        <button className="btn-secondary" onClick={() => { downloadFile(`${t.id}.csv`, toCsv(t.columns, rows), 'text/csv;charset=utf-8'); exported('CSV'); }}><Download size={15} /> CSV</button>
        <button className="btn-secondary" onClick={() => { downloadFile(`${t.id}.xls`, toExcelHtml(t.title, t.columns, rows), 'application/vnd.ms-excel'); exported('Excel'); }}><FileDown size={15} /> Excel</button>
        <button className="btn-secondary" onClick={() => { exported('PDF'); window.print(); }}><Printer size={15} /> Print / PDF</button>
        <button className="btn-ghost" onClick={reset}><RotateCcw size={15} /> Reset to sample</button>
      </div>
      <h2 className="print-only mb-2 text-xl font-bold">{t.title}</h2>
      <Card className="overflow-x-auto">
        <table className="table-im min-w-[720px]">
          <thead>
            <tr>
              {t.columns.map((c) => <th key={c}>{c}</th>)}
              <th className="w-10 no-print"><span className="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {t.columns.map((c, ci) => (
                  <td key={ci} className="p-1">
                    <input className="w-full min-w-[80px] rounded border border-transparent bg-transparent px-2 py-1 text-sm hover:border-navy-200 focus:border-brand-500 focus:bg-white focus:outline-none" value={r[ci] ?? ''} onChange={(e) => set(ri, ci, e.target.value)} aria-label={`${c} row ${ri + 1}`} />
                  </td>
                ))}
                <td className="no-print p-1"><button className="btn-ghost px-2 text-bad-600" onClick={() => delRow(ri)} aria-label={`Delete row ${ri + 1}`}><Trash2 size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 text-xs text-navy-400 no-print">{dirty ? 'Your changes are saved automatically in this browser.' : 'Showing sample data. Edit any cell to start your own version.'}</p>
    </div>
  );
}
