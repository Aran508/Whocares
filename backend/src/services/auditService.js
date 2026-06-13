const pool = require('../config/db');

/**
 * Records an action in the audit_log table.
 * Every PR, PO, inventory change, approval, etc. should call this
 * so the company has a full digital history.
 */
async function logAction({ company_id, user_id, action, entity_type, entity_id, details }) {
  await pool.query(
    `INSERT INTO audit_log (company_id, user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [company_id, user_id || null, action, entity_type || null, entity_id || null, details ? JSON.stringify(details) : null]
  );
}

/**
 * Records a step in a product's movement history (digital twin tracking).
 */
async function recordMovement({
  company_id, inventory_item_id, stage, quantity,
  from_location, to_location, related_document_type,
  related_document_id, performed_by, notes
}) {
  await pool.query(
    `INSERT INTO movement_history
     (company_id, inventory_item_id, stage, quantity, from_location, to_location,
      related_document_type, related_document_id, performed_by, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [company_id, inventory_item_id, stage, quantity, from_location, to_location,
     related_document_type, related_document_id, performed_by || null, notes || null]
  );

  if (to_location) {
    await pool.query(
      `UPDATE inventory_items SET current_location = $1, updated_at = NOW() WHERE id = $2`,
      [to_location, inventory_item_id]
    );
  }
}

module.exports = { logAction, recordMovement };
