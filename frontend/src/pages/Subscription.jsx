import React, { useEffect, useState } from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import api from '../services/api.js';

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

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then((res) => { setPlans(res.data.plans); setSavings(res.data.yearly_savings_pct); })
      .catch(() => setError('Could not load plans. Check backend connection.'));

    api.get('/subscriptions/current')
      .then((res) => setCurrent(res.data.plan?.name))
      .catch(() => {});
  }, []);

  const subscribe = async (planName) => {
    setBusy(planName);
    try {
      await api.post('/subscriptions/subscribe', { plan_name: planName });
      setCurrent(planName);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update plan');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Power Levels</h1>
        <p className="text-mute text-sm font-mono">Choose how much ACIP runs for you</p>
      </div>

      {error && <div className="bg-panel border border-line rounded-2xl p-4 text-sm text-mute">{error}</div>}

      {current && (
        <div className="bg-gradient-to-r from-cyan/10 to-good/10 border border-good/30 rounded-2xl p-4 flex items-center gap-3">
          <Check size={20} className="text-good shrink-0" />
          <div>
            <div className="font-semibold text-sm capitalize">You're on the {current} plan</div>
            <div className="text-mute text-xs mt-0.5">Your active benefits are unlocked below — explore upgrades for more power.</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {plans.map((plan) => {
          const isYearly = plan.name === 'yearly';
          const isCurrent = current === plan.name;
          const planRank = { free: 0, monthly: 1, yearly: 2 };
          const isDowngrade = current && planRank[plan.name] < planRank[current];
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 border ${
                isCurrent ? 'border-good shadow-[0_0_24px_rgba(61,220,132,0.2)]' :
                isYearly ? 'border-amber bg-gradient-to-b from-amber/10 to-panel shadow-glowAmber' : 'border-line bg-panel'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 right-5 bg-good text-base text-[11px] font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} /> ACTIVE PLAN
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
                    {plan.price_inr === 0 ? 'Free' : `₹${Number(plan.price_inr).toLocaleString('en-IN')}`}
                  </span>
                  {plan.price_inr > 0 && (
                    <span className="text-mute text-xs"> / {isYearly ? 'year' : 'month'}</span>
                  )}
                </div>
              </div>

              <p className="text-mute text-xs mt-1.5">{plan.description}</p>

              <div className="mt-4 space-y-2">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const val = plan[key];
                  if (val === false || val === 0 || val === null && key.includes('max_')) {
                    if (val === false) return null;
                  }
                  let display = null;
                  if (typeof val === 'boolean') display = val ? <Check size={14} className="text-good" /> : null;
                  else if (val === null) display = <span className="text-cyan font-mono text-xs">Unlimited</span>;
                  else display = <span className="font-mono text-xs">{val}</span>;

                  if (!display) return null;

                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-mute">{label}</span>
                      {display}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => subscribe(plan.name)}
                disabled={isCurrent || busy === plan.name}
                className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-shadow ${
                  isCurrent
                    ? 'bg-base border border-line text-mute'
                    : isYearly
                      ? 'bg-amber text-base hover:shadow-glowAmber'
                      : 'bg-cyan text-base hover:shadow-glow'
                }`}
              >
                {isCurrent ? 'Current Plan' : busy === plan.name ? 'Updating…' : (
                  <>
                    <Zap size={14} /> {isYearly ? 'Go Yearly & Save' : `Choose ${plan.name}`}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-mute font-mono">
        Yearly plans unlock priority AI, quarterly reports & early access — features Monthly never gets.
      </p>
    </div>
  );
}
