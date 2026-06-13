-- ============================================================
-- ACIP - Advanced Company Intelligence Platform
-- Full Database Schema (PostgreSQL)
-- ============================================================

-- ---------- COMPANIES & SUBSCRIPTIONS ----------
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_type VARCHAR(20) NOT NULL CHECK (company_type IN ('startup','sme','enterprise')),
    operational_mode VARCHAR(20) NOT NULL DEFAULT 'hybrid' CHECK (operational_mode IN ('ai_managed','manual','hybrid')),
    founder_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    business_type VARCHAR(100),
    gst_number VARCHAR(50),
    registration_number VARCHAR(100),
    corporate_domain VARCHAR(255),
    address TEXT,
    country VARCHAR(100) DEFAULT 'India',
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL CHECK (name IN ('free','monthly','yearly')),
    price_inr NUMERIC(10,2) NOT NULL,
    max_users INT,
    max_transactions_per_month INT,
    ai_business_brain BOOLEAN DEFAULT FALSE,
    ai_managed_mode BOOLEAN DEFAULT FALSE,
    priority_ai BOOLEAN DEFAULT FALSE,
    quarterly_ai_report BOOLEAN DEFAULT FALSE,
    early_access BOOLEAN DEFAULT FALSE,
    extra_digital_twin_tags INT DEFAULT 0,
    description TEXT
);

CREATE TABLE company_subscriptions (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','trial')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- USERS & DEPARTMENTS ----------
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    parent_department_id INT REFERENCES departments(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','admin','manager','staff','approver')),
    department_id INT REFERENCES departments(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- PRODUCTS & DIGITAL TWIN INVENTORY ----------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    part_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'pcs',
    reorder_level NUMERIC(12,2) DEFAULT 0,
    standard_cost NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, part_number)
);

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    serial_or_batch VARCHAR(100) NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    barcode VARCHAR(255) UNIQUE,
    rfid_tag VARCHAR(255) UNIQUE,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_location VARCHAR(255),
    responsible_department_id INT REFERENCES departments(id),
    status VARCHAR(50) DEFAULT 'in_stock'
        CHECK (status IN ('in_stock','wip','finished_goods','dispatched','delivered','consumed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Digital movement history -> tracks every stage of the product journey
CREATE TABLE movement_history (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    inventory_item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN (
        'purchase_request','purchase_order','supplier_dispatch','inward_entry',
        'inventory_storage','production_consumption','work_in_progress',
        'finished_goods','outward_dispatch','customer_delivery','payment_collection'
    )),
    quantity NUMERIC(12,2),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    related_document_type VARCHAR(50),
    related_document_id INT,
    performed_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- SUPPLIERS ----------
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    on_time_delivery_pct NUMERIC(5,2) DEFAULT 0,
    avg_lead_time_days INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- PROCUREMENT: PR -> PO -> DISPATCH -> INWARD ----------
CREATE TABLE purchase_requisitions (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    requested_by INT REFERENCES users(id),
    department_id INT REFERENCES departments(id),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','converted_to_po')),
    created_by_ai BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP
);

CREATE TABLE pr_items (
    id SERIAL PRIMARY KEY,
    pr_id INT REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(12,2) NOT NULL,
    estimated_cost NUMERIC(12,2)
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    pr_id INT REFERENCES purchase_requisitions(id),
    supplier_id INT REFERENCES suppliers(id),
    status VARCHAR(30) DEFAULT 'created' CHECK (status IN ('created','sent','dispatched','partially_received','received','cancelled')),
    expected_delivery_date DATE,
    created_by_ai BOOLEAN DEFAULT FALSE,
    total_amount NUMERIC(14,2),
    created_at TIMESTAMP DEFAULT NOW(),
    approved_by INT REFERENCES users(id)
);

CREATE TABLE po_items (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(12,2) NOT NULL,
    unit_price NUMERIC(12,2),
    received_quantity NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE inward_entries (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    po_id INT REFERENCES purchase_orders(id),
    received_by INT REFERENCES users(id),
    received_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE inward_entry_items (
    id SERIAL PRIMARY KEY,
    inward_entry_id INT REFERENCES inward_entries(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(12,2) NOT NULL,
    inventory_item_id INT REFERENCES inventory_items(id)
);

-- ---------- PRODUCTION ----------
CREATE TABLE production_orders (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INT REFERENCES products(id),
    quantity_planned NUMERIC(12,2) NOT NULL,
    quantity_completed NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','on_hold','cancelled')),
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE production_consumption (
    id SERIAL PRIMARY KEY,
    production_order_id INT REFERENCES production_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity_consumed NUMERIC(12,2) NOT NULL,
    consumed_at TIMESTAMP DEFAULT NOW()
);

-- ---------- SALES & OUTWARD ----------
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    on_time_payment_pct NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    so_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','dispatched','delivered','invoiced','closed','cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount NUMERIC(14,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE so_items (
    id SERIAL PRIMARY KEY,
    so_id INT REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(12,2) NOT NULL,
    unit_price NUMERIC(12,2)
);

CREATE TABLE outward_dispatches (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    so_id INT REFERENCES sales_orders(id),
    dispatched_by INT REFERENCES users(id),
    dispatch_date TIMESTAMP DEFAULT NOW(),
    delivery_challan_number VARCHAR(50) UNIQUE,
    notes TEXT
);

-- ---------- FINANCE ----------
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    so_id INT REFERENCES sales_orders(id),
    po_id INT REFERENCES purchase_orders(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('sales','purchase')),
    amount NUMERIC(14,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid','partially_paid','paid','overdue')),
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT NOW(),
    method VARCHAR(50),
    reference VARCHAR(100)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100),
    amount NUMERIC(14,2) NOT NULL,
    description TEXT,
    incurred_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- AI BUSINESS BRAIN (ALERTS) ----------
CREATE TABLE ai_alerts (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'low_stock','order_delay','cost_increase','supplier_underperformance',
        'sales_decrease','production_slowdown','payment_overdue','other'
    )),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- AUDIT LOG (full digital history of org) ----------
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ---------- INDEXES ----------
CREATE INDEX idx_inventory_company ON inventory_items(company_id);
CREATE INDEX idx_movement_item ON movement_history(inventory_item_id);
CREATE INDEX idx_po_company ON purchase_orders(company_id);
CREATE INDEX idx_so_company ON sales_orders(company_id);
CREATE INDEX idx_alerts_company ON ai_alerts(company_id, is_resolved);
CREATE INDEX idx_audit_company ON audit_log(company_id, created_at);

-- ---------- SEED SUBSCRIPTION PLANS ----------
INSERT INTO subscription_plans
(name, price_inr, max_users, max_transactions_per_month, ai_business_brain, ai_managed_mode, priority_ai, quarterly_ai_report, early_access, extra_digital_twin_tags, description)
VALUES
('free', 0, 1, 50, FALSE, FALSE, FALSE, FALSE, FALSE, 0,
 'Manual mode only, basic inventory & digital twin tracking, up to 50 transactions/month.'),
('monthly', 1499, 25, NULL, TRUE, TRUE, FALSE, FALSE, FALSE, 0,
 'All operational modes, unlimited transactions, full AI Business Brain & Executive Dashboard.'),
('yearly', 14990, 25, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, 100,
 'Everything in Monthly at ~17% off + priority AI processing, free quarterly AI business health report, 100 extra digital twin tags, and early access to new modules.');
