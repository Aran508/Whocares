import React, { useEffect, useState } from 'react';
import { Check, Crown, Zap, Shield, ExternalLink } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURE_LABELS = {
  max_users: 'Team members',
  max_transactions_per_month: 'Transactions / month',
  ai_business_brain: 'AI Business Brain & alerts',
  ai_managed_mode: 'AI Managed mode',
  priority_ai: 'Priority AI processing',
  quarterly_ai_report: 'Quarterly AI health report',
  early_access: 'Early access to new modules',
  extra_digital_twin_tags: 'Extra digital twin tags'
};

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [savings, setSavings] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [showVault, setShowVault] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then(r => { setPlans(r.data.plans); setSavings(r.data.yearly_savings_pct); })
      .catch(() => setError('Could not load plans.'));
    api.get('/subscriptions/current')
      .then(r => setCurrent(r.data.plan?.name))
      .catch(() => {});
  }, []);

  const subscribe = async (planName) => {
    if (planName === 'free') {
      setBusy(planName);
      try {
        await api.post('/subscriptions/subscribe', { plan_name: planName });
        setCurrent(planName);
      } catch (err) {
        alert(err.response?.data?.error || 'Could not update plan');
      } finally { setBusy(null); }
      return;
    }
    // For paid plans: open Razorpay
    const plan = plans.find(p => p.name === planName);
    if (!window.Razorpay) {
      alert('Payment gateway loading… please try again in a moment.');
      return;
    }
    setBusy(planName);
    const options = {
      key: 'rzp_test_placeholder',  // Replace with your Razorpay Key ID from razorpay.com
      amount: Math.round(parseFloat(plan.price_inr) * 100), // in paise
      currency: 'INR',
      name: 'ACIP',
      description: `${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
      image: '/favicon.svg',
      theme: { color: '#00D4FF' },
      handler: async (response) => {
        try {
          await api.post('/subscriptions/subscribe', { plan_name: planName, payment_id: response.razorpay_payment_id });
          setCurrent(planName);
          alert(`✅ Payment successful! Your ${planName} plan is now active.`);
        } catch { alert('Payment received but plan activation failed. Contact support.'); }
        finally { setBusy(null); }
      },
      modal: { ondismiss: () => setBusy(null) }
    };
    new window.Razorpay(options).open();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Power Levels</h1>
        <p className="text-mute text-sm font-mono">Choose how much ACIP runs for you</p>
      </div>

      {/* Data Vault banner */}
      <button onClick={() => setShowVault(!showVault)}
        className="w-full text-left bg-panel border border-cyan/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
          <Shield size={18} className="text-cyan" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">Your Secure Data Vault</div>
          <div className="text-xs text-mute font-mono">Company: {user?.company_id ? `ID #${user.company_id}` : '—'} · All data isolated & encrypted</div>
        </div>
        <ExternalLink size={16} className="text-mute" />
      </button>

      {showVault && (
        <div className="bg-panel border border-line rounded-2xl p-4 text-xs text-mute font-mono space-y-1.5">
          <div className="text-ink font-semibold mb-2 text-sm">🔒 Your Data Vault</div>
          <div>Every piece of data you enter belongs exclusively to your company folder (ID #{user?.company_id}).</div>
          <div className="mt-2 space-y-1">
            {['Products & Inventory', 'Purchase Requisitions & Orders', 'Suppliers & Customers', 'Production Records', 'Financial Documents', 'AI Alerts & Audit Log'].map(d => (
              <div key={d} className="flex items-center gap-2"><Check size={12} className="text-good" /> {d}</div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-line">No other company can access your data. Each company gets a fully isolated namespace in the database.</div>
        </div>
      )}

      {error && <div className="bg-panel border border-line rounded-2xl p-4 text-sm text-mute">{error}</div>}

      <div className="space-y-4">
        {plans.map((plan) => {
          const isYearly = plan.name === 'yearly';
          const isCurrent = current === plan.name;
          return (
            <div key={plan.id} className={`relative rounded-2xl p-5 border transition-all ${
              isCurrent ? 'border-good shadow-[0_0_20px_rgba(61,220,132,0.15)]' :
              isYearly ? 'border-amber bg-gradient-to-b from-amber/10 to-panel shadow-glowAmber' : 'border-line bg-panel'
            }`}>
              {isCurrent && (
                <div className="absolute -top-3 right-5 bg-good text-base text-[11px] font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} /> ACTIVE
                </div>
              )}
              {!isCurrent && isYearly && (
                <div className="absolute -top-3 left-5 bg-amber text-base text-[11px] font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown size={12} /> BEST VALUE {savings ? `· SAVE ${savings}%` : ''}
                </div>
              )}

              <div className="flex items-baseline justify-between mt-2">
                <h2 className="font-display text-lg font-bold capitalize">{plan.name}</h2>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold font-mono">
                    {plan.price_inr === '0.00' || plan.price_inr === 0 ? 'Free' : `₹${Number(plan.price_inr).toLocaleString('en-IN')}`}
                  </span>
                  {parseFloat(plan.price_inr) > 0 && (
                    <span className="text-mute text-xs"> / {isYearly ? 'year' : 'month'}</span>
                  )}
                </div>
              </div>

              <p className="text-mute text-xs mt-1.5 mb-4">{plan.description}</p>

              <div className="space-y-2">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const val = plan[key];
                  if (val === false) return null;
                  if (val === 0 && key === 'extra_digital_twin_tags') return null;
                  let display = null;
                  if (typeof val === 'boolean') display = <Check size={14} className="text-good" />;
                  else if (val === null) display = <span className="text-cyan font-mono text-xs font-semibold">Unlimited</span>;
                  else display = <span className="font-mono text-xs font-semibold">{val}</span>;
                  if (!display) return null;
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-mute">{label}</span>
                      {display}
                    </div>
                  );
                })}
              </div>

              {!isCurrent && (
                <button onClick={() => subscribe(plan.name)} disabled={busy === plan.name}
                  className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isYearly ? 'bg-amber text-base hover:shadow-glowAmber' : 'bg-cyan text-base hover:shadow-glow'
                  } disabled:opacity-60`}>
                  {busy === plan.name ? 'Processing…' : (
                    <><Zap size={14} /> {parseFloat(plan.price_inr) === 0 ? 'Switch to Free' : `Pay ₹${Number(plan.price_inr).toLocaleString('en-IN')} & Activate`}</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-mute font-mono pb-4">
        Payments secured by Razorpay · Your data is always yours
      </p>

      {/* Load Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
