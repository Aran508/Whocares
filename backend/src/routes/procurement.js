const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logAction, recordMovement } = require('../services/auditService');
const { loadSubscription, requireFeature, checkTransactionLimit } = require('../middleware/subscription');

const router = express.Router();

// ---------------- SUPPLIERS ----------------

router.get('/suppliers', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM suppliers WHERE company_id=$1 ORDER BY rating DESC`, [req.user.company_id]);
    res.json({ suppliers: rows });
  } catch (err) { next(err); }
});

router.post('/suppliers', authenticate, async (req, res, next) => {
  const { name, contact_person, email, phone, address, avg_lead_time_days } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO suppliers (company_id, name, contact_person, email, phone, address, avg_lead_time_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.company_id, name, contact_person, email, phone, address, avg_lead_time_days || null]
    );
    res.status(201).json({ supplier: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- PURCHASE REQUISITIONS ----------------

router.get('/requisitions', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT pr.*, json_agg(json_build_object('product_id', pi.product_id, 'product_name', p.name, 'quantity', pi.quantity)) as items
       FROM purchase_requisitions pr
       LEFT JOIN pr_items pi ON pi.pr_id = pr.id
       LEFT JOIN products p ON p.id = pi.product_id
       WHERE pr.company_id = $1
       GROUP BY pr.id ORDER BY pr.created_at DESC`,
      [req.user.company_id]
    );
    res.json({ requisitions: rows });
  } catch (err) { next(err); }
});

// Create PR manually
router.post('/requisitions', authenticate, loadSubscription, checkTransactionLimit, async (req, res, next) => {
  const { items, notes, department_id } = req.body; // items: [{product_id, quantity, estimated_cost}]
  try {
    const prNumber = `PR-${Date.now()}`;
    const prRes = await pool.query(
      `INSERT INTO purchase_requisitions (company_id, pr_number, requested_by, department_id, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.company_id, prNumber, req.user.id, department_id || null, notes || null]
    );
    const pr = prRes.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO pr_items (pr_id, product_id, quantity, estimated_cost) VALUES ($1,$2,$3,$4)`,
        [pr.id, item.product_id, item.quantity, item.estimated_cost || null]
      );
    }

    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'pr_created', entity_type: 'purchase_requisition', entity_id: pr.id, details: { items } });

    res.status(201).json({ purchase_requisition: pr });
  } catch (err) { next(err); }
});

// Approve PR
router.post('/requisitions/:id/approve', authenticate, requireRole('owner', 'admin', 'manager', 'approver'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE purchase_requisitions SET status='approved', approved_by=$1, approved_at=NOW()
       WHERE id=$2 AND company_id=$3 RETURNING *`,
      [req.user.id, req.params.id, req.user.company_id]
    );
    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'pr_approved', entity_type: 'purchase_requisition', entity_id: req.params.id });
    res.json({ purchase_requisition: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- PURCHASE ORDERS ----------------

router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT po.*, s.name as supplier_name,
       json_agg(json_build_object('product_id', poi.product_id, 'product_name', p.name, 'quantity', poi.quantity, 'unit_price', poi.unit_price, 'received_quantity', poi.received_quantity)) as items
       FROM purchase_orders po
       LEFT JOIN suppliers s ON s.id = po.supplier_id
       LEFT JOIN po_items poi ON poi.po_id = po.id
       LEFT JOIN products p ON p.id = poi.product_id
       WHERE po.company_id = $1
       GROUP BY po.id, s.name ORDER BY po.created_at DESC`,
      [req.user.company_id]
    );
    res.json({ purchase_orders: rows });
  } catch (err) { next(err); }
});

// Create PO from an approved PR
router.post('/orders', authenticate, loadSubscription, checkTransactionLimit, async (req, res, next) => {
  const { pr_id, supplier_id, items, expected_delivery_date } = req.body; // items: [{product_id, quantity, unit_price}]
  try {
    const poNumber = `PO-${Date.now()}`;
    const totalAmount = items.reduce((sum, it) => sum + (it.quantity * (it.unit_price || 0)), 0);

    const poRes = await pool.query(
      `INSERT INTO purchase_orders (company_id, po_number, pr_id, supplier_id, expected_delivery_date, total_amount, approved_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.company_id, poNumber, pr_id || null, supplier_id, expected_delivery_date || null, totalAmount, req.user.id]
    );
    const po = poRes.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO po_items (po_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
        [po.id, item.product_id, item.quantity, item.unit_price || null]
      );
    }

    if (pr_id) {
      await pool.query(`UPDATE purchase_requisitions SET status='converted_to_po' WHERE id=$1`, [pr_id]);
    }

    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'po_created', entity_type: 'purchase_order', entity_id: po.id, details: { items, supplier_id } });

    res.status(201).json({ purchase_order: po });
  } catch (err) { next(err); }
});

// Update PO status (sent / dispatched / received / cancelled)
router.patch('/orders/:id/status', authenticate, async (req, res, next) => {
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE purchase_orders SET status=$1 WHERE id=$2 AND company_id=$3 RETURNING *`,
      [status, req.params.id, req.user.company_id]
    );
    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'po_status_updated', entity_type: 'purchase_order', entity_id: req.params.id, details: { status } });
    res.json({ purchase_order: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- INWARD ENTRY (Supplier Dispatch -> Inward -> Inventory) ----------------

router.post('/inward', authenticate, async (req, res, next) => {
  const { po_id, items, notes } = req.body; // items: [{product_id, quantity, serial_or_batch, current_location}]
  try {
    const entryRes = await pool.query(
      `INSERT INTO inward_entries (company_id, po_id, received_by, notes) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.company_id, po_id || null, req.user.id, notes || null]
    );
    const entry = entryRes.rows[0];

    for (const item of items) {
      // create digital twin inventory item
      const invRes = await pool.query(
        `INSERT INTO inventory_items (company_id, product_id, serial_or_batch, qr_code, barcode, quantity, current_location, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'in_stock') RETURNING *`,
        [req.user.company_id, item.product_id, item.serial_or_batch,
         `ACIP-${req.user.company_id}-${item.product_id}-${item.serial_or_batch}`,
         `ACIP-${req.user.company_id}-${item.product_id}-${item.serial_or_batch}`,
         item.quantity, item.current_location || 'Warehouse']
      );
      const invItem = invRes.rows[0];

      await pool.query(
        `INSERT INTO inward_entry_items (inward_entry_id, product_id, quantity, inventory_item_id) VALUES ($1,$2,$3,$4)`,
        [entry.id, item.product_id, item.quantity, invItem.id]
      );

      await recordMovement({
        company_id: req.user.company_id,
        inventory_item_id: invItem.id,
        stage: 'inward_entry',
        quantity: item.quantity,
        to_location: item.current_location || 'Warehouse',
        related_document_type: 'purchase_order',
        related_document_id: po_id,
        performed_by: req.user.id,
        notes: 'Inward entry from supplier'
      });

      if (po_id) {
        await pool.query(
          `UPDATE po_items SET received_quantity = received_quantity + $1 WHERE po_id=$2 AND product_id=$3`,
          [item.quantity, po_id, item.product_id]
        );
      }
    }

    // Update PO status if all items received
    if (po_id) {
      const check = await pool.query(
        `SELECT SUM(quantity) as total, SUM(received_quantity) as received FROM po_items WHERE po_id=$1`,
        [po_id]
      );
      const { total, received } = check.rows[0];
      const newStatus = parseFloat(received) >= parseFloat(total) ? 'received' : 'partially_received';
      await pool.query(`UPDATE purchase_orders SET status=$1 WHERE id=$2`, [newStatus, po_id]);
    }

    res.status(201).json({ inward_entry: entry });
  } catch (err) { next(err); }
});

module.exports = router;
