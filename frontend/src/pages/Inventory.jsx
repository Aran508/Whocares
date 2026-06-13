import React, { useEffect, useState } from 'react';
import { QrCode, MapPin, Package, X, Clock } from 'lucide-react';
import api from '../services/api.js';

const STATUS_COLORS = {
  in_stock: 'text-good border-good/40',
  wip: 'text-amber border-amber/40',
  finished_goods: 'text-cyan border-cyan/40',
  dispatched: 'text-mute border-line',
  delivered: 'text-mute border-line',
  consumed: 'text-bad border-bad/40'
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get('/products/inventory')
      .then((res) => setItems(res.data.inventory))
      .catch((err) => setError(err.response?.data?.error || 'Could not load inventory. Check backend connection.'));
  }, []);

  const openDetail = async (item) => {
    setSelected(item);
    setDetail(null);
    try {
      const { data } = await api.get(`/products/inventory/${item.id}`);
      setDetail(data);
    } catch (err) {
      setDetail({ error: true });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Package size={20} className="text-cyan" /> Digital Twin
        </h1>
        <p className="text-mute text-sm font-mono">Every item, tracked end to end</p>
      </div>

      {error && (
        <div className="bg-panel border border-line rounded-2xl p-4 text-sm text-mute">
          {error}
          <div className="text-[11px] mt-1 font-mono text-amber">Connect the backend API to see live inventory.</div>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((item) => (
          <button
            key={item.id} onClick={() => openDetail(item)}
            className="w-full text-left bg-panel border border-line rounded-2xl p-4 flex items-center gap-3 hover:border-cyan transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-base border border-line flex items-center justify-center shrink-0">
              <QrCode size={18} className="text-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{item.product_name}</div>
              <div className="text-xs text-mute font-mono truncate">{item.part_number} · {item.serial_or_batch}</div>
              <div className="text-xs text-mute flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {item.current_location || 'Unassigned'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-semibold">{item.quantity}</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status] || 'text-mute border-line'}`}>
                {item.status?.replace('_', ' ')}
              </span>
            </div>
          </button>
        ))}

        {!error && items.length === 0 && (
          <div className="text-center py-12 text-mute font-mono text-sm">
            No inventory items yet. Register items via Purchase → Inward Entry.
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-panel border-t border-line rounded-t-3xl w-full max-h-[80vh] overflow-y-auto scrollbar-thin p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{selected.product_name}</h2>
              <button onClick={() => setSelected(null)} className="text-mute"><X size={20} /></button>
            </div>

            {!detail && <div className="text-mute font-mono text-sm">Loading digital twin…</div>}
            {detail?.error && <div className="text-bad font-mono text-sm">Could not load details.</div>}

            {detail && !detail.error && (
              <div className="space-y-4">
                {detail.qr_code_image && (
                  <div className="bg-base border border-line rounded-2xl p-4 flex items-center justify-center">
                    <img src={detail.qr_code_image} alt="QR code" className="w-32 h-32" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoBlock label="Quantity" value={detail.item.quantity} />
                  <InfoBlock label="Location" value={detail.item.current_location} />
                  <InfoBlock label="Status" value={detail.item.status?.replace('_', ' ')} />
                  <InfoBlock label="Batch / Serial" value={detail.item.serial_or_batch} />
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Clock size={14} /> Movement History</h3>
                  <div className="space-y-2">
                    {detail.movement_history?.length === 0 && (
                      <p className="text-mute text-xs font-mono">No movements recorded yet.</p>
                    )}
                    {detail.movement_history?.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-cyan mt-1.5 shrink-0" />
                        <div>
                          <div className="font-semibold capitalize">{h.stage.replace(/_/g, ' ')}</div>
                          <div className="text-mute font-mono">
                            {h.to_location ? `→ ${h.to_location}` : ''} {h.quantity ? `· qty ${h.quantity}` : ''}
                          </div>
                          <div className="text-mute font-mono">{new Date(h.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="bg-base border border-line rounded-xl p-3">
      <div className="text-[10px] font-mono text-mute uppercase tracking-wide">{label}</div>
      <div className="font-semibold capitalize mt-0.5">{value ?? '—'}</div>
    </div>
  );
}
