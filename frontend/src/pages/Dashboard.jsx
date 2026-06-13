import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, AlertTriangle, Factory } from 'lucide-react';
import api from '../services/api.js';

function HealthGauge({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#3DDC84' : score >= 50 ? '#FFC93C' : '#FF5C5C';

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg width="176" height="176" className="rotate-[-90deg]">
        <circle cx="88" cy="88" r={radius} stroke="#2A343F" strokeWidth="10" fill="none" />
        <circle
          cx="88" cy="88" r={radius} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold text-4xl" style={{ color }}>{score}</div>
        <div className="text-[10px] font-mono text-mute uppercase tracking-widest mt-1">Health Score</div>
      </div>
      <div className="absolute inset-0 rounded-full pulse-ring pointer-events-none" />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-base border border-line flex items-center justify-center">
          <Icon size={16} className="text-cyan" />
        </div>
        {trend !== undefined && (
          trend >= 0
            ? <TrendingUp size={16} className="text-good" />
            : <TrendingDown size={16} className="text-bad" />
        )}
      </div>
      <div className="font-display text-xl font-bold font-mono">{value}</div>
      <div className="text-xs text-mute mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-mute font-mono mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Could not load dashboard. Check backend connection.'));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Business Brain</h1>
        <p className="text-mute text-sm font-mono">Live operational overview</p>
      </div>

      {error && (
        <div className="bg-panel border border-line rounded-2xl p-4 text-sm text-mute">
          {error}
          <div className="text-[11px] mt-1 font-mono text-amber">Connect the backend API to see live data.</div>
        </div>
      )}

      {data && (
        <>
          <div className="bg-panel border border-line rounded-2xl p-5">
            <HealthGauge score={data.business_health_score} />
            <p className="text-center text-xs text-mute mt-4 font-mono">
              {data.unresolved_alerts?.length
                ? `${data.unresolved_alerts.reduce((a, b) => a + parseInt(b.count), 0)} active alert(s) affecting score`
                : 'All systems nominal'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={TrendingUp} label="Revenue (all time)" value={fmt(data.revenue.all_time)} sub={`This month: ${fmt(data.revenue.this_month)}`} trend={1} />
            <KpiCard icon={TrendingDown} label="Expenses" value={fmt(data.expenses)} trend={-1} />
            <KpiCard icon={data.profit >= 0 ? TrendingUp : TrendingDown} label="Profit" value={fmt(data.profit)} trend={data.profit >= 0 ? 1 : -1} />
            <KpiCard icon={Package} label="Inventory value" value={fmt(data.inventory_value)} />
            <KpiCard icon={ShoppingCart} label="Open Purchase Orders" value={data.open_orders.purchase_orders} />
            <KpiCard icon={Factory} label="Open Sales Orders" value={data.open_orders.sales_orders} />
          </div>

          {data.unresolved_alerts?.length > 0 && (
            <div className="bg-panel border border-amber/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber" />
                <span className="font-semibold text-sm">Active Alerts</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {data.unresolved_alerts.map((a, i) => (
                  <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-full bg-base border border-line">
                    {a.severity.toUpperCase()} × {a.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {data.supplier_performance?.length > 0 && (
              <div className="bg-panel border border-line rounded-2xl p-4">
                <h3 className="font-semibold text-sm mb-3">Top Suppliers</h3>
                <div className="space-y-2">
                  {data.supplier_performance.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="font-mono text-cyan">{s.on_time_delivery_pct}% on-time</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!data && !error && (
        <div className="text-center py-12 text-mute font-mono text-sm">Loading business brain…</div>
      )}
    </div>
  );
}
