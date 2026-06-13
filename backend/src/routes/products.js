const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction, recordMovement } = require('../services/auditService');

const router = express.Router();

// ---------------- PRODUCTS ----------------

// GET /api/products
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC`,
      [req.user.company_id]
    );
    res.json({ products: rows });
  } catch (err) { next(err); }
});

// POST /api/products
router.post('/', authenticate, async (req, res, next) => {
  const { part_number, name, category, unit, reorder_level, standard_cost } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (company_id, part_number, name, category, unit, reorder_level, standard_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.company_id, part_number, name, category, unit || 'pcs', reorder_level || 0, standard_cost || 0]
    );
    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'product_created', entity_type: 'product', entity_id: rows[0].id, details: rows[0] });
    res.status(201).json({ product: rows[0] });
  } catch (err) { next(err); }
});

// ---------------- DIGITAL TWIN INVENTORY ----------------

// GET /api/products/inventory  -> list all inventory items (digital twins) with current status
router.get('/inventory', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, p.name as product_name, p.part_number, d.name as department_name
       FROM inventory_items i
       JOIN products p ON p.id = i.product_id
       LEFT JOIN departments d ON d.id = i.responsible_department_id
       WHERE i.company_id = $1
       ORDER BY i.updated_at DESC`,
      [req.user.company_id]
    );
    res.json({ inventory: rows });
  } catch (err) { next(err); }
});

// POST /api/products/inventory -> register a new physical item/batch, generates QR/barcode
router.post('/inventory', authenticate, async (req, res, next) => {
  const { product_id, serial_or_batch, quantity, current_location, responsible_department_id, status } = req.body;
  try {
    const qrPayload = `ACIP-${req.user.company_id}-${product_id}-${serial_or_batch}-${uuidv4().slice(0, 8)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
    const barcode = qrPayload; // barcode value (render with a barcode lib on frontend)

    const { rows } = await pool.query(
      `INSERT INTO inventory_items
       (company_id, product_id, serial_or_batch, qr_code, barcode, quantity, current_location, responsible_department_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.company_id, product_id, serial_or_batch, qrPayload, barcode, quantity, current_location, responsible_department_id || null, status || 'in_stock']
    );
    const item = rows[0];

    await recordMovement({
      company_id: req.user.company_id,
      inventory_item_id: item.id,
      stage: 'inventory_storage',
      quantity,
      to_location: current_location,
      related_document_type: 'inventory_item',
      related_document_id: item.id,
      performed_by: req.user.id,
      notes: 'Initial registration'
    });

    res.status(201).json({ inventory_item: item, qr_code_image: qrCodeDataUrl });
  } catch (err) { next(err); }
});

// GET /api/products/inventory/:id -> full digital twin view (location, history, related docs)
router.get('/inventory/:id', authenticate, async (req, res, next) => {
  try {
    const itemRes = await pool.query(
      `SELECT i.*, p.name as product_name, p.part_number
       FROM inventory_items i JOIN products p ON p.id = i.product_id
       WHERE i.id = $1 AND i.company_id = $2`,
      [req.params.id, req.user.company_id]
    );
    if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const historyRes = await pool.query(
      `SELECT * FROM movement_history WHERE inventory_item_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    const qrImage = await QRCode.toDataURL(itemRes.rows[0].qr_code);

    res.json({ item: itemRes.rows[0], movement_history: historyRes.rows, qr_code_image: qrImage });
  } catch (err) { next(err); }
});

// POST /api/products/inventory/:id/move -> record a movement / status change (digital twin update)
router.post('/inventory/:id/move', authenticate, async (req, res, next) => {
  const { stage, quantity, from_location, to_location, notes, new_status } = req.body;
  try {
    await recordMovement({
      company_id: req.user.company_id,
      inventory_item_id: req.params.id,
      stage,
      quantity,
      from_location,
      to_location,
      related_document_type: 'manual_move',
      related_document_id: req.params.id,
      performed_by: req.user.id,
      notes
    });

    if (new_status) {
      await pool.query(`UPDATE inventory_items SET status=$1 WHERE id=$2`, [new_status, req.params.id]);
    }

    await logAction({ company_id: req.user.company_id, user_id: req.user.id, action: 'inventory_moved', entity_type: 'inventory_item', entity_id: req.params.id, details: req.body });

    res.json({ message: 'Movement recorded' });
  } catch (err) { next(err); }
});

module.exports = router;
