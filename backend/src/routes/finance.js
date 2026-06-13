const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction, recordMovement } = require('../services/auditService');

const router = express.Router();

// ---------------- INVOICES ----------------
router.get('/invoices', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM invoices WHERE company_id=$1 ORDER BY created_at DESC`, [req.user.company_id]);
    res.json({ invoices: rows });
  } catch (err) { next(err); }
});

router.post('/invoices', authenticate, async (req, res, next) => {
  const { type, so_id, po_id, amount, due_date } = req.body; // type: 'sales' | 'purchase'
  try {
    const invoiceNumber = `${type === 'sales' ? 'INV' : 'BILL'}-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO invoices (company_id, invoice_number, so_id, po_id, type, amount, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.company_id, invoiceNumber, so_id || null, po_id || null, type, amount, due_date || null]
    );
    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'invoice_created', entity_type: 'invoice', entity_id: rows[0].id, details: rows[0] });
    res.status(201).json({ invoice: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- PAYMENTS ----------------
router.post('/invoices/:id/payments', authenticate, async (req, res, next) => {
  const { amount, method, reference } = req.body;
  try {
    const paymentRes = await pool.query(
      `INSERT INTO payments (invoice_id, amount, method, reference) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, amount, method, reference]
    );

    // Update invoice status based on total paid vs amount
    const totals = await pool.query(
      `SELECT i.amount, COALESCE(SUM(p.amount),0) as paid
       FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
       WHERE i.id=$1 GROUP BY i.amount`,
      [req.params.id]
    );
    const { amount: invoiceAmount, paid } = totals.rows[0];
    const newStatus = parseFloat(paid) >= parseFloat(invoiceAmount) ? 'paid' : 'partially_paid';
    await pool.query(`UPDATE invoices SET status=$1 WHERE id=$2`, [newStatus, req.params.id]);

    // If this is a sales invoice, log payment_collection movement stage for traceability
    const invoiceCheck = await pool.query(`SELECT type, so_id FROM invoices WHERE id=$1`, [req.params.id]);
    if (invoiceCheck.rows[0]?.type === 'sales') {
      await logAction({
        company_id: req.user.company_id, user_id: req.user.id,
        action: 'payment_collected', entity_type: 'invoice', entity_id: req.params.id,
        details: { amount, method, reference, stage: 'payment_collection' }
      });
    }

    res.status(201).json({ payment: paymentRes.rows[0], invoice_status: newStatus });
  } catch (err) { next(err); }
});

// ---------------- EXPENSES ----------------
router.get('/expenses', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM expenses WHERE company_id=$1 ORDER BY incurred_at DESC`, [req.user.company_id]);
    res.json({ expenses: rows });
  } catch (err) { next(err); }
});

router.post('/expenses', authenticate, async (req, res, next) => {
  const { category, amount, description, incurred_at } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO expenses (company_id, category, amount, description, incurred_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.company_id, category, amount, description, incurred_at || new Date()]
    );
    res.status(201).json({ expense: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
