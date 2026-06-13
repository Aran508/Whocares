const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard
 * Returns the Executive Dashboard: revenue, expenses, profit, inventory value,
 * open orders, production status, supplier/customer performance, business health score.
 */
router.get('/', authenticate, async (req, res, next) => {
  const companyId = req.user.company_id;
  try {
    // Revenue (paid sales invoices, current month + all-time)
    const revenueRes = await pool.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM invoices WHERE company_id=$1 AND type='sales' AND status='paid'`,
      [companyId]
    );
    const revenueThisMonthRes = await pool.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM invoices
       WHERE company_id=$1 AND type='sales' AND status='paid' AND created_at >= date_trunc('month', CURRENT_DATE)`,
      [companyId]
    );

    // Expenses (purchase invoices paid + manual expenses)
    const expensesRes = await pool.query(
      `SELECT
        (SELECT COALESCE(SUM(amount),0) FROM invoices WHERE company_id=$1 AND type='purchase' AND status='paid')
        + (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE company_id=$1) as total`,
      [companyId]
    );

    const revenue = parseFloat(revenueRes.rows[0].total);
    const expensesTotal = parseFloat(expensesRes.rows[0].total);
    const profit = revenue - expensesTotal;

    // Inventory value
    const inventoryValueRes = await pool.query(
      `SELECT COALESCE(SUM(i.quantity * p.standard_cost),0) as value
       FROM inventory_items i JOIN products p ON p.id=i.product_id
       WHERE i.company_id=$1 AND i.status IN ('in_stock','finished_goods','wip')`,
      [companyId]
    );

    // Open orders
    const openPOsRes = await pool.query(
      `SELECT COUNT(*) FROM purchase_orders WHERE company_id=$1 AND status NOT IN ('received','cancelled')`,
      [companyId]
    );
    const openSOsRes = await pool.query(
      `SELECT COUNT(*) FROM sales_orders WHERE company_id=$1 AND status NOT IN ('closed','cancelled','delivered')`,
      [companyId]
    );

    // Production status
    const productionRes = await pool.query(
      `SELECT status, COUNT(*) as count FROM production_orders WHERE company_id=$1 GROUP BY status`,
      [companyId]
    );

    // Supplier performance
    const supplierPerfRes = await pool.query(
      `SELECT id, name, rating, on_time_delivery_pct FROM suppliers WHERE company_id=$1 ORDER BY rating DESC LIMIT 5`,
      [companyId]
    );

    // Customer performance
    const customerPerfRes = await pool.query(
      `SELECT id, name, on_time_payment_pct FROM customers WHERE company_id=$1 ORDER BY on_time_payment_pct DESC LIMIT 5`,
      [companyId]
    );

    // Unresolved alerts (for health score)
    const alertsRes = await pool.query(
      `SELECT severity, COUNT(*) as count FROM ai_alerts WHERE company_id=$1 AND is_resolved=FALSE GROUP BY severity`,
      [companyId]
    );

    // ---- Business Health Score (0-100) ----
    // Starts at 100, deducts points for alerts by severity, rewards profitability
    let healthScore = 100;
    const severityWeights = { low: 2, medium: 5, high: 10, critical: 20 };
    for (const row of alertsRes.rows) {
      healthScore -= (severityWeights[row.severity] || 5) * parseInt(row.count, 10);
    }
    if (profit < 0) healthScore -= 15;
    healthScore = Math.max(0, Math.min(100, healthScore));

    res.json({
      revenue: { all_time: revenue, this_month: parseFloat(revenueThisMonthRes.rows[0].total) },
      expenses: expensesTotal,
      profit,
      inventory_value: parseFloat(inventoryValueRes.rows[0].value),
      open_orders: {
        purchase_orders: parseInt(openPOsRes.rows[0].count, 10),
        sales_orders: parseInt(openSOsRes.rows[0].count, 10)
      },
      production_status: productionRes.rows,
      supplier_performance: supplierPerfRes.rows,
      customer_performance: customerPerfRes.rows,
      unresolved_alerts: alertsRes.rows,
      business_health_score: healthScore
    });
  } catch (err) { next(err); }
});

module.exports = router;
