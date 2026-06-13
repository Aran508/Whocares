const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction, recordMovement } = require('../services/auditService');

const router = express.Router();

// ---------------- CUSTOMERS ----------------
router.get('/customers', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM customers WHERE company_id=$1 ORDER BY name`, [req.user.company_id]);
    res.json({ customers: rows });
  } catch (err) { next(err); }
});

router.post('/customers', authenticate, async (req, res, next) => {
  const { name, contact_person, email, phone, address } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (company_id, name, contact_person, email, phone, address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.company_id, name, contact_person, email, phone, address]
    );
    res.status(201).json({ customer: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- SALES ORDERS ----------------
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT so.*, c.name as customer_name,
       json_agg(json_build_object('product_id', si.product_id, 'product_name', p.name, 'quantity', si.quantity, 'unit_price', si.unit_price)) as items
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.customer_id
       LEFT JOIN so_items si ON si.so_id = so.id
       LEFT JOIN products p ON p.id = si.product_id
       WHERE so.company_id=$1 GROUP BY so.id, c.name ORDER BY so.created_at DESC`,
      [req.user.company_id]
    );
    res.json({ sales_orders: rows });
  } catch (err) { next(err); }
});

router.post('/orders', authenticate, async (req, res, next) => {
  const { customer_id, items, expected_delivery_date } = req.body; // items: [{product_id, quantity, unit_price}]
  try {
    const soNumber = `SO-${Date.now()}`;
    const totalAmount = items.reduce((sum, it) => sum + (it.quantity * (it.unit_price || 0)), 0);

    const { rows } = await pool.query(
      `INSERT INTO sales_orders (company_id, so_number, customer_id, expected_delivery_date, total_amount)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.company_id, soNumber, customer_id, expected_delivery_date || null, totalAmount]
    );
    const so = rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO so_items (so_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
        [so.id, item.product_id, item.quantity, item.unit_price || null]
      );
    }

    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'so_created', entity_type: 'sales_order', entity_id: so.id, details: { items, customer_id } });

    res.status(201).json({ sales_order: so });
  } catch (err) { next(err); }
});

// ---------------- OUTWARD DISPATCH (creates Delivery Challan) ----------------
router.post('/orders/:id/dispatch', authenticate, async (req, res, next) => {
  const { items, notes } = req.body; // items: [{inventory_item_id, quantity}]
  try {
    const challanNumber = `DC-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO outward_dispatches (company_id, so_id, dispatched_by, delivery_challan_number, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.company_id, req.params.id, req.user.id, challanNumber, notes || null]
    );

    for (const item of items) {
      await pool.query(
        `UPDATE inventory_items SET quantity = quantity - $1, status='dispatched' WHERE id=$2`,
        [item.quantity, item.inventory_item_id]
      );
      await recordMovement({
        company_id: req.user.company_id,
        inventory_item_id: item.inventory_item_id,
        stage: 'outward_dispatch',
        quantity: item.quantity,
        related_document_type: 'sales_order',
        related_document_id: req.params.id,
        performed_by: req.user.id,
        notes: `Delivery Challan ${challanNumber}`
      });
    }

    await pool.query(`UPDATE sales_orders SET status='dispatched' WHERE id=$1`, [req.params.id]);

    res.status(201).json({ outward_dispatch: rows[0] });
  } catch (err) { next(err); }
});

// Mark sales order as delivered
router.patch('/orders/:id/delivered', authenticate, async (req, res, next) => {
  try {
    await pool.query(`UPDATE sales_orders SET status='delivered' WHERE id=$1 AND company_id=$2`, [req.params.id, req.user.company_id]);

    const itemsRes = await pool.query(`SELECT id FROM inventory_items WHERE status='dispatched'`);
    // (In a real system you'd track which inventory items belong to which dispatch precisely)

    res.json({ message: 'Marked as delivered' });
  } catch (err) { next(err); }
});

module.exports = router;
