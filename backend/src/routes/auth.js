const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register-startup
 * Minimal registration for startups
 */
router.post('/register-startup', async (req, res, next) => {
  const { company_name, founder_name, email, mobile, business_type, gst_number, registration_number, address, password } = req.body;
  try {
    const companyRes = await pool.query(
      `INSERT INTO companies (name, company_type, operational_mode, founder_name, email, mobile, business_type, gst_number, registration_number, address)
       VALUES ($1,'startup','hybrid',$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [company_name, founder_name, email, mobile, business_type, gst_number || null, registration_number || null, address]
    );
    const company = companyRes.rows[0];

    // Owner user account
    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO users (company_id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,'owner') RETURNING id, name, email, role`,
      [company.id, founder_name, email, hash]
    );

    // Assign free plan by default
    const freePlan = await pool.query(`SELECT id FROM subscription_plans WHERE name='free'`);
    await pool.query(
      `INSERT INTO company_subscriptions (company_id, plan_id, status) VALUES ($1,$2,'active')`,
      [company.id, freePlan.rows[0].id]
    );

    const token = jwt.sign(
      { id: userRes.rows[0].id, company_id: company.id, role: 'owner', email },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({ company, user: userRes.rows[0], token });
  } catch (err) { next(err); }
});

/**
 * POST /api/auth/register-sme
 */
router.post('/register-sme', async (req, res, next) => {
  const { company_name, registration_number, gst_number, address, admin_name, admin_email, employee_id, password } = req.body;
  try {
    const companyRes = await pool.query(
      `INSERT INTO companies (name, company_type, operational_mode, email, registration_number, gst_number, address)
       VALUES ($1,'sme','hybrid',$2,$3,$4,$5) RETURNING *`,
      [company_name, admin_email, registration_number, gst_number, address]
    );
    const company = companyRes.rows[0];

    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO users (company_id, employee_id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5,'admin') RETURNING id, name, email, role`,
      [company.id, employee_id, admin_name, admin_email, hash]
    );

    const freePlan = await pool.query(`SELECT id FROM subscription_plans WHERE name='free'`);
    await pool.query(
      `INSERT INTO company_subscriptions (company_id, plan_id, status) VALUES ($1,$2,'active')`,
      [company.id, freePlan.rows[0].id]
    );

    const token = jwt.sign(
      { id: userRes.rows[0].id, company_id: company.id, role: 'admin', email: admin_email },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({ company, user: userRes.rows[0], token });
  } catch (err) { next(err); }
});

/**
 * POST /api/auth/register-enterprise
 */
router.post('/register-enterprise', async (req, res, next) => {
  const { company_name, registration_number, gst_number, corporate_domain, address, admin_name, admin_email, employee_id, password, country, currency } = req.body;
  try {
    const companyRes = await pool.query(
      `INSERT INTO companies (name, company_type, operational_mode, email, registration_number, gst_number, corporate_domain, address, country, currency)
       VALUES ($1,'enterprise','hybrid',$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [company_name, admin_email, registration_number, gst_number, corporate_domain, address, country || 'India', currency || 'INR']
    );
    const company = companyRes.rows[0];

    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO users (company_id, employee_id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5,'admin') RETURNING id, name, email, role`,
      [company.id, employee_id, admin_name, admin_email, hash]
    );

    const freePlan = await pool.query(`SELECT id FROM subscription_plans WHERE name='free'`);
    await pool.query(
      `INSERT INTO company_subscriptions (company_id, plan_id, status) VALUES ($1,$2,'active')`,
      [company.id, freePlan.rows[0].id]
    );

    const token = jwt.sign(
      { id: userRes.rows[0].id, company_id: company.id, role: 'admin', email: admin_email },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({ company, user: userRes.rows[0], token });
  } catch (err) { next(err); }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query(`SELECT * FROM users WHERE email = $1 AND is_active = TRUE`, [email]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, company_id: user.company_id, role: user.role, email: user.email },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id }
    });
  } catch (err) { next(err); }
});

module.exports = router;
