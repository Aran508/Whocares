const pool = require('../config/db');

/**
 * Loads the company's active subscription plan onto req.plan.
 * Use requireFeature('ai_business_brain') etc. to gate premium features.
 */
async function loadSubscription(req, res, next) {
  try {
    const { company_id } = req.user;
    const result = await pool.query(
      `SELECT sp.* FROM company_subscriptions cs
       JOIN subscription_plans sp ON sp.id = cs.plan_id
       WHERE cs.company_id = $1 AND cs.status = 'active'
       ORDER BY cs.start_date DESC LIMIT 1`,
      [company_id]
    );
    if (result.rows.length === 0) {
      // default to free plan if none found
      const free = await pool.query(`SELECT * FROM subscription_plans WHERE name = 'free'`);
      req.plan = free.rows[0];
    } else {
      req.plan = result.rows[0];
    }
    next();
  } catch (err) {
    next(err);
  }
}

function requireFeature(featureKey) {
  return (req, res, next) => {
    if (!req.plan || !req.plan[featureKey]) {
      return res.status(402).json({
        error: 'This feature requires a higher subscription plan.',
        feature: featureKey,
        upgrade_url: '/subscriptions'
      });
    }
    next();
  };
}

async function checkTransactionLimit(req, res, next) {
  try {
    const { company_id } = req.user;
    if (req.plan.max_transactions_per_month === null) return next(); // unlimited

    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM audit_log
       WHERE company_id = $1 AND created_at >= date_trunc('month', CURRENT_DATE)`,
      [company_id]
    );
    const used = parseInt(rows[0].count, 10);
    if (used >= req.plan.max_transactions_per_month) {
      return res.status(402).json({
        error: 'Monthly transaction limit reached for your plan. Upgrade to continue.',
        used,
        limit: req.plan.max_transactions_per_month
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadSubscription, requireFeature, checkTransactionLimit };
