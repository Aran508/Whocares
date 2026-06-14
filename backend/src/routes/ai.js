const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { loadSubscription, requireFeature } = require('../middleware/subscription');
const { askClaude, handleNaturalLanguagePurchaseRequest, runBusinessBrainChecks } = require('../services/aiService');
const { logAction } = require('../services/auditService');

const router = express.Router();

/**
 * POST /api/ai/command
 * The main natural-language entry point.
 * e.g. { "message": "I need to buy 100 motors" }
 * Detects intent and routes to the right module (currently: purchasing).
 */
router.post('/command', authenticate, loadSubscription, async (req, res, next) => {
  const { message } = req.body;
  try {    const intent = await askClaude(
      `Classify this message into one category only: "purchase_request", "stock_query", "report_request", "general_question".
       Respond with ONLY the category word.
       Message: "${message}"`,
      'You are an intent classifier for a company operations AI. Respond with one word only.'
    );

    const category = intent.trim().toLowerCase();

    if (category.includes('purchase')) {
      const result = await handleNaturalLanguagePurchaseRequest({
        company_id: req.user.company_id,
        user_id: req.user.id,
        message
      });
      await logAction({
        company_id: req.user.company_id, user_id: req.user.id,
        action: 'ai_purchase_request', entity_type: 'purchase_requisition',
        entity_id: result.purchase_requisition.id, details: { message }
      });
      return res.json({ intent: 'purchase_request', result });
    }

    if (category.includes('stock')) {
      const { rows } = await pool.query(
        `SELECT p.name, p.reorder_level, COALESCE(SUM(i.quantity),0) as current_qty
         FROM products p LEFT JOIN inventory_items i ON i.product_id=p.id AND i.status='in_stock'
         WHERE p.company_id=$1 GROUP BY p.id, p.name, p.reorder_level ORDER BY p.name`,
        [req.user.company_id]
      );
      return res.json({ intent: 'stock_query', result: rows });
    }

    // Fallback: general business question -> ask Claude with context
    const answer = await askClaude(
      message,
      `You are the AI Business Brain for a company's operations platform (ACIP).
       Answer concisely and helpfully as a virtual business mentor/operations manager.`
    );
    res.json({ intent: 'general', result: answer });
  } catch (err) {
    const anthropicError = err.response?.data?.error;
    const isOwnerOrAdmin = ['owner', 'admin'].includes(req.user.role);
    if (anthropicError) {
      if (/credit/i.test(anthropicError.message || '')) {
        return res.status(402).json({
          error: isOwnerOrAdmin
            ? 'AI features need Anthropic API credits. Add credits at console.anthropic.com → Plans & Billing, then try again.'
            : 'AI Business Brain is temporarily unavailable. Please contact your administrator.'
        });
      }
      if (anthropicError.type === 'authentication_error') {
        return res.status(401).json({
          error: isOwnerOrAdmin
            ? 'AI service authentication failed. Check the ANTHROPIC_API_KEY configuration.'
            : 'AI Business Brain is temporarily unavailable. Please contact your administrator.'
        });
      }
      return res.status(502).json({
        error: isOwnerOrAdmin ? `AI Business Brain unavailable: ${anthropicError.message}` : 'AI Business Brain is temporarily unavailable. Please try again shortly.'
      });
    }
    next(err);
  }
});

/**
 * GET /api/ai/alerts
 */
router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM ai_alerts WHERE company_id=$1 AND is_resolved=FALSE ORDER BY severity DESC, created_at DESC`,
      [req.user.company_id]
    );
    res.json({ alerts: rows });
  } catch (err) { next(err); }
});

/**
 * POST /api/ai/alerts/run
 * Manually trigger the Business Brain checks (also runs on a schedule, see alertEngine.js)
 */
router.post('/alerts/run', authenticate, async (req, res, next) => {
  try {
    const alerts = await runBusinessBrainChecks(req.user.company_id);
    res.json({ message: `${alerts.length} alert(s) evaluated`, alerts });
  } catch (err) { next(err); }
});

/**
 * PATCH /api/ai/alerts/:id/resolve
 */
router.patch('/alerts/:id/resolve', authenticate, async (req, res, next) => {
  try {
    await pool.query(`UPDATE ai_alerts SET is_resolved=TRUE WHERE id=$1 AND company_id=$2`, [req.params.id, req.user.company_id]);
    res.json({ message: 'Alert resolved' });
  } catch (err) { next(err); }
});

/**
 * POST /api/ai/recommend-suppliers
 * body: { product_id }
 */
router.post('/recommend-suppliers', authenticate, loadSubscription, requireFeature('ai_business_brain'), async (req, res, next) => {
  const { product_id } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT s.* FROM suppliers s WHERE s.company_id=$1 ORDER BY s.rating DESC, s.on_time_delivery_pct DESC LIMIT 5`,
      [req.user.company_id]
    );
    res.json({ recommended_suppliers: rows });
  } catch (err) { next(err); }
});

module.exports = router;
