import React, { useEffect, useState } from 'react';
import { ClipboardList, ShoppingCart, TrendingUp, CheckCircle2, PackageCheck, X } from 'lucide-react';
import api from '../services/api.js';

const TABS = [
  { key: 'pr', label: 'Requisitions', icon: ClipboardList },
  { key: 'po', label: 'Purchase Orders', icon: ShoppingCart },
  { key: 'so', label: 'Sales Orders', icon: TrendingUp }
];

const STATUS_COLORS = {
  pending: 'text-amber border-amber/40',
  approved: 'text-good border-good/40',
  converted_to_po: 'text-cyan border-cyan/40',
  created: 'text-cyan border-cyan/40',
  sent: 'text-amber border-amber/40',
  dispatched: 'text-cyan border-cyan/40',
  partially_received: 'text-amber border-amber/40',
  received: 'text-good border-good/40',
  confirmed: 'text-cyan border-cyan/40',
  delivered: 'text-good border-good/40',
  cancelled: 'text-bad border-bad/40',
  rejected: 'text-bad border-bad/40'
};

export default function Orders() {
  const [tab, setTab] = useState('pr');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [inwardPO, setInwardPO] = useState(null);
  const [inwardRows, setInwardRows] = useState([]);
  const [inwardBusy, setInwardBusy] = useState(false);

  useEffect(() => {
    setError('');
    setData([]);
    const load = async () => {
      try {
        if (tab === 'pr') {
          const { data } = await api.get('/procurement/requisitions');
          setData(data.requisitions);
        } else if (tab === 'po') {
          const { data } = await api.get('/procurement/orders');
          setData(data.purchase_orders);
        } else {
          const { data } = await api.get('/sales/orders');
          setData(data.sales_orders);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load orders. Check backend connection.');
      }
    };
    load();
  }, [tab]);

  const approvePR = async (id) => {
    try {
      await api.post(`/procurement/requisitions/${id}/approve`);
      setData((d) => d.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not approve');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Document Flow</h1>
        <p className="text-mute text-sm font-mono">PR → PO → Dispatch → Delivery</p>
      </div>

      <div className="flex gap-2 bg-panel border border-line rounded-2xl p-1.5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              tab === key ? 'bg-cyan text-base' : 'text-mute'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-panel border border-line rounded-2xl p-4 text-sm text-mute">
          {error}
          <div className="text-[11px] mt-1 font-mono text-amber">Connect the backend API to see live orders.</div>
        </div>
      )}

      <div className="space-y-2.5">
        {data.map((doc) => (
          <div key={doc.id} className="bg-panel border border-line rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono font-semibold text-sm">
                {doc.pr_number || doc.po_number || doc.so_number}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[doc.status] || 'text-mute border-line'}`}>
                {doc.status?.replace(/_/g, ' ')}
              </span>
            </div>

            {doc.supplier_name && <div className="text-xs text-mute mb-1">Supplier: {doc.supplier_name}</div>}
            {doc.customer_name && <div className="text-xs text-mute mb-1">Customer: {doc.customer_name}</div>}
            {doc.created_by_ai && (
              <div className="text-[10px] font-mono text-amber mb-1.5">⚡ Created by AI</div>
            )}

            {doc.items && Array.isArray(doc.items) && doc.items[0]?.product_name && (
              <div className="space-y-1 mt-2">
                {doc.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs text-mute font-mono">
                    <span>{it.product_name}</span>
                    <span>×{it.quantity}{it.unit_price ? ` @ ₹${it.unit_price}` : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'pr' && doc.status === 'pending' && (
              <button
                onClick={() => approvePR(doc.id)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 bg-good/15 text-good border border-good/30 rounded-xl py-2 text-xs font-semibold"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
            )}
          </div>
        ))}

        {!error && data.length === 0 && (
          <div className="text-center py-12 text-mute font-mono text-sm">
            No records yet. Try "I need to buy 100 motors" in the AI tab.
          </div>
        )}
      </div>
    </div>
  );
}
