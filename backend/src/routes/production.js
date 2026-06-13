const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction, recordMovement } = require('../services/auditService');

const router = express.Router();

// GET /api/production/orders
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT po.*, p.name as product_name, p.part_number
       FROM production_orders po JOIN products p ON p.id = po.product_id
       WHERE po.company_id=$1 ORDER BY po.created_at DESC`,
      [req.user.company_id]
    );
    res.json({ production_orders: rows });
  } catch (err) { next(err); }
});

// POST /api/production/orders
router.post('/orders', authenticate, async (req, res, next) => {
  const { product_id, quantity_planned, start_date, due_date } = req.body;
  try {
    const orderNumber = `WO-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO production_orders (company_id, order_number, product_id, quantity_planned, start_date, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.company_id, orderNumber, product_id, quantity_planned, start_date || null, due_date || null]
    );
    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'production_order_created', entity_type: 'production_order', entity_id: rows[0].id, details: rows[0] });
    res.status(201).json({ production_order: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/production/orders/:id/consume -> consumes raw material inventory (WIP tracking)
router.post('/orders/:id/consume', authenticate, async (req, res, next) => {
  const { product_id, quantity, inventory_item_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO production_consumption (production_order_id, product_id, quantity_consumed) VALUES ($1,$2,$3)`,
      [req.params.id, product_id, quantity]
    );

    if (inventory_item_id) {
      await pool.query(
        `UPDATE inventory_items SET quantity = quantity - $1, status='wip' WHERE id=$2`,
        [quantity, inventory_item_id]
      );
      await recordMovement({
        company_id: req.user.company_id,
        inventory_item_id,
        stage: 'production_consumption',
        quantity,
        related_document_type: 'production_order',
        related_document_id: req.params.id,
        performed_by: req.user.id,
        notes: 'Consumed for production'
      });
    }

    res.json({ message: 'Consumption recorded' });
  } catch (err) { next(err); }
});

// PATCH /api/production/orders/:id/complete -> marks quantity completed, creates finished goods inventory
router.patch('/orders/:id/complete', authenticate, async (req, res, next) => {
  const { quantity_completed, serial_or_batch, location } = req.body;
  try {
    const orderRes = await pool.query(
      `UPDATE production_orders SET quantity_completed = quantity_completed + $1,
       status = CASE WHEN quantity_completed + $1 >= quantity_planned THEN 'completed' ELSE 'in_progress' END
       WHERE id=$2 AND company_id=$3 RETURNING *`,
      [quantity_completed, req.params.id, req.user.company_id]
    );
    const order = orderRes.rows[0];

    // Create finished goods digital twin
    const invRes = await pool.query(
      `INSERT INTO inventory_items (company_id, product_id, serial_or_batch, qr_code, barcode, quantity, current_location, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'finished_goods') RETURNING *`,
      [req.user.company_id, order.product_id, serial_or_batch || `FG-${Date.now()}`,
       `ACIP-${req.user.company_id}-${order.product_id}-FG-${Date.now()}`,
       `ACIP-${req.user.company_id}-${order.product_id}-FG-${Date.now()}`,
       quantity_completed, location || 'Finished Goods Store']
    );

    await recordMovement({
      company_id: req.user.company_id,
      inventory_item_id: invRes.rows[0].id,
      stage: 'finished_goods',
      quantity: quantity_completed,
      to_location: location || 'Finished Goods Store',
      related_document_type: 'production_order',
      related_document_id: order.id,
      performed_by: req.user.id,
      notes: 'Production completed'
    });

    res.json({ production_order: order, finished_goods_item: invRes.rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
