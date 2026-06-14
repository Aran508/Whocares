import React, { useEffect, useState } from 'react';
import { QrCode, MapPin, Package, X, Clock, Plus, ChevronRight } from 'lucide-react';
import api from '../services/api.js';

const STATUS_COLORS = {
  in_stock: 'text-good border-good/40',
  wip: 'text-amber border-amber/40',
  finished_goods: 'text-cyan border-cyan/40',
  dispatched: 'text-mute border-line',
  delivered: 'text-mute border-line',
  consumed: 'text-bad border-bad/40'
};

const STAGES = [
  'purchase_request','purchase_order','supplier_dispatch','inward_entry',
  'inventory_storage','production_consumption','work_in_progress',
  'finished_goods','outward_dispatch','customer_delivery','payment_collection'
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [mode, setMode] = useState('list'); // list | inward | addProduct
  const [form, setForm] = useState({ product_id: '', serial_or_batch: '', quantity: '', current_location: 'Warehouse A' });
  const [prodForm, setProdForm] = useState({ part_number: '', name: '', category: '', unit: 'pcs', reorder_level: '10', standard_cost: '0' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/products/inventory').then((r) => setItems(r.data.inventory)).catch(() => setError(''));
    api.get('/products').then((r) => setProducts(r.data.products)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (item) => {
    setSelected(item); setDetail(null);
    try { const { data } = await api.get(`/products/inventory/${item.id}`); setDetail(data); }
    catch { setDetail({ error: true }); }
  };

  const submitInward = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess('');
    try {
      await api.post('/procurement/inward', {
        items: [{ product_id: parseInt(form.product_id), quantity: parseFloat(form.quantity), serial_or_batch: form.serial_or_batch || `BATCH-${Date.now()}`, current_location: form.current_location }]
      });
      setSuccess('✅ Inward entry recorded. Digital Twin created.');
      setForm({ product_id: '', serial_or_batch: '', quantity: '', current_location: 'Warehouse A' });
      load();
    } catch (err) {
      setSuccess('❌ ' + (err.response?.data?.error || 'Failed to save'));
    } finally { setSaving(false); }
  };

  const submitProduct = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess('');
    try {
      await api.post('/products', prodForm);
      setSuccess('✅ Product registered successfully.');
      setProdForm({ part_number: '', name: '', category: '', unit: 'pcs', reorder_level: '10', standard_cost: '0' });
      load();
    } catch (err) {
      setSuccess('❌ ' + (err.response?.data?.error || 'Failed to save'));
    } finally { setSaving(false); }
  };

  if (mode === 'addProduct') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setMode('list'); setSuccess(''); }} className="text-mute"><X size={20} /></button>
        <div><h1 className="font-display text-xl font-bold">Register Product</h1>
          <p className="text-mute text-xs font-mono">Add a new product to your master catalogue</p></div>
      </div>
      <form onSubmit={submitProduct} className="bg-panel border border-line rounded-2xl p-5 space-y-3.5">
        <Field label="Part Number *" value={prodForm.part_number} onChange={v => setProdForm(f=>({...f,part_number:v}))} placeholder="e.g. MOT-001" required />
        <Field label="Product Name *" value={prodForm.name} onChange={v => setProdForm(f=>({...f,name:v}))} placeholder="e.g. 12V DC Motor" required />
        <Field label="Category" value={prodForm.category} onChange={v => setProdForm(f=>({...f,category:v}))} placeholder="e.g. Electrical" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit" value={prodForm.unit} onChange={v => setProdForm(f=>({...f,unit:v}))} placeholder="pcs" />
          <Field label="Reorder Level" type="number" value={prodForm.reorder_level} onChange={v => setProdForm(f=>({...f,reorder_level:v}))} />
        </div>
        <Field label="Standard Cost (₹)" type="number" value={prodForm.standard_cost} onChange={v => setProdForm(f=>({...f,standard_cost:v}))} />
        {success && <p className={`text-sm font-mono ${success.startsWith('✅') ? 'text-good' : 'text-bad'}`}>{success}</p>}
        <button type="submit" disabled={saving} className="w-full bg-cyan text-base font-semibold rounded-xl py-2.5 disabled:opacity-60">
          {saving ? 'Saving…' : 'Register Product'}
        </button>
      </form>
    </div>
  );

  if (mode === 'inward') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setMode('list'); setSuccess(''); }} className="text-mute"><X size={20} /></button>
        <div><h1 className="font-display text-xl font-bold">Inward Entry</h1>
          <p className="text-mute text-xs font-mono">Record received material — creates Digital Twin automatically</p></div>
      </div>
      {products.length === 0 && (
        <div className="bg-panel border border-amber/40 rounded-2xl p-4 text-sm text-amber font-mono">
          No products found. Register a product first before recording inward entries.
          <button onClick={() => setMode('addProduct')} className="block mt-2 text-cyan underline text-xs">+ Register Product</button>
        </div>
      )}
      <form onSubmit={submitInward} className="bg-panel border border-line rounded-2xl p-5 space-y-3.5">
        <div>
          <label className="block text-xs font-mono text-mute mb-1.5 uppercase tracking-wide">Product *</label>
          <select required value={form.product_id} onChange={e => setForm(f=>({...f,product_id:e.target.value}))}
            className="w-full bg-base border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors">
            <option value="">Select product…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.part_number})</option>)}
          </select>
        </div>
        <Field label="Batch / Serial No." value={form.serial_or_batch} onChange={v => setForm(f=>({...f,serial_or_batch:v}))} placeholder="e.g. BATCH-2026-001 (auto-generated if blank)" />
        <Field label="Quantity Received *" type="number" value={form.quantity} onChange={v => setForm(f=>({...f,quantity:v}))} placeholder="0" required />
        <Field label="Storage Location *" value={form.current_location} onChange={v => setForm(f=>({...f,current_location:v}))} placeholder="e.g. Warehouse A, Shelf B3" required />
        {success && <p className={`text-sm font-mono ${success.startsWith('✅') ? 'text-good' : 'text-bad'}`}>{success}</p>}
        <button type="submit" disabled={saving || !form.product_id || !form.quantity} className="w-full bg-good text-base font-semibold rounded-xl py-2.5 disabled:opacity-60">
          {saving ? 'Recording…' : '✓ Record Inward Entry'}
        </button>
      </form>
      <div className="bg-panel border border-line rounded-2xl p-4 text-xs text-mute font-mono space-y-1">
        <div className="text-ink font-semibold mb-2">What happens next:</div>
        <div>→ A Digital Twin is created with a unique QR code</div>
        <div>→ Movement history starts: Inward Entry → Storage</div>
        <div>→ Inventory count updates automatically</div>
        <div>→ AI Business Brain monitors stock vs reorder level</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Package size={20} className="text-cyan" /> Digital Twin
          </h1>
          <p className="text-mute text-sm font-mono">Every item, tracked end to end</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMode('addProduct'); setSuccess(''); }} className="bg-panel border border-line rounded-xl px-3 py-2 text-xs font-mono text-mute hover:border-cyan hover:text-cyan transition-colors">
            + Product
          </button>
          <button onClick={() => { setMode('inward'); setSuccess(''); }} className="bg-good text-base rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1">
            <Plus size={14} /> Inward
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <button key={item.id} onClick={() => openDetail(item)}
            className="w-full text-left bg-panel border border-line rounded-2xl p-4 flex items-center gap-3 hover:border-cyan transition-colors">
            <div className="w-10 h-10 rounded-xl bg-base border border-line flex items-center justify-center shrink-0">
              <QrCode size={18} className="text-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{item.product_name}</div>
              <div className="text-xs text-mute font-mono truncate">{item.part_number} · {item.serial_or_batch}</div>
              <div className="text-xs text-mute flex items-center gap-1 mt-0.5"><MapPin size={11} /> {item.current_location || 'Unassigned'}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-semibold">{item.quantity}</div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status] || 'text-mute border-line'}`}>
                {item.status?.replace('_', ' ')}
              </span>
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="text-center py-10 bg-panel border border-dashed border-line rounded-2xl">
            <Package size={32} className="text-mute mx-auto mb-3" />
            <div className="text-sm font-semibold mb-1">No inventory items yet</div>
            <div className="text-mute text-xs mb-3 font-mono">Register a product, then record an Inward Entry</div>
            <button onClick={() => setMode('inward')} className="text-xs bg-good text-base px-4 py-2 rounded-xl font-semibold">+ Record First Inward Entry</button>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-panel border-t border-line rounded-t-3xl w-full max-h-[80vh] overflow-y-auto scrollbar-thin p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{selected.product_name}</h2>
              <button onClick={() => setSelected(null)} className="text-mute"><X size={20} /></button>
            </div>
            {!detail && <div className="text-mute font-mono text-sm">Loading digital twin…</div>}
            {detail?.error && <div className="text-bad font-mono text-sm">Could not load details.</div>}
            {detail && !detail.error && (
              <div className="space-y-4">
                {detail.qr_code_image && (
                  <div className="bg-base border border-line rounded-2xl p-4 flex flex-col items-center">
                    <img src={detail.qr_code_image} alt="QR code" className="w-32 h-32" />
                    <p className="text-[10px] text-mute font-mono mt-2">Scan to verify authenticity</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoBlock label="Quantity" value={detail.item.quantity} />
                  <InfoBlock label="Location" value={detail.item.current_location} />
                  <InfoBlock label="Status" value={detail.item.status?.replace(/_/g,' ')} />
                  <InfoBlock label="Batch / Serial" value={detail.item.serial_or_batch} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Clock size={14} className="text-cyan" /> Movement History</h3>
                  <div className="relative pl-4">
                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-line" />
                    {detail.movement_history?.length === 0 && <p className="text-mute text-xs font-mono">No movements recorded yet.</p>}
                    {detail.movement_history?.map((h, i) => (
                      <div key={i} className="relative mb-3 text-xs">
                        <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-cyan" />
                        <div className="font-semibold capitalize">{h.stage.replace(/_/g,' ')}</div>
                        <div className="text-mute font-mono">{h.to_location ? `→ ${h.to_location}` : ''}{h.quantity ? ` · qty ${h.quantity}` : ''}</div>
                        <div className="text-mute font-mono">{new Date(h.created_at).toLocaleString()}</div>
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

function Field({ label, type='text', value, onChange, placeholder='', required=false }) {
  return (
    <div>
      <label className="block text-xs font-mono text-mute mb-1.5 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} required={required} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-base border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors" />
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
