import { useMemo, useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar } from 'recharts';
import { Shuffle } from 'lucide-react';
import { simulateInventory } from './logic';
import { Callout, Card } from '../components/ui';

export default function InventorySim() {
  const [p, setP] = useState({ demandMean: 40, demandSd: 10, leadTime: 6, rop: 300, orderQty: 400, initial: 450, seed: 7 });
  const z = 1.65;
  const ss = Math.round(z * p.demandSd * Math.sqrt(p.leadTime));
  const suggestedRop = p.demandMean * p.leadTime + ss;
  const maxStock = suggestedRop + p.orderQty;
  const r = useMemo(() => simulateInventory({ ...p, days: 60, maxStock }), [p, maxStock]);
  const field = (k: keyof typeof p, label: string, min: number, max: number, step = 1) => (
    <div key={k}>
      <div className="flex justify-between text-sm"><label className="font-medium">{label}</label><span className="font-semibold">{p[k]}</span></div>
      <input type="range" min={min} max={max} step={step} value={p[k]} onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })} className="w-full accent-brand-600" aria-label={label} />
    </div>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="space-y-3 p-5">
        <p className="text-sm text-navy-500">Seal kits for the assembly line — 60 working days.</p>
        {field('demandMean', 'Average daily consumption', 10, 100)}
        {field('demandSd', 'Demand variability (σ per day)', 0, 40)}
        {field('leadTime', 'Supplier lead time (days)', 1, 20)}
        {field('rop', 'Reorder point (units)', 0, 1200, 10)}
        {field('orderQty', 'Order quantity (units)', 50, 1500, 10)}
        {field('initial', 'Opening stock', 0, 1500, 10)}
        <div className="rounded-lg bg-navy-50 p-3 text-xs text-navy-600">
          Safety stock at 95% = 1.65 × {p.demandSd} × √{p.leadTime} = <b>{ss}</b><br />
          Suggested ROP = {p.demandMean} × {p.leadTime} + {ss} = <b>{suggestedRop}</b>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex-1" onClick={() => setP({ ...p, rop: suggestedRop })}>Use suggested ROP</button>
          <button className="btn-secondary" onClick={() => setP({ ...p, seed: p.seed + 1 })} title="New random demand pattern"><Shuffle size={15} /></button>
        </div>
      </Card>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[['Fill rate', `${r.fillRate.toFixed(1)}%`], ['Stock-out days', r.stockoutDays], ['Units short', r.totalShort], ['Avg. stock', Math.round(r.avgStock)], ['Orders placed', r.orders]].map(([l, v]) => (
            <div key={l as string} className="card p-3"><p className="text-xs text-navy-400">{l}</p><p className="text-lg font-bold">{v}</p></div>
          ))}
        </div>
        <Card className="p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={r.days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={45} />
                <Tooltip />
                <Area type="stepAfter" dataKey="stock" name="Stock on hand" stroke="#2a6fdb" fill="#d9e8ff" />
                <Bar dataKey="shortage" name="Shortage" fill="#d63a3a" />
                <Bar dataKey="received" name="Receipt" fill="#1f9d5c" />
                <Line type="monotone" dataKey="demand" name="Daily demand" stroke="#e5830f" dot={false} strokeWidth={1.5} />
                <ReferenceLine y={p.rop} stroke="#d63a3a" strokeDasharray="6 4" label={{ value: 'ROP', fontSize: 11, position: 'insideTopLeft' }} />
                <ReferenceLine y={ss} stroke="#e5830f" strokeDasharray="3 3" label={{ value: 'Safety stock', fontSize: 11, position: 'insideBottomLeft' }} />
                <ReferenceLine y={maxStock} stroke="#4c6187" strokeDasharray="2 4" label={{ value: 'Max', fontSize: 11, position: 'insideTopLeft' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Callout tone={r.stockoutDays ? 'bad' : r.excessDays > 15 ? 'warn' : 'ok'} title="What happened?">
          {r.stockoutDays ? `Shortages on ${r.stockoutDays} days stopped assembly. Raise the reorder point (safety stock), shorten the lead time, or order larger quantities.` : r.excessDays > 15 ? `No shortages, but stock was above the maximum on ${r.excessDays} days — excess inventory ties up cash. Lower the ROP or order quantity.` : 'Balanced: no shortages and limited excess. This is the target of inventory management.'} Average cover is {r.daysOfCover.toFixed(1)} days.
        </Callout>
      </div>
    </div>
  );
}
