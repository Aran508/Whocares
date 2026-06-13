import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Building2, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TYPES = [
  { key: 'startup', label: 'Startup', icon: Rocket, desc: 'AI mentor + auto-document creation. Minimal setup.' },
  { key: 'sme', label: 'Professional / SME', icon: Building2, desc: 'Standard ERP workflows, department controls.' },
  { key: 'enterprise', label: 'Enterprise / MNC', icon: Globe, desc: 'Multi-plant, multi-currency, governance.' }
];

export default function Register() {
  const [type, setType] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let endpoint, payload;
      if (type === 'startup') {
        endpoint = '/auth/register-startup';
        payload = {
          company_name: form.company_name, founder_name: form.founder_name, email: form.email,
          mobile: form.mobile, business_type: form.business_type, gst_number: form.gst_number,
          registration_number: form.registration_number, address: form.address, password: form.password
        };
      } else if (type === 'sme') {
        endpoint = '/auth/register-sme';
        payload = {
          company_name: form.company_name, registration_number: form.registration_number,
          gst_number: form.gst_number, address: form.address, admin_name: form.admin_name,
          admin_email: form.email, employee_id: form.employee_id, password: form.password
        };
      } else {
        endpoint = '/auth/register-enterprise';
        payload = {
          company_name: form.company_name, registration_number: form.registration_number,
          gst_number: form.gst_number, corporate_domain: form.corporate_domain, address: form.address,
          admin_name: form.admin_name, admin_email: form.email, employee_id: form.employee_id,
          password: form.password, country: form.country, currency: form.currency
        };
      }

      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!type) {
    return (
      <div className="py-6">
        <h1 className="font-display text-2xl font-bold mb-1">Set up your company</h1>
        <p className="text-mute text-sm font-mono mb-6">Choose the profile that fits your operation</p>

        <div className="space-y-3">
          {TYPES.map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key} onClick={() => setType(key)}
              className="w-full text-left bg-panel border border-line rounded-2xl p-4 flex items-start gap-4 hover:border-cyan transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-base border border-line flex items-center justify-center shrink-0">
                <Icon size={20} className="text-cyan" />
              </div>
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-mute text-xs mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-mute mt-6">
          Already registered? <Link to="/login" className="text-cyan font-medium">Log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <button onClick={() => setType(null)} className="flex items-center gap-1.5 text-mute text-sm mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-xl font-bold mb-1">
        {TYPES.find((t) => t.key === type).label} registration
      </h1>
      <p className="text-mute text-sm font-mono mb-5">Fill in your details to power on</p>

      <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-2xl p-5 space-y-3.5">
        <Field label="Company name" onChange={(v) => update('company_name', v)} required />

        {type === 'startup' && (
          <>
            <Field label="Founder name" onChange={(v) => update('founder_name', v)} required />
            <Field label="Mobile number" onChange={(v) => update('mobile', v)} />
            <Field label="Business type" onChange={(v) => update('business_type', v)} placeholder="e.g. Manufacturing, SaaS" />
            <Field label="GST number (optional)" onChange={(v) => update('gst_number', v)} required={false} />
            <Field label="Registration number (optional)" onChange={(v) => update('registration_number', v)} required={false} />
          </>
        )}

        {(type === 'sme' || type === 'enterprise') && (
          <>
            <Field label="Admin / contact name" onChange={(v) => update('admin_name', v)} required />
            <Field label="Employee ID" onChange={(v) => update('employee_id', v)} required />
            <Field label="Registration number" onChange={(v) => update('registration_number', v)} required />
            <Field label="GST / VAT number" onChange={(v) => update('gst_number', v)} required />
          </>
        )}

        {type === 'enterprise' && (
          <>
            <Field label="Corporate domain" onChange={(v) => update('corporate_domain', v)} placeholder="company.com" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country" onChange={(v) => update('country', v)} placeholder="India" />
              <Field label="Currency" onChange={(v) => update('currency', v)} placeholder="INR" />
            </div>
          </>
        )}

        <Field label="Address" onChange={(v) => update('address', v)} required />
        <Field label="Email" type="email" onChange={(v) => update('email', v)} required />
        <Field label="Password" type="password" onChange={(v) => update('password', v)} required />

        {error && <p className="text-bad text-xs font-mono">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-amber text-base font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 hover:shadow-glowAmber transition-shadow disabled:opacity-60"
        >
          {loading ? 'Setting up…' : 'Launch ACIP'} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', onChange, required = true, placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-mono text-mute mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-amber"> *</span>}
      </label>
      <input
        type={type} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-base border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors"
      />
    </div>
  );
}
