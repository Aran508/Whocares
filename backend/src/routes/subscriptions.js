const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { loadSubscription } = require('../middleware/subscription');

const router = express.Router();

/**
 * GET /api/subscriptions/plans
 * Public - list all plans (Free / Monthly / Yearly) with feature comparison
 */
router.get('/plans', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM subscription_plans ORDER BY price_inr ASC`);
    // Add a computed "savings" field for yearly vs monthly
    const monthly = rows.find(p => p.name === 'monthly');
    const yearly = rows.find(p => p.name === 'yearly');
    let yearlySavingsPct = null;
    if (monthly && yearly) {
      const monthlyAnnualCost = monthly.price_inr * 12;
      yearlySavingsPct = Math.round(((monthlyAnnualCost - yearly.price_inr) / monthlyAnnualCost) * 100);
    }
    res.json({ plans: rows, yearly_savings_pct: yearlySavingsPct });
  } catch (err) { next(err); }
});

/**
 * GET /api/subscriptions/current
 */
router.get('/current', authenticate, loadSubscription, async (req, res) => {
  res.json({ plan: req.plan });
});

/**
 * POST /api/subscriptions/subscribe
 * body: { plan_name: 'monthly' | 'yearly' | 'free' }
 * NOTE: Payment gateway integration (Razorpay/Stripe) should be wired in here
 * before marking status as 'active' in production.
 */
router.post('/subscribe', authenticate, async (req, res, next) => {
  const { plan_name } = req.body;
  const { company_id } = req.user;
  try {
    const planRes = await pool.query(`SELECT * FROM subscription_plans WHERE name = $1`, [plan_name]);
    if (planRes.rows.length === 0) return res.status(400).json({ error: 'Invalid plan name' });
    const plan = planRes.rows[0];

    // Expire any existing active subscription
    await pool.query(
      `UPDATE company_subscriptions SET status='expired' WHERE company_id=$1 AND status='active'`,
      [company_id]
    );

    const endDate = plan_name === 'yearly'
      ? `CURRENT_DATE + INTERVAL '1 year'`
      : plan_name === 'monthly'
        ? `CURRENT_DATE + INTERVAL '1 month'`
        : `NULL`;

    const insertQuery = `
      INSERT INTO company_subscriptions (company_id, plan_id, status, start_date, end_date)
      VALUES ($1, $2, 'active', CURRENT_DATE, ${endDate})
      RETURNING *`;

    const { rows } = await pool.query(insertQuery, [company_id, plan.id]);

    res.json({ subscription: rows[0], plan });
  } catch (err) { next(err); }
});

module.exports = router;
