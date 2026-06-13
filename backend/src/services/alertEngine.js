const cron = require('node-cron');
const pool = require('../config/db');
const { runBusinessBrainChecks } = require('./aiService');

/**
 * Runs every hour: evaluates AI Business Brain checks (low stock, delayed orders,
 * overdue payments, etc.) for every active company.
 */
function startAlertEngine() {
  cron.schedule('0 * * * *', async () => {
    try {
      const { rows } = await pool.query(`SELECT id FROM companies`);
      for (const company of rows) {
        await runBusinessBrainChecks(company.id);
      }
      console.log(`[AlertEngine] Checked ${rows.length} companies at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('[AlertEngine] Error:', err.message);
    }
  });
}

module.exports = { startAlertEngine };
