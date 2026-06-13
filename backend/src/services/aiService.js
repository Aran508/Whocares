const axios = require('axios');
const pool = require('../config/db');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

/**
 * Generic helper to call Claude for reasoning tasks (supplier suggestions,
 * report summaries, recommendations).
 */
async function askClaude(prompt, systemPrompt = '') {
  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  const textBlock = response.data.content.find((c) => c.type === 'text');
  return textBlock ? textBlock.text : '';
}

/**
 * "I need to buy 100 motors" -> creates a PR automatically,
 * suggests suppliers, and (if AI Managed mode) creates a PO too.
 */
async function handleNaturalLanguagePurchaseRequest({ company_id, user_id, message }) {
  // 1. Ask Claude to extract structured intent
  const extraction = await askClaude(
    `Extract a purchase request from this message. Respond ONLY with JSON:
     {"product_name": string, "quantity": number, "notes": string}
     Message: "${message}"`,
    'You are a procurement parsing assistant. Respond with raw JSON only, no markdown.'
  );

  let parsed;
  try {
    parsed = JSON.parse(extraction.replace(/```json|```/g, '').trim());
  } catch (e) {
    throw new Error('Could not parse purchase request from message');
  }

  // 2. Find or create the product
  let productRes = await pool.query(
    `SELECT * FROM products WHERE company_id = $1 AND name ILIKE $2 LIMIT 1`,
    [company_id, parsed.product_name]
  );
  let product = productRes.rows[0];
  if (!product) {
    const partNumber = `AUTO-${Date.now()}`;
    const insert = await pool.query(
      `INSERT INTO products (company_id, part_number, name) VALUES ($1,$2,$3) RETURNING *`,
      [company_id, partNumber, parsed.product_name]
    );
    product = insert.rows[0];
  }

  // 3. Create Purchase Requisition
  const prNumber = `PR-${Date.now()}`;
  const prRes = await pool.query(
    `INSERT INTO purchase_requisitions (company_id, pr_number, requested_by, status, created_by_ai, notes)
     VALUES ($1,$2,$3,'pending',TRUE,$4) RETURNING *`,
    [company_id, prNumber, user_id, parsed.notes || message]
  );
  const pr = prRes.rows[0];

  await pool.query(
    `INSERT INTO pr_items (pr_id, product_id, quantity) VALUES ($1,$2,$3)`,
    [pr.id, product.id, parsed.quantity]
  );

  // 4. Suggest suppliers (best-rated suppliers for the company)
  const supplierRes = await pool.query(
    `SELECT id, name, rating, on_time_delivery_pct, avg_lead_time_days
     FROM suppliers WHERE company_id = $1
     ORDER BY rating DESC, on_time_delivery_pct DESC LIMIT 3`,
    [company_id]
  );

  return {
    purchase_requisition: pr,
    product,
    quantity: parsed.quantity,
    suggested_suppliers: supplierRes.rows,
    message: `Created Purchase Requisition ${prNumber} for ${parsed.quantity} x ${product.name}.`
  };
}

/**
 * Runs periodic checks across the company's data and creates ai_alerts.
 * Called by a cron job (see services/alertEngine.js) or on-demand.
 */
async function runBusinessBrainChecks(company_id) {
  const alerts = [];

  // Low stock check
  const lowStock = await pool.query(
    `SELECT p.id, p.name, p.reorder_level, COALESCE(SUM(i.quantity),0) as current_qty
     FROM products p
     LEFT JOIN inventory_items i ON i.product_id = p.id AND i.status = 'in_stock'
     WHERE p.company_id = $1
     GROUP BY p.id, p.name, p.reorder_level
     HAVING COALESCE(SUM(i.quantity),0) <= p.reorder_level`,
    [company_id]
  );
  for (const row of lowStock.rows) {
    alerts.push({
      company_id, category: 'low_stock', severity: 'high',
      title: `Low stock: ${row.name}`,
      description: `Current quantity (${row.current_qty}) is at or below reorder level (${row.reorder_level}).`,
      related_entity_type: 'product', related_entity_id: row.id
    });
  }

  // Delayed PO check
  const delayedPOs = await pool.query(
    `SELECT id, po_number, expected_delivery_date FROM purchase_orders
     WHERE company_id = $1 AND status NOT IN ('received','cancelled')
     AND expected_delivery_date < CURRENT_DATE`,
    [company_id]
  );
  for (const row of delayedPOs.rows) {
    alerts.push({
      company_id, category: 'order_delay', severity: 'medium',
      title: `Delayed PO: ${row.po_number}`,
      description: `Expected delivery date ${row.expected_delivery_date} has passed.`,
      related_entity_type: 'purchase_order', related_entity_id: row.id
    });
  }

  // Overdue invoices
  const overdueInvoices = await pool.query(
    `SELECT id, invoice_number, due_date FROM invoices
     WHERE company_id = $1 AND status IN ('unpaid','partially_paid') AND due_date < CURRENT_DATE`,
    [company_id]
  );
  for (const row of overdueInvoices.rows) {
    alerts.push({
      company_id, category: 'payment_overdue', severity: 'high',
      title: `Overdue invoice: ${row.invoice_number}`,
      description: `Payment was due on ${row.due_date}.`,
      related_entity_type: 'invoice', related_entity_id: row.id
    });
  }

  // Insert all alerts (avoid duplicates by checking unresolved alerts on same entity)
  for (const alert of alerts) {
    const exists = await pool.query(
      `SELECT id FROM ai_alerts WHERE company_id=$1 AND category=$2 AND related_entity_id=$3 AND is_resolved=FALSE`,
      [alert.company_id, alert.category, alert.related_entity_id]
    );
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO ai_alerts (company_id, category, severity, title, description, related_entity_type, related_entity_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [alert.company_id, alert.category, alert.severity, alert.title, alert.description, alert.related_entity_type, alert.related_entity_id]
      );
    }
  }

  return alerts;
}

module.exports = { askClaude, handleNaturalLanguagePurchaseRequest, runBusinessBrainChecks };
